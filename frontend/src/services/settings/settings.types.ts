// ============================================================================
// services/settings/settings.types.ts - Settings type definitions and schemas
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Base Settings Schema
// ============================================================================

export const SettingsDataSchema = z.object({
  // General Information
  barangay: z.string().min(1, 'Barangay is required').max(100, 'Barangay name too long'),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  province: z.string().min(1, 'Province is required').max(100, 'Province name too long'),
  region: z.string().min(1, 'Region is required').max(100, 'Region name too long'),
  type: z.enum(['Urban', 'Rural', 'Highly Urbanized'], {
    errorMap: () => ({ message: 'Type must be Urban, Rural, or Highly Urbanized' })
  }),
  contactNumber: z.string()
    .min(1, 'Contact number is required')
    .regex(/^[\d\s\-+()]+$/, 'Invalid contact number format')
    .max(20, 'Contact number too long'),
  emailAddress: z.string()
    .min(1, 'Email address is required')
    .email('Invalid email address format')
    .max(100, 'Email address too long'),
  openingHours: z.string()
    .min(1, 'Opening hours is required')
    .max(20, 'Opening hours format too long'),
  closingHours: z.string()
    .min(1, 'Closing hours is required')
    .max(20, 'Closing hours format too long'),
  primaryLanguage: z.string().max(50, 'Primary language name too long').optional().or(z.literal('')),
  secondaryLanguage: z.string().max(50, 'Secondary language name too long').optional().or(z.literal('')),
  
  // Privacy and Security
  sessionTimeout: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 5 && num <= 480;
    }, 'Session timeout must be between 5 and 480 minutes'),
  maxLoginAttempts: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 10;
    }, 'Max login attempts must be between 1 and 10'),
  dataRetention: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 50;
    }, 'Data retention must be between 1 and 50 years'),
  backupFrequency: z.enum(['Daily', 'Weekly', 'Monthly'], {
    errorMap: () => ({ message: 'Backup frequency must be Daily, Weekly, or Monthly' })
  }),
  
  // System
  systemName: z.string().max(100, 'System name too long').optional().or(z.literal('')),
  versionNumber: z.string().max(20, 'Version number too long').optional().or(z.literal(''))
});

// ============================================================================
// Section-specific Schemas for validation
// ============================================================================

export const GeneralSettingsSchema = SettingsDataSchema.pick({
  barangay: true,
  city: true,
  province: true,
  region: true,
  type: true,
  contactNumber: true,
  emailAddress: true,
  openingHours: true,
  closingHours: true,
  primaryLanguage: true,
  secondaryLanguage: true
});

export const PrivacySettingsSchema = SettingsDataSchema.pick({
  sessionTimeout: true,
  maxLoginAttempts: true,
  dataRetention: true,
  backupFrequency: true
});

export const SystemSettingsSchema = SettingsDataSchema.pick({
  systemName: true,
  versionNumber: true
});

// ============================================================================
// Partial update schema for flexibility
// ============================================================================

export const SettingsUpdateSchema = SettingsDataSchema.partial();

// ============================================================================
// Settings validation parameters
// ============================================================================

export const SettingsValidationSchema = z.object({
  section: z.enum(['general', 'privacy', 'system', 'all']).optional(),
  validateOnly: z.boolean().optional()
});

// ============================================================================
// Settings backup/restore schemas
// ============================================================================

export const SettingsBackupSchema = z.object({
  settings: SettingsDataSchema,
  timestamp: z.string(),
  version: z.string(),
  createdBy: z.string().optional()
});

export const SettingsRestoreSchema = z.object({
  backupId: z.string().min(1, 'Backup ID is required'),
  confirmRestore: z.boolean().refine(val => val === true, 'Restore confirmation is required')
});

// ============================================================================
// Type exports
// ============================================================================

export type SettingsData = z.infer<typeof SettingsDataSchema>;
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;
export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;
export type SettingsUpdate = z.infer<typeof SettingsUpdateSchema>;
export type SettingsValidation = z.infer<typeof SettingsValidationSchema>;
export type SettingsBackup = z.infer<typeof SettingsBackupSchema>;
export type SettingsRestore = z.infer<typeof SettingsRestoreSchema>;

// ============================================================================
// Settings sections enum for better type safety
// ============================================================================

export enum SettingsSection {
  GENERAL = 'general',
  PRIVACY = 'privacy',
  SYSTEM = 'system',
  ALL = 'all'
}

// ============================================================================
// Default settings values
// ============================================================================

export const DEFAULT_SETTINGS: SettingsData = {
  // General Information
  barangay: '',
  city: '',
  province: '',
  region: '',
  type: 'Urban',
  contactNumber: '',
  emailAddress: '',
  openingHours: '8:00 AM',
  closingHours: '5:00 PM',
  primaryLanguage: 'Filipino',
  secondaryLanguage: 'English',
  
  // Privacy and Security
  sessionTimeout: '30',
  maxLoginAttempts: '3',
  dataRetention: '7',
  backupFrequency: 'Daily',
  
  // System
  systemName: 'Barangay Management System',
  versionNumber: '1.0.0'
};