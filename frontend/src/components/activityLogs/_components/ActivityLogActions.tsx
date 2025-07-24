// ============================================================================
// components/activity-logs/ActivityLogActions.tsx
// ============================================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Download, 
  Trash2, 
  RefreshCw, 
  FileText, 
  FileSpreadsheet, 
  File,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';

interface ActivityLogActionsProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  onClearOldLogs: (days: number) => void;
  onRefresh: () => void;
  isExporting: boolean;
  isClearing: boolean;
  isRefreshing: boolean;
}

export const ActivityLogActions: React.FC<ActivityLogActionsProps> = ({
  onExport,
  onClearOldLogs,
  onRefresh,
  isExporting,
  isClearing,
  isRefreshing
}) => {
  const { t } = useTranslation();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showClearMenu, setShowClearMenu] = useState(false);

  const exportOptions = [
    { format: 'csv' as const, label: t('activityLogs.export.csv'), icon: FileText },
    { format: 'excel' as const, label: t('activityLogs.export.excel'), icon: FileSpreadsheet },
    { format: 'pdf' as const, label: t('activityLogs.export.pdf'), icon: File }
  ];

  const clearOptions = [
    { days: 30, label: t('activityLogs.clear.30days') },
    { days: 90, label: t('activityLogs.clear.90days') },
    { days: 180, label: t('activityLogs.clear.180days') },
    { days: 365, label: t('activityLogs.clear.1year') }
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    onExport(format);
    setShowExportMenu(false);
  };

  const handleClearLogs = (days: number) => {
    onClearOldLogs(days);
    setShowClearMenu(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-smblue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        title={t('activityLogs.actions.refresh')}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {t('activityLogs.actions.refresh')}
      </button>

      {/* Export Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={isExporting}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-smblue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? t('activityLogs.actions.exporting') : t('activityLogs.actions.export')}
          <ChevronDown className="h-4 w-4 ml-1" />
        </button>

        {showExportMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu">
              {exportOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                    role="menuitem"
                  >
                    <IconComponent className="h-4 w-4 mr-3 text-gray-400" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Click outside to close export menu */}
        {showExportMenu && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setShowExportMenu(false)}
          />
        )}
      </div>

      {/* Clear Old Logs Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowClearMenu(!showClearMenu)}
          disabled={isClearing}
          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isClearing ? t('activityLogs.actions.clearing') : t('activityLogs.actions.clearOld')}
          <ChevronDown className="h-4 w-4 ml-1" />
        </button>

        {showClearMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu">
              <div className="px-4 py-2 text-xs text-gray-500 bg-yellow-50 border-b">
                <div className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-yellow-600" />
                  {t('activityLogs.actions.clearWarning')}
                </div>
              </div>
              {clearOptions.map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleClearLogs(option.days)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 transition-colors duration-150"
                  role="menuitem"
                >
                  <span>{option.label}</span>
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Click outside to close clear menu */}
        {showClearMenu && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setShowClearMenu(false)}
          />
        )}
      </div>
    </div>
  );
};