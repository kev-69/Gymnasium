import { useState } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { subscriptionsApi } from '../../services/api';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePlanModal({ isOpen, onClose, onSuccess }: CreatePlanModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceCedis: '',
    durationDays: '',
    userType: 'student' as 'student' | 'staff' | 'public',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        isActive: true,
      };

      const response = await subscriptionsApi.createPlan(planData);

      if (response.success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          priceCedis: '',
          durationDays: '',
          userType: 'student',
        });
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to create subscription plan');
      }
    } catch (err: any) {
      console.error('Error creating plan:', err);
      setError(err.message || 'An error occurred while creating the plan');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        priceCedis: '',
        durationDays: '',
        userType: 'student',
      });
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Subscription Plan">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
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
          <p className="mt-1 text-xs text-gray-500">
            Select which user type can subscribe to this plan
          </p>
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
          <p className="mt-1 text-xs text-gray-500">
            Click a preset or enter custom number of days
          </p>
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
          <p className="mt-1 text-xs text-gray-500">
            Optional description to help users understand the plan
          </p>
        </div>

        {/* Summary */}
        {formData.name && formData.priceCedis && formData.durationDays && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Plan Summary</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>{formData.name}</strong> for <strong>{formData.userType}s</strong></li>
              <li>• Price: <strong>GH₵{parseFloat(formData.priceCedis).toFixed(2)}</strong></li>
              <li>• Duration: <strong>{formData.durationDays} days</strong> ({Math.round(parseInt(formData.durationDays) / 30)} month{Math.round(parseInt(formData.durationDays) / 30) !== 1 ? 's' : ''})</li>
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
            disabled={loading}
          >
            {loading && <LoadingSpinner size="sm" />}
            {loading ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
