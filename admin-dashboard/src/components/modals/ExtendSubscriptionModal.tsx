import { useState } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { subscriptionsApi } from '../../services/api';
import type { UserSubscription } from '../../types';

interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription: UserSubscription;
}

export default function ExtendSubscriptionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  subscription 
}: ExtendSubscriptionModalProps) {
  const [days, setDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const extensionDays = useCustom ? parseInt(customDays) : days;

    if (!extensionDays || extensionDays <= 0) {
      setError('Please enter a valid number of days');
      return;
    }

    if (extensionDays > 365) {
      setError('Extension cannot exceed 365 days');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await subscriptionsApi.extendSubscription(subscription.id, extensionDays);

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend subscription');
      console.error('Extension error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDays(30);
    setCustomDays('');
    setUseCustom(false);
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

  const calculateNewEndDate = () => {
    if (!subscription.endDate) return 'N/A';
    
    const extensionDays = useCustom ? parseInt(customDays) || 0 : days;
    const currentEndDate = new Date(subscription.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + extensionDays);
    
    return formatDate(newEndDate.toISOString());
  };

  const presetDays = [7, 14, 30, 60, 90];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Extend Subscription" size="md">
      <div className="space-y-6">
        {/* Subscription Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-900">User:</span>
              <span className="text-sm text-blue-700">
                {(subscription as any).user_name || 'Unknown User'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-900">Plan:</span>
              <span className="text-sm text-blue-700">
                {(subscription as any).plan_name || 'Unknown Plan'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-900">Current End Date:</span>
              <span className="text-sm text-blue-700">
                {formatDate(subscription.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-blue-900">Status:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                subscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
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

        {/* Extension Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Extension Period
          </label>
          
          {/* Preset Days */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {presetDays.map((presetDay) => (
              <button
                key={presetDay}
                onClick={() => {
                  setDays(presetDay);
                  setUseCustom(false);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                  !useCustom && days === presetDay
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {presetDay} days
              </button>
            ))}
          </div>

          {/* Custom Days */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setUseCustom(!useCustom)}
              className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                useCustom
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              Custom
            </button>
            {useCustom && (
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="Enter days..."
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">days</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New End Date Preview */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-900">New End Date:</span>
            <span className="text-lg font-bold text-green-700">
              {calculateNewEndDate()}
            </span>
          </div>
          <p className="text-xs text-green-600 mt-2">
            {useCustom ? (customDays || 0) : days} days will be added to the current end date
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (!useCustom && !days) || (useCustom && !customDays)}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Extending...</span>
              </span>
            ) : (
              'Extend Subscription'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
