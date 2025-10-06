export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  userType: 'public';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UniversityUser {
  id: string;
  universityId: string; // 8-digit ID
  firstName: string;
  lastName: string;
  email: string;
  hallOfResidence?: string;
  userType: 'student' | 'staff';
  pinHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UniversityDatabase {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hallOfResidence?: string;
  userType: 'student' | 'staff';
  pinHash?: string;
  issueDate: Date;
  expiryDate?: Date; // NULL for staff
  academicYear?: string;
  program?: string;
  level?: string;
  faculty?: string;
  department?: string;
  status: 'active' | 'graduated' | 'suspended' | 'inactive';
  isActive: boolean;
}

export interface AuthTokenPayload {
  userId: string;
  userType: 'public' | 'student' | 'staff';
  email: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: 'admin' | 'super_admin';
}

export interface LoginRequest {
  email?: string;
  password?: string;
  universityId?: string;
  pin?: string;
}

export interface RegisterPublicUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterUniversityUserRequest {
  universityId: string;
  pin: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface IdLookupRequest {
  universityId: string;
}

export interface IdLookupResponse {
  found: boolean;
  isExpired?: boolean;
  data?: {
    firstName: string;
    lastName: string;
    email: string;
    hallOfResidence?: string;
    userType: 'student' | 'staff';
    issueDate: string;
    expiryDate?: string;
    academicYear?: string;
    program?: string;
    level?: string;
    faculty?: string;
    department?: string;
    status: string;
  };
  message?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  userType: 'student' | 'staff' | 'public';
  durationType: 'walk-in' | 'monthly' | 'semester' | 'half-year' | 'yearly';
  priceCedis: number;
  durationDays: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  startDate?: Date;
  endDate?: Date;
  paymentReference?: string;
  amountPaid?: number;
  currency: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  userSubscriptionId: string;
  paymentReference: string;
  paystackReference?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  paymentMethod?: string;
  gatewayResponse?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  planId: string;
  autoRenew?: boolean;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}