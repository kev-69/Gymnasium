import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { paymentsApi } from '../../services/api';
import type { PaymentTransaction } from '../../types';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  onRetry?: (payment: PaymentTransaction) => void;
  onRefund?: (payment: PaymentTransaction) => void;
}

interface PaymentWithDetails extends PaymentTransaction {
  user_name?: string;
  user_email?: string;
  user_type?: string;
  subscription_id?: string;
  subscription_plan_name?: string;
  subscription_status?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
}

export function PaymentDetailsModal({
  isOpen,
  onClose,
  paymentId,
  onRetry,
  onRefund,
}: PaymentDetailsModalProps) {
  const [payment, setPayment] = useState<PaymentWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPaymentDetails();
    }
  }, [isOpen, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await paymentsApi.getTransactionById(paymentId);

      if (response.success && response.data) {
        setPayment(response.data);
      } else {
        setError(response.message || 'Failed to load payment details');
      }
    } catch (err: any) {
      console.error('Error fetching payment details:', err);
      setError(err.message || 'An error occurred while loading payment details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return '💳';
    const methodLower = method.toLowerCase();
    if (methodLower.includes('cash')) return '💵';
    if (methodLower.includes('card')) return '💳';
    if (methodLower.includes('mobile')) return '📱';
    if (methodLower.includes('bank')) return '🏦';
    return '💳';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details">
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
      ) : payment ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payment.amount)} {payment.currency}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Transaction ID: {payment.id}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}
              >
                {payment.status.toUpperCase()}
              </span>
            </div>

            {/* Payment Method Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-2xl">{getPaymentMethodIcon(payment.paymentMethod)}</span>
              <span className="font-medium">{payment.paymentMethod || 'Unknown method'}</span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900">Payment Information</h4>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Payment Reference</p>
                <p className="font-medium text-gray-900 break-all">{payment.paymentReference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(payment.amount)} {payment.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-900">{payment.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}
                >
                  {payment.status}
                </span>
              </div>
              {payment.paystackReference && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Paystack Reference</p>
                  <p className="font-medium text-gray-900 break-all">{payment.paystackReference}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">{formatDateTime(payment.createdAt)}</p>
              </div>
              {payment.paidAt && (
                <div>
                  <p className="text-sm text-gray-500">Paid At</p>
                  <p className="font-medium text-gray-900">{formatDateTime(payment.paidAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          {payment.user_name && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900">User Information</h4>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{payment.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{payment.user_email || 'N/A'}</p>
                </div>
                {payment.user_type && (
                  <div>
                    <p className="text-sm text-gray-500">User Type</p>
                    <p className="font-medium text-gray-900 capitalize">{payment.user_type}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Information */}
          {payment.subscription_id && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900">Related Subscription</h4>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Subscription ID</p>
                  <p className="font-medium text-gray-900 break-all">{payment.subscription_id}</p>
                </div>
                {payment.subscription_plan_name && (
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-medium text-gray-900">{payment.subscription_plan_name}</p>
                  </div>
                )}
                {payment.subscription_status && (
                  <div>
                    <p className="text-sm text-gray-500">Subscription Status</p>
                    <p className="font-medium text-gray-900 capitalize">{payment.subscription_status}</p>
                  </div>
                )}
                {payment.subscription_start_date && (
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">{formatDate(payment.subscription_start_date)}</p>
                  </div>
                )}
                {payment.subscription_end_date && (
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium text-gray-900">{formatDate(payment.subscription_end_date)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gateway Response */}
          {payment.gatewayResponse && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900">Gateway Response</h4>
              </div>
              <div className="p-6">
                <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-64 border border-gray-200">
                  {JSON.stringify(payment.gatewayResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Transaction Timeline */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900">Transaction Timeline</h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    {(payment.status === 'completed' || payment.status === 'failed') && (
                      <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-gray-900">Transaction Created</p>
                    <p className="text-xs text-gray-500">{formatDateTime(payment.createdAt)}</p>
                  </div>
                </div>

                {payment.paidAt && payment.status === 'completed' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Payment Completed</p>
                      <p className="text-xs text-gray-500">{formatDateTime(payment.paidAt)}</p>
                    </div>
                  </div>
                )}

                {payment.status === 'failed' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Payment Failed</p>
                      <p className="text-xs text-gray-500">{formatDateTime(payment.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {payment.status === 'cancelled' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Payment Cancelled</p>
                      <p className="text-xs text-gray-500">{formatDateTime(payment.updatedAt)}</p>
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
            {payment.status === 'failed' && onRetry && (
              <button
                onClick={() => {
                  onRetry(payment);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Retry Payment
              </button>
            )}
            {payment.status === 'completed' && onRefund && (
              <button
                onClick={() => {
                  onRefund(payment);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Process Refund
              </button>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
