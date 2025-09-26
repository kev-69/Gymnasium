// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  userType: 'student' | 'staff' | 'public';
  createdAt: string;
  updatedAt: string;
}

export interface UniversityUser extends User {
  userType: 'student' | 'staff';
  studentId?: string;
  staffId?: string;
  firstName: string;
  lastName: string;
  department: string;
  program?: string;
  yearOfStudy?: number;
  phoneNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface PublicUser extends User {
  userType: 'public';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  address: string;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  priceCedis: number;
  durationDays: number;
  userType: 'student' | 'staff' | 'public';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentReference?: string;
  startDate?: string;
  endDate?: string;
  amountPaid: number;
  currency: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  plan?: SubscriptionPlan;
  user?: User;
}

// Payment Types
export interface PaymentTransaction {
  id: string;
  userSubscriptionId: string;
  paymentReference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalUsers: number;
  publicUsers: number;
  universityUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  pendingSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  newSubscriptionsThisMonth: number;
  newUsersThisMonth: number;
  usersByType?: {
    student: number;
    staff: number;
    public: number;
  };
  subscriptionsByStatus?: {
    active: number;
    pending: number;
    expired: number;
    cancelled: number;
  };
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  subscriptions: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CreateUserForm {
  userType: 'student' | 'staff' | 'public';
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  // University user fields
  studentId?: string;
  staffId?: string;
  department?: string;
  program?: string;
  yearOfStudy?: number;
  // Public user fields
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface UpdateUserForm extends Partial<CreateUserForm> {
  id: string;
}

export interface CreateSubscriptionPlanForm {
  name: string;
  description?: string;
  priceCedis: number;
  durationDays: number;
  userType: 'student' | 'staff' | 'public';
  isActive: boolean;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: any;
  current: boolean;
  badge?: number;
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

// Filter Types
export interface UserFilters {
  userType?: 'student' | 'staff' | 'public';
  search?: string;
  department?: string;
  hasActiveSubscription?: boolean;
}

export interface SubscriptionFilters {
  status?: 'pending' | 'active' | 'expired' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'cancelled';
  userType?: 'student' | 'staff' | 'public';
  planId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PaymentFilters {
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  amountRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    from: string;
    to: string;
  };
}

// Utility Types
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}