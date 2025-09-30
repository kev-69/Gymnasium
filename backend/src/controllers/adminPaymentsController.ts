import { Request, Response } from 'express';
import { db } from '../config/database';

export class AdminPaymentsController {
  /**
   * Get all payment transactions with filtering
   * @route GET /admin/payments
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const method = req.query.method as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const offset = (page - 1) * limit;

      // Build WHERE conditions
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        conditions.push(`pt.status = $${paramCount}`);
        params.push(status);
      }

      if (method) {
        paramCount++;
        conditions.push(`pt.payment_method ILIKE $${paramCount}`);
        params.push(`%${method}%`);
      }

      if (startDate) {
        paramCount++;
        conditions.push(`pt.created_at >= $${paramCount}`);
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        conditions.push(`pt.created_at <= $${paramCount}`);
        params.push(endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          pt.id,
          pt.payment_reference,
          pt.paystack_reference,
          pt.amount,
          pt.currency,
          pt.status,
          pt.payment_method,
          pt.gateway_response,
          pt.paid_at,
          pt.created_at,
          pt.updated_at,
          us.id as subscription_id,
          us.status as subscription_status,
          sp.name as plan_name,
          sp.user_type as plan_user_type,
          sp.duration_type,
          COALESCE(pu.first_name || ' ' || pu.last_name, uu.first_name || ' ' || uu.last_name) as user_name,
          COALESCE(pu.email, uu.email) as user_email,
          COALESCE('public', uu.user_type) as user_type,
          uu.university_id
        FROM payment_transactions pt
        JOIN user_subscriptions us ON pt.user_subscription_id = us.id
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        LEFT JOIN public_users pu ON us.user_id = pu.id
        LEFT JOIN university_users uu ON us.user_id = uu.id
        ${whereClause}
        ORDER BY pt.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      params.push(limit, offset);

      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM payment_transactions pt
        JOIN user_subscriptions us ON pt.user_subscription_id = us.id
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        LEFT JOIN public_users pu ON us.user_id = pu.id
        LEFT JOIN university_users uu ON us.user_id = uu.id
        ${whereClause}
      `;

      const [transactionsResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, params.slice(0, -2))
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          transactions: transactionsResult.rows,
          total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment transactions'
      });
    }
  }

  /**
   * Get payment transaction by ID
   * @route GET /admin/payments/:id
   */
  async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          pt.id,
          pt.user_subscription_id,
          pt.payment_reference,
          pt.paystack_reference,
          pt.amount,
          pt.currency,
          pt.status,
          pt.payment_method,
          pt.gateway_response,
          pt.paid_at,
          pt.created_at,
          pt.updated_at,
          us.id as subscription_id,
          us.user_id,
          us.status as subscription_status,
          us.start_date,
          us.end_date,
          us.amount_paid as subscription_amount,
          sp.id as plan_id,
          sp.name as plan_name,
          sp.user_type as plan_user_type,
          sp.duration_type,
          sp.price_cedis as plan_price,
          sp.duration_days,
          COALESCE(pu.first_name || ' ' || pu.last_name, uu.first_name || ' ' || uu.last_name) as user_name,
          COALESCE(pu.email, uu.email) as user_email,
          COALESCE('public', uu.user_type) as user_type,
          pu.phone,
          uu.university_id,
          uu.hall_of_residence
        FROM payment_transactions pt
        JOIN user_subscriptions us ON pt.user_subscription_id = us.id
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        LEFT JOIN public_users pu ON us.user_id = pu.id
        LEFT JOIN university_users uu ON us.user_id = uu.id
        WHERE pt.id = $1
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Payment transaction not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching payment transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment transaction'
      });
    }
  }

  /**
   * Retry failed payment
   * @route POST /admin/payments/:id/retry
   */
  async retryPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // First check if the payment exists and is in a retryable state
      const checkQuery = `
        SELECT 
          pt.id,
          pt.status,
          pt.user_subscription_id,
          us.user_id,
          sp.price_cedis
        FROM payment_transactions pt
        JOIN user_subscriptions us ON pt.user_subscription_id = us.id
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        WHERE pt.id = $1
      `;

      const checkResult = await db.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Payment transaction not found'
        });
        return;
      }

      const payment = checkResult.rows[0];

      if (payment.status !== 'failed' && payment.status !== 'abandoned') {
        res.status(400).json({
          success: false,
          message: 'Only failed or abandoned payments can be retried'
        });
        return;
      }

      // Reset payment status to pending for retry
      const updateQuery = `
        UPDATE payment_transactions 
        SET 
          status = 'pending',
          updated_at = CURRENT_TIMESTAMP,
          gateway_response = 'Payment retry initiated by admin'
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(updateQuery, [id]);

      // In a real implementation, you would also trigger the payment gateway retry here
      // For now, we'll just update the status

      res.status(200).json({
        success: true,
        message: 'Payment retry initiated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error retrying payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retry payment'
      });
    }
  }

  /**
   * Mark payment as completed (for walk-in payments)
   * @route PATCH /admin/payments/:id/complete
   */
  async markPaymentCompleted(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amountPaid, paymentMethod, notes } = req.body;

      // First check if the payment exists and is in a completable state
      const checkQuery = `
        SELECT 
          pt.id,
          pt.status,
          pt.user_subscription_id,
          us.status as subscription_status
        FROM payment_transactions pt
        JOIN user_subscriptions us ON pt.user_subscription_id = us.id
        WHERE pt.id = $1
      `;

      const checkResult = await db.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Payment transaction not found'
        });
        return;
      }

      const payment = checkResult.rows[0];

      if (payment.status === 'success') {
        res.status(400).json({
          success: false,
          message: 'Payment is already completed'
        });
        return;
      }

      // Begin transaction
      await db.query('BEGIN');

      try {
        // Update payment transaction
        const updatePaymentQuery = `
          UPDATE payment_transactions 
          SET 
            status = 'success',
            amount = $2,
            payment_method = $3,
            gateway_response = $4,
            paid_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `;

        const gatewayResponse = notes ? `Walk-in payment completed by admin. Notes: ${notes}` : 'Walk-in payment completed by admin';

        const paymentResult = await db.query(updatePaymentQuery, [
          id, amountPaid, paymentMethod, gatewayResponse
        ]);

        // Update subscription status if it was pending
        if (payment.subscription_status === 'pending') {
          const updateSubscriptionQuery = `
            UPDATE user_subscriptions 
            SET 
              status = 'active',
              payment_status = 'completed',
              amount_paid = $2,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `;

          await db.query(updateSubscriptionQuery, [payment.user_subscription_id, amountPaid]);
        }

        await db.query('COMMIT');

        res.status(200).json({
          success: true,
          message: 'Payment marked as completed successfully',
          data: paymentResult.rows[0]
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error marking payment as completed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark payment as completed'
      });
    }
  }
}