import { Request, Response } from 'express';
import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class AdminSubscriptionsController {
  /**
   * Get all subscriptions with filtering
   * @route GET /admin/subscriptions
   */
  async getSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const userType = req.query.userType as string;
      const planId = req.query.planId as string;

      const offset = (page - 1) * limit;

      // Build WHERE conditions
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        conditions.push(`us.status = $${paramCount}`);
        params.push(status);
      }

      if (userType) {
        paramCount++;
        conditions.push(`sp.user_type = $${paramCount}`);
        params.push(userType);
      }

      if (planId) {
        paramCount++;
        conditions.push(`us.subscription_plan_id = $${paramCount}`);
        params.push(planId);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          us.id,
          us.status,
          us.payment_status,
          us.start_date,
          us.end_date,
          us.amount_paid,
          us.currency,
          us.auto_renew,
          us.created_at,
          us.updated_at,
          sp.name as plan_name,
          sp.user_type as plan_user_type,
          sp.duration_type,
          sp.price_cedis as plan_price,
          COALESCE(pu.first_name || ' ' || pu.last_name, uu.first_name || ' ' || uu.last_name) as user_name,
          COALESCE(pu.email, uu.email) as user_email,
          COALESCE('public', uu.user_type) as user_type,
          uu.university_id
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        LEFT JOIN public_users pu ON us.user_id = pu.id
        LEFT JOIN university_users uu ON us.user_id = uu.id
        ${whereClause}
        ORDER BY us.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      params.push(limit, offset);

      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        LEFT JOIN public_users pu ON us.user_id = pu.id
        LEFT JOIN university_users uu ON us.user_id = uu.id
        ${whereClause}
      `;

      const [subscriptionsResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, params.slice(0, -2))
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          subscriptions: subscriptionsResult.rows,
          total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscriptions'
      });
    }
  }

  /**
   * Get subscription by ID
   * @route GET /admin/subscriptions/:id
   */
  async getSubscriptionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          us.id,
          us.user_id,
          us.status,
          us.payment_status,
          us.start_date,
          us.end_date,
          us.payment_reference,
          us.amount_paid,
          us.currency,
          us.auto_renew,
          us.created_at,
          us.updated_at,
          sp.id as plan_id,
          sp.name as plan_name,
          sp.user_type as plan_user_type,
          sp.duration_type,
          sp.price_cedis as plan_price,
          sp.duration_days,
          sp.description as plan_description,
          COALESCE(pu.first_name || ' ' || pu.last_name, uu.first_name || ' ' || uu.last_name) as user_name,
          COALESCE(pu.email, uu.email) as user_email,
          COALESCE('public', uu.user_type) as user_type,
          pu.phone,
          uu.university_id,
          uu.hall_of_residence
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        LEFT JOIN public_users pu ON us.user_id = pu.id
        LEFT JOIN university_users uu ON us.user_id = uu.id
        WHERE us.id = $1
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
        return;
      }

      // Get payment transactions for this subscription
      const paymentsQuery = `
        SELECT 
          id,
          payment_reference,
          paystack_reference,
          amount,
          currency,
          status,
          payment_method,
          paid_at,
          created_at
        FROM payment_transactions
        WHERE user_subscription_id = $1
        ORDER BY created_at DESC
      `;

      const payments = await db.query(paymentsQuery, [id]);

      const subscription = {
        ...result.rows[0],
        payments: payments.rows
      };

      res.status(200).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription'
      });
    }
  }

  /**
   * Create walk-in subscription
   * @route POST /admin/subscriptions/walk-in
   */
  async createWalkInSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { userId, planId, amountPaid } = req.body;

      // Get plan details
      const planQuery = `
        SELECT * FROM subscription_plans 
        WHERE id = $1 AND is_active = true
      `;
      
      const planResult = await db.query(planQuery, [planId]);

      if (planResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Subscription plan not found or inactive'
        });
        return;
      }

      const plan = planResult.rows[0];

      // Verify user exists
      const userCheckQuery = `
        SELECT 
          COALESCE(pu.id, uu.id) as id,
          COALESCE('public', uu.user_type) as user_type
        FROM public_users pu
        FULL OUTER JOIN university_users uu ON false
        WHERE COALESCE(pu.id, uu.id) = $1
      `;

      const userResult = await db.query(userCheckQuery, [userId]);

      if (userResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const user = userResult.rows[0];

      // Check if plan user type matches user type
      if (plan.user_type !== user.user_type) {
        res.status(400).json({
          success: false,
          message: `Plan is for ${plan.user_type} users, but user is ${user.user_type}`
        });
        return;
      }

      const subscriptionId = uuidv4();
      const paymentReference = `WALKIN_${Date.now()}_${subscriptionId.slice(0, 8)}`;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000));

      // Begin transaction
      await db.query('BEGIN');

      try {
        // Create subscription
        const subscriptionQuery = `
          INSERT INTO user_subscriptions (
            id, user_id, subscription_plan_id, status, payment_status,
            start_date, end_date, payment_reference, amount_paid, currency
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;

        const subscriptionResult = await db.query(subscriptionQuery, [
          subscriptionId, userId, planId, 'active', 'completed',
          startDate, endDate, paymentReference, amountPaid, 'GHS'
        ]);

        // Create payment transaction
        const paymentQuery = `
          INSERT INTO payment_transactions (
            user_subscription_id, payment_reference, amount, currency,
            status, payment_method, paid_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;

        await db.query(paymentQuery, [
          subscriptionId, paymentReference, amountPaid, 'GHS',
          'success', 'walk-in', startDate
        ]);

        await db.query('COMMIT');

        res.status(201).json({
          success: true,
          message: 'Walk-in subscription created successfully',
          data: subscriptionResult.rows[0]
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating walk-in subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create walk-in subscription'
      });
    }
  }

  /**
   * Cancel subscription
   * @route PATCH /admin/subscriptions/:id/cancel
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const query = `
        UPDATE user_subscriptions 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status IN ('pending', 'active')
        RETURNING *
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Subscription not found or cannot be cancelled'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  }

  /**
   * Extend subscription
   * @route PATCH /admin/subscriptions/:id/extend
   */
  async extendSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { days } = req.body;

      const query = `
        UPDATE user_subscriptions 
        SET 
          end_date = end_date + INTERVAL '${days} days',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'active'
        RETURNING *
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Active subscription not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Subscription extended by ${days} days`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error extending subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend subscription'
      });
    }
  }

  /**
   * Get all subscription plans
   * @route GET /admin/subscription-plans
   */
  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const query = `
        SELECT 
          id,
          name,
          user_type,
          duration_type,
          price_cedis,
          duration_days,
          description,
          is_active,
          created_at,
          updated_at
        FROM subscription_plans
        ORDER BY user_type, duration_days ASC
      `;

      const result = await db.query(query);

      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription plans'
      });
    }
  }

  /**
   * Create subscription plan
   * @route POST /admin/subscription-plans
   */
  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const { name, userType, durationType, priceCedis, durationDays, description, isActive } = req.body;

      // Check if plan already exists
      const checkQuery = `
        SELECT id FROM subscription_plans 
        WHERE user_type = $1 AND duration_type = $2
      `;

      const existingPlan = await db.query(checkQuery, [userType, durationType]);

      if (existingPlan.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: `A ${durationType} plan for ${userType} users already exists`
        });
        return;
      }

      const query = `
        INSERT INTO subscription_plans (
          name, user_type, duration_type, price_cedis, 
          duration_days, description, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await db.query(query, [
        name, userType, durationType, priceCedis,
        durationDays, description, isActive ?? true
      ]);

      res.status(201).json({
        success: true,
        message: 'Subscription plan created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription plan'
      });
    }
  }

  /**
   * Update subscription plan
   * @route PUT /admin/subscription-plans/:id
   */
  async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Build update query
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (updates.name) {
        paramCount++;
        updateFields.push(`name = $${paramCount}`);
        params.push(updates.name);
      }
      if (updates.priceCedis) {
        paramCount++;
        updateFields.push(`price_cedis = $${paramCount}`);
        params.push(updates.priceCedis);
      }
      if (updates.durationDays) {
        paramCount++;
        updateFields.push(`duration_days = $${paramCount}`);
        params.push(updates.durationDays);
      }
      if (updates.description !== undefined) {
        paramCount++;
        updateFields.push(`description = $${paramCount}`);
        params.push(updates.description);
      }
      if (updates.isActive !== undefined) {
        paramCount++;
        updateFields.push(`is_active = $${paramCount}`);
        params.push(updates.isActive);
      }

      if (updateFields.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
        return;
      }

      paramCount++;
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(id);

      const query = `
        UPDATE subscription_plans 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscription plan updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update subscription plan'
      });
    }
  }
}