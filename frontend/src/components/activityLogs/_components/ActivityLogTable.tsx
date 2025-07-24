// ============================================================================
// components/activity-logs/ActivityLogTable.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ActivityLog } from '@/services/activityLogs/activity-logs.types';
import { ActivityLogTableRow } from './ActivityLogTableRow';

interface ActivityLogTableProps {
  activityLogs: ActivityLog[];
  isLoading: boolean;
  searchTerm: string;
  onView: (log: ActivityLog) => void;
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  activityLogs,
  isLoading,
  searchTerm,
  onView
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400"></div>
        <span className="ml-2 text-gray-600">{t('activityLogs.messages.loading')}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('activityLogs.table.headers.timestamp')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('activityLogs.table.headers.user')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('activityLogs.table.headers.action')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('activityLogs.table.headers.target')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('activityLogs.table.headers.description')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('activityLogs.table.headers.ipAddress')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('activityLogs.table.headers.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activityLogs.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                {searchTerm
                  ? t('activityLogs.table.noResultsSearch', { searchTerm })
                  : t('activityLogs.table.noResults')}
              </td>
            </tr>
          ) : (
            activityLogs.map((log) => (
              <ActivityLogTableRow
                key={log.id}
                log={log}
                onView={onView}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};