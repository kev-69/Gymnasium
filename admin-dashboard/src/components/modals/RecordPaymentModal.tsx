import { useState } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { paymentsApi } from '../../services/api';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionId: string;
  expectedAmount: number;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  transactionId,
  expectedAmount,
}: RecordPaymentModalProps) {
  const [formData, setFormData] = useState({
    amountPaid: expectedAmount.toString(),
    paymentMethod: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'mobile_money',
    receiptNumber: `RCP-${Date.now()}`,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
      setError('Valid amount is required');
      return false;
    }
    if (!formData.receiptNumber.trim()) {
      setError('Receipt number is required');
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

      const paymentData = {
        amountPaid: parseFloat(formData.amountPaid),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim() || `Manual payment recorded. Receipt: ${formData.receiptNumber}`,
      };

      const response = await paymentsApi.markPaymentCompleted(transactionId, paymentData);

      if (response.success) {
        // Reset form
        setFormData({
          amountPaid: expectedAmount.toString(),
          paymentMethod: 'cash',
          receiptNumber: `RCP-${Date.now()}`,
          notes: '',
        });
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to record payment');
      }
    } catch (err: any) {
      console.error('Error recording payment:', err);
      setError(err.message || 'An error occurred while recording the payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        amountPaid: expectedAmount.toString(),
        paymentMethod: 'cash',
        receiptNumber: `RCP-${Date.now()}`,
        notes: '',
      });
      setError('');
      onClose();
    }
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData((prev) => ({ ...prev, receiptNumber: `RCP-${timestamp}-${random}` }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Record Manual Payment">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Use this form to record walk-in or manual payments that were
            received outside the online payment gateway.
          </p>
        </div>

        {/* Amount Paid */}
        <div>
          <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid (GH₵) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">GH₵</span>
            <input
              type="number"
              id="amountPaid"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Expected amount: GH₵{expectedAmount.toFixed(2)}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          >
            <option value="cash">💵 Cash</option>
            <option value="card">💳 Card (POS)</option>
            <option value="bank_transfer">🏦 Bank Transfer</option>
            <option value="mobile_money">📱 Mobile Money</option>
          </select>
        </div>

        {/* Receipt Number */}
        <div>
          <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Receipt Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="receiptNumber"
              name="receiptNumber"
              value={formData.receiptNumber}
              onChange={handleChange}
              placeholder="RCP-XXXX-XXX"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={generateReceiptNumber}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Generate
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Unique receipt number for record keeping
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any additional information about this payment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Include any relevant details about the payment transaction
          </p>
        </div>

        {/* Payment Summary */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Summary</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex justify-between">
              <span>Amount:</span>
              <strong>GH₵{parseFloat(formData.amountPaid || '0').toFixed(2)}</strong>
            </li>
            <li className="flex justify-between">
              <span>Method:</span>
              <strong className="capitalize">{formData.paymentMethod.replace('_', ' ')}</strong>
            </li>
            <li className="flex justify-between">
              <span>Receipt:</span>
              <strong>{formData.receiptNumber}</strong>
            </li>
          </ul>
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
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading && <LoadingSpinner size="sm" />}
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
