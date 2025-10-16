import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { usersApi, subscriptionsApi } from '../../services/api';
import type { User, SubscriptionPlan } from '../../types';

interface WalkInSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WalkInSubscriptionModal({ isOpen, onClose, onSuccess }: WalkInSubscriptionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: User Selection, 2: Plan Selection, 3: Payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: User Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Step 2: Plan Selection
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  // Step 3: Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'momo'>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setUsers([]);
        return;
      }

      try {
        setSearchLoading(true);
        const response = await usersApi.getUsers({ 
          search: searchTerm, 
          limit: 10 
        });
        if (response.data) {
          setUsers(response.data.users);
        }
      } catch (err) {
        console.error('User search error:', err);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Load plans when user is selected
  useEffect(() => {
    const fetchPlans = async () => {
      if (!selectedUser) return;

      try {
        setLoading(true);
        const response = await subscriptionsApi.getPlans();
        if (response.data) {
          // Filter plans by user type
          const filteredPlans = response.data.filter(
            (plan: SubscriptionPlan) => plan.userType === selectedUser.userType && plan.isActive
          );
          setPlans(filteredPlans);
        }
      } catch (err) {
        console.error('Plans fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [selectedUser]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm('');
    setUsers([]);
    setStep(2);
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedPlan) return;

    try {
      setLoading(true);
      setError(null);

      // Create walk-in subscription
      await subscriptionsApi.createWalkInSubscription({
        userId: selectedUser.id,
        planId: selectedPlan.id,
        amountPaid: selectedPlan.priceCedis,
      });

      // Success
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
      console.error('Walk-in subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedUser(null);
    setSelectedPlan(null);
    setSearchTerm('');
    setUsers([]);
    setPaymentMethod('cash');
    setPaymentReference('');
    setNotes('');
    setError(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedPlan(null);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toFixed(2)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Walk-in Subscription" size="lg">
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
              Select User
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-gray-200">
            <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
              Select Plan
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-gray-200">
            <div className={`h-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: step >= 3 ? '100%' : '0%' }} />
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
              Payment
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: User Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700 mb-2">
                Search for User
              </label>
              <input
                type="text"
                id="userSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {searchLoading && (
                <p className="mt-2 text-sm text-gray-500">Searching...</p>
              )}
            </div>

            {/* User Results */}
            {users.length > 0 && (
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {(user as any).first_name} {(user as any).last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {(user as any).student_id && (
                          <p className="text-xs text-gray-400">ID: {(user as any).student_id}</p>
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.userType === 'student' ? 'bg-blue-100 text-blue-800' :
                        user.userType === 'staff' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.userType}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchTerm.length >= 2 && users.length === 0 && !searchLoading && (
              <p className="text-sm text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        )}

        {/* Step 2: Plan Selection */}
        {step === 2 && (
          <div className="space-y-4">
            {selectedUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm font-medium text-blue-900">
                  Selected User: {(selectedUser as any).first_name} {(selectedUser as any).last_name}
                </p>
                <p className="text-sm text-blue-700">{selectedUser.email}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Available Plans for {selectedUser?.userType}s
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : plans.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No active plans available for this user type
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedPlan?.id === plan.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                      {plan.description && (
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      )}
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(plan.priceCedis)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {plan.durationDays} days
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
          <div className="space-y-4">
            {selectedUser && selectedPlan && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      {(selectedUser as any).first_name} {(selectedUser as any).last_name}
                    </p>
                    <p className="text-sm text-green-700">{selectedUser.email}</p>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    {selectedUser.userType}
                  </span>
                </div>
                <div className="border-t border-green-200 pt-2 mt-2">
                  <p className="text-sm font-medium text-green-900">{selectedPlan.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedPlan.priceCedis)}
                    </span>
                    <span className="text-sm text-green-700">
                      {selectedPlan.durationDays} days
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card (POS)</option>
                <option value="momo">Mobile Money</option>
              </select>
            </div>

            <div>
              <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference (Optional)
              </label>
              <input
                type="text"
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g., Receipt #12345 or leave blank for auto-generate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes about this transaction..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={step === 1 ? handleClose : handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedUser || !selectedPlan}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating...</span>
                </span>
              ) : (
                'Create Subscription'
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
