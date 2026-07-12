import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { BadRequestError } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

const router: Router = Router();

// Get dashboard overview statistics
router.get('/overview', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      expiringSoon,
      todayCheckIns,
      monthlyRevenue,
      newMembersThisMonth
    ] = await prisma.$transaction([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.member.count({ where: { status: 'INACTIVE' } }),
      // expiringSoon = expires within the next 3 days (date-based, always accurate)
      prisma.member.count({
        where: {
          expiryDate: { gte: new Date(), lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
          status: { not: 'ARCHIVED' }
        }
      }),
      prisma.checkIn.count({
        where: { checkInAt: { gte: today, lt: tomorrow } }
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: startOfMonth } },
        _sum: { amount: true }
      }),
      prisma.member.count({ where: { joinDate: { gte: startOfMonth } } })
    ]);

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

    const [monthlyStats, monthlyRevenue, monthlyCheckIns] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM "joinDate") as month,
          COUNT(*) as newmembers
        FROM members
        WHERE EXTRACT(YEAR FROM "joinDate") = ${year}
        GROUP BY EXTRACT(MONTH FROM "joinDate")
        ORDER BY month
      `,
      prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM "paidAt") as month,
          COALESCE(SUM(amount), 0) as revenue
        FROM payments
        WHERE EXTRACT(YEAR FROM "paidAt") = ${year}
          AND status = 'PAID'
        GROUP BY EXTRACT(MONTH FROM "paidAt")
        ORDER BY month
      `,
      prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM "checkInAt") as month,
          COUNT(*) as checkins
        FROM check_ins
        WHERE EXTRACT(YEAR FROM "checkInAt") = ${year}
        GROUP BY EXTRACT(MONTH FROM "checkInAt")
        ORDER BY month
      `
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const formattedStats = monthNames.map((month, index) => {
      const monthNumber = index + 1;

      const monthData = (monthlyStats as any[]).find(s => Number(s.month) === monthNumber);
      const newMembers = monthData ? Number(monthData.newmembers) : 0;

      const revenueData = (monthlyRevenue as any[]).find(s => Number(s.month) === monthNumber);
      const revenue = revenueData ? Number(revenueData.revenue) : 0;

      const checkInData = (monthlyCheckIns as any[]).find(s => Number(s.month) === monthNumber);
      const checkIns = checkInData ? Number(checkInData.checkins) : 0;

      return {
        month,
        monthNumber,
        newMembers,
        revenue: parseFloat(revenue.toString()),
        checkIns,
        year
      };
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
});

// Get years that actually exist in member/payment data
router.get('/available-years', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [memberYears, revenueYears] = await Promise.all([
      prisma.$queryRaw`
        SELECT DISTINCT EXTRACT(YEAR FROM "joinDate") AS year
        FROM members
        ORDER BY year DESC
      `,
      prisma.$queryRaw`
        SELECT DISTINCT EXTRACT(YEAR FROM "paidAt") AS year
        FROM payments
        WHERE status = 'PAID' AND "paidAt" IS NOT NULL
        ORDER BY year DESC
      `,
    ]);

    res.json({
      success: true,
      data: {
        memberYears: (memberYears as any[]).map(item => Number(item.year)).filter(Boolean),
        revenueYears: (revenueYears as any[]).map(item => Number(item.year)).filter(Boolean),
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get membership type distribution
router.get('/membership-distribution', async (req, res, next) => {
  try {
    const distribution = await prisma.member.groupBy({
      by: ['membershipType'],
      _count: { id: true },
      where: { status: { not: 'ARCHIVED' } }
    });

    res.json({
      success: true,
      data: distribution.map(item => ({
        type: item.membershipType,
        count: item._count.id
      }))
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
      _count: { id: true },
      where: { status: { not: 'ARCHIVED' } }
    });

    res.json({
      success: true,
      data: distribution.map(item => ({
        gender: item.gender,
        count: item._count.id
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get age distribution — single SQL query with CASE WHEN instead of 5 separate counts
router.get('/age-distribution', async (req, res, next) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        SUM(CASE WHEN age BETWEEN 16 AND 25 THEN 1 ELSE 0 END) AS "16-25",
        SUM(CASE WHEN age BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS "26-35",
        SUM(CASE WHEN age BETWEEN 36 AND 45 THEN 1 ELSE 0 END) AS "36-45",
        SUM(CASE WHEN age BETWEEN 46 AND 55 THEN 1 ELSE 0 END) AS "46-55",
        SUM(CASE WHEN age >= 56 THEN 1 ELSE 0 END)             AS "56+"
      FROM members
      WHERE status != 'ARCHIVED'
    `;

    const row = (result as any[])[0] || {};
    const distribution = [
      { range: '16-25', count: Number(row['16-25'] || 0) },
      { range: '26-35', count: Number(row['26-35'] || 0) },
      { range: '36-45', count: Number(row['36-45'] || 0) },
      { range: '46-55', count: Number(row['46-55'] || 0) },
      { range: '56+',   count: Number(row['56+']   || 0) }
    ];

    res.json({ success: true, data: distribution });
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

    const memberSelect = { select: { id: true, name: true, profilePicture: true } };

    const [recentCheckIns, recentPayments, recentWorkouts] = await Promise.all([
      prisma.checkIn.findMany({
        take: limit,
        orderBy: { checkInAt: 'desc' },
        include: { member: memberSelect }
      }),
      prisma.payment.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { member: memberSelect }
      }),
      prisma.workout.findMany({
        take: limit,
        orderBy: { workoutAt: 'desc' },
        include: { member: memberSelect }
      })
    ]);

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
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    res.json({ success: true, data: allActivities });
  } catch (error) {
    next(error);
  }
});

export default router;
