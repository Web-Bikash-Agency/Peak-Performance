import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Validation middleware
const validateWorkout = [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  body('workoutType').isIn(['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'SPORTS', 'OTHER']).withMessage('Invalid workout type'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Calories must be non-negative'),
  body('workoutAt').optional().isISO8601().withMessage('Invalid workout date')
];

const validateWorkoutUpdate = [
  body('workoutType').optional().isIn(['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'SPORTS', 'OTHER']).withMessage('Invalid workout type'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Calories must be non-negative'),
  body('workoutAt').optional().isISO8601().withMessage('Invalid workout date'),
  body('notes').optional().trim()
];

// Get all workouts with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('memberId').optional().trim(),
  query('workoutType').optional().isIn(['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'SPORTS', 'OTHER']),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('sortBy').optional().isIn(['workoutAt', 'duration', 'calories', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const {
      page = 1,
      limit = 10,
      memberId,
      workoutType,
      startDate,
      endDate,
      sortBy = 'workoutAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    
    if (memberId) {
      where.memberId = memberId;
    }

    if (workoutType) {
      where.workoutType = workoutType;
    }

    if (startDate || endDate) {
      where.workoutAt = {};
      if (startDate) {
        where.workoutAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.workoutAt.lte = new Date(endDate as string);
      }
    }

    // Get total count
    const total = await prisma.workout.count({ where });

    // Get workouts
    const workouts = await prisma.workout.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        workouts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get workout by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true
          }
        }
      }
    });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    res.json({
      success: true,
      data: { workout }
    });
  } catch (error) {
    next(error);
  }
});

// Create new workout
router.post('/', validateWorkout, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const workoutData = req.body;

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: workoutData.memberId }
    });

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    // Set workout date to now if not provided
    if (!workoutData.workoutAt) {
      workoutData.workoutAt = new Date();
    }

    const workout = await prisma.workout.create({
      data: workoutData,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Workout recorded successfully',
      data: { workout }
    });
  } catch (error) {
    next(error);
  }
});

// Update workout
router.put('/:id', validateWorkoutUpdate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const { id } = req.params;
    const updateData = req.body;

    // Ensure id is not undefined
    if (!id) {
      throw new BadRequestError('Workout ID is required');
    }

    // Check if workout exists
    const existingWorkout = await prisma.workout.findUnique({
      where: { id }
    });

    if (!existingWorkout) {
      throw new NotFoundError('Workout not found');
    }

    const workout = await prisma.workout.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: { workout }
    });
  } catch (error) {
    next(error);
  }
});

// Delete workout
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure id is not undefined
    if (!id) {
      throw new BadRequestError('Workout ID is required');
    }

    // Check if workout exists
    const workout = await prisma.workout.findUnique({
      where: { id }
    });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    await prisma.workout.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get workout statistics
router.get('/stats/overview', async (req, res, next) => {
  try {
    // Get total workouts count
    const totalWorkouts = await prisma.workout.count();

    // Get today's workouts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayWorkouts = await prisma.workout.count({
      where: {
        workoutAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get this week's workouts
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyWorkouts = await prisma.workout.count({
      where: {
        workoutAt: {
          gte: startOfWeek
        }
      }
    });

    // Get this month's workouts
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyWorkouts = await prisma.workout.count({
      where: {
        workoutAt: {
          gte: startOfMonth
        }
      }
    });

    // Get total duration and calories
    const totalStats = await prisma.workout.aggregate({
      _sum: {
        duration: true,
        calories: true
      }
    });

    // Get workout type distribution
    const workoutTypeDistribution = await prisma.workout.groupBy({
      by: ['workoutType'],
      _count: { id: true }
    });

    // Get average workout duration
    const avgDuration = await prisma.workout.aggregate({
      _avg: { duration: true }
    });

    res.json({
      success: true,
      data: {
        totalWorkouts,
        todayWorkouts,
        weeklyWorkouts,
        monthlyWorkouts,
        totalDuration: totalStats._sum.duration || 0,
        totalCalories: totalStats._sum.calories || 0,
        averageDuration: avgDuration._avg.duration || 0,
        workoutTypeDistribution: workoutTypeDistribution.map(item => ({
          type: item.workoutType,
          count: item._count.id
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get member workout history
router.get('/member/:memberId/history', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const { memberId } = req.params;
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate
    } = req.query;

    // Ensure memberId is not undefined
    if (!memberId) {
      throw new BadRequestError('Member ID is required');
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    // Build where clause
    const where: any = { memberId };
    
    if (startDate || endDate) {
      where.workoutAt = {};
      if (startDate) {
        where.workoutAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.workoutAt.lte = new Date(endDate as string);
      }
    }

    // Get total count
    const total = await prisma.workout.count({ where });

    // Get workouts
    const workouts = await prisma.workout.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { workoutAt: 'desc' }
    });

    // Get member stats
    const memberStats = await prisma.workout.aggregate({
      where: { memberId },
      _sum: {
        duration: true,
        calories: true
      },
      _count: { 
        id: true 
      }
    });

    res.json({
      success: true,
      data: {
        workouts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        stats: {
          totalWorkouts: memberStats._count?.id || 0,
          totalDuration: memberStats._sum?.duration || 0,
          totalCalories: memberStats._sum?.calories || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;