import { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { subscriptionsApi } from '../services/api';
import type { UserSubscription, SubscriptionPlan } from '../types';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  // @ts-ignore - TODO: Implement plan modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  // @ts-ignore - TODO: Implement walk-in modal  
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  
  // Filtering and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'active' | 'expired' | 'cancelled' | ''>('');
  const [selectedUserType, setSelectedUserType] = useState<'student' | 'staff' | 'public' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  // Tab state
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans'>('subscriptions');

  // Normalize subscription data from API (snake_case to camelCase)
  const normalizeSubscription = (subscription: any): UserSubscription => ({
    ...subscription,
    userId: subscription.user_id || subscription.userId,
    planId: subscription.plan_id || subscription.planId,
    startDate: subscription.start_date || subscription.startDate,
    endDate: subscription.end_date || subscription.endDate,
    amountPaid: subscription.amount_paid || subscription.amountPaid,
    createdAt: subscription.created_at || subscription.createdAt,
    updatedAt: subscription.updated_at || subscription.updatedAt,
  });

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          page: currentPage,
          limit: limit,
          ...(selectedStatus && { status: selectedStatus }),
          ...(selectedUserType && { userType: selectedUserType }),
        };
        
        const response = await subscriptionsApi.getSubscriptions(params);
        if (response.data) {
          setSubscriptions(response.data.subscriptions.map(normalizeSubscription));
          setTotalSubscriptions(response.data.total);
          setTotalPages(Math.ceil(response.data.total / limit));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
        console.error('Subscriptions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await subscriptionsApi.getPlans();
        if (response.data) {
          setPlans(response.data);
        }
      } catch (err) {
        console.error('Plans fetch error:', err);
      } finally {
        setPlansLoading(false);
      }
    };

    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    }
    fetchPlans();
  }, [currentPage, selectedStatus, selectedUserType, activeTab]);

  const handleViewSubscription = (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setShowSubscriptionModal(true);
  };

  const handleCancelSubscription = async (subscriptionId: string, reason?: string) => {
    try {
      await subscriptionsApi.cancelSubscription(subscriptionId, reason);
      // Refresh subscriptions list
      const params = {
        page: currentPage,
        limit: limit,
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedUserType && { userType: selectedUserType }),
      };
      const response = await subscriptionsApi.getSubscriptions(params);
      if (response.data) {
        setSubscriptions(response.data.subscriptions.map(normalizeSubscription));
      }
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    }
  };

  const handleExtendSubscription = async (subscriptionId: string, days: number) => {
    try {
      await subscriptionsApi.extendSubscription(subscriptionId, days);
      // Refresh subscriptions list
      const params = {
        page: currentPage,
        limit: limit,
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedUserType && { userType: selectedUserType }),
      };
      const response = await subscriptionsApi.getSubscriptions(params);
      if (response.data) {
        setSubscriptions(response.data.subscriptions.map(normalizeSubscription));
      }
    } catch (err) {
      console.error('Failed to extend subscription:', err);
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toFixed(2)}`;
  };

  const subscriptionColumns = [
    {
      header: 'User',
      accessor: (subscription: UserSubscription) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {(subscription as any).user_name || 'Unknown User'}
          </p>
          <p className="text-sm text-gray-500">
            {(subscription as any).user_email || 'No email'}
          </p>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: (subscription: UserSubscription) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {(subscription as any).plan_name || 'Unknown Plan'}
          </p>
          <p className="text-sm text-gray-500">
            {formatCurrency(parseFloat((subscription as any).amount_paid || '0'))}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (subscription: UserSubscription) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(subscription.status)}`}>
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Start Date',
      accessor: (subscription: UserSubscription) => formatDate(subscription.startDate || ''),
    },
    {
      header: 'End Date',
      accessor: (subscription: UserSubscription) => formatDate(subscription.endDate || ''),
    },
    {
      header: 'Actions',
      accessor: (subscription: UserSubscription) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewSubscription(subscription)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </button>
          {subscription.status === 'active' && (
            <>
              <button
                onClick={() => handleExtendSubscription(subscription.id, 30)}
                className="text-green-600 hover:text-green-900 text-sm font-medium"
              >
                Extend
              </button>
              <button
                onClick={() => handleCancelSubscription(subscription.id, 'Admin cancelled')}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Subscriptions</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage subscription plans and user subscriptions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setShowWalkInModal(true);
              console.log('Walk-in modal not implemented yet');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Walk-in Subscription
          </button>
          <button
            onClick={() => {
              setShowPlanModal(true);
              console.log('Plan modal not implemented yet');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Plan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscriptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Subscriptions ({totalSubscriptions})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subscription Plans ({plans.length})
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'subscriptions' ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search users
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                id="userType"
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          {/* Subscriptions Table */}
          {subscriptions.length === 0 ? (
            <EmptyState
              title="No subscriptions found"
              description="No subscriptions match your current filters."
              action={{
                label: "Clear filters",
                onClick: () => {
                  setSearchTerm('');
                  setSelectedStatus('');
                  setSelectedUserType('');
                }
              }}
            />
          ) : (
            <div className="space-y-4">
              <Table
                data={subscriptions}
                columns={subscriptionColumns}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages} ({totalSubscriptions} total subscriptions)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-900">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subscription Plans */}
          {plansLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : plans.length === 0 ? (
            <EmptyState
              title="No subscription plans found"
              description="Create your first subscription plan to get started."
              action={{
                label: "Add Plan",
                onClick: () => {
                  setShowPlanModal(true);
                  console.log('Plan modal not implemented yet');
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Price:</span>
                      <span className="text-sm font-medium">{formatCurrency(plan.priceCedis)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">User Type:</span>
                      <span className="text-sm font-medium capitalize">{plan.userType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Duration:</span>
                      <span className="text-sm font-medium">{plan.durationDays} days</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50">
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscription Details Modal */}
      {showSubscriptionModal && selectedSubscription && (
        <Modal
          isOpen={showSubscriptionModal}
          title="Subscription Details"
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedSubscription(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="mt-1 text-sm text-gray-900">
                  {(selectedSubscription as any).user_name || 'Unknown User'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">
                  {(selectedSubscription as any).user_email || 'No email'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <p className="mt-1 text-sm text-gray-900">
                  {(selectedSubscription as any).plan_name || 'Unknown Plan'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(selectedSubscription.status)}`}>
                  {selectedSubscription.status.charAt(0).toUpperCase() + selectedSubscription.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(selectedSubscription.startDate || '')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(selectedSubscription.endDate || '')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatCurrency(parseFloat((selectedSubscription as any).amount_paid || '0'))}
                </p>
              </div>
            </div>
            
            {selectedSubscription.status === 'active' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleExtendSubscription(selectedSubscription.id, 30)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Extend 30 Days
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(selectedSubscription.id, 'Admin cancelled')}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}