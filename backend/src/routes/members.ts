import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { BadRequestError, NotFoundError, ConflictError } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';
import upload from '../middleware/upload';
import cloudinary from '../config/cloudinary';

const router: Router = Router();

function uploadToCloudinary(fileBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "gym-members" },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary error:", error);
          return reject("Cloudinary upload failed");
        }
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer); // Send buffer to Cloudinary
  });
}

// Validation middleware
const validateMember = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('age').toInt().isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),
  body('gender').customSanitizer(val => val.toUpperCase()).isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('membershipType').isIn(['ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH', 'ONE_YEAR']).withMessage('Invalid membership type'),
  body('expiryDate').isISO8601().withMessage('Invalid expiry date')
];

const validateMemberUpdate = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('age').optional().toInt().isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),
  body('gender').optional().customSanitizer(val => val.toUpperCase()).isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('membershipType').optional().isIn(['ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH', 'ONE_YEAR']).withMessage('Invalid membership type'),
  body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'EXPIRING_SOON', 'ARCHIVED']).withMessage('Invalid status')
];

// Get all members with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'EXPIRING_SOON', 'ARCHIVED']),
  query('membershipType').optional().isIn(['ONE_MONTH', 'THREE_MONTH', ' SIX_MONTH', 'ONE_YEAR']),
  query('sortBy').optional().isIn(['name', 'joinDate', 'expiryDate', 'status']),
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
      search,
      status,
      membershipType,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build where clause (excluding status filter — will apply in-memory after computing)
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (membershipType) {
      where.membershipType = membershipType;
    }

    // Fetch all matching members (without pagination yet) to compute status and apply filters
    const allMembers = await prisma.member.findMany({
      where,
      orderBy: { [sortBy as string]: sortOrder },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        email: true,
        phone: true,
        membershipType: true,
        expiryDate: true,
        status: true,
        profilePicture: true,
        joinDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            checkIns: true,
            payments: true,
            workouts: true
          }
        }
      }
    });

    // Recompute member status based on expiryDate so frontend always sees current status
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const computedMembers = allMembers.map(m => {
      // Preserve archived members
      if (m.status === 'ARCHIVED') return m;

      // Ensure expiryDate is a Date
      const expiry = new Date(m.expiryDate);

      let computedStatus: string = 'ACTIVE';
      if (expiry <= now) {
        computedStatus = 'INACTIVE';
      } else if (expiry <= threeDaysFromNow) {
        computedStatus = 'EXPIRING_SOON';
      } else {
        computedStatus = 'ACTIVE';
      }

      return {
        ...m,
        status: computedStatus
      };
    });

    // Apply status filter to computed members (in-memory)
    let filteredMembers = computedMembers;
    if (status) {
      filteredMembers = computedMembers.filter(m => m.status === status);
    }

    // Apply pagination to filtered results
    const total = filteredMembers.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedMembers = filteredMembers.slice(skip, skip + Number(limit));

    res.json({
      success: true,
      data: {
        members: paginatedMembers,
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

// Get member by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Member ID is required');
    }

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        checkIns: {
          orderBy: { checkInAt: 'desc' },
          take: 10
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        workouts: {
          orderBy: { workoutAt: 'desc' },
          take: 10
        }
      }
    });

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    res.json({
      success: true,
      data: { member }
    });
  } catch (error) {
    next(error);
  }
});

// Create new member
router.post('/', upload.single("profilePicture"), validateMember, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const memberData = req.body;

    memberData.age = Number(memberData.age);
    memberData.expiryDate = new Date(memberData.expiryDate);

    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    // Convert empty email to null
    if (memberData.email === "") {
      memberData.email = null;
    }

    // Check if email already exists (only if email is provided)
    if (memberData.email) {
      const existingMember = await prisma.member.findUnique({
        where: { email: memberData.email }
      });

      if (existingMember) {
        throw new ConflictError('Member with this email already exists');
      }
    }

    let imageUrl: string | null = null;

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
      console.log("Uploaded to Cloudinary:", imageUrl);
    }


    // Set status based on expiry date
    const expiryDate = new Date(memberData.expiryDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    let status = 'ACTIVE';
    if (expiryDate <= now) {
      status = 'INACTIVE';
    } else if (expiryDate <= threeDaysFromNow) {
      status = 'EXPIRING_SOON';
    }

    const member = await prisma.member.create({
      data: {
        ...memberData,
        profilePicture: imageUrl, 
        status,
        expiryDate: expiryDate
      }
    });

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
});

// Update member
router.put('/:id', upload.single("profilePicture"), validateMemberUpdate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new BadRequestError(firstError?.msg || 'Validation error');
    }

    const { id } = req.params;
    const updateData = req.body;

    if (updateData.age) updateData.age = Number(updateData.age);
    if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);


    if (updateData.email === "") {
      updateData.email = null;
    }

    if (!id) {
      throw new BadRequestError('Member ID is required');
    }

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      throw new NotFoundError('Member not found');
    }

    // Check email uniqueness if updating email
    if (updateData.email && updateData.email !== existingMember.email) {
      const emailExists = await prisma.member.findUnique({
        where: { email: updateData.email }
      });

      if (emailExists) {
        throw new ConflictError('Member with this email already exists');
      }
    }


    if (req.file) {
      updateData.profilePicture = await uploadToCloudinary(req.file.buffer);
  }



    if (updateData.status === 'ACTIVE' && existingMember.status === 'ARCHIVED') {
  // When unarchiving, check if membership is still valid
  const expiryDate = new Date(existingMember.expiryDate);
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  if (expiryDate <= now) {
    updateData.status = 'INACTIVE';
  } else if (expiryDate <= threeDaysFromNow) {
    updateData.status = 'EXPIRING_SOON';
  }
  // Otherwise keep ACTIVE
}

    // Update status based on expiry date if it's being updated
    if (updateData.expiryDate) {
      const expiryDate = new Date(updateData.expiryDate);
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      if (expiryDate <= now) {
        updateData.status = 'INACTIVE';
      } else if (expiryDate <= threeDaysFromNow) {
        updateData.status = 'EXPIRING_SOON';
      } else {
        updateData.status = 'ACTIVE';
      }
    }

    const member = await prisma.member.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
});


// Delete member
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Member ID is required');
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    // If member is already archived, perform hard delete
    if (member.status === 'ARCHIVED') {
      await prisma.member.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Member permanently deleted from database'
      });
    } else {
      // If not archived, perform soft delete (archive)
      await prisma.member.update({
        where: { id },
        data: { status: 'ARCHIVED' }
      });

      res.json({
        success: true,
        message: 'Member archived successfully'
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get member statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Member ID is required');
    }

    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    // Get check-in count
    const checkInCount = await prisma.checkIn.count({
      where: { memberId: id }
    });

    // Get payment count and total
    const payments = await prisma.payment.findMany({
      where: { memberId: id }
    });

    const totalPaid = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    // Get workout count and total duration
    const workouts = await prisma.workout.findMany({
      where: { memberId: id }
    });

    const totalWorkoutDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

    res.json({
      success: true,
      data: {
        checkInCount,
        paymentCount: payments.length,
        totalPaid,
        workoutCount: workouts.length,
        totalWorkoutDuration,
        totalCalories
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
