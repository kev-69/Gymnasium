import { Router } from 'express';
import { AdminDashboardController } from '../controllers/adminDashboardController';
import { authenticateAdmin } from '../middleware/adminAuth';
import { validateQuery } from '../middleware/validation';
import Joi from 'joi';

// Validation schemas
const limitSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(10)
});

const revenueAnalyticsSchema = Joi.object({
  period: Joi.string().valid('week', 'month', 'year').optional().default('month')
});

const router = Router();
const adminDashboardController = new AdminDashboardController();

// All routes require admin authentication
router.use(authenticateAdmin);

/**
 * @route   GET /admin/dashboard/stats
 * @desc    Get dashboard statistics (total users, subscriptions, revenue, etc.)
 * @access  Admin
 */
router.get('/dashboard/stats', adminDashboardController.getStats);

/**
 * @route   GET /admin/users/recent
 * @desc    Get recent user registrations
 * @access  Admin
 * @query   limit - Number of records to return (default: 10, max: 100)
 */
router.get('/users/recent', 
  validateQuery(limitSchema), 
  adminDashboardController.getRecentUsers
);

/**
 * @route   GET /admin/subscriptions/recent
 * @desc    Get recent subscriptions
 * @access  Admin
 * @query   limit - Number of records to return (default: 10, max: 100)
 */
router.get('/subscriptions/recent', 
  validateQuery(limitSchema), 
  adminDashboardController.getRecentSubscriptions
);

/**
 * @route   GET /admin/payments/recent
 * @desc    Get recent payment transactions
 * @access  Admin
 * @query   limit - Number of records to return (default: 10, max: 100)
 */
router.get('/payments/recent', 
  validateQuery(limitSchema), 
  adminDashboardController.getRecentTransactions
);

/**
 * @route   GET /admin/analytics/revenue
 * @desc    Get revenue analytics data
 * @access  Admin
 * @query   period - Time period (week|month|year, default: month)
 */
router.get('/analytics/revenue', 
  validateQuery(revenueAnalyticsSchema), 
  adminDashboardController.getRevenueAnalytics
);

/**
 * @route   GET /admin/analytics/subscriptions
 * @desc    Get subscription analytics
 * @access  Admin
 */
router.get('/analytics/subscriptions', adminDashboardController.getSubscriptionAnalytics);

export default router;