import { Router } from 'express';
import { AdminUsersController } from '../controllers/adminUsersController';
import { authenticateAdmin } from '../middleware/adminAuth';
import { validateRequest, validateQuery } from '../middleware/validation';
import Joi from 'joi';

// Validation schemas
const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  search: Joi.string().min(1).max(100).optional(),
  userType: Joi.string().valid('student', 'staff', 'public').optional(),
  hasActiveSubscription: Joi.boolean().optional()
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  hallOfResidence: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional()
});

const userIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required'
  })
});

const router = Router();
const adminUsersController = new AdminUsersController();

// All routes require admin authentication
router.use(authenticateAdmin);

/**
 * @route   GET /admin/users
 * @desc    Get all users with filtering and pagination
 * @access  Admin
 * @query   page - Page number (default: 1)
 * @query   limit - Number of records per page (default: 20, max: 100)
 * @query   search - Search term for name or email
 * @query   userType - Filter by user type (student|staff|public)
 * @query   hasActiveSubscription - Filter by subscription status
 */
router.get('/users', 
  validateQuery(getUsersQuerySchema), 
  adminUsersController.getUsers
);

/**
 * @route   GET /admin/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/users/:id', 
  validateRequest(userIdParamSchema),
  adminUsersController.getUserById
);

/**
 * @route   PUT /admin/users/:id
 * @desc    Update user information
 * @access  Admin
 */
router.put('/users/:id', 
  validateRequest(userIdParamSchema),
  validateRequest(updateUserSchema),
  adminUsersController.updateUser
);

/**
 * @route   PATCH /admin/users/:id/activate
 * @desc    Activate user account
 * @access  Admin
 */
router.patch('/users/:id/activate', 
  validateRequest(userIdParamSchema),
  adminUsersController.activateUser
);

/**
 * @route   PATCH /admin/users/:id/deactivate
 * @desc    Deactivate user account
 * @access  Admin
 */
router.patch('/users/:id/deactivate', 
  validateRequest(userIdParamSchema),
  adminUsersController.deactivateUser
);

export default router;