import { Router } from 'express';
import authRoutes from './authRoutes';
import subscriptionRoutes from './subscriptionRoutes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/subscriptions', subscriptionRoutes);

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