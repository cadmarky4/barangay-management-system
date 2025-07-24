// ============================================================================
// services/auth/auth.service.ts - Auth service implementation
// ============================================================================

import { BaseApiService } from '@/services/__shared/api';
import {
  ApiResponseSchema,
} from '@/services/__shared/types';
import { 
  LoginCredentialsRequestSchema,
  LoginResponseSchema,
  MiniUserSchema,
  type LoginCredentialsRequest,
  type LoginResponse,
  type MiniUser,
} from './auth.types';
import { tokenStorage } from '@/services/__shared/client';

import { z } from 'zod';

export class AuthService extends BaseApiService {
  private readonly basePath = '/auth';

  /**
   * Login with email/username and password
   */
  async login(credentials: LoginCredentialsRequest): Promise<LoginResponse> {
    // Validate input
    const validatedCredentials = LoginCredentialsRequestSchema.parse(credentials);
    
    const responseSchema = ApiResponseSchema(LoginResponseSchema);
    
    const response = await this.request(`${this.basePath}/login`, responseSchema, {
      method: 'POST',
      data: {
        // Send as 'login' field to support both email and username
        login: validatedCredentials.email,
        password: validatedCredentials.password,
      },
    });

    if (!response.data) {
      throw new Error('Login failed: No data returned');
    }

    // Store token and user data
    tokenStorage.set(response.data.token, validatedCredentials.rememberMe || false);
    
    const storage = validatedCredentials.rememberMe ? localStorage : sessionStorage;
    storage.setItem('auth_user', JSON.stringify(response.data.user));

    return response.data;
  }

  /**
   * Login with email (backward compatibility)
   */
  async loginWithEmail(credentials: { email: string; password: string; rememberMe?: boolean }): Promise<LoginResponse> {
    const responseSchema = ApiResponseSchema(LoginResponseSchema);
    
    const response = await this.request(`${this.basePath}/login-email`, responseSchema, {
      method: 'POST',
      data: {
        login: credentials.email,
        password: credentials.password,
      },
    });

    if (!response.data) {
      throw new Error('Login failed: No data returned');
    }

    // Store token and user data
    tokenStorage.set(response.data.token, credentials.rememberMe || false);
    
    const storage = credentials.rememberMe ? localStorage : sessionStorage;
    storage.setItem('auth_user', JSON.stringify(response.data.user));

    return response.data;
  }

  /**
   * Register new user
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone: string;
    role?: string;
    department?: string;
    position?: string;
    employee_id?: string;
    resident_id?: number;
    notes?: string;
  }): Promise<LoginResponse> {
    const responseSchema = ApiResponseSchema(LoginResponseSchema);
    
    const response = await this.request(`${this.basePath}/register`, responseSchema, {
      method: 'POST',
      data: userData,
    });

    if (!response.data) {
      throw new Error('Registration failed: No data returned');
    }

    // Store token and user data
    tokenStorage.set(response.data.token);
    sessionStorage.setItem('auth_user', JSON.stringify(response.data.user));

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.request(`${this.basePath}/logout`, ApiResponseSchema(z.object({
        message: z.string(),
      })), {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with cleanup even if request fails
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await this.request(`${this.basePath}/logout-all`, ApiResponseSchema(z.object({
        message: z.string(),
      })), {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout all request failed:', error);
      // Continue with cleanup even if request fails
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<MiniUser> {
    const responseSchema = ApiResponseSchema(z.object({
      user: MiniUserSchema,
    }));
    
    const response = await this.request(`${this.basePath}/user`, responseSchema, {
      method: 'GET',
    });

    if (!response.data?.user) {
      throw new Error('Failed to get current user: No data returned');
    }

    // Update cached user data
    const storage = localStorage.getItem('auth_user') ? localStorage : sessionStorage;
    storage.setItem('auth_user', JSON.stringify(response.data.user));

    return response.data.user;
  }

  /**
   * Get user profile with full details
   */
  async getUserProfile(): Promise<MiniUser> {
    const responseSchema = ApiResponseSchema(z.object({
      user: MiniUserSchema,
    }));
    
    const response = await this.request(`${this.basePath}/profile`, responseSchema, {
      method: 'GET',
    });

    if (!response.data?.user) {
      throw new Error('Failed to get user profile: No data returned');
    }

    return response.data.user;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    position?: string;
    notes?: string;
  }): Promise<MiniUser> {
    const responseSchema = ApiResponseSchema(z.object({
      user: MiniUserSchema,
    }));
    
    const response = await this.request(`${this.basePath}/update-profile`, responseSchema, {
      method: 'PUT',
      data: profileData,
    });

    if (!response.data?.user) {
      throw new Error('Failed to update profile: No data returned');
    }

    // Update cached user data
    const storage = localStorage.getItem('auth_user') ? localStorage : sessionStorage;
    storage.setItem('auth_user', JSON.stringify(response.data.user));

    return response.data.user;
  }

  /**
   * Change password
   */
  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
    logout_other_devices?: boolean;
  }): Promise<void> {
    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(`${this.basePath}/change-password`, responseSchema, {
      method: 'POST',
      data: passwordData,
    });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string; user: MiniUser }> {
    const responseSchema = ApiResponseSchema(z.object({
      token: z.string(),
      user: MiniUserSchema,
    }));
    
    const response = await this.request(`${this.basePath}/refresh`, responseSchema, {
      method: 'POST',
    });

    if (!response.data) {
      throw new Error('Token refresh failed: No data returned');
    }

    // Update stored token and user data
    const rememberMe = !!localStorage.getItem('auth_token');
    tokenStorage.set(response.data.token, rememberMe);
    
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('auth_user', JSON.stringify(response.data.user));

    return response.data;
  }

  /**
   * Verify email
   */
  async verifyEmail(): Promise<MiniUser> {
    const responseSchema = ApiResponseSchema(z.object({
      user: MiniUserSchema,
    }));
    
    const response = await this.request(`${this.basePath}/verify-email`, responseSchema, {
      method: 'POST',
    });

    if (!response.data?.user) {
      throw new Error('Email verification failed: No data returned');
    }

    // Update cached user data
    const storage = localStorage.getItem('auth_user') ? localStorage : sessionStorage;
    storage.setItem('auth_user', JSON.stringify(response.data.user));

    return response.data.user;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(`${this.basePath}/forgot-password`, responseSchema, {
      method: 'POST',
      data: { email },
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetData: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(`${this.basePath}/reset-password`, responseSchema, {
      method: 'POST',
      data: resetData,
    });
  }

  /**
   * Helper method to get cached user data
   */
  getCachedUser(): MiniUser | null {
    try {
      const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
      if (userData) {
        const parsed = JSON.parse(userData);
        return MiniUserSchema.parse(parsed);
      }
    } catch (error) {
      console.error('Error parsing cached user data:', error);
      // Clear invalid cached data
      this.clearAuthData();
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenStorage.get();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCachedUser();
    return user?.role === role.toUpperCase();
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCachedUser();
    if (!user) return false;
    return roles.some(role => user.role === role.toUpperCase());
  }

  /**
   * Check if user is barangay official
   */
  isBarangayOfficial(): boolean {
    return this.hasAnyRole([
      'BARANGAY_CAPTAIN',
      'BARANGAY_SECRETARY', 
      'BARANGAY_TREASURER',
      'BARANGAY_COUNCILOR'
    ]);
  }

  /**
   * Check if user is admin level
   */
  isAdmin(): boolean {
    return this.hasAnyRole(['SUPER_ADMIN', 'ADMIN']);
  }

  /**
   * Check if user is active and verified
   */
  isActiveUser(): boolean {
    const user = this.getCachedUser();
    return !!(user?.is_active && user?.is_verified);
  }

  /**
   * Get user permissions based on role
   */
  getUserPermissions(): {
    canManageResidents: boolean;
    canManageUsers: boolean;
    canGenerateReports: boolean;
    canManageSettings: boolean;
  } {
    const user = this.getCachedUser();
    if (!user) {
      return {
        canManageResidents: false,
        canManageUsers: false,
        canGenerateReports: false,
        canManageSettings: false,
      };
    }

    const canManageResidents = this.hasAnyRole([
      'SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN', 
      'BARANGAY_SECRETARY', 'BARANGAY_CLERK', 'DATA_ENCODER'
    ]);

    const canManageUsers = this.hasAnyRole(['SUPER_ADMIN', 'ADMIN']);

    const canGenerateReports = this.hasAnyRole([
      'SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN',
      'BARANGAY_SECRETARY', 'BARANGAY_TREASURER'
    ]);

    const canManageSettings = this.hasAnyRole(['SUPER_ADMIN', 'ADMIN']);

    return {
      canManageResidents,
      canManageUsers,
      canGenerateReports,
      canManageSettings,
    };
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    tokenStorage.remove();
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
  }

  /**
   * Auto-refresh token if needed
   */
  async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // Try to get current user to validate token
      await this.getCurrentUser();
      return true;
    } catch (error) {
      // If token is invalid, try to refresh
      try {
        await this.refreshToken();
        return true;
      } catch (refreshError) {
        // If refresh fails, clear auth data
        this.clearAuthData();
        return false;
      }
    }
  }
}

// Create singleton instance
export const authService = new AuthService();