import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { asyncHandler } from '@/middleware/errorHandler';

export class AuthController {
  /**
   * Register a new public user
   */
  static registerPublic = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await AuthService.registerPublicUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Public user registered successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Look up university member by ID
   */
  static lookupUniversityId = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await AuthService.lookupUniversityId(req.body);
      
      res.status(200).json({
        success: true,
        message: result.found ? 'University member found' : 'University member not found',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Register a university member
   */
  static registerUniversity = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await AuthService.registerUniversityUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'University member registered successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Login user (public or university member)
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await AuthService.login(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req: any, res: Response) => {
    const user = req.user;
    
    // Remove sensitive data
    if (user.passwordHash) {
      delete user.passwordHash;
    }
    if (user.pinHash) {
      delete user.pinHash;
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });
  });

  /**
   * Logout user (client-side token removal)
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    // In a stateless JWT system, logout is handled client-side
    // Here we just return a success message
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });
}