// ============================================================================
// services/activity-logs/activity-logs.service.ts - Activity Logs service implementation
// ============================================================================

import { z } from 'zod';

import { BaseApiService } from '@/services/__shared/api';
import { 
  ActivityLogSchema,
  ActivityLogParamsSchema,
  ActivityStatisticsSchema,
  ActivitySummarySchema,
  ActivityLogDetailSchema,
  ActivityLogExportParamsSchema,
  type ActivityLog,
  type ActivityLogParams,
  type ActivityStatistics,
  type ActivitySummary,
  type ActivityLogDetail,
  type ActivityLogExportParams
} from './activity-logs.types';

import { 
  ApiResponseSchema, 
  PaginatedResponseSchema, 
  type PaginatedResponse 
} from '@/services/__shared/types';

export class ActivityLogsService extends BaseApiService {
  /**
   * Get paginated list of activity logs
   */
  async getActivityLogs(params: ActivityLogParams = {}): Promise<PaginatedResponse<ActivityLog>> {
    // Validate input parameters
    const validatedParams = ActivityLogParamsSchema.parse(params);
    
    // Build query string
    const searchParams = new URLSearchParams();
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          // Handle array parameters (action_types, table_names)
          value.forEach(item => searchParams.append(`${key}[]`, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const paginatedSchema = PaginatedResponseSchema(ActivityLogSchema);
    
    return this.request(
      `/activity-logs?${searchParams.toString()}`,
      paginatedSchema,
      { method: 'GET' }
    );
  }

  /**
   * Get single activity log by ID with detailed information
   */
  async getActivityLog(id: string): Promise<ActivityLogDetail> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid activity log ID: ID must be a non-empty string');
    }

    const responseSchema = ApiResponseSchema(ActivityLogDetailSchema);
    
    const response = await this.request(
      `/activity-logs/${id}`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Activity log not found');
    }

    return response.data;
  }

  /**
   * Get activity logs for a specific record
   */
  async getActivityLogsForRecord(tableName: string, recordId: number): Promise<ActivityLog[]> {
    if (!tableName || !recordId) {
      throw new Error('Table name and record ID are required');
    }

    const paginatedSchema = PaginatedResponseSchema(ActivityLogSchema);
    
    const response = await this.request(
      `/activity-logs?table_name=${encodeURIComponent(tableName)}&record_id=${recordId}&sort_by=timestamp&sort_order=desc`,
      paginatedSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get activity logs for a specific user
   */
  async getActivityLogsForUser(userId: string, params: Omit<ActivityLogParams, 'user_id'> = {}): Promise<PaginatedResponse<ActivityLog>> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return this.getActivityLogs({ ...params, user_id: userId });
  }

  /**
   * Get activity statistics
   */
  async getActivityStatistics(): Promise<ActivityStatistics> {
    const responseSchema = ApiResponseSchema(ActivityStatisticsSchema);
    
    const response = await this.request(
      '/activity-logs/statistics',
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get activity statistics');
    }

    return response.data;
  }

  /**
   * Get activity summary for dashboard
   */
  async getActivitySummary(): Promise<ActivitySummary> {
    const responseSchema = ApiResponseSchema(ActivitySummarySchema);
    
    const response = await this.request(
      '/activity-logs/summary',
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get activity summary');
    }

    return response.data;
  }

  /**
   * Search activity logs by description or user name
   */
  async searchActivityLogs(searchTerm: string, limit = 50): Promise<PaginatedResponse<ActivityLog>> {
    if (!searchTerm.trim()) {
      throw new Error('Search term is required');
    }

    return this.getActivityLogs({
      search: searchTerm,
      per_page: limit,
      sort_by: 'timestamp',
      sort_order: 'desc'
    });
  }

  /**
   * Get recent activities (last 24 hours)
   */
  async getRecentActivities(limit = 20): Promise<ActivityLog[]> {
    const response = await this.getActivityLogs({
      time_range: 'today',
      per_page: limit,
      sort_by: 'timestamp',
      sort_order: 'desc'
    });

    return response.data;
  }

  /**
   * Get activities by date range
   */
  async getActivitiesByDateRange(
    dateFrom: string, 
    dateTo: string, 
    params: Omit<ActivityLogParams, 'date_from' | 'date_to'> = {}
  ): Promise<PaginatedResponse<ActivityLog>> {
    if (!dateFrom || !dateTo) {
      throw new Error('Start date and end date are required');
    }

    // Validate date format
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    return this.getActivityLogs({
      ...params,
      date_from: startDate.toISOString(),
      date_to: endDate.toISOString(),
      sort_by: 'timestamp',
      sort_order: 'desc'
    });
  }

  /**
   * Get activities by action type
   */
  async getActivitiesByAction(actionType: string, params: Omit<ActivityLogParams, 'action_type'> = {}): Promise<PaginatedResponse<ActivityLog>> {
    if (!actionType) {
      throw new Error('Action type is required');
    }

    return this.getActivityLogs({
      ...params,
      action_type: actionType as any,
      sort_by: 'timestamp',
      sort_order: 'desc'
    });
  }

  /**
   * Get activities by table/model
   */
  async getActivitiesByTable(tableName: string, params: Omit<ActivityLogParams, 'table_name'> = {}): Promise<PaginatedResponse<ActivityLog>> {
    if (!tableName) {
      throw new Error('Table name is required');
    }

    return this.getActivityLogs({
      ...params,
      table_name: tableName,
      sort_by: 'timestamp',
      sort_order: 'desc'
    });
  }

  /**
   * Export activity logs
   */
  async exportActivityLogs(exportParams: ActivityLogExportParams): Promise<Blob> {
    // Validate export parameters
    const validatedParams = ActivityLogExportParamsSchema.parse(exportParams);
    
    // Build query string for filters
    const searchParams = new URLSearchParams();
    
    // Add format
    searchParams.append('format', validatedParams.format);
    searchParams.append('include_user_details', validatedParams.include_user_details.toString());
    searchParams.append('include_old_values', validatedParams.include_old_values.toString());
    searchParams.append('include_new_values', validatedParams.include_new_values.toString());
    searchParams.append('date_format', validatedParams.date_format);
    
    // Add filters if provided
    if (validatedParams.filters) {
      Object.entries(validatedParams.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(`${key}[]`, item.toString()));
          } else {
            searchParams.append(key, value?.toString() ?? '');
          }
        }
      });
    }

    const response = await this.request(
      `/activity-logs/export?${searchParams.toString()}`,
      z.any(), // No schema validation for Blob response
      {
        method: 'GET',
        responseType: 'blob'
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Get activity logs with user details
   */
  async getActivityLogsWithUsers(params: ActivityLogParams = {}): Promise<PaginatedResponse<ActivityLog>> {
    // This ensures user relationships are included
    const searchParams = new URLSearchParams();
    
    // Add include parameter for user details
    searchParams.append('include', 'user');
    
    // Add other parameters
    const validatedParams = ActivityLogParamsSchema.parse(params);
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(`${key}[]`, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const paginatedSchema = PaginatedResponseSchema(ActivityLogSchema);
    
    return this.request(
      `/activity-logs?${searchParams.toString()}`,
      paginatedSchema,
      { method: 'GET' }
    );
  }

  /**
   * Get top active users
   */
  async getTopActiveUsers(limit = 10, timeRange = 'last_30_days'): Promise<Array<{ user?: any; activity_count: number }>> {
    const responseSchema = ApiResponseSchema(z.array(z.object({
      user: z.any(),
      activity_count: z.number()
    })));
    
    const response = await this.request(
      `/activity-logs/top-users?limit=${limit}&time_range=${timeRange}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data || [];
  }

  /**
   * Get most affected tables/models
   */
  async getMostAffectedTables(limit = 10, timeRange = 'last_30_days'): Promise<Array<{ table_name: string; activity_count: number }>> {
    const responseSchema = ApiResponseSchema(z.array(z.object({
      table_name: z.string(),
      activity_count: z.number()
    })));
    
    const response = await this.request(
      `/activity-logs/top-tables?limit=${limit}&time_range=${timeRange}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data || [];
  }

  /**
   * Clear old activity logs (admin only)
   */
  async clearOldLogs(olderThanDays: number): Promise<{ deleted_count: number }> {
    if (!olderThanDays || olderThanDays < 1) {
      throw new Error('Days must be a positive number');
    }

    const responseSchema = ApiResponseSchema(z.object({
      deleted_count: z.number()
    }));
    
    const response = await this.request(
      `/activity-logs/cleanup`,
      responseSchema,
      {
        method: 'DELETE',
        data: { older_than_days: olderThanDays }
      }
    );

    return response.data || { deleted_count: 0 };
  }
}

// Create singleton instance
export const activityLogsService = new ActivityLogsService();