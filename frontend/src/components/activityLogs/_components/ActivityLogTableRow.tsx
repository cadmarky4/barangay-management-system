// ============================================================================
// components/activity-logs/ActivityLogTableRow.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, User, Globe, Monitor } from 'lucide-react';
import { type ActivityLog, getActionTypeVariant, getActionDescription } from '@/services/activityLogs/activity-logs.types';

interface ActivityLogTableRowProps {
  log: ActivityLog;
  onView: (log: ActivityLog) => void;
}

interface ActionBadgeProps {
  actionType: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
}

const ActionBadge: React.FC<ActionBadgeProps> = ({ actionType, variant }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantStyles = {
    default: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800",
    secondary: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]}`}>
      {actionType.replace('_', ' ').toUpperCase()}
    </span>
  );
};

export const ActivityLogTableRow: React.FC<ActivityLogTableRowProps> = ({
  log,
  onView
}) => {
  const { t } = useTranslation();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return t('activityLogs.time.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('activityLogs.time.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('activityLogs.time.hoursAgo', { count: hours });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getUserAgent = (userAgent: string) => {
    // Simple user agent parsing for display
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'Other';
  };

  const getDeviceType = (userAgent: string) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    
    return 'Desktop';
  };

  const actionVariant = getActionTypeVariant(log.action_type);

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {/* Timestamp */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatTimestamp(log.timestamp)}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(log.timestamp).toLocaleDateString()}
        </div>
      </td>

      {/* User */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {log.user?.name || t('activityLogs.table.unknownUser')}
            </div>
            <div className="text-xs text-gray-500">
              {log.user?.email || t('activityLogs.table.noEmail')}
            </div>
          </div>
        </div>
      </td>

      {/* Action */}
      <td className="px-6 py-4 whitespace-nowrap">
        <ActionBadge 
          actionType={log.action_type} 
          variant={actionVariant}
        />
      </td>

      {/* Target */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {log.table_name.replace('_', ' ').toUpperCase()}
        </div>
        <div className="text-xs text-gray-500">
          ID: {log.record_id}
        </div>
      </td>

      {/* Description */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate" title={log.description}>
          {log.description}
        </div>
      </td>

      {/* IP Address & Browser */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Globe className="h-4 w-4 mr-1 text-gray-400" />
          {log.ip_address}
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Monitor className="h-3 w-3 mr-1" />
          {getUserAgent(log.user_agent)} • {getDeviceType(log.user_agent)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button
          onClick={() => onView(log)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-smblue-500 transition-colors duration-150"
          title={t('activityLogs.table.actions.view')}
        >
          <Eye className="h-3 w-3 mr-1" />
          {t('activityLogs.table.actions.view')}
        </button>
      </td>
    </tr>
  );
};