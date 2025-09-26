import { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { paymentsApi } from '../services/api';
import type { PaymentTransaction } from '../types';

export default function Payments() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Filtering and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'completed' | 'failed' | 'cancelled' | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  // Summary stats
  const [stats, setStats] = useState({
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });

  // Normalize payment data from API (snake_case to camelCase)
  const normalizePayment = (payment: any): PaymentTransaction => ({
    ...payment,
    amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount,
    userSubscriptionId: payment.user_subscription_id || payment.userSubscriptionId,
    paymentReference: payment.payment_reference || payment.paymentReference,
    paymentMethod: payment.payment_method || payment.paymentMethod,
    gatewayResponse: payment.gateway_response || payment.gatewayResponse,
    createdAt: payment.created_at || payment.createdAt,
    updatedAt: payment.updated_at || payment.updatedAt,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          page: currentPage,
          limit: limit,
          ...(selectedStatus && { status: selectedStatus }),
          ...(searchTerm && { search: searchTerm }),
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        };
        
        const response = await paymentsApi.getTransactions(params);
        if (response.data) {
          setPayments(response.data.transactions.map(normalizePayment));
          setTotalPayments(response.data.total);
          setTotalPages(Math.ceil(response.data.total / limit));
          
          // Calculate stats
          const paymentsData = response.data.transactions;
          const totalAmount = paymentsData.reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0);
          const completedPayments = paymentsData.filter((p: any) => p.status === 'completed');
          const pendingPayments = paymentsData.filter((p: any) => p.status === 'pending');
          const failedPayments = paymentsData.filter((p: any) => p.status === 'failed');
          
          setStats({
            totalAmount,
            completedAmount: completedPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0),
            pendingAmount: pendingPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0),
            failedAmount: failedPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0),
            completedCount: completedPayments.length,
            pendingCount: pendingPayments.length,
            failedCount: failedPayments.length,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payments');
        console.error('Payments fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentPage, selectedStatus, searchTerm, dateFrom, dateTo]);

  const handleViewPayment = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleRetryPayment = async (paymentId: string) => {
    try {
      await paymentsApi.retryPayment(paymentId);
      // Refresh payments list
      const params = {
        page: currentPage,
        limit: limit,
        ...(selectedStatus && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      };
      const response = await paymentsApi.getTransactions(params);
      if (response.data) {
        setPayments(response.data.transactions.map(normalizePayment));
      }
    } catch (err) {
      console.error('Failed to retry payment:', err);
    }
  };

  const handleMarkCompleted = async (paymentId: string, amount: number) => {
    try {
      await paymentsApi.markPaymentCompleted(paymentId, {
        amountPaid: amount,
        paymentMethod: 'manual', // Default method for manual completion
        notes: 'Manually marked as completed by admin'
      });
      // Refresh payments list
      const params = {
        page: currentPage,
        limit: limit,
        ...(selectedStatus && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      };
      const response = await paymentsApi.getTransactions(params);
      if (response.data) {
        setPayments(response.data.transactions.map(normalizePayment));
      }
    } catch (err) {
      console.error('Failed to mark payment as completed:', err);
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₵${(numAmount || 0).toFixed(2)}`;
  };

  const paymentColumns = [
    {
      header: 'Payment Reference',
      accessor: (payment: PaymentTransaction) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {payment.paymentReference}
          </p>
          <p className="text-sm text-gray-500">
            {payment.paymentMethod || 'Unknown method'}
          </p>
        </div>
      ),
    },
    {
      header: 'User Info',
      accessor: (payment: PaymentTransaction) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {(payment as any).user_name || 'Unknown User'}
          </p>
          <p className="text-sm text-gray-500">
            {(payment as any).user_email || 'No email'}
          </p>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (payment: PaymentTransaction) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(payment.amount)}
          </p>
          <p className="text-sm text-gray-500">
            {payment.currency}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (payment: PaymentTransaction) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(payment.status)}`}>
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: (payment: PaymentTransaction) => formatDate(payment.createdAt),
    },
    {
      header: 'Actions',
      accessor: (payment: PaymentTransaction) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewPayment(payment)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </button>
          {payment.status === 'failed' && (
            <button
              onClick={() => handleRetryPayment(payment.id)}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Retry
            </button>
          )}
          {payment.status === 'pending' && (
            <button
              onClick={() => handleMarkCompleted(payment.id, payment.amount)}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Mark Completed
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Payments</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage payment transactions and billing
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              // Export payments functionality - not implemented yet
              console.log('Export payments not implemented yet');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
              <p className="text-sm text-gray-500">{formatCurrency(stats.completedAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
              <p className="text-sm text-gray-500">{formatCurrency(stats.pendingAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedCount}</p>
              <p className="text-sm text-gray-500">{formatCurrency(stats.failedAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference or user..."
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
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            id="dateFrom"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            id="dateTo"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('');
              setDateFrom('');
              setDateTo('');
            }}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="No payment transactions match your current filters."
          action={{
            label: "Clear filters",
            onClick: () => {
              setSearchTerm('');
              setSelectedStatus('');
              setDateFrom('');
              setDateTo('');
            }
          }}
        />
      ) : (
        <div className="space-y-4">
          <Table
            data={payments}
            columns={paymentColumns}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages} ({totalPayments} total payments)
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

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <Modal
          isOpen={showPaymentModal}
          title="Payment Transaction Details"
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Reference</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.paymentReference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatCurrency(selectedPayment.amount)} {selectedPayment.currency}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(selectedPayment.status)}`}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.paymentMethod || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="mt-1 text-sm text-gray-900">
                  {(selectedPayment as any).user_name || 'Unknown User'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">
                  {(selectedPayment as any).user_email || 'No email'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.updatedAt)}</p>
              </div>
            </div>
            
            {selectedPayment.gatewayResponse && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Gateway Response</label>
                <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded border overflow-auto">
                  {JSON.stringify(selectedPayment.gatewayResponse, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                {selectedPayment.status === 'failed' && (
                  <button
                    onClick={() => {
                      handleRetryPayment(selectedPayment.id);
                      setShowPaymentModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Retry Payment
                  </button>
                )}
                {selectedPayment.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleMarkCompleted(selectedPayment.id, selectedPayment.amount);
                      setShowPaymentModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}