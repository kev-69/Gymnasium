import { api } from '../lib/api';
import type { 
  ApiResponse, 
  DashboardStats, 
  User, 
  UserSubscription, 
  PaymentTransaction, 
  SubscriptionPlan 
} from '../types';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return api.get('/admin/dashboard/stats');
  },

  /**
   * Get recent user registrations
   */
  async getRecentUsers(limit: number = 10): Promise<ApiResponse<User[]>> {
    return api.get(`/admin/users/recent?limit=${limit}`);
  },

  /**
   * Get recent subscriptions
   */
  async getRecentSubscriptions(limit: number = 10): Promise<ApiResponse<UserSubscription[]>> {
    return api.get(`/admin/subscriptions/recent?limit=${limit}`);
  },

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<ApiResponse<PaymentTransaction[]>> {
    return api.get(`/admin/payments/recent?limit=${limit}`);
  },

  /**
   * Get revenue analytics data
   */
  async getRevenueAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> {
    return api.get(`/admin/analytics/revenue?period=${period}`);
  },

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<ApiResponse<any>> {
    return api.get('/admin/analytics/subscriptions');
  },
};

export const usersApi = {
  /**
   * Get all users with filtering and pagination
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: 'student' | 'staff' | 'public';
    hasActiveSubscription?: boolean;
  } = {}): Promise<ApiResponse<{ users: User[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return api.get(`/admin/users?${searchParams.toString()}`);
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return api.get(`/admin/users/${id}`);
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return api.put(`/admin/users/${id}`, data);
  },

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<ApiResponse<void>> {
    return api.patch(`/admin/users/${id}/deactivate`);
  },

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<ApiResponse<void>> {
    return api.patch(`/admin/users/${id}/activate`);
  },
};

export const subscriptionsApi = {
  /**
   * Get all subscriptions with filtering
   */
  async getSubscriptions(params: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'active' | 'expired' | 'cancelled';
    userType?: 'student' | 'staff' | 'public';
    planId?: string;
  } = {}): Promise<ApiResponse<{ subscriptions: UserSubscription[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return api.get(`/admin/subscriptions?${searchParams.toString()}`);
  },

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<ApiResponse<UserSubscription>> {
    return api.get(`/admin/subscriptions/${id}`);
  },

  /**
   * Create walk-in subscription
   */
  async createWalkInSubscription(data: {
    userId: string;
    planId: string;
    amountPaid: number;
  }): Promise<ApiResponse<UserSubscription>> {
    return api.post('/admin/subscriptions/walk-in', data);
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(id: string, reason?: string): Promise<ApiResponse<void>> {
    return api.patch(`/admin/subscriptions/${id}/cancel`, { reason });
  },

  /**
   * Extend subscription
   */
  async extendSubscription(id: string, days: number): Promise<ApiResponse<UserSubscription>> {
    return api.patch(`/admin/subscriptions/${id}/extend`, { days });
  },

  /**
   * Get subscription plans
   */
  async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return api.get('/admin/subscription-plans');
  },

  /**
   * Create subscription plan
   */
  async createPlan(data: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SubscriptionPlan>> {
    return api.post('/admin/subscription-plans', data);
  },

  /**
   * Update subscription plan
   */
  async updatePlan(id: string, data: Partial<SubscriptionPlan>): Promise<ApiResponse<SubscriptionPlan>> {
    return api.put(`/admin/subscription-plans/${id}`, data);
  },
};

export const paymentsApi = {
  /**
   * Get all payment transactions
   */
  async getTransactions(params: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    method?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<{ transactions: PaymentTransaction[]; total: number; page: number; limit: number }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return api.get(`/admin/payments?${searchParams.toString()}`);
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<ApiResponse<PaymentTransaction>> {
    return api.get(`/admin/payments/${id}`);
  },

  /**
   * Retry failed payment
   */
  async retryPayment(transactionId: string): Promise<ApiResponse<void>> {
    return api.post(`/admin/payments/${transactionId}/retry`);
  },

  /**
   * Mark payment as completed (for walk-in payments)
   */
  async markPaymentCompleted(transactionId: string, data: {
    amountPaid: number;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiResponse<PaymentTransaction>> {
    return api.patch(`/admin/payments/${transactionId}/complete`, data);
  },
};

export const adminApi = {
  /**
   * Get current admin profile
   */
  async getProfile(): Promise<ApiResponse<any>> {
    return api.get('/auth/admin/me');
  },

  /**
   * Update admin profile
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<ApiResponse<any>> {
    return api.put('/auth/admin/profile', data);
  },

  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return api.put('/auth/admin/change-password', data);
  },

  /**
   * Get all admins (super admin only)
   */
  async getAllAdmins(): Promise<ApiResponse<any[]>> {
    return api.get('/auth/admin/all');
  },

  /**
   * Create new admin (super admin only)
   */
  async createAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'super_admin';
  }): Promise<ApiResponse<any>> {
    return api.post('/auth/admin/create', data);
  },
};