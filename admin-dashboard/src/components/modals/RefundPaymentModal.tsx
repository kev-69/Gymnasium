import { useState } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { PaymentTransaction } from '../../types';

interface RefundPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment: PaymentTransaction;
}

export function RefundPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  payment,
}: RefundPaymentModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState(payment.amount.toString());
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedReasons = [
    'Subscription cancelled',
    'Duplicate payment',
    'Service not delivered',
    'Customer request',
    'Technical error',
    'Overcharged',
    'Other (specify below)',
  ];

  const handleRefundTypeChange = (type: 'full' | 'partial') => {
    setRefundType(type);
    if (type === 'full') {
      setRefundAmount(payment.amount.toString());
    }
    setError('');
  };

  const validateForm = () => {
    if (!reason) {
      setError('Please select a refund reason');
      return false;
    }
    if (reason === 'Other (specify below)' && !customReason.trim()) {
      setError('Please provide a custom reason');
      return false;
    }
    if (refundType === 'partial') {
      const amount = parseFloat(refundAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid refund amount');
        return false;
      }
      if (amount > payment.amount) {
        setError('Refund amount cannot exceed the original payment amount');
        return false;
      }
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

      // TODO: Implement actual refund API call
      // const refundData = {
      //   paymentId: payment.id,
      //   refundType,
      //   refundAmount: parseFloat(refundAmount),
      //   reason: reason === 'Other (specify below)' ? customReason : reason,
      // };
      
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For now, just show success
      console.log('Refund processed:', {
        paymentId: payment.id,
        refundType,
        refundAmount: parseFloat(refundAmount),
        reason: reason === 'Other (specify below)' ? customReason : reason,
      });

      // Reset form
      setRefundType('full');
      setRefundAmount(payment.amount.toString());
      setReason('');
      setCustomReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error processing refund:', err);
      setError(err.message || 'An error occurred while processing the refund');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRefundType('full');
      setRefundAmount(payment.amount.toString());
      setReason('');
      setCustomReason('');
      setError('');
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return `GH₵${amount.toFixed(2)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Process Refund">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Warning Banner */}
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
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Refund Feature - Coming Soon
              </h4>
              <p className="text-sm text-yellow-800">
                This is a placeholder for the refund processing feature. Integration with payment
                gateway refund APIs will be implemented in a future update.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Payment Reference</p>
              <p className="font-medium text-gray-900 break-all">{payment.paymentReference}</p>
            </div>
            <div>
              <p className="text-gray-600">Amount Paid</p>
              <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method</p>
              <p className="font-medium text-gray-900">{payment.paymentMethod || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Refund Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Refund Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRefundTypeChange('full')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                refundType === 'full'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              disabled={loading}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    refundType === 'full'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {refundType === 'full' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-semibold text-gray-900">Full Refund</span>
              </div>
              <p className="text-sm text-gray-600">
                Refund the entire amount of {formatCurrency(payment.amount)}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleRefundTypeChange('partial')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                refundType === 'partial'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              disabled={loading}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    refundType === 'partial'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {refundType === 'partial' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-semibold text-gray-900">Partial Refund</span>
              </div>
              <p className="text-sm text-gray-600">
                Refund a specific amount less than {formatCurrency(payment.amount)}
              </p>
            </button>
          </div>
        </div>

        {/* Refund Amount (for partial refunds) */}
        {refundType === 'partial' && (
          <div>
            <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount (GH₵) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">GH₵</span>
              <input
                type="number"
                id="refundAmount"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={payment.amount}
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Maximum refund amount: {formatCurrency(payment.amount)}
            </p>
          </div>
        )}

        {/* Refund Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Refund Reason <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          >
            <option value="">Select a reason...</option>
            {predefinedReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Reason */}
        {reason === 'Other (specify below)' && (
          <div>
            <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="customReason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please provide details for the refund..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={loading}
              required
            />
          </div>
        )}

        {/* Refund Summary */}
        {reason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-semibold text-red-900 mb-2">Refund Summary</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li className="flex justify-between">
                <span>Refund Type:</span>
                <strong className="capitalize">{refundType} Refund</strong>
              </li>
              <li className="flex justify-between">
                <span>Refund Amount:</span>
                <strong>{formatCurrency(parseFloat(refundAmount || '0'))}</strong>
              </li>
              <li className="flex justify-between">
                <span>Reason:</span>
                <strong>{reason === 'Other (specify below)' ? 'Custom' : reason}</strong>
              </li>
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading && <LoadingSpinner size="sm" />}
            {loading ? 'Processing...' : 'Process Refund'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
