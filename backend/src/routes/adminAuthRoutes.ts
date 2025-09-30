import { Router } from 'express';
import { AdminAuthController } from '../controllers/adminAuthController';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

// Validation schemas
const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  })
});

const createAdminSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  role: Joi.string().valid('admin', 'super_admin').required().messages({
    'any.only': 'Role must be either admin or super_admin',
    'any.required': 'Role is required'
  })
});

const router = Router();

// Public routes (no authentication required)
// Admin login
router.post('/admin/login', validateRequest(adminLoginSchema), AdminAuthController.login);

// Protected routes (authentication required)
// Get current admin profile
router.get('/admin/me', authenticateAdmin, AdminAuthController.getProfile);

// Update admin profile
router.put(
  '/admin/profile',
  authenticateAdmin,
  validateRequest(updateProfileSchema),
  AdminAuthController.updateProfile
);

// Change password
router.put(
  '/admin/change-password',
  authenticateAdmin,
  validateRequest(changePasswordSchema),
  AdminAuthController.changePassword
);

// Admin logout (client-side token removal)
router.post('/admin/logout', authenticateAdmin, AdminAuthController.logout);

// Super admin only routes
// Create new admin
router.post(
  '/admin/create',
  authenticateAdmin,
  requireSuperAdmin,
  validateRequest(createAdminSchema),
  AdminAuthController.createAdmin
);

// Get all admins
router.get(
  '/admin/all',
  authenticateAdmin,
  requireSuperAdmin,
  AdminAuthController.getAllAdmins
);

export default router;