import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import sanMiguelLogo from '../../assets/sanMiguelLogo.jpg';

const LoginPage: React.FC = () => {
  const { login, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    login: '', // This will now accept both email and username
    password: '',
    rememberMe: false
  });  
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // Use auth error from context if available
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Debug: Monitor error state changes
  useEffect(() => {
    console.log('Error state changed:', error);
  }, [error]);

  // Debug: Monitor component lifecycle
  useEffect(() => {
    console.log('LoginPage mounted');
    return () => {
      console.log('LoginPage unmounted');
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, clearing error and starting login...');
    setError('');

    // Basic validation
    if (!formData.login.trim()) {
      setError('Email or username is required');
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      console.log('Attempting login with:', { ...formData, password: '[REDACTED]' });
      await login(formData);
      console.log('Login successful');
      
      // Navigation will be handled by ProtectedRoute or AuthContext
    } catch (err) {
      console.error('Login error:', err);
      
      // More detailed error handling
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          const errorMsg = 'Unable to connect to the server. Please check your internet connection and try again.';
          console.log('Setting network error:', errorMsg);
          setError(errorMsg);
        } else if (err.message.includes('Unauthorized') || err.message.includes('Invalid credentials')) {
          const errorMsg = 'Invalid email/username or password. Please check your credentials and try again.';
          console.log('Setting auth error:', errorMsg);
          setError(errorMsg);
        } else if (err.message.includes('Account is deactivated')) {
          const errorMsg = 'Your account has been deactivated. Please contact the administrator.';
          console.log('Setting deactivated error:', errorMsg);
          setError(errorMsg);
        } else if (err.message.includes('validation')) {
          const errorMsg = 'Please check your email/username and password format.';
          console.log('Setting validation error:', errorMsg);
          setError(errorMsg);
        } else {
          const errorMsg = err.message || 'Login failed. Please try again.';
          console.log('Setting generic error:', errorMsg);
          setError(errorMsg);
        }
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.';
        console.log('Setting unexpected error:', errorMsg);
        setError(errorMsg);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Determine if the input looks like an email
  const isEmailInput = formData.login.includes('@');

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed bg-blue-500"
        style={{
          backgroundImage: `url('/background.png')`
        }}
      >
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <div className="w-22 h-22 rounded-full flex items-center justify-center overflow-clip">
              <img 
                src={sanMiguelLogo} 
                alt="San Miguel Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Brgy. Sikatuna Village</h1>
          <p className="text-gray-600 text-lg">Information Management System</p>
          <div className="w-16 h-px bg-gray-400 mx-auto mt-4"></div>
        </div>        
        
        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Sign In</h2>
          
          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-600 text-sm font-bold">Login Failed</p>
                <p className="text-red-600 text-sm">{error || authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Username
              </label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email or username"
                required
                autoComplete="username"
              />
              {formData.login && (
                <p className="text-xs text-gray-500 mt-1">
                  {isEmailInput ? 'Logging in with email' : 'Logging in with username'}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-label="Remember me"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>            
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Create Account Button */}
            <Link
              to="/register"
              className="w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-4 rounded-lg border border-blue-600 transition-colors duration-200 text-center block"
            >
              Create new account
            </Link>
          </form>
          
          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Having trouble signing in? Contact your administrator for assistance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2025 Brgy. Sikatuna Village. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;