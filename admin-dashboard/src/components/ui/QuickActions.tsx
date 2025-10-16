import { useState } from 'react';

interface QuickActionsProps {
  onCreateWalkIn: () => void;
  onViewPendingPayments: () => void;
  onSearchUser: (query: string) => void;
}

export function QuickActions({
  onCreateWalkIn,
  onViewPendingPayments,
  onSearchUser,
}: QuickActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchUser(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-4">
        {/* Quick Create Walk-In */}
        <button
          onClick={onCreateWalkIn}
          className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center group-hover:bg-blue-700">
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900">Create Walk-In Subscription</div>
            <div className="text-sm text-gray-600">Register a new walk-in member</div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* View Pending Payments */}
        <button
          onClick={onViewPendingPayments}
          className="w-full flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 bg-amber-600 text-white rounded-lg flex items-center justify-center group-hover:bg-amber-700">
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900">View Pending Payments</div>
            <div className="text-sm text-gray-600">Check overdue and pending payments</div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Quick User Search */}
        <form onSubmit={handleSearch} className="space-y-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Quick User Search</span>
            <div className="mt-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email, name, or ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </label>
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Search User
          </button>
        </form>
      </div>
    </div>
  );
}
