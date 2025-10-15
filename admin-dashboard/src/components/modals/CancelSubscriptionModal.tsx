import { useState } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { subscriptionsApi } from '../../services/api';
import type { UserSubscription } from '../../types';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription: UserSubscription;
}

export default function CancelSubscriptionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  subscription 
}: CancelSubscriptionModalProps) {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [processRefund, setProcessRefund] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedReasons = [
    'User request',
    'Payment issues',
    'Service quality',
    'Moving away',
    'Health reasons',
    'No longer needed',
    'Other'
  ];

  const handleSubmit = async () => {
    const finalReason = selectedReason === 'Other' ? reason : selectedReason;

    if (!finalReason.trim()) {
      setError('Please select or enter a cancellation reason');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await subscriptionsApi.cancelSubscription(subscription.id, finalReason);

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      console.error('Cancellation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setSelectedReason('');
    setProcessRefund(false);
    setError(null);
    onClose();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₵${(numAmount || 0).toFixed(2)}`;
  };

  const calculateRemainingDays = () => {
    if (!subscription.endDate) return 0;
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cancel Subscription" size="md">
      <div className="space-y-6">
        {/* Warning Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Warning: This action cannot be undone
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Cancelling this subscription will immediately revoke the user's gym access.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">User:</span>
              <span className="text-sm text-gray-700">
                {(subscription as any).user_name || 'Unknown User'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">Plan:</span>
              <span className="text-sm text-gray-700">
                {(subscription as any).plan_name || 'Unknown Plan'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">Amount Paid:</span>
              <span className="text-sm text-gray-700">
                {formatCurrency((subscription as any).amount_paid || subscription.amountPaid || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">Start Date:</span>
              <span className="text-sm text-gray-700">
                {formatDate(subscription.startDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">End Date:</span>
              <span className="text-sm text-gray-700">
                {formatDate(subscription.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">Remaining Days:</span>
              <span className="text-sm font-semibold text-red-600">
                {calculateRemainingDays()} days
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Cancellation Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Reason for Cancellation <span className="text-red-500">*</span>
          </label>
          
          {/* Predefined Reasons */}
          <div className="space-y-2 mb-4">
            {predefinedReasons.map((presetReason) => (
              <label
                key={presetReason}
                className="flex items-center p-3 border-2 rounded-md cursor-pointer transition-all hover:bg-gray-50"
                style={{
                  borderColor: selectedReason === presetReason ? '#3B82F6' : '#E5E7EB',
                  backgroundColor: selectedReason === presetReason ? '#EFF6FF' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={presetReason}
                  checked={selectedReason === presetReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    if (e.target.value !== 'Other') {
                      setReason('');
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">{presetReason}</span>
              </label>
            ))}
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'Other' && (
            <div className="mt-3">
              <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
                Please specify the reason
              </label>
              <textarea
                id="customReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Enter cancellation reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Refund Option (Optional - for future implementation) */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={processRefund}
              onChange={(e) => setProcessRefund(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-blue-900">Process refund</span>
              <p className="text-xs text-blue-700 mt-1">
                Issue a prorated refund for the remaining {calculateRemainingDays()} days
                {processRefund && (
                  <span className="block mt-1 font-semibold">
                    (Refund amount calculation: Coming soon)
                  </span>
                )}
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Keep Subscription
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (!selectedReason && !reason.trim())}
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Cancelling...</span>
              </span>
            ) : (
              'Cancel Subscription'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
