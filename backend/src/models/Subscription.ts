import { db } from '@/config/database';
import { SubscriptionPlan, UserSubscription, PaymentTransaction } from '@/types';

export class SubscriptionPlanModel {
  static async findAll(): Promise<SubscriptionPlan[]> {
    const query = `
      SELECT id, name, user_type, duration_type, price_cedis, duration_days, 
             description, is_active, created_at, updated_at
      FROM subscription_plans 
      WHERE is_active = true
      ORDER BY user_type, 
               CASE duration_type 
                 WHEN 'walk-in' THEN 1 
                 WHEN 'monthly' THEN 2 
                 WHEN 'semester' THEN 3 
                 WHEN 'half-year' THEN 4 
                 WHEN 'yearly' THEN 5 
               END
    `;
    const result = await db.query(query);
    return result.rows.map(this.mapRowToSubscriptionPlan);
  }

  static async findByUserType(userType: 'student' | 'staff' | 'public'): Promise<SubscriptionPlan[]> {
    const query = `
      SELECT id, name, user_type, duration_type, price_cedis, duration_days, 
             description, is_active, created_at, updated_at
      FROM subscription_plans 
      WHERE user_type = $1 AND is_active = true
      ORDER BY CASE duration_type 
                 WHEN 'walk-in' THEN 1 
                 WHEN 'monthly' THEN 2 
                 WHEN 'semester' THEN 3 
                 WHEN 'half-year' THEN 4 
                 WHEN 'yearly' THEN 5 
               END
    `;
    const result = await db.query(query, [userType]);
    return result.rows.map(this.mapRowToSubscriptionPlan);
  }

  static async findById(id: string): Promise<SubscriptionPlan | null> {
    const query = `
      SELECT id, name, user_type, duration_type, price_cedis, duration_days, 
             description, is_active, created_at, updated_at
      FROM subscription_plans 
      WHERE id = $1 AND is_active = true
    `;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToSubscriptionPlan(result.rows[0]);
  }

  private static mapRowToSubscriptionPlan(row: any): SubscriptionPlan {
    return {
      id: row.id,
      name: row.name,
      userType: row.user_type,
      durationType: row.duration_type,
      priceCedis: parseFloat(row.price_cedis),
      durationDays: row.duration_days,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export class UserSubscriptionModel {
  static async create(subscriptionData: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSubscription> {
    const query = `
      INSERT INTO user_subscriptions (
        user_id, subscription_plan_id, status, payment_status, 
        start_date, end_date, payment_reference, amount_paid, 
        currency, auto_renew
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      subscriptionData.userId,
      subscriptionData.subscriptionPlanId,
      subscriptionData.status,
      subscriptionData.paymentStatus,
      subscriptionData.startDate,
      subscriptionData.endDate,
      subscriptionData.paymentReference,
      subscriptionData.amountPaid,
      subscriptionData.currency,
      subscriptionData.autoRenew
    ];
    
    const result = await db.query(query, values);
    return this.mapRowToUserSubscription(result.rows[0]);
  }

  static async findByUserId(userId: string): Promise<UserSubscription[]> {
    const query = `
      SELECT us.*, sp.name as plan_name, sp.user_type, sp.duration_type
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
      WHERE us.user_id = $1
      ORDER BY us.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows.map(this.mapRowToUserSubscription);
  }

  static async findActiveByUserId(userId: string): Promise<UserSubscription | null> {
    const query = `
      SELECT us.*, sp.name as plan_name, sp.user_type, sp.duration_type
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
      WHERE us.user_id = $1 
        AND us.status = 'active' 
        AND us.end_date > CURRENT_TIMESTAMP
      ORDER BY us.end_date DESC
      LIMIT 1
    `;
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUserSubscription(result.rows[0]);
  }

  static async findByPaymentReference(paymentReference: string): Promise<UserSubscription | null> {
    const query = `
      SELECT us.*, sp.name as plan_name, sp.user_type, sp.duration_type
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
      WHERE us.payment_reference = $1
    `;
    const result = await db.query(query, [paymentReference]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUserSubscription(result.rows[0]);
  }

  static async updateStatus(id: string, status: UserSubscription['status'], paymentStatus?: UserSubscription['paymentStatus']): Promise<UserSubscription | null> {
    let query = `
      UPDATE user_subscriptions 
      SET status = $2
    `;
    const values = [id, status];
    
    if (paymentStatus) {
      query += `, payment_status = $3`;
      values.push(paymentStatus);
    }
    
    query += ` WHERE id = $1 RETURNING *`;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUserSubscription(result.rows[0]);
  }

  static async activateSubscription(id: string, startDate: Date, endDate: Date): Promise<UserSubscription | null> {
    const query = `
      UPDATE user_subscriptions 
      SET status = 'active', 
          payment_status = 'completed',
          start_date = $2,
          end_date = $3
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await db.query(query, [id, startDate, endDate]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUserSubscription(result.rows[0]);
  }

  private static mapRowToUserSubscription(row: any): UserSubscription {
    return {
      id: row.id,
      userId: row.user_id,
      subscriptionPlanId: row.subscription_plan_id,
      status: row.status,
      paymentStatus: row.payment_status,
      startDate: row.start_date,
      endDate: row.end_date,
      paymentReference: row.payment_reference,
      amountPaid: row.amount_paid ? parseFloat(row.amount_paid) : undefined,
      currency: row.currency,
      autoRenew: row.auto_renew,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export class PaymentTransactionModel {
  static async create(transactionData: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentTransaction> {
    const query = `
      INSERT INTO payment_transactions (
        user_subscription_id, payment_reference, paystack_reference,
        amount, currency, status, payment_method, gateway_response, paid_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      transactionData.userSubscriptionId,
      transactionData.paymentReference,
      transactionData.paystackReference,
      transactionData.amount,
      transactionData.currency,
      transactionData.status,
      transactionData.paymentMethod,
      transactionData.gatewayResponse,
      transactionData.paidAt
    ];
    
    const result = await db.query(query, values);
    return this.mapRowToPaymentTransaction(result.rows[0]);
  }

  static async findByReference(paymentReference: string): Promise<PaymentTransaction | null> {
    const query = `
      SELECT * FROM payment_transactions 
      WHERE payment_reference = $1
    `;
    const result = await db.query(query, [paymentReference]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToPaymentTransaction(result.rows[0]);
  }

  static async updateStatus(
    paymentReference: string, 
    status: PaymentTransaction['status'],
    gatewayResponse?: string,
    paidAt?: Date
  ): Promise<PaymentTransaction | null> {
    let query = `
      UPDATE payment_transactions 
      SET status = $2
    `;
    const values = [paymentReference, status];
    
    if (gatewayResponse) {
      query += `, gateway_response = $${values.length + 1}`;
      values.push(gatewayResponse);
    }
    
    if (paidAt) {
      query += `, paid_at = $${values.length + 1}`;
      values.push(paidAt.toISOString());
    }
    
    query += ` WHERE payment_reference = $1 RETURNING *`;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToPaymentTransaction(result.rows[0]);
  }

  private static mapRowToPaymentTransaction(row: any): PaymentTransaction {
    return {
      id: row.id,
      userSubscriptionId: row.user_subscription_id,
      paymentReference: row.payment_reference,
      paystackReference: row.paystack_reference,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      paymentMethod: row.payment_method,
      gatewayResponse: row.gateway_response,
      paidAt: row.paid_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}