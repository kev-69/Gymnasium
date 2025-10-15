import { useState } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { subscriptionsApi } from '../../services/api';
import type { SubscriptionPlan } from '../../types';

interface TogglePlanStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: SubscriptionPlan;
}

export function TogglePlanStatusModal({
  isOpen,
  onClose,
  onSuccess,
  plan,
}: TogglePlanStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isActivating = !plan.isActive;
  const action = isActivating ? 'Activate' : 'Deactivate';

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await subscriptionsApi.updatePlan(plan.id, {
        isActive: !plan.isActive,
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || `Failed to ${action.toLowerCase()} plan`);
      }
    } catch (err: any) {
      console.error(`Error ${action.toLowerCase()}ing plan:`, err);
      setError(err.message || `An error occurred while ${action.toLowerCase()}ing the plan`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${action} Subscription Plan`}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Plan Info Card */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">User Type</p>
              <p className="font-medium text-gray-900 capitalize">{plan.userType}</p>
            </div>
            <div>
              <p className="text-gray-600">Price</p>
              <p className="font-medium text-gray-900">GH₵{plan.priceCedis.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">Duration</p>
              <p className="font-medium text-gray-900">{plan.durationDays} days</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className={`font-medium ${plan.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          {plan.description && (
            <p className="mt-3 text-sm text-gray-700 border-t border-gray-300 pt-3">
              {plan.description}
            </p>
          )}
        </div>

        {/* Warning Message */}
        {isActivating ? (
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
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-green-900 mb-1">Activate Plan</h4>
                <p className="text-sm text-green-800">
                  This plan will be made available for new subscriptions. Users will be able to
                  see and subscribe to this plan.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">Deactivate Plan</h4>
                <p className="text-sm text-yellow-800 mb-2">
                  This plan will be hidden from new subscriptions. Users won't be able to subscribe
                  to this plan anymore.
                </p>
                <p className="text-sm text-yellow-800 font-medium">
                  Note: Existing active subscriptions using this plan will not be affected.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Question */}
        <div className="text-center py-2">
          <p className="text-base font-medium text-gray-900">
            Are you sure you want to {action.toLowerCase()} this plan?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isActivating
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
            disabled={loading}
          >
            {loading && <LoadingSpinner size="sm" />}
            {loading ? `${action.slice(0, -1)}ing...` : action}
          </button>
        </div>
      </div>
    </Modal>
  );
}
