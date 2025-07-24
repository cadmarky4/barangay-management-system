// ============================================================================
// components/activity-logs/ActivityLogStatistics.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ActivityStatistics } from '@/services/activityLogs/activity-logs.types';
import { 
  Activity, 
  Users, 
  Calendar, 
  TrendingUp,
  Database,
  Clock,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface ActivityLogStatisticsProps {
  data?: ActivityStatistics;
  isLoading: boolean;
  isLoaded: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: string;
  isLoaded: boolean;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  delay, 
  isLoaded, 
  subtitle,
  trend 
}) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
  }`} style={{ transitionDelay: delay }}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-darktext mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
            {Math.abs(trend.value)}% vs last period
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const ActivityLogStatistics: React.FC<ActivityLogStatisticsProps> = ({ 
  data, 
  isLoading, 
  isLoaded 
}) => {
  const { t } = useTranslation();

  if (isLoading && !data) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`} style={{ transitionDelay: '400ms' }}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Calculate some derived stats
  const totalActivities = data.total_activities || 0;
  const todayActivities = data.today_activities || 0;
  const weekActivities = data.this_week_activities || 0;
  const monthActivities = data.this_month_activities || 0;

  // Get top action types
  const topActions = Object.entries(data.by_action_type || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Get most active tables
  const topTables = Object.entries(data.by_table || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <>
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('activityLogs.stats.totalActivities')}
          value={totalActivities.toLocaleString()}
          icon={<Activity className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          delay="400ms"
          isLoaded={isLoaded}
          subtitle={t('activityLogs.stats.allTime')}
        />

        <StatCard
          title={t('activityLogs.stats.todayActivities')}
          value={todayActivities.toLocaleString()}
          icon={<Calendar className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          delay="500ms"
          isLoaded={isLoaded}
          subtitle={t('activityLogs.stats.last24Hours')}
        />

        <StatCard
          title={t('activityLogs.stats.weekActivities')}
          value={weekActivities.toLocaleString()}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          delay="600ms"
          isLoaded={isLoaded}
          subtitle={t('activityLogs.stats.last7Days')}
        />

        <StatCard
          title={t('activityLogs.stats.monthActivities')}
          value={monthActivities.toLocaleString()}
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          delay="700ms"
          isLoaded={isLoaded}
          subtitle={t('activityLogs.stats.last30Days')}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Peak Activity Info */}
        <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '800ms' }}>
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 mr-3">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-darktext">{t('activityLogs.stats.peakActivity')}</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('activityLogs.stats.peakHour')}</span>
              <span className="text-sm font-medium text-darktext">
                {data.peak_hour || t('activityLogs.stats.noData')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('activityLogs.stats.peakDay')}</span>
              <span className="text-sm font-medium text-darktext">
                {data.peak_day || t('activityLogs.stats.noData')}
              </span>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '900ms' }}>
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 mr-3">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-darktext">{t('activityLogs.stats.topActions')}</h4>
          </div>
          <div className="space-y-2">
            {topActions.length > 0 ? topActions.map(([action, count]) => (
              <div key={action} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {action.replace('_', ' ')}
                </span>
                <span className="text-sm font-medium text-darktext">
                  {count.toLocaleString()}
                </span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">{t('activityLogs.stats.noData')}</p>
            )}
          </div>
        </div>

        {/* Most Affected Tables */}
        <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '1000ms' }}>
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 mr-3">
              <Database className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-darktext">{t('activityLogs.stats.topTables')}</h4>
          </div>
          <div className="space-y-2">
            {topTables.length > 0 ? topTables.map(([table, count]) => (
              <div key={table} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {table.replace('_', ' ')}
                </span>
                <span className="text-sm font-medium text-darktext">
                  {count.toLocaleString()}
                </span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">{t('activityLogs.stats.noData')}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export { ActivityLogStatistics };