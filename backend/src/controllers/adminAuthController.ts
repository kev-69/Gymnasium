import { Request, Response } from 'express';
import { AdminAuthService } from '../services/adminAuthService';
import { AdminUserModel } from '../models/AdminUser';
import { AdminLoginRequest } from '../types';

export class AdminAuthController {
  /**
   * Admin login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: AdminLoginRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const result = await AdminAuthService.authenticateAdmin(email, password);

      if (!result) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          admin: result.admin,
          token: result.token,
        },
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get current admin profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated',
        });
        return;
      }

      const admin = await AdminUserModel.findById(adminId);

      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
        return;
      }

      // Remove password hash from response
      const { passwordHash, ...adminWithoutPassword } = admin;

      res.json({
        success: true,
        message: 'Admin profile retrieved successfully',
        data: adminWithoutPassword,
      });
    } catch (error) {
      console.error('Get admin profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update admin profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.id;
      const { firstName, lastName, email } = req.body;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated',
        });
        return;
      }

      const updatedAdmin = await AdminUserModel.updateProfile(adminId, {
        firstName,
        lastName,
        email,
      });

      if (!updatedAdmin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
        return;
      }

      // Remove password hash from response
      const { passwordHash, ...adminWithoutPassword } = updatedAdmin;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: adminWithoutPassword,
      });
    } catch (error) {
      console.error('Update admin profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Change admin password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.id;
      const { currentPassword, newPassword } = req.body;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Admin not authenticated',
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
        return;
      }

      const success = await AdminAuthService.changePassword(
        adminId,
        currentPassword,
        newPassword
      );

      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create new admin (super admin only)
   */
  static async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const currentAdmin = (req as any).admin;
      const { email, password, firstName, lastName, role } = req.body;

      // Check if current admin is super admin
      if (currentAdmin?.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          message: 'Only super admins can create new admin accounts',
        });
        return;
      }

      if (!email || !password || !firstName || !lastName || !role) {
        res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
        return;
      }

      if (!['admin', 'super_admin'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
        return;
      }

      const admin = await AdminAuthService.createAdmin({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: admin,
      });
    } catch (error: any) {
      console.error('Create admin error:', error);
      
      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505') {
        res.status(409).json({
          success: false,
          message: 'An admin with this email already exists',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get all admins (super admin only)
   */
  static async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const currentAdmin = (req as any).admin;

      // Check if current admin is super admin
      if (currentAdmin?.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          message: 'Only super admins can view all admin accounts',
        });
        return;
      }

      const admins = await AdminUserModel.findAll();

      // Remove password hashes from response
      const adminsWithoutPassword = admins.map(admin => {
        const { passwordHash, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
      });

      res.json({
        success: true,
        message: 'Admins retrieved successfully',
        data: adminsWithoutPassword,
      });
    } catch (error) {
      console.error('Get all admins error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Logout (client-side token removal)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage
    res.json({
      success: true,
      message: 'Logout successful',
    });
  }
}