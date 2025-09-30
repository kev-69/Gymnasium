import { Request, Response } from 'express';
import { db } from '../config/database';

export class AdminUsersController {
  /**
   * Get all users with filtering and pagination
   * @route GET /admin/users
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const userType = req.query.userType as string;
      const hasActiveSubscription = req.query.hasActiveSubscription === 'true';

      const offset = (page - 1) * limit;

      // Build WHERE conditions
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      // Search condition
      if (search) {
        paramCount++;
        conditions.push(`(
          pu.first_name ILIKE $${paramCount} OR 
          pu.last_name ILIKE $${paramCount} OR 
          pu.email ILIKE $${paramCount} OR
          uu.first_name ILIKE $${paramCount} OR 
          uu.last_name ILIKE $${paramCount} OR 
          uu.email ILIKE $${paramCount}
        )`);
        params.push(`%${search}%`);
      }

      // User type condition
      if (userType) {
        paramCount++;
        if (userType === 'public') {
          conditions.push(`pu.id IS NOT NULL`);
        } else {
          conditions.push(`uu.user_type = $${paramCount}`);
          params.push(userType);
        }
      }

      // Active subscription condition
      if (hasActiveSubscription !== undefined) {
        if (hasActiveSubscription) {
          conditions.push(`us.status = 'active' AND us.end_date > NOW()`);
        } else {
          conditions.push(`(us.id IS NULL OR us.status != 'active' OR us.end_date <= NOW())`);
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Main query to get users
      const query = `
        SELECT 
          COALESCE(pu.id, uu.id) as id,
          COALESCE(pu.first_name, uu.first_name) as first_name,
          COALESCE(pu.last_name, uu.last_name) as last_name,
          COALESCE(pu.email, uu.email) as email,
          pu.phone,
          uu.university_id,
          uu.hall_of_residence,
          COALESCE('public', uu.user_type) as user_type,
          COALESCE(pu.is_active, uu.is_active) as is_active,
          COALESCE(pu.created_at, uu.created_at) as created_at,
          CASE 
            WHEN us.status = 'active' AND us.end_date > NOW() THEN true 
            ELSE false 
          END as has_active_subscription,
          us.end_date as subscription_end_date,
          sp.name as current_plan_name
        FROM public_users pu
        FULL OUTER JOIN university_users uu ON false
        LEFT JOIN user_subscriptions us ON (
          (pu.id = us.user_id OR uu.id = us.user_id) 
          AND us.status = 'active' 
          AND us.end_date > NOW()
        )
        LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        ${whereClause}
        ORDER BY COALESCE(pu.created_at, uu.created_at) DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      params.push(limit, offset);

      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM public_users pu
        FULL OUTER JOIN university_users uu ON false
        LEFT JOIN user_subscriptions us ON (
          (pu.id = us.user_id OR uu.id = us.user_id) 
          AND us.status = 'active' 
          AND us.end_date > NOW()
        )
        ${whereClause}
      `;

      const [usersResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, params.slice(0, -2)) // Remove limit and offset for count
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          users: usersResult.rows,
          total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  /**
   * Get user by ID
   * @route GET /admin/users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          COALESCE(pu.id, uu.id) as id,
          COALESCE(pu.first_name, uu.first_name) as first_name,
          COALESCE(pu.last_name, uu.last_name) as last_name,
          COALESCE(pu.email, uu.email) as email,
          pu.phone,
          uu.university_id,
          uu.hall_of_residence,
          COALESCE('public', uu.user_type) as user_type,
          COALESCE(pu.is_active, uu.is_active) as is_active,
          COALESCE(pu.created_at, uu.created_at) as created_at,
          COALESCE(pu.updated_at, uu.updated_at) as updated_at
        FROM public_users pu
        FULL OUTER JOIN university_users uu ON false
        WHERE COALESCE(pu.id, uu.id) = $1
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Get user's subscriptions
      const subscriptionsQuery = `
        SELECT 
          us.id,
          us.status,
          us.payment_status,
          us.start_date,
          us.end_date,
          us.amount_paid,
          us.created_at,
          sp.name as plan_name,
          sp.duration_type,
          sp.price_cedis as plan_price
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        WHERE us.user_id = $1
        ORDER BY us.created_at DESC
      `;

      const subscriptions = await db.query(subscriptionsQuery, [id]);

      const user = {
        ...result.rows[0],
        subscriptions: subscriptions.rows
      };

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  /**
   * Update user information
   * @route PUT /admin/users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check if user exists and determine which table they're in
      const checkQuery = `
        SELECT 
          pu.id as public_id,
          uu.id as university_id,
          COALESCE('public', uu.user_type) as user_type
        FROM public_users pu
        FULL OUTER JOIN university_users uu ON false
        WHERE COALESCE(pu.id, uu.id) = $1
      `;

      const checkResult = await db.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const userRecord = checkResult.rows[0];
      const isPublicUser = userRecord.public_id !== null;

      // Build update query based on user type
      let updateQuery: string;
      const updateParams: any[] = [];
      const updateFields: string[] = [];
      let paramCount = 0;

      if (isPublicUser) {
        // Update public user
        if (updates.firstName) {
          paramCount++;
          updateFields.push(`first_name = $${paramCount}`);
          updateParams.push(updates.firstName);
        }
        if (updates.lastName) {
          paramCount++;
          updateFields.push(`last_name = $${paramCount}`);
          updateParams.push(updates.lastName);
        }
        if (updates.email) {
          paramCount++;
          updateFields.push(`email = $${paramCount}`);
          updateParams.push(updates.email);
        }
        if (updates.phone) {
          paramCount++;
          updateFields.push(`phone = $${paramCount}`);
          updateParams.push(updates.phone);
        }
        if (updates.isActive !== undefined) {
          paramCount++;
          updateFields.push(`is_active = $${paramCount}`);
          updateParams.push(updates.isActive);
        }

        paramCount++;
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateParams.push(id);

        updateQuery = `
          UPDATE public_users 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `;
      } else {
        // Update university user
        if (updates.firstName) {
          paramCount++;
          updateFields.push(`first_name = $${paramCount}`);
          updateParams.push(updates.firstName);
        }
        if (updates.lastName) {
          paramCount++;
          updateFields.push(`last_name = $${paramCount}`);
          updateParams.push(updates.lastName);
        }
        if (updates.email) {
          paramCount++;
          updateFields.push(`email = $${paramCount}`);
          updateParams.push(updates.email);
        }
        if (updates.hallOfResidence) {
          paramCount++;
          updateFields.push(`hall_of_residence = $${paramCount}`);
          updateParams.push(updates.hallOfResidence);
        }
        if (updates.isActive !== undefined) {
          paramCount++;
          updateFields.push(`is_active = $${paramCount}`);
          updateParams.push(updates.isActive);
        }

        paramCount++;
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateParams.push(id);

        updateQuery = `
          UPDATE university_users 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `;
      }

      if (updateFields.length === 1) { // Only updated_at
        res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
        return;
      }

      const result = await db.query(updateQuery, updateParams);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  /**
   * Activate user account
   * @route PATCH /admin/users/:id/activate
   */
  async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Try to update in both tables
      const publicUserQuery = `
        UPDATE public_users 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;

      const universityUserQuery = `
        UPDATE university_users 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;

      const [publicResult, universityResult] = await Promise.all([
        db.query(publicUserQuery, [id]).catch(() => ({ rows: [] })),
        db.query(universityUserQuery, [id]).catch(() => ({ rows: [] }))
      ]);

      if (publicResult.rows.length === 0 && universityResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User activated successfully'
      });
    } catch (error) {
      console.error('Error activating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate user'
      });
    }
  }

  /**
   * Deactivate user account
   * @route PATCH /admin/users/:id/deactivate
   */
  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Try to update in both tables
      const publicUserQuery = `
        UPDATE public_users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;

      const universityUserQuery = `
        UPDATE university_users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;

      const [publicResult, universityResult] = await Promise.all([
        db.query(publicUserQuery, [id]).catch(() => ({ rows: [] })),
        db.query(universityUserQuery, [id]).catch(() => ({ rows: [] }))
      ]);

      if (publicResult.rows.length === 0 && universityResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate user'
      });
    }
  }
}