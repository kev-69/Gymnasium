import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminUserModel } from '../models/AdminUser';
import { AdminUser, AdminTokenPayload } from '../types';

export class AdminAuthService {
  /**
   * Authenticate admin user with email and password
   */
  static async authenticateAdmin(email: string, password: string): Promise<{
    admin: Omit<AdminUser, 'passwordHash'>;
    token: string;
  } | null> {
    try {
      // Find admin by email
      const admin = await AdminUserModel.findByEmail(email);
      if (!admin) {
        return null;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isPasswordValid) {
        return null;
      }

      // Update last login
      await AdminUserModel.updateLastLogin(admin.id);

      // Generate JWT token
      const tokenPayload: AdminTokenPayload = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Return admin without password hash
      const { passwordHash, ...adminWithoutPassword } = admin;

      return {
        admin: adminWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Admin authentication error:', error);
      return null;
    }
  }

  /**
   * Verify JWT token and return admin data
   */
  static async verifyToken(token: string): Promise<Omit<AdminUser, 'passwordHash'> | null> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as AdminTokenPayload;

      const admin = await AdminUserModel.findById(decoded.adminId);
      if (!admin) {
        return null;
      }

      // Return admin without password hash
      const { passwordHash, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Create new admin user
   */
  static async createAdmin(adminData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'super_admin';
  }): Promise<Omit<AdminUser, 'passwordHash'>> {
    const passwordHash = await this.hashPassword(adminData.password);

    const admin = await AdminUserModel.create({
      email: adminData.email,
      passwordHash,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      role: adminData.role,
    });

    // Return admin without password hash
    const { passwordHash: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Change admin password
   */
  static async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const admin = await AdminUserModel.findById(adminId);
      if (!admin) {
        return false;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isCurrentPasswordValid) {
        return false;
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      return await AdminUserModel.updatePassword(adminId, newPasswordHash);
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  }

  /**
   * Reset admin password (super admin only)
   */
  static async resetPassword(adminId: string, newPassword: string): Promise<boolean> {
    try {
      const newPasswordHash = await this.hashPassword(newPassword);
      return await AdminUserModel.updatePassword(adminId, newPasswordHash);
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }
}