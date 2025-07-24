import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiX, FiSave, FiUser } from 'react-icons/fi';
import { UsersService } from '../../services/users/users.service';
import type { User, CreateUserFormData, UserRole, Department } from '../../services/users/users.types';

interface EditUserProps {
  userId: string;
  onClose: () => void;
  onSave: (user: User) => void;
}

const EditUser: React.FC<EditUserProps> = ({ userId, onClose, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateUserFormData>({
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

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await usersService.getUser(userId);
      
      // Transform API data to form data
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        middle_name: userData.middle_name || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'VIEWER',
        department: userData.department || 'ADMINISTRATION',
        position: userData.position || '',
        employee_id: userData.employee_id || '',
        password: '', // Don't populate password
        confirm_password: '',
        is_active: userData.is_active ?? true,
        send_credentials: false,
        notes: userData.notes || ''
      });
      
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : 'Unknown error') || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [userId, usersService]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    try {
      setSaving(true);
      // Create update data, excluding password if not provided
      const updateData: Partial<CreateUserFormData> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        employee_id: formData.employee_id,
        is_active: formData.is_active,
        notes: formData.notes
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
        updateData.confirm_password = formData.confirm_password;
      }

      const updatedUser = await usersService.updateUser(userId, updateData as CreateUserFormData);
      onSave(updatedUser);
    } catch (err: unknown) {
      console.error('Error updating user:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as { data?: { errors?: Record<string, string[]> } };
        if (response?.data?.errors) {
          const validationErrors = response.data.errors;
          const errorMessages = Object.values(validationErrors).flat();
          setError(errorMessages.join(', '));
        } else {
          setError((err instanceof Error ? err.message : 'Unknown error') || 'Failed to update user');
        }
      } else {
        setError((err instanceof Error ? err.message : 'Unknown error') || 'Failed to update user');
      }
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiUser className="w-6 h-6 text-smblue-400" />
            <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                  required
                />
              </div>              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                />
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                System Information
              </h3>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                  required
                >
                  <option value="USER">User</option>
                  <option value="STAFF">Staff</option>
                  <option value="SK_KAGAWAD">SK Kagawad</option>
                  <option value="SK_CHAIRPERSON">SK Chairperson</option>
                  <option value="KAGAWAD">Kagawad</option>
                  <option value="BARANGAY_TREASURER">Barangay Treasurer</option>
                  <option value="BARANGAY_SECRETARY">Barangay Secretary</option>
                  <option value="BARANGAY_CAPTAIN">Barangay Captain</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                />
              </div>              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employee_id"
                  value={formData.employee_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-smblue-400 border-gray-300 rounded focus:ring-smblue-200"
                  />
                  <span className="text-sm font-medium text-gray-700">Active User</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                placeholder="Additional notes about this user..."
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Change Password (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-smblue-400 hover:bg-smblue-300 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;

