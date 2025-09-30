import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminAuthService } from '../services/adminAuthService';
import { AdminTokenPayload } from '../types';

export interface AuthenticatedAdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
    firstName: string;
    lastName: string;
  };
}

/**
 * Middleware to authenticate admin users using JWT token
 */
export const authenticateAdmin = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    // Verify token and get admin data
    const admin = await AdminAuthService.verifyToken(token);

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    // Attach admin to request object
    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      firstName: admin.firstName,
      lastName: admin.lastName,
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if admin has super admin privileges
 */
export const requireSuperAdmin = (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.admin.role !== 'super_admin') {
    res.status(403).json({
      success: false,
      message: 'Super admin privileges required',
    });
    return;
  }

  next();
};

/**
 * Middleware to check if admin has admin or super admin privileges
 */
export const requireAdmin = (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (!['admin', 'super_admin'].includes(req.admin.role)) {
    res.status(403).json({
      success: false,
      message: 'Admin privileges required',
    });
    return;
  }

  next();
};