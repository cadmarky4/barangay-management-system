import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { setAuthErrorHandler, clearAuthErrorHandler } from '../services/__shared/_auth/auth-error-handler';

// Import types from your auth types file
import type { User, UserRole, Department } from '@/services/users/users.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isBarangayOfficial: () => boolean;
  isAdmin: () => boolean;
  canManageResidents: () => boolean;
  canManageUsers: () => boolean;
  canGenerateReports: () => boolean;
}

interface LoginCredentials {
  login: string; // Now accepts both email and username
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role?: UserRole;
  department?: Department;
  position?: string;
  employee_id?: string;
  phone: string;
  resident_id?: number;
  notes?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to clear auth data
  const clearAuthData = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  }, []);

  // Define logout function using useCallback
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint if token exists
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          // Log response for debugging but don't block logout
          if (!response.ok) {
            console.warn('Logout API returned non-OK status:', response.status);
          }
        } catch (error) {
          console.error('Logout API error:', error);
          // Continue with logout even if API call fails
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and storage
      clearAuthData();
      setIsLoading(false);
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [token, clearAuthData]);

  // Register the logout handler for API errors
  useEffect(() => {
    const handleAuthError = () => {
      console.log('Auth error handler called from API');
      logout();
    };

    setAuthErrorHandler(handleAuthError);

    return () => {
      clearAuthErrorHandler();
    };
  }, [logout]);

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check both localStorage and sessionStorage for token
        let savedToken = localStorage.getItem('auth_token');
        let savedUser = localStorage.getItem('auth_user');
        
        if (!savedToken) {
          savedToken = sessionStorage.getItem('auth_token');
          savedUser = sessionStorage.getItem('auth_user');
        }

        if (savedToken && savedUser) {
          try {
            // Parse saved user data for validation
            const parsedUser = JSON.parse(savedUser);
            
            // Validate token with backend
            const response = await fetch('http://127.0.0.1:8000/api/auth/user', {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${savedToken}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.user) {
                // Token is valid, set user and token
                setToken(savedToken);
                setUser(data.data.user); // Use fresh user data from server
                setError(null);
              } else {
                throw new Error('Invalid token response structure');
              }
            } else {
              throw new Error(`Token validation failed: ${response.status}`);
            }
          } catch (error) {
            console.error('Error validating saved token:', error);
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [clearAuthData]);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          login: credentials.login, // Updated to use 'login' field for both email/username
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (data.success && data.data) {
        const { user: userData, token: userToken } = data.data;
        
        setUser(userData);
        setToken(userToken);
        setError(null);
        
        // Save to appropriate storage based on remember me
        const storage = credentials.rememberMe ? localStorage : sessionStorage;
        storage.setItem('auth_token', userToken);
        storage.setItem('auth_user', JSON.stringify(userData));
      } else {
        const errorMessage = data.message || 'Login failed: Invalid response format';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          const errorMessage = `Validation errors: ${errorMessages}`;
          setError(errorMessage);
          const error = new Error(errorMessage) as any;
          error.errors = data.errors;
          throw error;
        }
        const errorMessage = data.error || data.message || 'Registration failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (data.success && data.data) {
        const { user: newUser, token: userToken } = data.data;
        
        setUser(newUser);
        setToken(userToken);
        setError(null);
        
        // Save to localStorage by default for new registrations
        localStorage.setItem('auth_token', userToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
      } else {
        const errorMessage = data.message || 'Registration failed: Invalid response format';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error && !error.message.includes('Validation errors')) {
        setError(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!token) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/user', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          
          // Update stored user data
          const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
          storage.setItem('auth_user', JSON.stringify(data.data.user));
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Role checking functions
  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const isBarangayOfficial = useCallback((): boolean => {
    return hasAnyRole(['BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER', 'BARANGAY_COUNCILOR']);
  }, [hasAnyRole]);

  const isAdmin = useCallback((): boolean => {
    return hasAnyRole(['SUPER_ADMIN', 'ADMIN']);
  }, [hasAnyRole]);

  const canManageResidents = useCallback((): boolean => {
    return hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_CLERK', 'DATA_ENCODER']);
  }, [hasAnyRole]);

  const canManageUsers = useCallback((): boolean => {
    return hasAnyRole(['SUPER_ADMIN', 'ADMIN']);
  }, [hasAnyRole]);

  const canGenerateReports = useCallback((): boolean => {
    return hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER']);
  }, [hasAnyRole]);

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    hasRole,
    hasAnyRole,
    isBarangayOfficial,
    isAdmin,
    canManageResidents,
    canManageUsers,
    canGenerateReports,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;