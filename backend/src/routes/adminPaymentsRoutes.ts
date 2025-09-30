import { Router } from 'express';
import { AdminPaymentsController } from '../controllers/adminPaymentsController';
import { authenticateAdmin } from '../middleware/adminAuth';
import { validateRequest, validateQuery } from '../middleware/validation';
import Joi from 'joi';

// Validation schemas
const getTransactionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  status: Joi.string().valid('pending', 'success', 'failed', 'abandoned').optional(),
  method: Joi.string().max(50).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional()
});

const transactionIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Transaction ID must be a valid UUID',
    'any.required': 'Transaction ID is required'
  })
});

const markCompletedSchema = Joi.object({
  amountPaid: Joi.number().positive().required().messages({
    'number.positive': 'Amount paid must be a positive number',
    'any.required': 'Amount paid is required'
  }),
  paymentMethod: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Payment method is required',
    'string.max': 'Payment method must not exceed 50 characters',
    'any.required': 'Payment method is required'
  }),
  notes: Joi.string().max(500).optional()
});

const router = Router();
const adminPaymentsController = new AdminPaymentsController();

// All routes require admin authentication
router.use(authenticateAdmin);

/**
 * @route   GET /admin/payments
 * @desc    Get all payment transactions with filtering
 * @access  Admin
 * @query   page - Page number (default: 1)
 * @query   limit - Number of records per page (default: 20, max: 100)
 * @query   status - Filter by payment status (pending|success|failed|abandoned)
 * @query   method - Filter by payment method
 * @query   startDate - Filter payments from this date (ISO format)
 * @query   endDate - Filter payments until this date (ISO format)
 */
router.get('/payments', 
  validateQuery(getTransactionsQuerySchema), 
  adminPaymentsController.getTransactions
);

/**
 * @route   GET /admin/payments/:id
 * @desc    Get payment transaction by ID
 * @access  Admin
 */
router.get('/payments/:id', 
  validateRequest(transactionIdParamSchema),
  adminPaymentsController.getTransactionById
);

/**
 * @route   POST /admin/payments/:id/retry
 * @desc    Retry failed payment
 * @access  Admin
 */
router.post('/payments/:id/retry', 
  validateRequest(transactionIdParamSchema),
  adminPaymentsController.retryPayment
);

/**
 * @route   PATCH /admin/payments/:id/complete
 * @desc    Mark payment as completed (for walk-in payments)
 * @access  Admin
 */
router.patch('/payments/:id/complete', 
  validateRequest(transactionIdParamSchema),
  validateRequest(markCompletedSchema),
  adminPaymentsController.markPaymentCompleted
);

export default router;