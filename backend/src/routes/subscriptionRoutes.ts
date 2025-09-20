import { Router } from 'express';
import { SubscriptionController } from '@/controllers/subscriptionController';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import Joi from 'joi';

// Validation schemas
export const createSubscriptionSchema = Joi.object({
  planId: Joi.string().uuid().required().messages({
    'string.guid': 'Plan ID must be a valid UUID',
    'any.required': 'Plan ID is required'
  }),
  autoRenew: Joi.boolean().optional().default(false)
});

const router = Router();

// Public routes (no authentication required)
// Get all subscription plans
router.get('/plans', SubscriptionController.getPlans);

// Get subscription plans by user type
router.get('/plans/:userType', SubscriptionController.getPlansByUserType);

// Protected routes (authentication required)
// Get user's subscription history
router.get(
  '/my-subscriptions',
  authenticateToken,
  SubscriptionController.getUserSubscriptions
);

// Get user's active subscription
router.get(
  '/my-active-subscription',
  authenticateToken,
  SubscriptionController.getActiveSubscription
);

// Create a new subscription
router.post(
  '/subscribe',
  authenticateToken,
  validateRequest(createSubscriptionSchema),
  SubscriptionController.createSubscription
);

// Verify payment (can be called by user or webhook)
router.post(
  '/verify-payment/:paymentReference',
  SubscriptionController.verifyPayment
);

// Paystack webhook endpoint
router.post(
  '/webhook/paystack',
  SubscriptionController.handlePaystackWebhook
);

export default router;