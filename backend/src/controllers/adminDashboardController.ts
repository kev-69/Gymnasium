import { Request, Response } from 'express';
import { db } from '../config/database';

export class AdminDashboardController {
  /**
   * Get dashboard statistics
   * @route GET /admin/dashboard/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Get total users count
      const totalUsersQuery = `
        SELECT 
          (SELECT COUNT(*) FROM public_users WHERE is_active = true) as public_users,
          (SELECT COUNT(*) FROM university_users WHERE is_active = true) as university_users
      `;
      
      // Get subscription statistics
      const subscriptionStatsQuery = `
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_subscriptions
        FROM user_subscriptions
      `;
      
      // Get revenue statistics
      const revenueStatsQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN status = 'success' AND created_at >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END), 0) as monthly_revenue,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
        FROM payment_transactions
      `;
      
      // Get this month's stats
      const monthlyStatsQuery = `
        SELECT 
          COUNT(CASE WHEN us.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_subscriptions_this_month,
          COUNT(CASE WHEN pu.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_public_users_this_month,
          COUNT(CASE WHEN uu.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_university_users_this_month
        FROM user_subscriptions us
        FULL OUTER JOIN public_users pu ON true
        FULL OUTER JOIN university_users uu ON true
      `;

      const [userStats, subscriptionStats, revenueStats, monthlyStats] = await Promise.all([
        db.query(totalUsersQuery),
        db.query(subscriptionStatsQuery),
        db.query(revenueStatsQuery),
        db.query(monthlyStatsQuery)
      ]);

      const userResult = userStats.rows[0];
      const subscriptionResult = subscriptionStats.rows[0];
      const revenueResult = revenueStats.rows[0];
      const monthlyResult = monthlyStats.rows[0];

      const dashboardStats = {
        totalUsers: parseInt(userResult.public_users) + parseInt(userResult.university_users),
        publicUsers: parseInt(userResult.public_users),
        universityUsers: parseInt(userResult.university_users),
        totalSubscriptions: parseInt(subscriptionResult.total_subscriptions),
        activeSubscriptions: parseInt(subscriptionResult.active_subscriptions),
        expiredSubscriptions: parseInt(subscriptionResult.expired_subscriptions),
        pendingSubscriptions: parseInt(subscriptionResult.pending_subscriptions),
        totalRevenue: parseFloat(revenueResult.total_revenue),
        monthlyRevenue: parseFloat(revenueResult.monthly_revenue),
        successfulPayments: parseInt(revenueResult.successful_payments),
        failedPayments: parseInt(revenueResult.failed_payments),
        newSubscriptionsThisMonth: parseInt(monthlyResult.new_subscriptions_this_month || '0'),
        newUsersThisMonth: parseInt(monthlyResult.new_public_users_this_month || '0') + parseInt(monthlyResult.new_university_users_this_month || '0')
      };

      res.status(200).json({
        success: true,
        data: dashboardStats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  /**
   * Get recent user registrations
   * @route GET /admin/users/recent
   */
  async getRecentUsers(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const query = `
        (SELECT 
          id, 
          first_name, 
          last_name, 
          email, 
          'public' as user_type,
          created_at,
          is_active
        FROM public_users 
        ORDER BY created_at DESC 
        LIMIT $1)
        UNION ALL
        (SELECT 
          id, 
          first_name, 
          last_name, 
          email, 
          user_type,
          created_at,
          is_active
        FROM university_users 
        ORDER BY created_at DESC 
        LIMIT $1)
        ORDER BY created_at DESC 
        LIMIT $1
      `;

      const result = await db.query(query, [limit]);

      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching recent users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent users'
      });
    }
  }

  /**
   * Get recent subscriptions
   * @route GET /admin/subscriptions/recent
   */
  async getRecentSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const query = `
        SELECT 
          us.id,
          us.status,
          us.payment_status,
          us.start_date,
          us.end_date,
          us.amount_paid,
          us.created_at,
          sp.name as plan_name,
          sp.user_type as plan_user_type,
          sp.duration_type,
          COALESCE(pu.first_name || ' ' || pu.last_name, uu.first_name || ' ' || uu.last_name) as user_name,
          COALESCE(pu.email, uu.email) as user_email,
          COALESCE('public', uu.user_type) as user_type
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        LEFT JOIN public_users pu ON us.user_id = pu.id
        LEFT JOIN university_users uu ON us.user_id = uu.id
        ORDER BY us.created_at DESC
        LIMIT $1
      `;

      const result = await db.query(query, [limit]);

      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching recent subscriptions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent subscriptions'
      });
    }
  }

  /**
   * Get recent payment transactions
   * @route GET /admin/payments/recent
   */
  async getRecentTransactions(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const query = `
        SELECT 
          pt.id,
          pt.payment_reference,
          pt.amount,
          pt.currency,
          pt.status,
          pt.payment_method,
          pt.paid_at,
          pt.created_at,
          sp.name as plan_name,
          COALESCE(pu.first_name || ' ' || pu.last_name, uu.first_name || ' ' || uu.last_name) as user_name,
          COALESCE(pu.email, uu.email) as user_email
        FROM payment_transactions pt
        JOIN user_subscriptions us ON pt.user_subscription_id = us.id
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        LEFT JOIN public_users pu ON us.user_id = pu.id
        LEFT JOIN university_users uu ON us.user_id = uu.id
        ORDER BY pt.created_at DESC
        LIMIT $1
      `;

      const result = await db.query(query, [limit]);

      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent transactions'
      });
    }
  }

  /**
   * Get revenue analytics
   * @route GET /admin/analytics/revenue
   */
  async getRevenueAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string || 'month';
      
      let dateFormat: string;
      let groupByClause: string;
      let intervalClause: string;

      switch (period) {
        case 'week':
          dateFormat = 'YYYY-MM-DD';
          groupByClause = "DATE_TRUNC('day', pt.created_at)";
          intervalClause = "7 days";
          break;
        case 'year':
          dateFormat = 'YYYY-MM';
          groupByClause = "DATE_TRUNC('month', pt.created_at)";
          intervalClause = "12 months";
          break;
        default: // month
          dateFormat = 'YYYY-MM-DD';
          groupByClause = "DATE_TRUNC('day', pt.created_at)";
          intervalClause = "30 days";
      }

      const query = `
        SELECT 
          TO_CHAR(${groupByClause}, '${dateFormat}') as period,
          COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as revenue,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_transactions,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions
        FROM payment_transactions pt
        WHERE pt.created_at >= NOW() - INTERVAL '${intervalClause}'
        GROUP BY ${groupByClause}
        ORDER BY ${groupByClause} ASC
      `;

      const result = await db.query(query);

      res.status(200).json({
        success: true,
        data: {
          period,
          analytics: result.rows
        }
      });
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue analytics'
      });
    }
  }

  /**
   * Get subscription analytics
   * @route GET /admin/analytics/subscriptions
   */
  async getSubscriptionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      // Get subscription distribution by plan
      const planDistributionQuery = `
        SELECT 
          sp.name,
          sp.user_type,
          sp.duration_type,
          COUNT(us.id) as subscription_count,
          COUNT(CASE WHEN us.status = 'active' THEN 1 END) as active_count
        FROM subscription_plans sp
        LEFT JOIN user_subscriptions us ON sp.id = us.subscription_plan_id
        GROUP BY sp.id, sp.name, sp.user_type, sp.duration_type
        ORDER BY subscription_count DESC
      `;

      // Get subscription status distribution
      const statusDistributionQuery = `
        SELECT 
          status,
          COUNT(*) as count
        FROM user_subscriptions
        GROUP BY status
      `;

      // Get user type distribution
      const userTypeDistributionQuery = `
        SELECT 
          sp.user_type,
          COUNT(us.id) as subscription_count
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        GROUP BY sp.user_type
      `;

      const [planDistribution, statusDistribution, userTypeDistribution] = await Promise.all([
        db.query(planDistributionQuery),
        db.query(statusDistributionQuery),
        db.query(userTypeDistributionQuery)
      ]);

      res.status(200).json({
        success: true,
        data: {
          planDistribution: planDistribution.rows,
          statusDistribution: statusDistribution.rows,
          userTypeDistribution: userTypeDistribution.rows
        }
      });
    } catch (error) {
      console.error('Error fetching subscription analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription analytics'
      });
    }
  }
}