import { Router } from 'express';
import { AdminSubscriptionsController } from '../controllers/adminSubscriptionsController';
import { authenticateAdmin } from '../middleware/adminAuth';
import { validateRequest, validateQuery } from '../middleware/validation';
import Joi from 'joi';

// Validation schemas
const getSubscriptionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  status: Joi.string().valid('pending', 'active', 'expired', 'cancelled').optional(),
  userType: Joi.string().valid('student', 'staff', 'public').optional(),
  planId: Joi.string().uuid().optional()
});

const subscriptionIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Subscription ID must be a valid UUID',
    'any.required': 'Subscription ID is required'
  })
});

const createWalkInSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required'
  }),
  planId: Joi.string().uuid().required().messages({
    'string.guid': 'Plan ID must be a valid UUID',
    'any.required': 'Plan ID is required'
  }),
  amountPaid: Joi.number().positive().required().messages({
    'number.positive': 'Amount paid must be a positive number',
    'any.required': 'Amount paid is required'
  })
});

const cancelSubscriptionSchema = Joi.object({
  reason: Joi.string().max(500).optional()
});

const extendSubscriptionSchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).required().messages({
    'number.min': 'Extension must be at least 1 day',
    'number.max': 'Extension cannot exceed 365 days',
    'any.required': 'Number of days is required'
  })
});

const createPlanSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  userType: Joi.string().valid('student', 'staff', 'public').required(),
  durationType: Joi.string().valid('walk-in', 'monthly', 'semester', 'half-year', 'yearly').required(),
  priceCedis: Joi.number().positive().required(),
  durationDays: Joi.number().integer().positive().required(),
  description: Joi.string().max(500).optional(),
  isActive: Joi.boolean().optional().default(true)
});

const updatePlanSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  priceCedis: Joi.number().positive().optional(),
  durationDays: Joi.number().integer().positive().optional(),
  description: Joi.string().max(500).optional(),
  isActive: Joi.boolean().optional()
});

const planIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Plan ID must be a valid UUID',
    'any.required': 'Plan ID is required'
  })
});

const router = Router();
const adminSubscriptionsController = new AdminSubscriptionsController();

// All routes require admin authentication
router.use(authenticateAdmin);

/**
 * @route   GET /admin/subscriptions
 * @desc    Get all subscriptions with filtering
 * @access  Admin
 */
router.get('/subscriptions', 
  validateQuery(getSubscriptionsQuerySchema), 
  adminSubscriptionsController.getSubscriptions
);

/**
 * @route   GET /admin/subscriptions/:id
 * @desc    Get subscription by ID
 * @access  Admin
 */
router.get('/subscriptions/:id', 
  validateRequest(subscriptionIdParamSchema),
  adminSubscriptionsController.getSubscriptionById
);

/**
 * @route   POST /admin/subscriptions/walk-in
 * @desc    Create walk-in subscription
 * @access  Admin
 */
router.post('/subscriptions/walk-in', 
  validateRequest(createWalkInSchema),
  adminSubscriptionsController.createWalkInSubscription
);

/**
 * @route   PATCH /admin/subscriptions/:id/cancel
 * @desc    Cancel subscription
 * @access  Admin
 */
router.patch('/subscriptions/:id/cancel', 
  validateRequest(subscriptionIdParamSchema),
  validateRequest(cancelSubscriptionSchema),
  adminSubscriptionsController.cancelSubscription
);

/**
 * @route   PATCH /admin/subscriptions/:id/extend
 * @desc    Extend subscription
 * @access  Admin
 */
router.patch('/subscriptions/:id/extend', 
  validateRequest(subscriptionIdParamSchema),
  validateRequest(extendSubscriptionSchema),
  adminSubscriptionsController.extendSubscription
);

/**
 * @route   GET /admin/subscription-plans
 * @desc    Get all subscription plans
 * @access  Admin
 */
router.get('/subscription-plans', 
  adminSubscriptionsController.getPlans
);

/**
 * @route   POST /admin/subscription-plans
 * @desc    Create new subscription plan
 * @access  Admin
 */
router.post('/subscription-plans', 
  validateRequest(createPlanSchema),
  adminSubscriptionsController.createPlan
);

/**
 * @route   PUT /admin/subscription-plans/:id
 * @desc    Update subscription plan
 * @access  Admin
 */
router.put('/subscription-plans/:id', 
  validateRequest(planIdParamSchema),
  validateRequest(updatePlanSchema),
  adminSubscriptionsController.updatePlan
);

export default router;