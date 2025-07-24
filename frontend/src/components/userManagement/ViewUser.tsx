import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield } from 'react-icons/fi';
import { UsersService } from '../../services/users/users.service';
import { formatDate } from '@/utils/dateUtils';
import type { User } from '../../services/users/users.types';

interface ViewUserProps {
  userId: string;
  onClose: () => void;
  onEdit?: () => void;
}

const ViewUser: React.FC<ViewUserProps> = ({ userId, onClose, onEdit }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const usersService = useMemo(() => new UsersService(), []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await usersService.getUser(userId);
      setUser(userData);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : 'Unknown error') || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [userId, usersService]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiUser className="w-6 h-6 text-smblue-400" />
            <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-smblue-400 hover:bg-smblue-300 text-white rounded-lg transition-colors"
              >
                Edit User
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close user details"
              aria-label="Close user details"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Profile Header */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-24 h-24 bg-smblue-100 rounded-full flex items-center justify-center">
              <FiUser className="w-12 h-12 text-smblue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {user.first_name} {user.middle_name && `${user.middle_name} `}{user.last_name}
              </h3>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {formatRoleName(user.role)}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(user.is_active)}`}>
                  {getStatusText(user.is_active)}
                </span>
              </div>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Contact Information
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <FiPhone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Professional Information
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiShield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-gray-900">{formatRoleName(user.role)}</p>
                  </div>
                </div>
                
                {user.department && (
                  <div className="flex items-center space-x-3">
                    <FiMapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="text-gray-900">{user.department}</p>
                    </div>
                  </div>
                )}
                
                {user.position && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Position</p>
                    <p className="text-gray-900">{user.position}</p>
                  </div>
                )}
                
                {user.employee_id && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee ID</p>
                    <p className="text-gray-900">{user.employee_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Account Created</p>
                <div className="flex items-center space-x-2 mt-1">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <div className="flex items-center space-x-2 mt-1">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">
                    {formatDate(user.updated_at)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Last Login</p>
                <div className="flex items-center space-x-2 mt-1">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never logged in'}
                  </p>
                </div>
              </div>
            </div>
          </div>          {/* Verification Status */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${user.is_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  Email {user.is_verified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {user.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Notes</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{user.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;

