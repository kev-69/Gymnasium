import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { subscriptionsApi } from '../../services/api';
import type { SubscriptionPlan } from '../../types';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: SubscriptionPlan;
}

export function EditPlanModal({ isOpen, onClose, onSuccess, plan }: EditPlanModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceCedis: '',
    durationDays: '',
    userType: 'student' as 'student' | 'staff' | 'public',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with plan data
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || '',
        priceCedis: plan.priceCedis.toString(),
        durationDays: plan.durationDays.toString(),
        userType: plan.userType,
        isActive: plan.isActive,
      });
    }
  }, [plan]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setError(''); // Clear error on input change
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Plan name is required');
      return false;
    }
    if (!formData.priceCedis || parseFloat(formData.priceCedis) <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
      setError('Valid duration is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const planData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        priceCedis: parseFloat(formData.priceCedis),
        durationDays: parseInt(formData.durationDays),
        userType: formData.userType,
        isActive: formData.isActive,
      };

      const response = await subscriptionsApi.updatePlan(plan.id, planData);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to update subscription plan');
      }
    } catch (err: any) {
      console.error('Error updating plan:', err);
      setError(err.message || 'An error occurred while updating the plan');
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

  // Common duration presets
  const durationPresets = [
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
    { label: '2 Months', days: 60 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
  ];

  const hasChanges = () => {
    return (
      formData.name !== plan.name ||
      formData.description !== (plan.description || '') ||
      parseFloat(formData.priceCedis) !== plan.priceCedis ||
      parseInt(formData.durationDays) !== plan.durationDays ||
      formData.userType !== plan.userType ||
      formData.isActive !== plan.isActive
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Subscription Plan">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!plan.isActive && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This plan is currently inactive. Enable it below to make it available for subscriptions.
            </p>
          </div>
        )}

        {/* Plan Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Plan Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Student Monthly Plan"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>

        {/* User Type */}
        <div>
          <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
            User Type <span className="text-red-500">*</span>
          </label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="public">Public</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="priceCedis" className="block text-sm font-medium text-gray-700 mb-2">
            Price (GH₵) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="priceCedis"
            name="priceCedis"
            value={formData.priceCedis}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>

        {/* Duration with Presets */}
        <div>
          <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Days) <span className="text-red-500">*</span>
          </label>
          
          {/* Duration Presets */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {durationPresets.map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, durationDays: preset.days.toString() }))}
                className={`px-3 py-2 text-xs font-medium border rounded-lg transition-colors ${
                  formData.durationDays === preset.days.toString()
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Duration Input */}
          <input
            type="number"
            id="durationDays"
            name="durationDays"
            value={formData.durationDays}
            onChange={handleChange}
            placeholder="Custom days"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the plan features and benefits..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
        </div>

        {/* Active Status Toggle */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={loading}
          />
          <label htmlFor="isActive" className="flex-1 text-sm font-medium text-gray-900">
            Active Plan
            <p className="text-xs text-gray-600 mt-1">
              {formData.isActive
                ? 'Plan is available for new subscriptions'
                : 'Plan is hidden and not available for new subscriptions'}
            </p>
          </label>
        </div>

        {/* Changes Summary */}
        {hasChanges() && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Changes Summary</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {formData.name !== plan.name && (
                <li>• Name: <strong>{plan.name}</strong> → <strong>{formData.name}</strong></li>
              )}
              {parseFloat(formData.priceCedis) !== plan.priceCedis && (
                <li>• Price: <strong>GH₵{plan.priceCedis}</strong> → <strong>GH₵{parseFloat(formData.priceCedis).toFixed(2)}</strong></li>
              )}
              {parseInt(formData.durationDays) !== plan.durationDays && (
                <li>• Duration: <strong>{plan.durationDays} days</strong> → <strong>{formData.durationDays} days</strong></li>
              )}
              {formData.userType !== plan.userType && (
                <li>• User Type: <strong>{plan.userType}</strong> → <strong>{formData.userType}</strong></li>
              )}
              {formData.isActive !== plan.isActive && (
                <li>• Status: <strong>{plan.isActive ? 'Active' : 'Inactive'}</strong> → <strong>{formData.isActive ? 'Active' : 'Inactive'}</strong></li>
              )}
            </ul>
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
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !hasChanges()}
          >
            {loading && <LoadingSpinner size="sm" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
