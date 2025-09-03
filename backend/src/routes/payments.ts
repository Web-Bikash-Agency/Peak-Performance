import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { BadRequestError, NotFoundError, ConflictError } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Validation middleware
const validatePayment = [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentType').isIn(['MEMBERSHIP', 'PERSONAL_TRAINING', 'CLASS', 'OTHER']).withMessage('Invalid payment type'),
  body('dueDate').isISO8601().withMessage('Invalid due date')
];

const validatePaymentUpdate = [
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentType').optional().isIn(['MEMBERSHIP', 'PERSONAL_TRAINING', 'CLASS', 'OTHER']).withMessage('Invalid payment type'),
  body('status').optional().isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('notes').optional().trim()
];

// Get all payments with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('memberId').optional().trim(),
  query('status').optional().isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
  query('paymentType').optional().isIn(['MEMBERSHIP', 'PERSONAL_TRAINING', 'CLASS', 'OTHER']),
  query('sortBy').optional().isIn(['createdAt', 'dueDate', 'amount', 'status']),
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
      status,
      paymentType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    
    if (memberId) {
      where.memberId = memberId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentType) {
      where.paymentType = paymentType;
    }

    // Get total count
    const total = await prisma.payment.count({ where });

    // Get payments
    const payments = await prisma.payment.findMany({
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
        payments,
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

// Get payment by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Payment ID is required');
    }

    const payment = await prisma.payment.findUnique({
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

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// Create new payment
router.post('/', validatePayment, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const paymentData = req.body;

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: paymentData.memberId }
    });

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    // Set status based on due date
    const dueDate = new Date(paymentData.dueDate);
    const now = new Date();
    
    let status = 'PENDING';
    if (dueDate < now) {
      status = 'OVERDUE';
    }

    const payment = await prisma.payment.create({
      data: {
        ...paymentData,
        status,
        dueDate: dueDate
      },
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
      message: 'Payment created successfully',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// Update payment
router.put('/:id', validatePaymentUpdate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new BadRequestError('Payment ID is required');
    }

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      throw new NotFoundError('Payment not found');
    }

    // Update status based on due date if it's being updated
    if (updateData.dueDate) {
      const dueDate = new Date(updateData.dueDate);
      const now = new Date();
      
      if (dueDate < now && updateData.status !== 'PAID') {
        updateData.status = 'OVERDUE';
      }
    }

    // If marking as paid, set paidAt
    if (updateData.status === 'PAID' && !existingPayment.paidAt) {
      updateData.paidAt = new Date();
    }

    const payment = await prisma.payment.update({
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
      message: 'Payment updated successfully',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// Delete payment
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Payment ID is required');
    }

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Only allow deletion of pending payments
    if (payment.status !== 'PENDING') {
      throw new BadRequestError('Only pending payments can be deleted');
    }

    await prisma.payment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Mark payment as paid
router.patch('/:id/mark-paid', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, notes } = req.body;

    if (!id) {
      throw new BadRequestError('Payment ID is required');
    }

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestError('Payment is already marked as paid');
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        notes: notes || payment.notes
      },
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
      message: 'Payment marked as paid successfully',
      data: { payment: updatedPayment }
    });
  } catch (error) {
    next(error);
  }
});

// Get payment statistics
router.get('/stats/overview', async (req, res, next) => {
  try {
    // Get total payments count
    const totalPayments = await prisma.payment.count();

    // Get pending payments count
    const pendingPayments = await prisma.payment.count({
      where: { status: 'PENDING' }
    });

    // Get overdue payments count
    const overduePayments = await prisma.payment.count({
      where: { status: 'OVERDUE' }
    });

    // Get total revenue (paid payments)
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
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
      _sum: { amount: true }
    });

    // Get payment type distribution
    const paymentTypeDistribution = await prisma.payment.groupBy({
      by: ['paymentType'],
      _count: { id: true },
      where: { status: { not: 'CANCELLED' } }
    });

    res.json({
      success: true,
      data: {
        totalPayments,
        pendingPayments,
        overduePayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        paymentTypeDistribution: paymentTypeDistribution.map(item => ({
          type: item.paymentType,
          count: item._count.id
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;