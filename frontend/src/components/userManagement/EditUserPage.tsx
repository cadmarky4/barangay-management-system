import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiX, FiSave } from 'react-icons/fi';
import { UsersService } from '../../services/users/users.service';
import type { User, UserRole, Department } from '../../services/users/users.types';

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    username: '',
    email: '',
    phone: '',
    role: 'VIEWER' as UserRole,
    department: 'ADMINISTRATION' as Department,
    position: '',
    employee_id: '',
    password: '',
    confirm_password: '',
    is_active: true,
    send_credentials: false,
    notes: ''
  });

  const usersService = useMemo(() => new UsersService(), []);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) {
        setError('User ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const userData = await usersService.getUser(id);
        
        if (!userData) {
          setError('User not found');
          setLoading(false);
          return;
        }
        
        setUser(userData);
        
        // Transform API data to form data
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          middle_name: userData.middle_name || '',
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role,
          department: userData.department,
          position: userData.position || '',
          employee_id: userData.employee_id || '',
          password: '',
          confirm_password: '',
          is_active: userData.is_active,
          send_credentials: false,
          notes: userData.notes || ''
        });
        
      } catch (error: unknown) {
        console.error('Failed to load user:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if it's a 404 error (user not found)
        if (errorMessage?.includes('404') || errorMessage?.includes('not found')) {
          setError('User not found');
        } else if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
          setError('Unable to connect to server. Please check your connection.');
        } else {
          setError('Failed to load user data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, usersService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.role) {
      setError('Role is required');
      return false;
    }
    
    // Only validate password if it's provided (for updates)
    if (formData.password && formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError('No user data available');
      return;
    }

    try {
      setSaving(true);
      
      // Create update data (exclude password fields if empty)
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name || null,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        position: formData.position || null,
        employee_id: formData.employee_id || null,
        is_active: formData.is_active,
        notes: formData.notes || null,
        ...(formData.password && { 
          password: formData.password,
          confirm_password: formData.confirm_password
        })
      };

      await usersService.updateUser(user.id, updateData);
      
      // Navigate back to users list with success
      navigate('/users', { state: { message: 'User updated successfully' } });
      
    } catch (err: unknown) {
      console.error('Failed to update user:', err);
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } }; message?: string };
      
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        setError(errors.join(', '));
      } else {
        setError(error.message || 'Failed to update user. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (window.confirm('Any unsaved changes will be lost. Are you sure you want to leave?')) {
      navigate('/users');
    }
  };

  if (loading) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user data...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-400 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">User Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error === 'Invalid user ID' 
                ? 'The user ID provided is invalid.'
                : error === 'User not found'
                ? 'The user you are looking for does not exist.'
                : error || 'Unable to load user data.'}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/users')}
              className="w-full px-6 py-3 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
            >
              Back to Users List
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-darktext">Edit User: {user.first_name} {user.last_name}</h1>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                    placeholder="Enter middle name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Role and Department */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Department</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                  >
                    <option value="USER">User</option>
                    <option value="STAFF">Staff</option>
                    <option value="KAGAWAD">Kagawad</option>
                    <option value="SK_KAGAWAD">SK Kagawad</option>
                    <option value="SK_CHAIRPERSON">SK Chairperson</option>
                    <option value="BARANGAY_TREASURER">Barangay Treasurer</option>
                    <option value="BARANGAY_SECRETARY">Barangay Secretary</option>
                    <option value="BARANGAY_CAPTAIN">Barangay Captain</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                    placeholder="Enter department"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                    placeholder="Enter position"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-smblue-600 rounded border-gray-300 focus:ring-smblue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Active User</label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-500 focus:border-transparent"
                placeholder="Enter any additional notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <FiSave className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditUserPage;
