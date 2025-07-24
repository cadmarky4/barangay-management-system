import { z } from 'zod';
import { UserRoleSchema, DepartmentSchema } from '@/services/users/users.types';

// Login credentials schema - updated to support username or email
export const LoginCredentialsRequestSchema = z.object({
  email: z.string().min(1, 'Email or username is required'), // Changed to accept both
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Alternative login schema for username specifically
export const LoginWithUsernameSchema = z.object({
  login: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Registration request schema
export const RegisterRequestSchema = z.object({
  // Personal Information
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_name: z.string().optional(),
  
  // Contact Information
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^(\+639|09)\d{9}$/, 'Invalid phone number format'),
  
  // Account Information
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  password_confirmation: z.string(),
  
  // Role and Department
  role: UserRoleSchema.optional(),
  department: DepartmentSchema.optional(),
  position: z.string().optional(),
  employee_id: z.string().optional(),
  
  // Relationship to resident
  resident_id: z.number().optional(),
  
  // Additional Information
  notes: z.string().optional(),
}).refine(
  (data) => data.password === data.password_confirmation,
  {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  }
);

// Mini user schema - aligned with your User model
export const MiniUserSchema = z.object({
  id: z.number(),
  
  // Personal Information
  first_name: z.string(),
  last_name: z.string(),
  middle_name: z.string().nullable().optional(),
  
  // Contact Information
  email: z.string().email(),
  phone: z.string(),
  
  // Account Information
  username: z.string(),
  role: UserRoleSchema,
  department: DepartmentSchema,
  position: z.string().nullable().optional(),
  employee_id: z.string().nullable().optional(),
  
  // Status
  is_active: z.boolean(),
  is_verified: z.boolean(),
  last_login_at: z.string().nullable().optional(),
  
  // Relationship
  resident_id: z.number().nullable().optional(),
  
  // Additional Information
  notes: z.string().nullable().optional(),
  
  // Computed attributes (from your User model)
  full_name: z.string().optional(),
  initials: z.string().optional(),
  display_name: z.string().optional(),
  role_display: z.string().optional(),
  department_display: z.string().optional(),
  is_user_active: z.boolean().optional(),
  has_logged_in: z.boolean().optional(),
  is_barangay_official: z.boolean().optional(),
  can_manage_residents: z.boolean().optional(),
  can_manage_users: z.boolean().optional(),
  can_generate_reports: z.boolean().optional(),
  
  // Timestamps
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.number().nullable().optional(),
  updated_by: z.number().nullable().optional(),
});

// Minimal user schema for basic operations
export const BasicUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string().optional(),
  role: UserRoleSchema,
  role_display: z.string().optional(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
});

// Login response schema
export const LoginResponseSchema = z.object({
  user: MiniUserSchema,
  token: z.string(),
});

// Profile update request schema
export const ProfileUpdateRequestSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  middle_name: z.string().optional(),
  phone: z.string().regex(/^(\+639|09)\d{9}$/, 'Invalid phone number format').optional(),
  email: z.string().email('Invalid email format').optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
});

// Change password request schema
export const ChangePasswordRequestSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  new_password_confirmation: z.string(),
  logout_other_devices: z.boolean().optional(),
}).refine(
  (data) => data.new_password === data.new_password_confirmation,
  {
    message: "New passwords don't match",
    path: ['new_password_confirmation'],
  }
);

// Forgot password request schema
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Reset password request schema
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  password_confirmation: z.string(),
}).refine(
  (data) => data.password === data.password_confirmation,
  {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  }
);

// Auth response schemas
export const AuthMessageResponseSchema = z.object({
  message: z.string(),
});

export const TokenRefreshResponseSchema = z.object({
  token: z.string(),
  user: MiniUserSchema,
});

export const UserProfileResponseSchema = z.object({
  user: MiniUserSchema,
});

// User permissions schema (computed from role)
export const UserPermissionsSchema = z.object({
  canManageResidents: z.boolean(),
  canManageUsers: z.boolean(),
  canGenerateReports: z.boolean(),
  canManageSettings: z.boolean(),
  canViewSensitiveData: z.boolean(),
  canApproveDocuments: z.boolean(),
  canManageBlotters: z.boolean(),
  canScheduleAppointments: z.boolean(),
});

// Auth state schema for frontend state management
export const AuthStateSchema = z.object({
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  user: MiniUserSchema.nullable(),
  token: z.string().nullable(),
  permissions: UserPermissionsSchema.nullable(),
  lastActivity: z.string().nullable(),
});

// Type exports
export type LoginCredentialsRequest = z.infer<typeof LoginCredentialsRequestSchema>;
export type LoginWithUsername = z.infer<typeof LoginWithUsernameSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type MiniUser = z.infer<typeof MiniUserSchema>;
export type BasicUser = z.infer<typeof BasicUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type AuthMessageResponse = z.infer<typeof AuthMessageResponseSchema>;
export type TokenRefreshResponse = z.infer<typeof TokenRefreshResponseSchema>;
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
export type UserPermissions = z.infer<typeof UserPermissionsSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;

// Helper type guards
export const isBarangayOfficial = (user: MiniUser): boolean => {
  return ['BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER', 'BARANGAY_COUNCILOR'].includes(user.role);
};

export const isAdmin = (user: MiniUser): boolean => {
  return ['SUPER_ADMIN', 'ADMIN'].includes(user.role);
};

export const canManageUsers = (user: MiniUser): boolean => {
  return ['SUPER_ADMIN', 'ADMIN'].includes(user.role);
};

export const canManageResidents = (user: MiniUser): boolean => {
  return ['SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_CLERK', 'DATA_ENCODER'].includes(user.role);
};

export const canGenerateReports = (user: MiniUser): boolean => {
  return ['SUPER_ADMIN', 'ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER'].includes(user.role);
};