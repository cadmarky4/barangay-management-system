import { BaseApiService } from '@/services/__shared/api';
import { ApiResponseSchema, type ApiResponse } from '@/services/__shared/types';
import { z } from 'zod';

// Zod schemas for dashboard data
export const DashboardStatisticsSchema = z.object({
  totalResidents: z.number(),
  totalHouseholds: z.number(),
  activeBarangayOfficials: z.number(),
  totalBlotterCases: z.number(),
  totalIssuedClearance: z.number(),
  ongoingProjects: z.number(),
});

export const ResidentDemographicsSchema = z.object({
  children: z.number(), // 0-17
  adults: z.number(),   // 18-59
  seniors: z.number(),  // 60+
});

export const DashboardNotificationSchema = z.object({
  id: z.number(),
  message: z.string(),
  time: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
});

export const RecentActivitySchema = z.object({
  id: z.number(),
  description: z.string(),
  time: z.string(),
  type: z.enum(['resident', 'project', 'document', 'blotter']),
});

export const BarangayOfficialSchema = z.object({
  id: z.number(),
  name: z.string(),
  position: z.string(),
  email: z.string(),
  contact: z.string(),
  photo: z.string(),
});

// Type exports
export type DashboardStatistics = z.infer<typeof DashboardStatisticsSchema>;
export type ResidentDemographics = z.infer<typeof ResidentDemographicsSchema>;
export type DashboardNotification = z.infer<typeof DashboardNotificationSchema>;
export type RecentActivity = z.infer<typeof RecentActivitySchema>;
export type BarangayOfficial = z.infer<typeof BarangayOfficialSchema>;

export class DashboardService extends BaseApiService {
  /**
   * Get dashboard statistics
   */
  async getStatistics(): Promise<ApiResponse<DashboardStatistics>> {
    const response = await this.request('/dashboard/statistics', ApiResponseSchema(DashboardStatisticsSchema));
    return {
      message: 'Dashboard statistics retrieved successfully',
      data: response.data,
    };
  }

  /**
   * Get resident demographics for charts
   */
  async getResidentDemographics(): Promise<ApiResponse<ResidentDemographics>> {
    const response = await this.request('/dashboard/demographics', ApiResponseSchema(ResidentDemographicsSchema));
    return {
      message: 'Resident demographics retrieved successfully',
      data: response.data,
    };
  }

  /**
   * Get recent notifications
   */
  async getNotifications(): Promise<ApiResponse<DashboardNotification[]>> {
    const response = await this.request('/dashboard/notifications', ApiResponseSchema(z.array(DashboardNotificationSchema)));
    return {
      message: 'Notifications retrieved successfully',
      data: response.data,
    };
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<ApiResponse<RecentActivity[]>> {
    const response = await this.request('/dashboard/activities', ApiResponseSchema(z.array(RecentActivitySchema)));
    return {
      message: 'Recent activities retrieved successfully',
      data: response.data,
    };
  }

  /**
   * Get barangay officials for dashboard
   */
  async getBarangayOfficials(): Promise<ApiResponse<BarangayOfficial[]>> {
    const response = await this.request('/dashboard/barangay-officials', ApiResponseSchema(z.array(BarangayOfficialSchema)));
    
    return {
      message: 'Barangay officials retrieved successfully',
      data: response.data,
    };
  }
}
