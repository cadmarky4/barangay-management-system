import React, { useState, useMemo } from 'react';
import { UsersService } from '../../services/users/users.service';
import type { CreateUserFormData, User, UserRole, Department } from '../../services/users/users.types';

interface AddNewUserProps {
  onClose: () => void;
  onSave: (userData: User) => void;
}

const AddNewUser: React.FC<AddNewUserProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    username: '',
    phone: '',
    role: 'VIEWER' as UserRole,
    department: 'ADMINISTRATION' as Department,
    position: '',
    employee_id: '',
    password: '',
    confirm_password: '',
    is_active: true,
    send_credentials: true,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usersService = useMemo(() => new UsersService(), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };  const validateForm = (): boolean => {
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
    if (!formData.department) {
      setError('Department is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
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

    setIsLoading(true);

    // Basic validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Create user via API (service will handle transformation)
      const newUser = await usersService.createUser(formData);
      
      // Call parent callback with success
      onSave(newUser);
      onClose();    } catch (err: unknown) {
      const message = err instanceof Error ? (err instanceof Error ? err.message : 'Unknown error') : 'Failed to create user';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password: password,
      confirm_password: password
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 pl-0">Add New User Account</h1>
      </div>      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter first name here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter last name here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name || ''}
                onChange={handleInputChange}
                placeholder="N/A if not applicable"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id || ''}
                onChange={handleInputChange}
                placeholder="Enter employee ID (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Account Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                placeholder="Confirm password..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Role & Department Information */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Role & Department</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role *
              </label>
                             <select
                 name="role"
                 value={formData.role}
                 onChange={handleInputChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 aria-label="User role"
                 required
               >
                <option value="">Select User Role</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
                <option value="ADMIN">Administrator</option>
                <option value="BARANGAY_CAPTAIN">Barangay Captain</option>
                <option value="BARANGAY_SECRETARY">Barangay Secretary</option>
                <option value="BARANGAY_TREASURER">Barangay Treasurer</option>
                <option value="BARANGAY_COUNCILOR">Barangay Councilor</option>
                <option value="BARANGAY_CLERK">Barangay Clerk</option>
                <option value="HEALTH_WORKER">Health Worker</option>
                <option value="SOCIAL_WORKER">Social Worker</option>
                <option value="SECURITY_OFFICER">Security Officer</option>
                <option value="DATA_ENCODER">Data Encoder</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
                             <select
                 name="department"
                 value={formData.department}
                 onChange={handleInputChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 aria-label="Department"
                 required
               >
                <option value="">Select Department</option>
                <option value="ADMINISTRATION">Administration</option>
                <option value="HEALTH_SERVICES">Health Services</option>
                <option value="SOCIAL_SERVICES">Social Services</option>
                <option value="SECURITY_PUBLIC_SAFETY">Security & Public Safety</option>
                <option value="FINANCE_TREASURY">Finance & Treasury</option>
                <option value="RECORDS_MANAGEMENT">Records Management</option>
                <option value="COMMUNITY_DEVELOPMENT">Community Development</option>
                <option value="DISASTER_RISK_REDUCTION">Disaster Risk Reduction</option>
                <option value="ENVIRONMENTAL_MANAGEMENT">Environmental Management</option>
                <option value="YOUTH_SPORTS_DEVELOPMENT">Youth & Sports Development</option>
                <option value="SENIOR_CITIZEN_AFFAIRS">Senior Citizen Affairs</option>
                <option value="WOMENS_AFFAIRS">Women's Affairs</option>
                <option value="BUSINESS_PERMITS">Business Permits</option>
                <option value="INFRASTRUCTURE_DEVELOPMENT">Infrastructure Development</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position/Title
              </label>
              <input
                type="text"
                name="position"
                value={formData.position || ''}
                onChange={handleInputChange}
                placeholder="Enter position or job title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Account Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Account is active (user can log in immediately)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="send_credentials"
                checked={formData.send_credentials}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Send login credentials to user via email
              </label>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Additional Notes</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes/Comments
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter any additional notes or comments about this user..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create User Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewUser; 

