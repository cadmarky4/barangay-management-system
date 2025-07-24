import React, { useState } from 'react';
import { FiX, FiLock, FiMail, FiCopy } from 'react-icons/fi';
import { UsersService } from '../../services/users/users.service';

interface ResetPasswordProps {
  userId: number;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ userId, userName, onClose, onSuccess }) => {
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const usersService = new UsersService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      // Convert userId to string and call the correct API
      const result = await usersService.resetUserPassword(userId.toString(), sendEmail);
      
      if (!sendEmail && result.temporary_password) {
        setTemporaryPassword(result.temporary_password);
        setShowResult(true);
      } else {
        onSuccess();
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : 'Unknown error') || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (temporaryPassword) {
      try {
        await navigator.clipboard.writeText(temporaryPassword);
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy password:', err);
      }
    }
  };

  const handleComplete = () => {
    setShowResult(false);
    setTemporaryPassword(null);
    onSuccess();
  };

  if (showResult && temporaryPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FiLock className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900">Password Reset Successful</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Password has been reset for <strong>{userName}</strong>
            </p>

            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporary Password:
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-gray-100 border rounded font-mono text-sm">
                  {temporaryPassword}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> The user should change this password immediately after logging in.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiLock className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 mb-4">
            Reset password for <strong>{userName}</strong>
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={sendEmail}
                  onChange={() => setSendEmail(true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Send via Email</span>
                  <p className="text-xs text-gray-500">Temporary password will be sent to user's email</p>
                </div>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={!sendEmail}
                  onChange={() => setSendEmail(false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Generate & Display</span>
                  <p className="text-xs text-gray-500">Show temporary password to copy manually</p>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <FiMail className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Note:</p>
                <p className="text-xs text-yellow-700">
                  A temporary 12-character password will be generated. The user should change it after logging in.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <FiLock className="w-4 h-4" />
              <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
