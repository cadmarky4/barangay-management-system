import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiLock, FiPower } from 'react-icons/fi';
import { FaUsers, FaUserCheck, FaShieldAlt, FaUserPlus } from 'react-icons/fa';
import AddNewUser from './AddNewUser';
import ResetPassword from '../_auth/ResetPassword';
import StatCard from '../_global/StatCard';
import { UsersService } from '../../services/users/users.service';
import type { User, UserParams, UserRole, UserFormData } from '../../services/users/users.types';
import Breadcrumb from '../_global/Breadcrumb';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoaded, setIsLoaded] = useState(false); // Add isLoaded state
  
  // Service integration state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    last_page: 1,
    per_page: 15
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    newThisMonth: 0
  });
  
  const usersService = useMemo(() => new UsersService(), []);

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: UserParams = {
        page: currentPage,
        per_page: 15,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        is_active: statusFilter === 'Active' ? true : statusFilter === 'Inactive' ? false : undefined,
      };

      console.log('Fetching users with params:', params);
      const response = await usersService.getUsers(params);
      console.log('Users response:', response);
      
      // Ensure we always set an array
      setUsers(Array.isArray(response.data) ? response.data : []);
      
      // Update pagination state
      setPagination({
        total: response.total || 0,
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        per_page: 15
      });
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      
      // Check if it's a network error (backend not running)
      if ((err instanceof Error ? err.message : 'Unknown error')?.includes('fetch') || (err instanceof Error ? err.message : 'Unknown error')?.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000');
      } else {
        setError((err instanceof Error ? err.message : 'Unknown error') || 'Failed to fetch users');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, usersService]);

  const fetchStats = useCallback(async () => {
    try {
      const statsResponse = await usersService.getUserStatistics();
      console.log('Stats response:', statsResponse);
      
      // Map backend response to frontend expected format
      setStats({
        total: statsResponse.total_users || 0,
        active: statsResponse.active_users || 0,
        admins: (statsResponse.by_role?.ADMIN || 0) + (statsResponse.by_role?.SUPER_ADMIN || 0),
        newThisMonth: statsResponse.recent_logins || 0
      });
    } catch (err: unknown) {
      console.error('Failed to fetch user statistics:', err);
      // Set default values on error
      setStats({
        total: 0,
        active: 0,
        admins: 0,
        newThisMonth: 0
      });
    }
  }, [usersService]);

  // Create a loadData function that combines your existing useEffect logic
  const loadData = useCallback(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  // Animation trigger on component mount
  useEffect(() => {
    loadData();
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Fetch users data
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, roleFilter, statusFilter, currentPage]);

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'SUPER_ADMIN': 'bg-red-100 text-red-800',
      'ADMIN': 'bg-purple-100 text-purple-800',
      'BARANGAY_CAPTAIN': 'bg-blue-100 text-blue-800',
      'BARANGAY_SECRETARY': 'bg-green-100 text-green-800',
      'BARANGAY_TREASURER': 'bg-yellow-100 text-yellow-800',
      'KAGAWAD': 'bg-indigo-100 text-indigo-800',
      'SK_CHAIRPERSON': 'bg-pink-100 text-pink-800',
      'SK_KAGAWAD': 'bg-cyan-100 text-cyan-800',
      'STAFF': 'bg-gray-100 text-gray-800',
      'USER': 'bg-slate-100 text-slate-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAddUser = async (userData: UserFormData) => {
    await handleUserSaved(userData);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setError(null);
      await usersService.deleteUser(userId);
      await fetchUsers();
      await fetchStats();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : 'Unknown error') || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      setError(null);
      // Get current user to check their status
      const currentUser = await usersService.getUser(userId);
      
      // Toggle between active/inactive
      if (currentUser.is_active) {
        await usersService.deactivateUser(userId);
      } else {
        await usersService.activateUser(userId);
      }
      
      await fetchUsers();
      await fetchStats();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : 'Unknown error') || 'Failed to toggle user status');
    }
  };

  const handleViewUser = (userId: string) => {
    navigate(`/users/view/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    navigate(`/users/edit/${userId}`);
  };

  const handleResetPassword = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowResetPassword(true);
  };

  const handleCloseModals = () => {
    setShowAddForm(false);
    setShowResetPassword(false);
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  const handleUserSaved = async (user: unknown) => {
    console.log('User saved:', user);
    // Refresh the users list
    await fetchUsers();
    await fetchStats();
    handleCloseModals();
  };

  const handlePasswordResetSuccess = async () => {
    alert('Password reset successfully!');
    handleCloseModals();
  };

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      console.warn('Users is not an array:', users);
      return [];
    }
    
    // Since we're doing server-side filtering via the API, 
    // we don't need to filter again on the frontend
    // The API already returns filtered results based on search, role, and status
    return users;
  }, [users]);

  if (showAddForm) {
    return (
      <AddNewUser 
        onClose={handleCloseModals} 
        onSave={handleAddUser}
      />
    );
  }

  if (showResetPassword && selectedUserId) {
    return (
      <ResetPassword 
        userId={parseInt(selectedUserId)}
        userName={selectedUserName}
        onClose={handleCloseModals}
        onSuccess={handlePasswordResetSuccess}
      />
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Page Header */}
      <div className={`mb-2 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h1 className="text-2xl font-bold text-darktext pl-0">User Management</h1>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`mb-4 p-4 bg-red-50 border border-red-200 rounded-lg transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Statistics Overview */}
      <section className={`w-full bg-white flex flex-col gap-3 border p-6 rounded-2xl border-gray-100 shadow-sm transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">
          Statistics Overview
        </h3>
        <div className="grid grid-cols-4 gap-4">          
          <StatCard 
            title="Total Users" 
            value={stats.total} 
            icon={FaUsers}
          />
          <StatCard 
            title="Active Users" 
            value={stats.active} 
            icon={FaUserCheck}
          />
          <StatCard 
            title="Administrators" 
            value={stats.admins} 
            icon={FaShieldAlt}
          />
          <StatCard 
            title="New This Month" 
            value={stats.newThisMonth} 
            icon={FaUserPlus}
          />
        </div>
      </section>

      {/* Users Section */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">System Users</h3>
          
          {/* Search and Add Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="ml-4 bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
            
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              aria-label="Filter by role"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="BARANGAY_CAPTAIN">Barangay Captain</option>
              <option value="BARANGAY_SECRETARY">Barangay Secretary</option>
              <option value="BARANGAY_TREASURER">Barangay Treasurer</option>
              <option value="KAGAWAD">Kagawad</option>
              <option value="SK_CHAIRPERSON">SK Chairperson</option>
              <option value="SK_KAGAWAD">SK Kagawad</option>
              <option value="STAFF">Staff</option>
              <option value="USER">User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src="https://placehold.co/80"
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {formatRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.is_active)}`}>
                        {getStatusText(user.is_active)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never logged in'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-smblue-400 hover:text-smblue-300"
                          title="View user details"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-smblue-400 hover:text-smblue-300"
                          title="Edit user"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Reset password"
                          onClick={() => handleResetPassword(user.id, `${user.first_name} ${user.last_name}`)}
                        >
                          <FiLock className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900"
                          title="Toggle status"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          <FiPower className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                let pageNum;
                if (pagination.last_page <= 5) {
                  pageNum = i + 1;
                } else {
                  const start = Math.max(1, currentPage - 2);
                  const end = Math.min(pagination.last_page, start + 4);
                  pageNum = start + i;
                  if (pageNum > end) return null;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === pageNum
                        ? 'bg-smblue-400 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                className="px-3 py-1 text-sm bg-smblue-400 text-white rounded hover:bg-smblue-300 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= pagination.last_page || loading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default UserManagement;