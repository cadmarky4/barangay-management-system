import React, { useState } from 'react';
import { FiX, FiDownload, FiFileText, FiFile, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { exportService } from '../../services/reports/export.service';
import type {
  StatisticsOverview,
  AgeGroupDistribution,
  SpecialPopulationRegistry,
  MonthlyRevenue,
  PopulationDistributionByStreet,
  DocumentTypesIssued,
  MostRequestedService,
  ReportsFilters,
} from '../../services/reports/reports.types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    statisticsOverview: StatisticsOverview;
    ageGroupDistribution: AgeGroupDistribution[];
    specialPopulationRegistry: SpecialPopulationRegistry[];
    monthlyRevenue: MonthlyRevenue[];
    populationDistributionByStreet: PopulationDistributionByStreet[];
    documentTypesIssued: DocumentTypesIssued[];
    mostRequestedServices: MostRequestedService[];
    filters: ReportsFilters;
  };
}

type ExportFormat = 'excel' | 'word';

interface ExportStatus {
  status: 'idle' | 'exporting' | 'success' | 'error';
  message: string;
  format?: ExportFormat;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data }) => {
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    status: 'idle',
    message: ''
  });

  const handleExport = async (format: ExportFormat) => {
    try {
      setExportStatus({
        status: 'exporting',
        message: `Preparing ${format === 'excel' ? 'Excel' : 'Word'} document...`,
        format
      });

      if (format === 'excel') {
        await exportService.exportToExcel(data);
      } else {
        await exportService.exportToWord(data);
      }

      setExportStatus({
        status: 'success',
        message: `${format === 'excel' ? 'Excel' : 'Word'} document exported successfully!`,
        format
      });

      // Auto-close after successful export
      setTimeout(() => {
        onClose();
        setExportStatus({ status: 'idle', message: '' });
      }, 2000);

    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Export failed. Please try again.',
        format
      });
    }
  };

  const resetStatus = () => {
    setExportStatus({ status: 'idle', message: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Export Reports</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Messages */}
          {exportStatus.status !== 'idle' && (
            <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
              exportStatus.status === 'success' ? 'bg-green-50 text-green-800' :
              exportStatus.status === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {exportStatus.status === 'exporting' && <FiLoader className="w-5 h-5 animate-spin" />}
              {exportStatus.status === 'success' && <FiCheckCircle className="w-5 h-5" />}
              {exportStatus.status === 'error' && <FiAlertCircle className="w-5 h-5" />}
              <span className="text-sm">{exportStatus.message}</span>
            </div>
          )}

          {/* Report Summary */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Report Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Year:</span> {data.filters.year || 'All'}
                </div>
                <div>
                  <span className="font-medium">Quarter:</span> {data.filters.quarter || 'All'}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Street:</span> {data.filters.street || 'All'}
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Choose Export Format</h3>
            
            {/* Excel Export */}
            <button
              onClick={() => handleExport('excel')}
              disabled={exportStatus.status === 'exporting'}
              className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
                exportStatus.status === 'exporting' && exportStatus.format === 'excel'
                  ? 'bg-blue-50 border-blue-200'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiFile className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Excel Spreadsheet</div>
                  <div className="text-sm text-gray-500">
                    Multiple sheets with charts and calculations
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {exportStatus.status === 'exporting' && exportStatus.format === 'excel' && (
                  <FiLoader className="w-4 h-4 animate-spin text-blue-600" />
                )}
                <FiDownload className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Word Export */}
            <button
              onClick={() => handleExport('word')}
              disabled={exportStatus.status === 'exporting'}
              className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
                exportStatus.status === 'exporting' && exportStatus.format === 'word'
                  ? 'bg-blue-50 border-blue-200'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Word Document</div>
                  <div className="text-sm text-gray-500">
                    Professional report with formatted tables
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {exportStatus.status === 'exporting' && exportStatus.format === 'word' && (
                  <FiLoader className="w-4 h-4 animate-spin text-blue-600" />
                )}
                <FiDownload className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>

          {/* Export Details */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">What's Included</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Statistics Overview</li>
              <li>• Age Group Distribution</li>
              <li>• Special Population Registry</li>
              <li>• Monthly Revenue Collection</li>
              <li>• Population Distribution by Purok/Sitio</li>
              <li>• Document Types Issued</li>
              <li>• Most Requested Services</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          {exportStatus.status === 'error' && (
            <button
              onClick={resetStatus}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={onClose}
            disabled={exportStatus.status === 'exporting'}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;