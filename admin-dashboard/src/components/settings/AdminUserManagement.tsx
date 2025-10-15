import { useState } from 'react';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string | null;
}

interface AdminUserManagementProps {
  onSave: (users: AdminUser[]) => void;
}

export function AdminUserManagement({ onSave }: AdminUserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@ug-gym.edu.gh',
      role: 'super_admin',
      status: 'active',
      createdAt: '2024-01-15',
      lastLogin: '2024-10-15T10:30:00',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@ug-gym.edu.gh',
      role: 'admin',
      status: 'active',
      createdAt: '2024-02-20',
      lastLogin: '2024-10-14T15:45:00',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@ug-gym.edu.gh',
      role: 'manager',
      status: 'inactive',
      createdAt: '2024-03-10',
      lastLogin: null,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    password: string;
    role: AdminUser['role'];
  }>({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all fields');
      return;
    }

    const user: AdminUser = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
    };

    setUsers([...users, user]);
    setShowCreateModal(false);
    setNewUser({ name: '', email: '', password: '', role: 'admin' });
    alert('Admin user created successfully!');
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  const handleUpdateRole = (userId: number, role: AdminUser['role']) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role } : user)));
    alert('User role updated successfully!');
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this admin user?')) {
      setUsers(users.filter((user) => user.id !== userId));
      alert('Admin user deleted successfully!');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Admin User Management</h3>
          <p className="text-sm text-gray-600">Manage admin users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Admin User
        </button>
      </div>

      {/* Role Descriptions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3">Role Permissions</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="inline-flex px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
              Super Admin
            </span>
            <span className="text-gray-600">
              Full system access including user management, settings, and system configuration
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
              Admin
            </span>
            <span className="text-gray-600">
              Manage users, subscriptions, payments, and view reports
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-flex px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
              Manager
            </span>
            <span className="text-gray-600">
              View-only access to users, subscriptions, and basic reports
            </span>
          </div>
        </div>
      </div>

      {/* Admin Users List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Admin Users ({users.length})</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as AdminUser['role'])}
                      className={`text-sm rounded-full px-3 py-1 font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getRoleBadgeColor(
                        user.role
                      )}`}
                      disabled={user.role === 'super_admin'}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        disabled={user.role === 'super_admin'}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      {user.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New Admin User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@ug-gym.edu.gh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter secure password"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters required</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as AdminUser['role'] })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSave(users)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
