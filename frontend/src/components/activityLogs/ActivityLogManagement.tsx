// ============================================================================
// pages/activity-logs/ActivityLogManagement.tsx - Main component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  useActivityLogs,
  useActivityStatistics,
  useExportActivityLogs,
  useClearOldActivityLogs
} from '@/services/activityLogs/useActivityLogs';
import { useNotifications } from '../_global/NotificationSystem';
import { type ActivityLog, type ActivityLogParams } from '@/services/activityLogs/activity-logs.types';
import { useDebounce } from '@/hooks/useDebounce';
import Breadcrumb from '../_global/Breadcrumb';
import { ActivityLogStatistics } from './_components/ActivityLogStatistics';
import { ActivityLogFilters } from './_components/ActivityLogFilters';
import { ActivityLogTable } from './_components/ActivityLogTable';
import { ActivityLogPagination } from './_components/ActivityLogPagination';
import { ActivityLogActions } from './_components/ActivityLogActions';

const ActivityLogManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Notifications
  const { showNotification } = useNotifications();
  
  // Local state
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Omit<ActivityLogParams, 'page' | 'per_page' | 'search'>>({});
  
  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Query parameters
  const queryParams: ActivityLogParams = {
    page: currentPage,
    per_page: 20,
    search: debouncedSearchTerm,
    sort_by: 'timestamp',
    sort_order: 'desc',
    ...filters,
  };
  
  // Queries and mutations
  const {
    data: activityLogsData,
    isLoading,
    error,
    refetch
  } = useActivityLogs(queryParams);

  const {
    data: statisticsData,
    isLoading: isLoadingStats
  } = useActivityStatistics();
  
  const exportMutation = useExportActivityLogs();
  const clearLogsMutation = useClearOldActivityLogs();
  
  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Reset to first page when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters]);
  
  // Handlers
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleFiltersChange = (newFilters: Omit<ActivityLogParams, 'page' | 'per_page' | 'search'>) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleView = (log: ActivityLog) => {
    navigate(`/activity-logs/view/${log.id}`);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      await exportMutation.mutateAsync({
        format,
        filters: { ...filters, search: debouncedSearchTerm },
        include_user_details: true,
        include_old_values: false,
        include_new_values: false,
        date_format: 'human_readable'
      });
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleClearOldLogs = async (days: number) => {
    if (window.confirm(t('activityLogs.messages.clearConfirm', { days }))) {
      try {
        const result = await clearLogsMutation.mutateAsync(days);
        showNotification({
          type: 'success',
          title: t('activityLogs.messages.clearSuccess'),
          message: t('activityLogs.messages.clearSuccessMessage', { count: result.deleted_count }),
          duration: 5000,
          persistent: false
        });
        refetch(); // Refresh the data
      } catch (error) {
        console.error('Clear logs error:', error);
      }
    }
  };

  const handleRefresh = () => {
    refetch();
  };
  
  // Prepare data
  const activityLogs = activityLogsData?.data || [];
  const pagination = activityLogsData ? {
    current_page: activityLogsData.current_page,
    last_page: activityLogsData.last_page,
    per_page: activityLogsData.per_page,
    total: activityLogsData.total,
  } : {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Breadcrumbs */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Page Header */}
      <div className={`mb-2 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-darktext pl-0">
              {t('activityLogs.title')}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {t('activityLogs.subtitle')}
            </p>
          </div>
          
          {/* Quick Actions */}
          <ActivityLogActions
            onExport={handleExport}
            onClearOldLogs={handleClearOldLogs}
            onRefresh={handleRefresh}
            isExporting={exportMutation.isPending}
            isClearing={clearLogsMutation.isPending}
            isRefreshing={isLoading}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '200ms' }}>
          <p className="text-red-800 text-sm">{t('activityLogs.messages.loadError')}</p>
        </div>
      )}

      {/* Statistics Overview */}
      <ActivityLogStatistics 
        data={statisticsData} 
        isLoading={isLoadingStats} 
        isLoaded={isLoaded} 
      />

      {/* Activity Logs Section */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '850ms' }}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-darktext border-l-4 border-smblue-400 pl-4">
              {t('activityLogs.table.title')}
            </h3>
            
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                {t('activityLogs.filters.clearAll')}
              </button>
            )}
          </div>

          {/* Filters and Search */}
          <ActivityLogFilters
            searchTerm={searchTerm}
            filters={filters}
            onSearchChange={handleSearchChange}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>
        
        {/* Table */}
        <ActivityLogTable
          activityLogs={activityLogs}
          isLoading={isLoading}
          searchTerm={debouncedSearchTerm}
          onView={handleView}
        />
        
        {/* Pagination */}
        {activityLogs.length > 0 && (
          <ActivityLogPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}
      </section>
    </main>
  );
};

export default ActivityLogManagement;