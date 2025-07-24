// ============================================================================
// types/activity-logs.ts - Activity Log Zod schemas and type definitions
// ============================================================================

import { z } from 'zod';

// Enum schemas
export const ActionTypeSchema = z.enum([
  'created',
  'updated',
  'deleted',
  'viewed',
  'exported',
  'imported',
  'restored',
  'archived',
  'login',
  'logout',
  'password_changed',
  'profile_updated',
  'settings_changed',
  'bulk_update',
  'bulk_delete',
  'file_upload',
  'file_download',
  'report_generated',
  'backup_created',
  'system_maintenance'
]);

// User schema for activity log relationships
export const ActivityLogUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.string().optional(),
});

// Main Activity Log schema
export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action_type: ActionTypeSchema,
  table_name: z.string(),
  record_id: z.number().int().positive(),
  old_values: z.record(z.any()).nullable(),
  new_values: z.record(z.any()).nullable(),
  ip_address: z.string().ip(),
  user_agent: z.string(),
  timestamp: z.string().datetime(),
  description: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  
  // Relationships
  user: ActivityLogUserSchema.optional(),
});

// Activity Log parameters for filtering and pagination
export const ActivityLogParamsSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  
  // Action filters
  action_type: ActionTypeSchema.optional(),
  action_types: z.array(ActionTypeSchema).optional(), // For multiple action types
  
  // User filters
  user_id: z.string().uuid().optional(),
  user_name: z.string().optional(),
  
  // Table/Model filters
  table_name: z.string().optional(),
  table_names: z.array(z.string()).optional(), // For multiple tables
  record_id: z.number().int().positive().optional(),
  
  // Date range filters
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  
  // Time range presets
  time_range: z.enum([
    'today',
    'yesterday', 
    'last_7_days',
    'last_30_days',
    'last_3_months',
    'last_6_months',
    'last_year',
    'custom'
  ]).optional(),

  include_users: z.boolean().optional(),
  
  // IP and browser filters
  ip_address: z.string().ip().optional(),
  user_agent_contains: z.string().optional(),
  
  // Sorting
  sort_by: z.enum(['timestamp', 'action_type', 'user_name', 'table_name']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

// Activity statistics schema
export const ActivityStatisticsSchema = z.object({
  total_activities: z.number(),
  today_activities: z.number(),
  this_week_activities: z.number(),
  this_month_activities: z.number(),
  
  // By action type
  by_action_type: z.record(z.number()),
  
  // By table/model
  by_table: z.record(z.number()),
  
  // By user (top 10)
  by_user: z.record(z.number()),
  
  // By hour (24 hours)
  by_hour: z.record(z.number()),
  
  // By day (last 30 days)
  by_day: z.record(z.number()),
  
  // Peak activity times
  peak_hour: z.string(),
  peak_day: z.string(),
});

// Activity summary for dashboard/overview
export const ActivitySummarySchema = z.object({
  recent_activities: z.array(ActivityLogSchema).max(10),
  total_today: z.number(),
  most_active_user: z.object({
    user_name: z.string(),
    activity_count: z.number(),
  }).optional(),
  most_affected_table: z.object({
    table_name: z.string(),
    activity_count: z.number(),
  }).optional(),
  last_login: z.string().datetime().optional(),
});

// Export options for activity logs
export const ActivityLogExportParamsSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']),
  filters: ActivityLogParamsSchema.omit({ page: true, per_page: true }).optional(),
  include_user_details: z.boolean().default(true),
  include_old_values: z.boolean().default(false),
  include_new_values: z.boolean().default(false),
  date_format: z.enum(['iso', 'human_readable']).default('human_readable'),
});

// Detailed activity log for single record view
export const ActivityLogDetailSchema = ActivityLogSchema.extend({
  // Additional computed fields for detail view
  changes_summary: z.array(z.object({
    field: z.string(),
    old_value: z.any(),
    new_value: z.any(),
    field_label: z.string().optional(),
  })).optional(),
  
  related_activities: z.array(ActivityLogSchema).optional(),
  
  // Browser and device info parsed from user_agent
  browser_info: z.object({
    browser: z.string(),
    version: z.string(),
    os: z.string(),
    device: z.string(),
  }).optional(),
  
  // Geographic info if available
  location_info: z.object({
    country: z.string(),
    city: z.string(),
    region: z.string(),
  }).optional(),
});

// Type exports
export type ActionType = z.infer<typeof ActionTypeSchema>;
export type ActivityLogUser = z.infer<typeof ActivityLogUserSchema>;
export type ActivityLog = z.infer<typeof ActivityLogSchema>;
export type ActivityLogParams = z.infer<typeof ActivityLogParamsSchema>;
export type ActivityStatistics = z.infer<typeof ActivityStatisticsSchema>;
export type ActivitySummary = z.infer<typeof ActivitySummarySchema>;
export type ActivityLogExportParams = z.infer<typeof ActivityLogExportParamsSchema>;
export type ActivityLogDetail = z.infer<typeof ActivityLogDetailSchema>;

// Helper function to get human-readable action descriptions
export const getActionDescription = (actionType: ActionType, tableName: string): string => {
  const tableDisplayName = tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  switch (actionType) {
    case 'created':
      return `Created new ${tableDisplayName.toLowerCase()} record`;
    case 'updated':
      return `Updated ${tableDisplayName.toLowerCase()} information`;
    case 'deleted':
      return `Deleted ${tableDisplayName.toLowerCase()} record`;
    case 'viewed':
      return `Viewed ${tableDisplayName.toLowerCase()} details`;
    case 'exported':
      return `Exported ${tableDisplayName.toLowerCase()} data`;
    case 'imported':
      return `Imported ${tableDisplayName.toLowerCase()} data`;
    case 'restored':
      return `Restored ${tableDisplayName.toLowerCase()} record`;
    case 'archived':
      return `Archived ${tableDisplayName.toLowerCase()} record`;
    case 'login':
      return 'User logged in';
    case 'logout':
      return 'User logged out';
    case 'password_changed':
      return 'Changed password';
    case 'profile_updated':
      return 'Updated profile information';
    case 'settings_changed':
      return 'Modified system settings';
    case 'bulk_update':
      return `Bulk updated ${tableDisplayName.toLowerCase()} records`;
    case 'bulk_delete':
      return `Bulk deleted ${tableDisplayName.toLowerCase()} records`;
    case 'file_upload':
      return 'Uploaded file';
    case 'file_download':
      return 'Downloaded file';
    case 'report_generated':
      return 'Generated report';
    case 'backup_created':
      return 'Created system backup';
    case 'system_maintenance':
      return 'Performed system maintenance';
    default:
      return `Performed ${actionType} action on ${tableDisplayName.toLowerCase()}`;
  }
};

// Helper function to get action type color/badge variant
export const getActionTypeVariant = (actionType: ActionType): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (actionType) {
    case 'created':
    case 'imported':
    case 'restored':
    case 'login':
      return 'success';
    case 'updated':
    case 'profile_updated':
    case 'settings_changed':
    case 'bulk_update':
      return 'default';
    case 'deleted':
    case 'bulk_delete':
    case 'logout':
      return 'destructive';
    case 'viewed':
    case 'exported':
    case 'file_download':
    case 'report_generated':
      return 'secondary';
    case 'archived':
    case 'password_changed':
    case 'file_upload':
    case 'backup_created':
    case 'system_maintenance':
      return 'warning';
    default:
      return 'default';
  }
};