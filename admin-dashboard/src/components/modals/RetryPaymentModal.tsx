import { useState } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { paymentsApi } from '../../services/api';
import type { PaymentTransaction } from '../../types';

interface RetryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment: PaymentTransaction;
}

export function RetryPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  payment,
}: RetryPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const response = await paymentsApi.retryPayment(payment.id);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(response.message || 'Failed to retry payment');
      }
    } catch (err: any) {
      console.error('Error retrying payment:', err);
      setError(err.message || 'An error occurred while retrying the payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return `GH₵${amount.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Parse gateway error if available
  const getGatewayError = () => {
    if (!payment.gatewayResponse) return null;
    
    try {
      const response = typeof payment.gatewayResponse === 'string' 
        ? JSON.parse(payment.gatewayResponse) 
        : payment.gatewayResponse;
      
      return response.message || response.error || response.status || null;
    } catch {
      return null;
    }
  };

  const gatewayError = getGatewayError();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Retry Payment">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-sm text-green-600">
                Payment retry initiated successfully! The system will attempt to process this payment again.
              </p>
            </div>
          </div>
        )}

        {/* Payment Information Card */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Payment Reference</p>
              <p className="font-medium text-gray-900 break-all">{payment.paymentReference}</p>
            </div>
            <div>
              <p className="text-gray-600">Amount</p>
              <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method</p>
              <p className="font-medium text-gray-900">{payment.paymentMethod || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                {payment.status}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">Failed At</p>
              <p className="font-medium text-gray-900">{formatDateTime(payment.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Gateway Error Display */}
        {gatewayError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">Gateway Error</h4>
                <p className="text-sm text-red-800">{gatewayError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Gateway Response (for debugging) */}
        {payment.gatewayResponse && (
          <details className="bg-white rounded-lg border border-gray-200">
            <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium text-sm text-gray-700">
              View Full Gateway Response
            </summary>
            <div className="px-4 pb-4">
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-48 border border-gray-200">
                {JSON.stringify(payment.gatewayResponse, null, 2)}
              </pre>
            </div>
          </details>
        )}

        {/* Information Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">About Payment Retry</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>The system will attempt to reprocess this payment through the gateway</li>
                <li>The user may be notified to complete the payment again</li>
                <li>Check the payment status after a few minutes</li>
                <li>Multiple retry attempts may be needed for some errors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation Question */}
        {!success && (
          <div className="text-center py-2">
            <p className="text-base font-medium text-gray-900">
              Do you want to retry this payment?
            </p>
            <p className="text-sm text-gray-600 mt-1">
              This will initiate a new payment attempt for {formatCurrency(payment.amount)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            {success ? 'Close' : 'Cancel'}
          </button>
          {!success && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Retrying...' : 'Retry Payment'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
