// ============================================================================
// services/settings/settings.service.ts - Settings service implementation
// ============================================================================

import { z } from 'zod';

import { BaseApiService } from '@/services/__shared/api';
import { 
  SettingsDataSchema,
  SettingsUpdateSchema,
  GeneralSettingsSchema,
  PrivacySettingsSchema,
  SystemSettingsSchema,
  SettingsValidationSchema,
  SettingsBackupSchema,
  DEFAULT_SETTINGS,
  type SettingsData,
  type SettingsUpdate,
  type GeneralSettings,
  type PrivacySettings,
  type SystemSettings,
  type SettingsBackup,
  SettingsSection
} from '@/services/settings/settings.types';

import { 
  ApiResponseSchema
} from '@/services/__shared/types';

export class SettingsService extends BaseApiService {
  /**
   * Get current settings
   */
  async getSettings(): Promise<SettingsData> {
    const responseSchema = ApiResponseSchema(SettingsDataSchema);
    
    const response = await this.request(
      '/settings',
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get settings');
    }

    return response.data;
  }

  /**
   * Update settings (full or partial)
   */
  async updateSettings(settingsData: SettingsUpdate): Promise<SettingsData> {
    // Validate input data
    const validatedData = SettingsUpdateSchema.parse(settingsData);
    
    const responseSchema = ApiResponseSchema(SettingsDataSchema);
    
    const response = await this.request(
      '/settings',
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update settings');
    }

    return response.data;
  }

  /**
   * Reset settings to default values
   */
  async resetSettings(): Promise<SettingsData> {
    const responseSchema = ApiResponseSchema(SettingsDataSchema);
    
    const response = await this.request(
      '/settings/reset',
      responseSchema,
      { method: 'POST' }
    );

    if (!response.data) {
      throw new Error('Failed to reset settings');
    }

    return response.data;
  }

  /**
   * Validate settings data
   */
  async validateSettings(settingsData: SettingsUpdate, section: SettingsSection = SettingsSection.ALL): Promise<boolean> {
    try {
      switch (section) {
        case SettingsSection.GENERAL: {
          // Extract only general settings fields
          const generalData = {
            ...(settingsData.barangay !== undefined && { barangay: settingsData.barangay }),
            ...(settingsData.city !== undefined && { city: settingsData.city }),
            ...(settingsData.province !== undefined && { province: settingsData.province }),
            ...(settingsData.region !== undefined && { region: settingsData.region }),
            ...(settingsData.type !== undefined && { type: settingsData.type }),
            ...(settingsData.contactNumber !== undefined && { contactNumber: settingsData.contactNumber }),
            ...(settingsData.emailAddress !== undefined && { emailAddress: settingsData.emailAddress }),
            ...(settingsData.openingHours !== undefined && { openingHours: settingsData.openingHours }),
            ...(settingsData.closingHours !== undefined && { closingHours: settingsData.closingHours }),
            ...(settingsData.primaryLanguage !== undefined && { primaryLanguage: settingsData.primaryLanguage }),
            ...(settingsData.secondaryLanguage !== undefined && { secondaryLanguage: settingsData.secondaryLanguage })
          };
          GeneralSettingsSchema.partial().parse(generalData);
          break;
        }
        
        case SettingsSection.PRIVACY: {
          const privacyData = {
            ...(settingsData.sessionTimeout !== undefined && { sessionTimeout: settingsData.sessionTimeout }),
            ...(settingsData.maxLoginAttempts !== undefined && { maxLoginAttempts: settingsData.maxLoginAttempts }),
            ...(settingsData.dataRetention !== undefined && { dataRetention: settingsData.dataRetention }),
            ...(settingsData.backupFrequency !== undefined && { backupFrequency: settingsData.backupFrequency })
          };
          PrivacySettingsSchema.partial().parse(privacyData);
          break;
        }
        
        case SettingsSection.SYSTEM: {
          const systemData = {
            ...(settingsData.systemName !== undefined && { systemName: settingsData.systemName }),
            ...(settingsData.versionNumber !== undefined && { versionNumber: settingsData.versionNumber })
          };
          SystemSettingsSchema.partial().parse(systemData);
          break;
        }
        
        default:
          SettingsUpdateSchema.parse(settingsData);
          break;
      }
      return true;
    } catch (error) {
      console.error('Settings validation failed:', error);
      return false;
    }
  }

  /**
   * Update specific section of settings
   */
  async updateGeneralSettings(generalData: Partial<GeneralSettings>): Promise<SettingsData> {
    // Validate general settings data
    const validatedData = GeneralSettingsSchema.partial().parse(generalData);
    
    return this.updateSettings(validatedData);
  }

  /**
   * Update privacy and security settings
   */
  async updatePrivacySettings(privacyData: Partial<PrivacySettings>): Promise<SettingsData> {
    // Validate privacy settings data
    const validatedData = PrivacySettingsSchema.partial().parse(privacyData);
    
    return this.updateSettings(validatedData);
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(systemData: Partial<SystemSettings>): Promise<SettingsData> {
    // Validate system settings data
    const validatedData = SystemSettingsSchema.partial().parse(systemData);
    
    return this.updateSettings(validatedData);
  }

  /**
   * Get specific section of settings
   */
  async getSettingsSection(section: SettingsSection): Promise<GeneralSettings | PrivacySettings | SystemSettings | SettingsData> {
    const allSettings = await this.getSettings();
    
    switch (section) {
      case SettingsSection.GENERAL:
        return {
          barangay: allSettings.barangay,
          city: allSettings.city,
          province: allSettings.province,
          region: allSettings.region,
          type: allSettings.type,
          contactNumber: allSettings.contactNumber,
          emailAddress: allSettings.emailAddress,
          openingHours: allSettings.openingHours,
          closingHours: allSettings.closingHours,
          primaryLanguage: allSettings.primaryLanguage,
          secondaryLanguage: allSettings.secondaryLanguage
        };
      
      case SettingsSection.PRIVACY:
        return {
          sessionTimeout: allSettings.sessionTimeout,
          maxLoginAttempts: allSettings.maxLoginAttempts,
          dataRetention: allSettings.dataRetention,
          backupFrequency: allSettings.backupFrequency
        };
      
      case SettingsSection.SYSTEM:
        return {
          systemName: allSettings.systemName,
          versionNumber: allSettings.versionNumber
        };
      
      default:
        return allSettings;
    }
  }

  /**
   * Check if settings are at default values
   */
  async isDefaultSettings(): Promise<boolean> {
    try {
      const currentSettings = await this.getSettings();
      
      // Compare with default settings (excluding empty optional fields)
      const normalizedCurrent = { ...currentSettings };
      const normalizedDefault = { ...DEFAULT_SETTINGS };
      
      // Handle optional fields that might be empty strings
      if (!normalizedCurrent.primaryLanguage) normalizedCurrent.primaryLanguage = '';
      if (!normalizedCurrent.secondaryLanguage) normalizedCurrent.secondaryLanguage = '';
      if (!normalizedCurrent.systemName) normalizedCurrent.systemName = '';
      if (!normalizedCurrent.versionNumber) normalizedCurrent.versionNumber = '';
      
      return JSON.stringify(normalizedCurrent) === JSON.stringify(normalizedDefault);
    } catch (error) {
      console.error('Error checking default settings:', error);
      return false;
    }
  }

  /**
   * Create backup of current settings (simplified)
   */
  async backupSettings(): Promise<SettingsBackup> {
    const currentSettings = await this.getSettings();
    
    const backup: SettingsBackup = {
      settings: currentSettings,
      timestamp: new Date().toISOString(),
      version: currentSettings.versionNumber || '1.0.0'
    };
    
    // Validate backup data
    const validatedBackup = SettingsBackupSchema.parse(backup);
    
    const responseSchema = ApiResponseSchema(SettingsBackupSchema);
    
    const response = await this.request(
      '/settings/backup',
      responseSchema,
      {
        method: 'POST',
        data: validatedBackup,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create settings backup');
    }

    return response.data;
  }

  /**
   * Test settings connectivity (simplified)
   */
  async testSettings(section: SettingsSection = SettingsSection.ALL): Promise<boolean> {
    try {
      const validationParams = SettingsValidationSchema.parse({
        section,
        validateOnly: true
      });
      
      const responseSchema = ApiResponseSchema(z.object({
        success: z.boolean(),
        message: z.string().optional(),
        details: z.record(z.any()).optional()
      }));
      
      const response = await this.request(
        '/settings/test',
        responseSchema,
        {
          method: 'POST',
          data: validationParams,
        }
      );

      return response.data?.success || false;
    } catch (error) {
      console.error('Error testing settings:', error);
      return false;
    }
  }
}

// Create singleton instance
export const settingsService = new SettingsService();

export { SettingsSection } from '@/services/settings/settings.types';
// Export types for external use
export type { SettingsData, SettingsUpdate, GeneralSettings, PrivacySettings, SystemSettings };