import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount in Ghana Cedis
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date in a readable format
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date and time in a readable format
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const then = new Date(date);
  const diffInMs = then.getTime() - now.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  } else if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  } else {
    return rtf.format(diffInDays, 'day');
  }
}

/**
 * Get user type display name
 */
export function getUserTypeDisplay(userType: 'student' | 'staff' | 'public'): string {
  const types = {
    student: 'Student',
    staff: 'Staff',
    public: 'Public',
  };
  return types[userType] || userType;
}

/**
 * Get subscription status display name
 */
export function getSubscriptionStatusDisplay(status: string): string {
  const statuses = {
    pending: 'Pending',
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Cancelled',
  };
  return statuses[status as keyof typeof statuses] || status;
}

/**
 * Get payment status display name
 */
export function getPaymentStatusDisplay(status: string): string {
  const statuses = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return statuses[status as keyof typeof statuses] || status;
}

/**
 * Get status badge class names
 */
export function getStatusBadgeClass(status: string): string {
  const classes = {
    // Subscription status
    active: 'badge-success',
    pending: 'badge-warning',
    expired: 'badge-secondary',
    cancelled: 'badge-danger',
    // Payment status
    completed: 'badge-success',
    failed: 'badge-danger',
  };
  return classes[status as keyof typeof classes] || 'badge-secondary';
}

/**
 * Calculate subscription duration in human readable format
 */
export function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days === 7) return '1 week';
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days === 30) return '1 month';
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} year${days >= 730 ? 's' : ''}`;
}

/**
 * Generate random color for charts
 */
export function generateChartColor(index: number): string {
  const colors = [
    '#0ea5e9', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
  ];
  return colors[index % colors.length];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate initials from name
 */
export function getInitials(firstName: string, lastName?: string): string {
  if (!lastName) {
    return firstName.charAt(0).toUpperCase();
  }
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by search term
 */
export function filterBySearch<T>(
  array: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] {
  if (!searchTerm) return array;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return array.filter(item =>
    searchKeys.some(key => {
      const value = item[key];
      return typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm);
    })
  );
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}