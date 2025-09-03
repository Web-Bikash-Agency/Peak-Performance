import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { BadRequestError } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Get dashboard overview statistics
router.get('/overview', async (req, res, next) => {
  try {
    // Get total members count
    const totalMembers = await prisma.member.count();

    // Get active members count
    const activeMembers = await prisma.member.count({
      where: { status: 'ACTIVE' }
    });

    // Get inactive members count
    const inactiveMembers = await prisma.member.count({
      where: { status: 'INACTIVE' }
    });

    // Get expiring soon members count (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await prisma.member.count({
      where: {
        status: 'ACTIVE',
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        }
      }
    });

    // Get today's check-ins
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCheckIns = await prisma.checkIn.count({
      where: {
        checkInAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get this month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paidAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    // Get this month's new members
    const newMembersThisMonth = await prisma.member.count({
      where: {
        joinDate: {
          gte: startOfMonth
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        expiringSoon,
        todayCheckIns,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        newMembersThisMonth
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get monthly statistics for charts
router.get('/monthly-stats', [
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Invalid year')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "joinDate") as month,
        COUNT(*) as newMembers
      FROM members 
      WHERE EXTRACT(YEAR FROM "joinDate") = ${year}
      GROUP BY EXTRACT(MONTH FROM "joinDate")
      ORDER BY month
    `;

    // DEBUG: Log raw query results
    console.log(`Raw monthly stats query result for ${year}:`, monthlyStats);
    console.log(`Total members in database:`, await prisma.member.count());

    // Get monthly revenue
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "paidAt") as month,
        COALESCE(SUM(amount), 0) as revenue
      FROM payments 
      WHERE EXTRACT(YEAR FROM "paidAt") = ${year}
        AND status = 'PAID'
      GROUP BY EXTRACT(MONTH FROM "paidAt")
      ORDER BY month
    `;

    // Get monthly check-ins
    const monthlyCheckIns = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "checkInAt") as month,
        COUNT(*) as checkIns
      FROM check_ins 
      WHERE EXTRACT(YEAR FROM "checkInAt") = ${year}
      GROUP BY EXTRACT(MONTH FROM "checkInAt")
      ORDER BY month
    `;

    // Format data for frontend
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // FIXED: Properly format the stats with year included and handle BigInt
    const formattedStats = monthNames.map((month, index) => {
      const monthNumber = index + 1;
      
      // FIXED: Handle BigInt conversion properly
      const monthData = (monthlyStats as any[]).find(s => Number(s.month) === monthNumber);
      const newMembers = monthData ? Number(monthData.newmembers) : 0; // Note: PostgreSQL returns lowercase 'newmembers'
      
      const revenueData = (monthlyRevenue as any[]).find(s => Number(s.month) === monthNumber);
      const revenue = revenueData ? Number(revenueData.revenue) : 0;
      
      const checkInData = (monthlyCheckIns as any[]).find(s => Number(s.month) === monthNumber);
      const checkIns = checkInData ? Number(checkInData.checkIns) : 0;

      return {
        month,
        monthNumber,
        newMembers,
        revenue: parseFloat(revenue.toString()),
        checkIns,
        year: year // Include the requested year in each data point
      };
    });

    console.log(`Monthly stats for ${year}:`, formattedStats); // Debug log

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error fetching monthly stats:', error); // Debug log
    next(error);
  }
});

// Get membership type distribution
router.get('/membership-distribution', async (req, res, next) => {
  try {
    const distribution = await prisma.member.groupBy({
      by: ['membershipType'],
      _count: {
        id: true
      },
      where: {
        status: {
          not: 'ARCHIVED'
        }
      }
    });

    const formattedDistribution = distribution.map(item => ({
      type: item.membershipType,
      count: item._count.id
    }));

    res.json({
      success: true,
      data: formattedDistribution
    });
  } catch (error) {
    next(error);
  }
});

// Get gender distribution
router.get('/gender-distribution', async (req, res, next) => {
  try {
    const distribution = await prisma.member.groupBy({
      by: ['gender'],
      _count: {
        id: true
      },
      where: {
        status: {
          not: 'ARCHIVED'
        }
      }
    });

    const formattedDistribution = distribution.map(item => ({
      gender: item.gender,
      count: item._count.id
    }));

    res.json({
      success: true,
      data: formattedDistribution
    });
  } catch (error) {
    next(error);
  }
});

// Get age distribution
router.get('/age-distribution', async (req, res, next) => {
  try {
    const ageRanges = [
      { min: 16, max: 25, label: '16-25' },
      { min: 26, max: 35, label: '26-35' },
      { min: 36, max: 45, label: '36-45' },
      { min: 46, max: 55, label: '46-55' },
      { min: 56, max: 100, label: '56+' }
    ];

    const distribution = await Promise.all(
      ageRanges.map(async (range) => {
        const count = await prisma.member.count({
          where: {
            age: {
              gte: range.min,
              lte: range.max
            },
            status: {
              not: 'ARCHIVED'
            }
          }
        });

        return {
          range: range.label,
          count
        };
      })
    );

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activities
router.get('/recent-activities', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const limit = parseInt(req.query.limit as string) || 20;

    // Get recent check-ins
    const recentCheckIns = await prisma.checkIn.findMany({
      take: limit,
      orderBy: { checkInAt: 'desc' },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    // Get recent workouts
    const recentWorkouts = await prisma.workout.findMany({
      take: limit,
      orderBy: { workoutAt: 'desc' },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    // Combine and sort all activities
    const allActivities = [
      ...recentCheckIns.map(ci => ({
        type: 'CHECK_IN',
        timestamp: ci.checkInAt,
        member: ci.member,
        data: { checkInAt: ci.checkInAt }
      })),
      ...recentPayments.map(p => ({
        type: 'PAYMENT',
        timestamp: p.createdAt,
        member: p.member,
        data: { amount: p.amount, status: p.status }
      })),
      ...recentWorkouts.map(w => ({
        type: 'WORKOUT',
        timestamp: w.workoutAt,
        member: w.member,
        data: { duration: w.duration, workoutType: w.workoutType }
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

    res.json({
      success: true,
      data: allActivities
    });
  } catch (error) {
    next(error);
  }
});

export default router;

