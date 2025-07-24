// ============================================================================
// services/users/users.service.ts - Users service implementation
// ============================================================================

import { z } from 'zod';

import { BaseApiService } from '@/services/__shared/api';
import {
  UserSchema,
  UserParamsSchema,
  UserStatisticsSchema,
  CreateUserFormDataSchema,
  UpdateUserFormDataSchema,
  ChangePasswordSchema,
  UserPermissionsSchema,
  type User,
  type UserParams,
  type UserStatistics,
  type CreateUserFormData,
  type UpdateUserFormData,
  type ChangePasswordData,
  type UserPermissions,
  type UserRole,
  type Department,
} from './users.types';

import {
  ApiResponseSchema,
  PaginatedResponseSchema,
  type PaginatedResponse
} from '@/services/__shared/types';
import { apiClient } from '@/services/__shared/client';

// Additional schemas for user-specific operations
const UserListResponseSchema = PaginatedResponseSchema(UserSchema);

const UserActivitySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  action: z.string(),
  resource: z.string(),
  resource_id: z.number().nullable(),
  ip_address: z.string(),
  user_agent: z.string(),
  created_at: z.string(),
});

const UserSessionSchema = z.object({
  id: z.string(),
  user_id: z.number(),
  ip_address: z.string(),
  user_agent: z.string(),
  last_activity: z.string(),
  is_current: z.boolean(),
});

const BulkUserActionSchema = z.object({
  user_ids: z.array(z.number()),
  action: z.enum(['activate', 'deactivate', 'delete', 'reset_password', 'verify', 'suspend']),
  reason: z.string().optional(),
});

const UserImportResultSchema = z.object({
  success_count: z.number(),
  error_count: z.number(),
  total_processed: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    field: z.string().optional(),
    error: z.string(),
    data: z.record(z.any()).optional(),
  })),
  warnings: z.array(z.object({
    row: z.number(),
    message: z.string(),
  })).optional(),
});

type UserActivity = z.infer<typeof UserActivitySchema>;
type UserSession = z.infer<typeof UserSessionSchema>;
type BulkUserAction = z.infer<typeof BulkUserActionSchema>;
type UserImportResult = z.infer<typeof UserImportResultSchema>;

export class UsersService extends BaseApiService {
  private readonly basePath = '/users';

  /**
   * Get paginated list of users
   */
  async getUsers(params: UserParams = {}): Promise<PaginatedResponse<User>> {
    // Validate input parameters
    const validatedParams = UserParamsSchema.parse(params);
    
    // Build query string
    const searchParams = new URLSearchParams();
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(
      `${this.basePath}?${searchParams.toString()}`,
      UserListResponseSchema,
      { method: 'GET' }
    );
  }

  /**
   * Get single user by ID
   */
  async getUser(id: string): Promise<User> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/${id}`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('User not found');
    }

    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/me`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Unable to get current user');
    }

    return response.data;
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserFormData): Promise<User> {
    // Validate input data
    const validatedData = CreateUserFormDataSchema.parse(userData);
    
    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      this.basePath,
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create user');
    }

    return response.data;
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, userData: UpdateUserFormData): Promise<User> {
    this.validateId(id, 'User ID');

    // Validate input data
    const validatedData = UpdateUserFormDataSchema.parse(userData);
    
    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update user');
    }

    return response.data;
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(userData: Partial<UpdateUserFormData>): Promise<User> {
    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/me`,
      responseSchema,
      {
        method: 'PUT',
        data: userData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update profile');
    }

    return response.data;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(
      `${this.basePath}/${id}`,
      responseSchema,
      { method: 'DELETE' }
    );
  }

  /**
   * Restore deleted user
   */
  async restoreUser(id: string): Promise<User> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/${id}/restore`,
      responseSchema,
      { method: 'POST' }
    );

    if (!response.data) {
      throw new Error('Failed to restore user');
    }

    return response.data;
  }

  /**
   * Permanently delete user
   */
  async forceDeleteUser(id: string): Promise<void> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(
      `${this.basePath}/${id}/force-delete`,
      responseSchema,
      { method: 'DELETE' }
    );
  }

  /**
   * Change user password
   */
  async changePassword(id: string, passwordData: ChangePasswordData): Promise<void> {
    this.validateId(id, 'User ID');

    // Validate input data
    const validatedData = ChangePasswordSchema.parse(passwordData);
    
    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(
      `${this.basePath}/${id}/change-password`,
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );
  }

  /**
   * Change current user password
   */
  async changeCurrentUserPassword(passwordData: ChangePasswordData): Promise<void> {
    // Validate input data
    const validatedData = ChangePasswordSchema.parse(passwordData);
    
    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(
      `${this.basePath}/me/change-password`,
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(id: string, sendEmail = true): Promise<{ temporary_password?: string; message: string }> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(z.object({
      temporary_password: z.string().optional(),
      message: z.string(),
    }));
    
    const response = await this.request(
      `${this.basePath}/${id}/reset-password`,
      responseSchema,
      {
        method: 'POST',
        data: { send_email: sendEmail },
      }
    );

    return response.data || { message: 'Password reset successfully' };
  }

  /**
   * Change user status (activate/deactivate/suspend)
   */
  async changeUserStatus(
    id: string, 
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', 
    reason?: string
  ): Promise<User> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/${id}/status`,
      responseSchema,
      {
        method: 'PUT',
        data: { status, reason },
      }
    );

    if (!response.data) {
      throw new Error('Failed to change user status');
    }

    return response.data;
  }

  /**
   * Activate user
   */
  async activateUser(id: string, reason?: string): Promise<User> {
    return this.changeUserStatus(id, 'ACTIVE', reason);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string, reason?: string): Promise<User> {
    return this.changeUserStatus(id, 'INACTIVE', reason);
  }

  /**
   * Suspend user
   */
  async suspendUser(id: string, reason?: string): Promise<User> {
    return this.changeUserStatus(id, 'SUSPENDED', reason);
  }

  /**
   * Verify user email
   */
  async verifyUser(id: string): Promise<User> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/${id}/verify`,
      responseSchema,
      { method: 'POST' }
    );

    if (!response.data) {
      throw new Error('Failed to verify user');
    }

    return response.data;
  }

  /**
   * Unverify user email
   */
  async unverifyUser(id: string): Promise<User> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/${id}/unverify`,
      responseSchema,
      { method: 'POST' }
    );

    if (!response.data) {
      throw new Error('Failed to unverify user');
    }

    return response.data;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(id: string): Promise<void> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(
      `${this.basePath}/${id}/resend-verification`,
      responseSchema,
      { method: 'POST' }
    );
  }

  /**
   * Send user credentials via email
   */
  async sendUserCredentials(id: string, includePassword = false): Promise<void> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(
      `${this.basePath}/${id}/send-credentials`,
      responseSchema,
      {
        method: 'POST',
        data: { include_password: includePassword },
      }
    );
  }

  /**
   * Link user to resident
   */
  async linkToResident(userId: string, residentId: string): Promise<User> {
    this.validateId(userId, 'User ID');
    this.validateId(residentId, 'Resident ID');

    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/${userId}/link-resident`,
      responseSchema,
      {
        method: 'POST',
        data: { resident_id: residentId },
      }
    );

    if (!response.data) {
      throw new Error('Failed to link user to resident');
    }

    return response.data;
  }

  /**
   * Unlink user from resident
   */
  async unlinkFromResident(userId: string): Promise<User> {
    this.validateId(userId, 'User ID');

    const responseSchema = ApiResponseSchema(UserSchema);
    
    const response = await this.request(
      `${this.basePath}/${userId}/unlink-resident`,
      responseSchema,
      { method: 'POST' }
    );

    if (!response.data) {
      throw new Error('Failed to unlink user from resident');
    }

    return response.data;
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    const responseSchema = ApiResponseSchema(UserStatisticsSchema);
    
    const response = await this.request(
      `${this.basePath}/statistics`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get user statistics');
    }

    return response.data;
  }

  /**
   * Search users by name, email, or username
   */
  async searchUsers(searchTerm: string, limit = 10): Promise<User[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const response = await this.request(
      `${this.basePath}?search=${encodeURIComponent(searchTerm)}&per_page=${limit}`,
      UserListResponseSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Check username availability
   */
  async checkUsernameAvailability(username: string, excludeUserId?: number): Promise<boolean> {
    if (!username.trim()) {
      throw new Error('Username is required');
    }

    const responseSchema = ApiResponseSchema(z.object({
      available: z.boolean(),
      message: z.string().optional(),
    }));

    const params = new URLSearchParams({ username });
    if (excludeUserId) {
      params.append('exclude_user_id', excludeUserId.toString());
    }
    
    const response = await this.request(
      `${this.basePath}/check-username?${params.toString()}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.available || false;
  }

  /**
   * Check email availability
   */
  async checkEmailAvailability(email: string, excludeUserId?: number): Promise<boolean> {
    if (!email.trim()) {
      throw new Error('Email is required');
    }

    const responseSchema = ApiResponseSchema(z.object({
      available: z.boolean(),
      message: z.string().optional(),
    }));

    const params = new URLSearchParams({ email });
    if (excludeUserId) {
      params.append('exclude_user_id', excludeUserId.toString());
    }
    
    const response = await this.request(
      `${this.basePath}/check-email?${params.toString()}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.available || false;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, includeInactive = false): Promise<User[]> {
    const params = new URLSearchParams({
      role,
      per_page: '100',
    });

    if (includeInactive) {
      params.append('include_inactive', 'true');
    }

    const response = await this.request(
      `${this.basePath}?${params.toString()}`,
      UserListResponseSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(department: Department, includeInactive = false): Promise<User[]> {
    const params = new URLSearchParams({
      department,
      per_page: '100',
    });

    if (includeInactive) {
      params.append('include_inactive', 'true');
    }

    const response = await this.request(
      `${this.basePath}?${params.toString()}`,
      UserListResponseSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get barangay officials
   */
  async getBarangayOfficials(includeInactive = false): Promise<User[]> {
    const params = new URLSearchParams({
      is_barangay_official: 'true',
      per_page: '100',
    });

    if (includeInactive) {
      params.append('include_inactive', 'true');
    }

    const response = await this.request(
      `${this.basePath}?${params.toString()}`,
      UserListResponseSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get users with linked residents
   */
  async getUsersWithResidents(): Promise<User[]> {
    const response = await this.request(
      `${this.basePath}?has_resident=true&per_page=100`,
      UserListResponseSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get users without linked residents
   */
  async getUsersWithoutResidents(): Promise<User[]> {
    const response = await this.request(
      `${this.basePath}?has_resident=false&per_page=100`,
      UserListResponseSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get user activity log
   */
  async getUserActivity(id: string, limit = 50): Promise<UserActivity[]> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(z.array(UserActivitySchema));
    
    const response = await this.request(
      `${this.basePath}/${id}/activity?limit=${limit}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data || [];
  }

  /**
   * Get user active sessions
   */
  async getUserSessions(id: string): Promise<UserSession[]> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(z.array(UserSessionSchema));
    
    const response = await this.request(
      `${this.basePath}/${id}/sessions`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data || [];
  }

  /**
   * Terminate user session
   */
  async terminateUserSession(userId: string, sessionId: string): Promise<void> {
    this.validateId(userId, 'User ID');

    if (!sessionId.trim()) {
      throw new Error('Session ID is required');
    }

    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(
      `${this.basePath}/${userId}/sessions/${sessionId}`,
      responseSchema,
      { method: 'DELETE' }
    );
  }

  /**
   * Terminate all user sessions except current
   */
  async terminateAllUserSessions(id: string): Promise<void> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(z.object({
      message: z.string(),
    }));
    
    await this.request(
      `${this.basePath}/${id}/sessions`,
      responseSchema,
      { method: 'DELETE' }
    );
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(id: string): Promise<UserPermissions> {
    this.validateId(id, 'User ID');

    const responseSchema = ApiResponseSchema(UserPermissionsSchema);
    
    const response = await this.request(
      `${this.basePath}/${id}/permissions`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get user permissions');
    }

    return response.data;
  }

  /**
   * Update user permissions
   */
  async updateUserPermissions(id: string, permissions: UserPermissions): Promise<UserPermissions> {
    this.validateId(id, 'User ID');

    const validatedPermissions = UserPermissionsSchema.parse(permissions);
    
    const responseSchema = ApiResponseSchema(UserPermissionsSchema);
    
    const response = await this.request(
      `${this.basePath}/${id}/permissions`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedPermissions,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update user permissions');
    }

    return response.data;
  }

  /**
   * Bulk user actions
   */
  async bulkUserAction(action: BulkUserAction): Promise<{
    success_count: number;
    error_count: number;
    errors: Array<{ user_id: number; error: string }>;
  }> {
    const validatedAction = BulkUserActionSchema.parse(action);
    
    const responseSchema = ApiResponseSchema(z.object({
      success_count: z.number(),
      error_count: z.number(),
      errors: z.array(z.object({
        user_id: z.number(),
        error: z.string(),
      })),
    }));
    
    const response = await this.request(
      `${this.basePath}/bulk-action`,
      responseSchema,
      {
        method: 'POST',
        data: validatedAction,
      }
    );

    if (!response.data) {
      throw new Error('Failed to perform bulk action');
    }

    return response.data;
  }

  /**
   * Export users data
   */
  async exportUsers(params: UserParams = {}, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    const validatedParams = UserParamsSchema.parse(params);
    
    const searchParams = new URLSearchParams();
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    searchParams.append('format', format);

    const response = await apiClient.get(`${this.basePath}/export?${searchParams.toString()}`, {
      responseType: 'blob',
    });

    if (!response.data) {
      throw new Error('Failed to export users data');
    }

    return response.data;
  }

  /**
   * Get export template
   */
  async getImportTemplate(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/import-template?format=${format}`, {
      responseType: 'blob',
    });

    if (!response.data) {
      throw new Error('Failed to get import template');
    }

    return response.data;
  }

  /**
   * Upload users from file (CSV/Excel)
   */
  async importUsers(file: File, options: {
    update_existing?: boolean;
    send_credentials?: boolean;
    default_password?: string;
    skip_validation?: boolean;
  } = {}): Promise<UserImportResult> {
    if (!file) {
      throw new Error('File is required');
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only CSV and Excel files are allowed.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await apiClient.post(`${this.basePath}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes
    });

    const responseSchema = ApiResponseSchema(UserImportResultSchema);
    const validatedResponse = responseSchema.parse(response.data);

    if (!validatedResponse.data) {
      throw new Error('Failed to import users');
    }

    return validatedResponse.data;
  }

  /**
   * Validate import file without importing
   */
  async validateImportFile(file: File): Promise<{
    is_valid: boolean;
    total_rows: number;
    errors: Array<{ row: number; field: string; error: string }>;
    warnings: Array<{ row: number; message: string }>;
  }> {
    if (!file) {
      throw new Error('File is required');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`${this.basePath}/validate-import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const responseSchema = ApiResponseSchema(z.object({
      is_valid: z.boolean(),
      total_rows: z.number(),
      errors: z.array(z.object({
        row: z.number(),
        field: z.string(),
        error: z.string(),
      })),
      warnings: z.array(z.object({
        row: z.number(),
        message: z.string(),
      })),
    }));

    const validatedResponse = responseSchema.parse(response.data);

    if (!validatedResponse.data) {
      throw new Error('Failed to validate import file');
    }

    return validatedResponse.data;
  }

  /**
   * Private helper method to validate IDs
   */
  private validateId(id: string, fieldName: string): void {
    if (!id || !id.trim() || isNaN(Number(id)) || Number(id) <= 0) {
      throw new Error(`Invalid ${fieldName}: must be a positive number`);
    }
  }
}

// Create singleton instance
export const usersService = new UsersService();