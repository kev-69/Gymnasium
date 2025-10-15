import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { subscriptionsApi } from '../../services/api';
import type { UserSubscription, PaymentTransaction } from '../../types';

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  onExtend?: (subscription: UserSubscription) => void;
  onCancel?: (subscription: UserSubscription) => void;
}

interface SubscriptionWithPayments extends UserSubscription {
  payments?: PaymentTransaction[];
  user_name?: string;
  user_email?: string;
  user_type?: string;
  phone?: string;
  university_id?: string;
  hall_of_residence?: string;
  plan_name?: string;
  plan_description?: string;
  plan_price?: number;
  plan_user_type?: string;
  duration_days?: number;
}

export function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscriptionId,
  onExtend,
  onCancel,
}: SubscriptionDetailsModalProps) {
  const [subscription, setSubscription] = useState<SubscriptionWithPayments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && subscriptionId) {
      fetchSubscriptionDetails();
    }
  }, [isOpen, subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await subscriptionsApi.getSubscriptionById(subscriptionId);

      if (response.success && response.data) {
        setSubscription(response.data);
      } else {
        setError(response.message || 'Failed to load subscription details');
      }
    } catch (err: any) {
      console.error('Error fetching subscription details:', err);
      setError(err.message || 'An error occurred while loading subscription details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `GH₵${amount.toFixed(2)}`;
  };

  const calculateRemainingDays = () => {
    if (!subscription?.endDate) return 0;
    const today = new Date();
    const end = new Date(subscription.endDate);
    const diff = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calculateProgress = () => {
    if (!subscription?.startDate || !subscription?.endDate) return 0;
    const start = new Date(subscription.startDate).getTime();
    const end = new Date(subscription.endDate).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const totalPaid = subscription?.payments?.reduce(
    (sum, payment) => sum + (payment.status === 'completed' ? payment.amount : 0),
    0
  ) || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subscription Details">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      ) : subscription ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {subscription.plan_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Subscription ID: {subscription.id}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(subscription.status)}`}>
                  {subscription.status.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(subscription.paymentStatus)}`}>
                  {subscription.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Progress Bar for Active Subscriptions */}
            {subscription.status === 'active' && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {calculateRemainingDays()} days remaining
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(calculateProgress())}% elapsed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900">User Information</h4>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{subscription.user_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{subscription.user_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {subscription.user_type || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{subscription.phone || 'N/A'}</p>
              </div>
              {subscription.university_id && (
                <div>
                  <p className="text-sm text-gray-500">University ID</p>
                  <p className="font-medium text-gray-900">{subscription.university_id}</p>
                </div>
              )}
              {subscription.hall_of_residence && (
                <div>
                  <p className="text-sm text-gray-500">Hall of Residence</p>
                  <p className="font-medium text-gray-900">{subscription.hall_of_residence}</p>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Details */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900">Subscription Details</h4>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium text-gray-900">{subscription.plan_name}</p>
                {subscription.plan_description && (
                  <p className="text-xs text-gray-600 mt-1">{subscription.plan_description}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Plan Price</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(subscription.plan_price || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">
                  {subscription.duration_days || 0} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(subscription.amountPaid)} {subscription.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">{formatDate(subscription.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(subscription.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Auto Renew</p>
                <p className="font-medium text-gray-900">
                  {subscription.autoRenew ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Reference</p>
                <p className="font-medium text-gray-900 break-all">
                  {subscription.paymentReference || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">Payment History</h4>
                <span className="text-sm font-medium text-gray-700">
                  Total: {formatCurrency(totalPaid)}
                </span>
              </div>
            </div>
            <div className="p-6">
              {subscription.payments && subscription.payments.length > 0 ? (
                <div className="space-y-4">
                  {subscription.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusBadge(payment.status)}`}
                          >
                            {payment.status}
                          </span>
                          {payment.paymentMethod && (
                            <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300">
                              {payment.paymentMethod}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {formatCurrency(payment.amount)} {payment.currency}
                        </p>
                        <p className="text-xs text-gray-600">
                          Reference: {payment.paymentReference}
                        </p>
                        {payment.paystackReference && (
                          <p className="text-xs text-gray-600">
                            Paystack: {payment.paystackReference}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(payment.paidAt || payment.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No payment history available</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900">Timeline</h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-gray-900">Subscription Created</p>
                    <p className="text-xs text-gray-500">{formatDateTime(subscription.createdAt)}</p>
                  </div>
                </div>

                {subscription.startDate && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      {subscription.endDate && <div className="w-0.5 h-full bg-gray-300 mt-2"></div>}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900">Subscription Started</p>
                      <p className="text-xs text-gray-500">{formatDateTime(subscription.startDate)}</p>
                    </div>
                  </div>
                )}

                {subscription.endDate && subscription.status !== 'cancelled' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          subscription.status === 'expired' ? 'bg-red-600' : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {subscription.status === 'expired' ? 'Subscription Expired' : 'Subscription Ends'}
                      </p>
                      <p className="text-xs text-gray-500">{formatDateTime(subscription.endDate)}</p>
                    </div>
                  </div>
                )}

                {subscription.status === 'cancelled' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Subscription Cancelled</p>
                      <p className="text-xs text-gray-500">{formatDateTime(subscription.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            {subscription.status === 'active' && onExtend && (
              <button
                onClick={() => {
                  onExtend(subscription);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Extend Subscription
              </button>
            )}
            {subscription.status === 'active' && onCancel && (
              <button
                onClick={() => {
                  onCancel(subscription);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
