import { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { usersApi } from '../services/api';
import type { User } from '../types';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Filtering and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'student' | 'staff' | 'public' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;
  
  // Bulk actions state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Utility function to normalize user data from API (snake_case to camelCase)
  const normalizeUser = (user: any): User => ({
    ...user,
    userType: user.user_type || user.userType,
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    isActive: user.is_active !== undefined ? user.is_active : user.isActive,
    createdAt: user.created_at || user.createdAt,
    updatedAt: user.updated_at || user.updatedAt,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          page: currentPage,
          limit: limit,
          ...(searchTerm && { search: searchTerm }),
          ...(selectedUserType && { userType: selectedUserType }),
        };
        
        const response = await usersApi.getUsers(params);
        if (response.data) {
          setUsers(response.data.users.map(normalizeUser));
          setTotalUsers(response.data.total);
          setTotalPages(Math.ceil(response.data.total / limit));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        console.error('Users fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm, selectedUserType]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await usersApi.activateUser(userId);
      // Refresh users list
      const params = {
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedUserType && { userType: selectedUserType }),
      };
      const response = await usersApi.getUsers(params);
      if (response.data) {
        setUsers(response.data.users.map(normalizeUser));
      }
    } catch (err) {
      console.error('Failed to activate user:', err);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await usersApi.deactivateUser(userId);
      // Refresh users list
      const params = {
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedUserType && { userType: selectedUserType }),
      };
      const response = await usersApi.getUsers(params);
      if (response.data) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allUserIds = new Set(users.map(user => user.id));
      setSelectedUsers(allUserIds);
      setShowBulkActions(true);
    } else {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkActivate = async () => {
    try {
      const promises = Array.from(selectedUsers).map(userId => usersApi.activateUser(userId));
      await Promise.all(promises);
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      // Refresh users list
      const params = {
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedUserType && { userType: selectedUserType }),
      };
      const response = await usersApi.getUsers(params);
      if (response.data) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Failed to bulk activate users:', err);
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const promises = Array.from(selectedUsers).map(userId => usersApi.deactivateUser(userId));
      await Promise.all(promises);
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      // Refresh users list
      const params = {
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedUserType && { userType: selectedUserType }),
      };
      const response = await usersApi.getUsers(params);
      if (response.data) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Failed to bulk deactivate users:', err);
    }
  };

  const getBadgeColor = (userType: string) => {
    if (!userType) return 'bg-gray-100 text-gray-800';
    switch (userType) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'public': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUserName = (user: User) => {
    if (!user) return 'Unknown User';
    
    const firstName = (user as any).firstName || '';
    const lastName = (user as any).lastName || '';
    
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };

  const getUserIdentifier = (user: User) => {
    if (user.userType === 'student') {
      return (user as any).student_id || (user as any).studentId || 'N/A';
    } else if (user.userType === 'staff') {
      return (user as any).staff_id || (user as any).staffId || 'N/A';
    }
    return 'N/A';
  };

  const columns = [
    {
      header: '',
      accessor: (user: User) => (
        <input
          type="checkbox"
          checked={selectedUsers.has(user.id)}
          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      ),
    },
    {
      header: 'Name',
      accessor: (user: User) => formatUserName(user),
    },
    {
      header: 'Email',
      accessor: 'email' as keyof User,
    },
    {
      header: 'Type',
      accessor: (user: User) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(user.userType || 'unknown')}`}>
          {user.userType ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1) : 'Unknown'}
        </span>
      ),
    },
    {
      header: 'ID Number',
      accessor: (user: User) => getUserIdentifier(user),
    },
    {
      header: 'Status',
      accessor: (user: User) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          (user as any).isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {(user as any).isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Joined',
      accessor: (user: User) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewUser(user)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => handleEditUser(user)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Edit
          </button>
          {(user as any).isActive !== false ? (
            <button
              onClick={() => handleDeactivateUser(user.id)}
              className="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => handleActivateUser(user.id)}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Users</h3>
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
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <div className="text-sm text-gray-500">
          Total: {totalUsers} users
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
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
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
              User Type
            </label>
            <select
              id="userType"
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value as 'student' | 'staff' | 'public' | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="student">Students</option>
              <option value="staff">Staff</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedUserType('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkActivate}
                className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Activate Selected
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Deactivate Selected
              </button>
              <button
                onClick={() => {
                  setSelectedUsers(new Set());
                  setShowBulkActions(false);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Students</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {users.filter(u => u.userType === 'student').length}
                </dd>
                <dd className="text-xs text-gray-500">
                  {users.filter(u => u.userType === 'student' && (u as any).isActive !== false).length} active
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 002 2h2a2 2 0 002-2V4h-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Staff</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {users.filter(u => u.userType === 'staff').length}
                </dd>
                <dd className="text-xs text-gray-500">
                  {users.filter(u => u.userType === 'staff' && (u as any).isActive !== false).length} active
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Public</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {users.filter(u => u.userType === 'public').length}
                </dd>
                <dd className="text-xs text-gray-500">
                  {users.filter(u => u.userType === 'public' && (u as any).isActive !== false).length} active
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {users.filter(u => (u as any).isActive !== false).length}
                </dd>
                <dd className="text-xs text-gray-500">
                  {users.filter(u => (u as any).isActive === false).length} inactive
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Users</h3>
            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Select all</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <Table
        data={users}
        columns={columns}
        loading={loading}
        emptyState={
          <EmptyState
            title="No users found"
            description="No users have registered yet."
            icon={
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
          />
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * limit + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * limit, totalUsers)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{totalUsers}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{formatUserName(selectedUser)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User Type</label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(selectedUser.userType || 'unknown')}`}>
                  {selectedUser.userType ? selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1) : 'Unknown'}
                </span>
              </div>
              {(selectedUser.userType === 'student' || selectedUser.userType === 'staff') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {selectedUser.userType === 'student' ? 'Student ID' : 'Staff ID'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{getUserIdentifier(selectedUser)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-sm text-gray-900">{(selectedUser as any).department || 'N/A'}</p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Joined</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <EditUserForm 
            user={selectedUser}
            onSave={async (updatedUser) => {
              try {
                await usersApi.updateUser(selectedUser.id, updatedUser);
                setShowEditModal(false);
                // Refresh users list
                const params = {
                  page: currentPage,
                  limit: limit,
                  ...(searchTerm && { search: searchTerm }),
                  ...(selectedUserType && { userType: selectedUserType }),
                };
                const response = await usersApi.getUsers(params);
                if (response.data) {
                  setUsers(response.data.users);
                }
              } catch (err) {
                console.error('Failed to update user:', err);
              }
            }}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}

// Edit User Form Component
function EditUserForm({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user: User; 
  onSave: (updatedUser: Partial<User>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    email: user.email,
    firstName: (user as any).first_name || (user as any).firstName || '',
    lastName: (user as any).last_name || (user as any).lastName || '',
    department: (user as any).department || '',
    studentId: (user as any).student_id || (user as any).studentId || '',
    staffId: (user as any).staff_id || (user as any).staffId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        {(user.userType === 'student' || user.userType === 'staff') && (
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        {user.userType === 'student' && (
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        {user.userType === 'staff' && (
          <div>
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
              Staff ID
            </label>
            <input
              type="text"
              id="staffId"
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}