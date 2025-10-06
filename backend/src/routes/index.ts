import { Router } from 'express';
import authRoutes from './authRoutes';
import adminAuthRoutes from './adminAuthRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import adminDashboardRoutes from './adminDashboardRoutes';
import adminUsersRoutes from './adminUsersRoutes';
import adminSubscriptionsRoutes from './adminSubscriptionsRoutes';
import adminPaymentsRoutes from './adminPaymentsRoutes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/auth', adminAuthRoutes);
router.use('/subscriptions', subscriptionRoutes);

// Admin API routes
router.use('/admin', adminDashboardRoutes);
router.use('/admin', adminUsersRoutes);
router.use('/admin', adminSubscriptionsRoutes);
router.use('/admin', adminPaymentsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UG Gym API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;