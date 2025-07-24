import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiLock, FiUserCheck, FiMail, FiPhone, FiMapPin, FiCalendar, FiClock } from 'react-icons/fi';
import { FaUser, FaShieldAlt } from 'react-icons/fa';
import { UsersService } from '../../services/users/users.service';
import type { User } from '../../services/users/users.types';

const ViewUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const usersService = useMemo(() => new UsersService(), []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await usersService.getUser(id ?? '');
      setUser(userData);
    } catch (err: unknown) {
      console.error('Failed to fetch user:', err);
      if (err instanceof Error && err.message.includes('404')) {
        setNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      }
    } finally {
      setLoading(false);
    }
  }, [id, usersService]);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetchUser();
  }, [id, fetchUser]);

  const handleGoBack = () => {
    navigate('/users');
  };

  const handleEdit = () => {
    navigate(`/users/edit/${id}`);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'SUPER_ADMIN': 'bg-red-100 text-red-800 border-red-200',
      'ADMIN': 'bg-purple-100 text-purple-800 border-purple-200',
      'BARANGAY_CAPTAIN': 'bg-blue-100 text-blue-800 border-blue-200',
      'BARANGAY_SECRETARY': 'bg-green-100 text-green-800 border-green-200',
      'BARANGAY_TREASURER': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'KAGAWAD': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'SK_CHAIRPERSON': 'bg-pink-100 text-pink-800 border-pink-200',
      'SK_KAGAWAD': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'STAFF': 'bg-gray-100 text-gray-800 border-gray-200',
      'USER': 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <h3 className="font-bold text-lg mb-2">Error Loading User</h3>
            <p>{error}</p>
            <button
              onClick={handleGoBack}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl text-gray-400 mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h1>
            <p className="text-gray-600 mb-6">
              The user you're looking for doesn't exist or may have been deleted.
            </p>
            <button
              onClick={handleGoBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGoBack}
                  className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="Back to Users"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                  <p className="text-gray-600">View user information and account details</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {user.first_name} {user.last_name}
                </h2>
                <div className="flex flex-col items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                    <FaShieldAlt className="w-3 h-3 inline mr-1" />
                    {formatRoleName(user.role)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(user.is_active)}`}>
                    <FiUserCheck className="w-3 h-3 inline mr-1" />
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  User ID: #{user.id}
                </p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Personal Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FiMail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>                    {user.phone && (
                      <div className="flex items-center gap-3">
                        <FiPhone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    {user.department && (
                      <div className="flex items-center gap-3">
                        <FiMapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium text-gray-900">{user.department}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Account Details
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FiCalendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiClock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium text-gray-900">{formatDate(user.updated_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiLock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Account Status</p>
                        <p className="font-medium text-gray-900">
                          {user.is_active ? 'Active & Verified' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>              {/* Additional Information */}
              {(user.position || user.employee_id) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-4">Employment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.position && (
                      <div>
                        <p className="text-sm text-gray-500">Position</p>
                        <p className="font-medium text-gray-900">{user.position}</p>
                      </div>
                    )}
                    {user.employee_id && (
                      <div>
                        <p className="text-sm text-gray-500">Employee ID</p>
                        <p className="font-medium text-gray-900">{user.employee_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Users
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
          >
            <FiEdit className="w-4 h-4" />
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserPage;
