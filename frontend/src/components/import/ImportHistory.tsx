// ============================================================================
// components/import/ImportHistory.tsx - Import History Component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaHistory, FaCheckCircle, FaExclamationTriangle, FaTimes, FaUsers, FaHome, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { ImportService } from '../../services/import/import.service';
import type { ImportHistoryItem } from '../../services/import/import.types';

interface ImportHistoryProps {
  className?: string;
}

const ImportHistory: React.FC<ImportHistoryProps> = ({ className = '' }) => {
  const [importService] = useState(new ImportService());
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RESIDENTS' | 'HOUSEHOLDS'>('ALL');
  const perPage = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['import-history', currentPage, typeFilter],
    queryFn: () => importService.getImportHistory({
      page: currentPage,
      per_page: perPage,
      type: typeFilter === 'ALL' ? undefined : typeFilter
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <FaTimes className="w-4 h-4 text-red-500" />;
      case 'PARTIAL':
        return <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FaHistory className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'SUCCESS':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'PARTIAL':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'RESIDENTS' ? 
      <FaUsers className="w-4 h-4 text-smblue-400" /> : 
      <FaHome className="w-4 h-4 text-green-500" />;
  };

  const totalPages = data ? Math.ceil(data.total / perPage) : 0;

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <FaTimes className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Import History</h3>
            <p className="text-sm text-red-600 mt-1">
              {error instanceof Error ? error.message : 'Failed to load import history'}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaHistory className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Import History</h3>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['ALL', 'RESIDENTS', 'HOUSEHOLDS'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setTypeFilter(type);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  typeFilter === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-300"></div>
            <span className="ml-3 text-gray-600">Loading history...</span>
          </div>
        ) : !data?.data.length ? (
          <div className="text-center py-8">
            <FaHistory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No import history found</p>
            <p className="text-sm text-gray-400 mt-1">
              Import some data to see the history here
            </p>
          </div>
        ) : (
          <>
            {/* History List */}
            <div className="space-y-4">
              {data.data.map((item: ImportHistoryItem) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{item.fileName}</h4>
                          <span className={getStatusBadge(item.status)}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            {getTypeIcon(item.type)}
                            {item.type.charAt(0) + item.type.slice(1).toLowerCase()}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            {formatDate(item.createdAt)}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <FaUser className="w-3 h-3" />
                            {item.createdBy}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-green-600">
                            ✓ {item.importedRows} imported
                          </span>
                          <span className="text-gray-500">
                            of {item.totalRows} total
                          </span>
                          {item.totalRows - item.importedRows > 0 && (
                            <span className="text-red-600">
                              ✗ {item.totalRows - item.importedRows} failed
                            </span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.status === 'SUCCESS' ? 'bg-green-500' :
                                item.status === 'FAILED' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}
                              style={{
                                width: `${item.totalRows > 0 ? (item.importedRows / item.totalRows) * 100 : 0}%`
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Errors */}
                        {item.errors && item.errors.length > 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                            <ul className="text-sm text-red-700 space-y-1">
                              {item.errors.slice(0, 3).map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                              {item.errors.length > 3 && (
                                <li className="text-red-600">
                                  ... and {item.errors.length - 3} more errors
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, data.total)} of {data.total} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImportHistory;