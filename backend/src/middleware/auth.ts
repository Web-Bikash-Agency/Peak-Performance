// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { prisma } from '../index';

// // Extend Express Request interface to include user
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         email: string;
//         role: string;
//       };
//     }
//   }
// }

// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access token required'
//       });
//     }

//     const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
//     if (!process.env.JWT_SECRET) {
//       throw new Error('JWT_SECRET not configured');
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
//     // Check if user still exists in database
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.id },
//       select: { id: true, email: true, role: true, isActive: true }
//     });

//     if (!user || !user.isActive) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found or inactive'
//       });
//     }

//     req.user = {
//       id: user.id,
//       email: user.email,
//       role: user.role
//     };

//     next();
//   } catch (error) {
//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token'
//       });
//     }
    
//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(401).json({
//         success: false,
//         message: 'Token expired'
//       });
//     }

//     console.error('Auth middleware error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Role-based access control middleware
// export const requireRole = (roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions'
//       });
//     }

//     next();
//   };
// };

// // Admin only middleware
// export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN']);

// // Super admin only middleware
// export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);




import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Role-based access control middleware - remove return type annotation
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN']);

// Super admin only middleware
export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);