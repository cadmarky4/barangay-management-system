// ============================================================================
// components/activity-logs/ActivityLogFilters.tsx
// ============================================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Calendar, User, Database, Activity, X } from 'lucide-react';
import { type ActivityLogParams, type ActionType } from '@/services/activityLogs/activity-logs.types';

interface ActivityLogFiltersProps {
  searchTerm: string;
  filters: Omit<ActivityLogParams, 'page' | 'per_page' | 'search'>;
  onSearchChange: (term: string) => void;
  onFiltersChange: (filters: Omit<ActivityLogParams, 'page' | 'per_page' | 'search'>) => void;
  isLoading: boolean;
}

export const ActivityLogFilters: React.FC<ActivityLogFiltersProps> = ({
  searchTerm,
  filters,
  onSearchChange,
  onFiltersChange,
  isLoading
}) => {
  const { t } = useTranslation();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Action type options
  const actionTypeOptions: ActionType[] = [
    'created', 'updated', 'deleted', 'viewed', 'exported', 'imported',
    'login', 'logout', 'password_changed', 'profile_updated'
  ];

  // Time range options
  const timeRangeOptions = [
    { value: 'today', label: t('activityLogs.filters.timeRange.today') },
    { value: 'yesterday', label: t('activityLogs.filters.timeRange.yesterday') },
    { value: 'last_7_days', label: t('activityLogs.filters.timeRange.last7Days') },
    { value: 'last_30_days', label: t('activityLogs.filters.timeRange.last30Days') },
    { value: 'last_3_months', label: t('activityLogs.filters.timeRange.last3Months') },
    { value: 'last_6_months', label: t('activityLogs.filters.timeRange.last6Months') },
    { value: 'last_year', label: t('activityLogs.filters.timeRange.lastYear') },
    { value: 'custom', label: t('activityLogs.filters.timeRange.custom') }
  ];

  // Common table names (you might want to fetch these dynamically)
  const tableOptions = [
    'residents', 'households', 'users', 'settings', 'documents', 'reports'
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key as keyof typeof newFilters];
    } else {
      (newFilters as any)[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const handleMultipleActionTypesChange = (actionTypes: ActionType[]) => {
    handleFilterChange('action_types', actionTypes.length > 0 ? actionTypes : undefined);
  };

  const handleMultipleTablesChange = (tables: string[]) => {
    handleFilterChange('table_names', tables.length > 0 ? tables : undefined);
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('activityLogs.filters.searchPlaceholder')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-smblue-500 focus:border-smblue-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-smblue-500 ${
              showAdvancedFilters ? 'bg-gray-50' : ''
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('activityLogs.filters.advancedFilters')}
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-smblue-500 rounded-full"></span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              title={t('activityLogs.filters.clearAll')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                {t('activityLogs.filters.timeRange.label')}
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                value={filters.time_range || ''}
                onChange={(e) => handleFilterChange('time_range', e.target.value)}
              >
                <option value="">{t('activityLogs.filters.timeRange.all')}</option>
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Activity className="h-4 w-4 inline mr-1" />
                {t('activityLogs.filters.actionType.label')}
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                value={filters.action_type || ''}
                onChange={(e) => handleFilterChange('action_type', e.target.value)}
              >
                <option value="">{t('activityLogs.filters.actionType.all')}</option>
                {actionTypeOptions.map((action) => (
                  <option key={action} value={action}>
                    {t(`activityLogs.actions.${action}`, action.replace('_', ' '))}
                  </option>
                ))}
              </select>
            </div>

            {/* Table Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Database className="h-4 w-4 inline mr-1" />
                {t('activityLogs.filters.table.label')}
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                value={filters.table_name || ''}
                onChange={(e) => handleFilterChange('table_name', e.target.value)}
              >
                <option value="">{t('activityLogs.filters.table.all')}</option>
                {tableOptions.map((table) => (
                  <option key={table} value={table}>
                    {t(`activityLogs.tables.${table}`, table.replace('_', ' '))}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                {t('activityLogs.filters.user.label')}
              </label>
              <input
                type="text"
                placeholder={t('activityLogs.filters.user.placeholder')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                value={filters.user_name || ''}
                onChange={(e) => handleFilterChange('user_name', e.target.value)}
              />
            </div>

            {/* IP Address Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('activityLogs.filters.ipAddress.label')}
              </label>
              <input
                type="text"
                placeholder={t('activityLogs.filters.ipAddress.placeholder')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                value={filters.ip_address || ''}
                onChange={(e) => handleFilterChange('ip_address', e.target.value)}
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('activityLogs.filters.sortBy.label')}
              </label>
              <div className="flex gap-2">
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                  value={filters.sort_by || 'timestamp'}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                >
                  <option value="timestamp">{t('activityLogs.filters.sortBy.timestamp')}</option>
                  <option value="action_type">{t('activityLogs.filters.sortBy.actionType')}</option>
                  <option value="user_name">{t('activityLogs.filters.sortBy.userName')}</option>
                  <option value="table_name">{t('activityLogs.filters.sortBy.tableName')}</option>
                </select>
                <select
                  className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                  value={filters.sort_order || 'desc'}
                  onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                >
                  <option value="desc">{t('activityLogs.filters.sortOrder.desc')}</option>
                  <option value="asc">{t('activityLogs.filters.sortOrder.asc')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Date Range (only show if custom is selected) */}
          {filters.time_range === 'custom' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('activityLogs.filters.dateFrom.label')}
                  </label>
                  <input
                    type="datetime-local"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                    value={filters.date_from ? filters.date_from.slice(0, 16) : ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('activityLogs.filters.dateTo.label')}
                  </label>
                  <input
                    type="datetime-local"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-smblue-500 focus:border-smblue-500 text-sm"
                    value={filters.date_to ? filters.date_to.slice(0, 16) : ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
              <button
                type="button"
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                onClick={() => onSearchChange('')}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {t(`activityLogs.filters.${key}.label`, key)}: {String(value)}
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                  onClick={() => handleFilterChange(key, '')}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};