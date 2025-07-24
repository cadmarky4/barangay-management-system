// ============================================================================
// hooks/activity-logs/use-activity-logs.ts - TanStack Query hooks for Activity Logs
// ============================================================================

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  useInfiniteQuery 
} from '@tanstack/react-query';

import { useNotifications } from '@/components/_global/NotificationSystem';
import type { 
  ActivityLog, 
  ActivityLogParams, 
  ActivityLogDetail,
  ActivityStatistics,
  ActivitySummary,
  ActivityLogExportParams
} from './activity-logs.types';
import { activityLogsService } from '@/services/activityLogs/activity-logs.service';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

// Query keys
export const activityLogsKeys = {
  all: ['activity-logs'] as const,
  lists: () => [...activityLogsKeys.all, 'list'] as const,
  list: (params: ActivityLogParams) => [...activityLogsKeys.lists(), params] as const,
  details: () => [...activityLogsKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityLogsKeys.details(), id] as const,
  statistics: () => [...activityLogsKeys.all, 'statistics'] as const,
  summary: () => [...activityLogsKeys.all, 'summary'] as const,
  search: (term: string) => [...activityLogsKeys.all, 'search', term] as const,
  recent: () => [...activityLogsKeys.all, 'recent'] as const,
  byUser: (userId: string) => [...activityLogsKeys.all, 'user', userId] as const,
  byTable: (tableName: string) => [...activityLogsKeys.all, 'table', tableName] as const,
  byRecord: (tableName: string, recordId: number) => [...activityLogsKeys.all, 'record', tableName, recordId] as const,
  byAction: (actionType: string) => [...activityLogsKeys.all, 'action', actionType] as const,
  dateRange: (from: string, to: string) => [...activityLogsKeys.all, 'dateRange', from, to] as const,
  topUsers: (timeRange: string) => [...activityLogsKeys.all, 'topUsers', timeRange] as const,
  topTables: (timeRange: string) => [...activityLogsKeys.all, 'topTables', timeRange] as const,
};

// Queries
export function useActivityLogs(params: ActivityLogParams = {}) {
  return useQuery({
    queryKey: activityLogsKeys.list(params),
    queryFn: () => activityLogsService.getActivityLogs(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (activity logs change frequently)
  });
}

export function useActivityLog(id: string, enabled = true) {
  return useQuery({
    queryKey: activityLogsKeys.detail(id),
    queryFn: () => activityLogsService.getActivityLog(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useActivityStatistics() {
  return useQuery({
    queryKey: activityLogsKeys.statistics(),
    queryFn: () => activityLogsService.getActivityStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

export function useActivitySummary() {
  return useQuery({
    queryKey: activityLogsKeys.summary(),
    queryFn: () => activityLogsService.getActivitySummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
}

export function useActivityLogSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: activityLogsKeys.search(searchTerm),
    queryFn: () => activityLogsService.searchActivityLogs(searchTerm),
    enabled: enabled && searchTerm.trim().length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useRecentActivities(limit = 20) {
  return useQuery({
    queryKey: activityLogsKeys.recent(),
    queryFn: () => activityLogsService.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
}

export function useActivityLogsForUser(userId: string, params: Omit<ActivityLogParams, 'user_id'> = {}, enabled = true) {
  return useQuery({
    queryKey: activityLogsKeys.byUser(userId),
    queryFn: () => activityLogsService.getActivityLogsForUser(userId, params),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useActivityLogsForTable(tableName: string, params: Omit<ActivityLogParams, 'table_name'> = {}, enabled = true) {
  return useQuery({
    queryKey: activityLogsKeys.byTable(tableName),
    queryFn: () => activityLogsService.getActivitiesByTable(tableName, params),
    enabled: enabled && !!tableName,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useActivityLogsForRecord(tableName: string, recordId: number, enabled = true) {
  return useQuery({
    queryKey: activityLogsKeys.byRecord(tableName, recordId),
    queryFn: () => activityLogsService.getActivityLogsForRecord(tableName, recordId),
    enabled: enabled && !!tableName && !!recordId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useActivityLogsByAction(actionType: string, params: Omit<ActivityLogParams, 'action_type'> = {}, enabled = true) {
  return useQuery({
    queryKey: activityLogsKeys.byAction(actionType),
    queryFn: () => activityLogsService.getActivitiesByAction(actionType, params),
    enabled: enabled && !!actionType,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useActivityLogsByDateRange(
  dateFrom: string, 
  dateTo: string, 
  params: Omit<ActivityLogParams, 'date_from' | 'date_to'> = {},
  enabled = true
) {
  return useQuery({
    queryKey: activityLogsKeys.dateRange(dateFrom, dateTo),
    queryFn: () => activityLogsService.getActivitiesByDateRange(dateFrom, dateTo, params),
    enabled: enabled && !!dateFrom && !!dateTo,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTopActiveUsers(limit = 10, timeRange = 'last_30_days') {
  return useQuery({
    queryKey: activityLogsKeys.topUsers(timeRange),
    queryFn: () => activityLogsService.getTopActiveUsers(limit, timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMostAffectedTables(limit = 10, timeRange = 'last_30_days') {
  return useQuery({
    queryKey: activityLogsKeys.topTables(timeRange),
    queryFn: () => activityLogsService.getMostAffectedTables(limit, timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useActivityLogsWithUsers(params: ActivityLogParams = {}) {
  return useQuery({
    queryKey: activityLogsKeys.list({ ...params, include_users: true }),
    queryFn: () => activityLogsService.getActivityLogsWithUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Infinite query for large datasets (useful for continuous scrolling)
export function useInfiniteActivityLogs(params: Omit<ActivityLogParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['activity-logs', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      activityLogsService.getActivityLogs({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutations
export function useExportActivityLogs() {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (params: ActivityLogExportParams) => 
      activityLogsService.exportActivityLogs(params),
    onSuccess: (blob: Blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on format and current date
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `activity-logs-${timestamp}.${variables.format}`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: t('activityLogs.export.successTitle'),
        message: t('activityLogs.export.successMessage'),
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: t('activityLogs.export.errorTitle'),
        message: t('activityLogs.export.errorMessage'),
      });
      console.error('Export Activity Logs Error:', error);
    },
  });
}

export function useClearOldActivityLogs() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (olderThanDays: number) => 
      activityLogsService.clearOldLogs(olderThanDays),
    onSuccess: (result: { deleted_count: number }) => {
      // Invalidate all activity logs queries
      queryClient.invalidateQueries({ queryKey: activityLogsKeys.all });
      
      showNotification({
        type: 'success',
        title: t('activityLogs.cleanup.successTitle'),
        message: t('activityLogs.cleanup.successMessage', { count: result.deleted_count }),
      });
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: t('activityLogs.cleanup.errorTitle'),
        message: t('activityLogs.cleanup.errorMessage'),
      });
      console.error('Clear Activity Logs Error:', error);
    },
  });
}

// Custom hook for real-time activity monitoring
export function useActivityMonitor(interval = 30000) { // 30 seconds default
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['activity-monitor'],
    queryFn: () => activityLogsService.getRecentActivities(10),
    refetchInterval: interval,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (queryResult.isSuccess) {
      // Invalidate related queries when new activities are detected
      queryClient.invalidateQueries({ queryKey: activityLogsKeys.summary() });
      queryClient.invalidateQueries({ queryKey: activityLogsKeys.statistics() });
    }
  }, [queryResult.data, queryResult.isSuccess, queryClient]);

  return queryResult;
}

// Custom hook for activity filtering with debouncing
export function useActivityLogFilters() {
  const [filters, setFilters] = useState<ActivityLogParams>({});
  const [debouncedFilters, setDebouncedFilters] = useState<ActivityLogParams>({});

  // Debounce filters to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  return {
    filters,
    debouncedFilters,
    setFilters,
    clearFilters: () => setFilters({}),
  };
}