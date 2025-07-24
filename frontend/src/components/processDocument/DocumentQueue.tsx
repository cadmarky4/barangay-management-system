// ============================================================================
// processDocument/DocumentQueue.tsx - Modern document queue management
// ============================================================================

import React, { useState } from 'react';
import { 
  FiClock, 
  FiEye, 
  FiCheck, 
  FiX, 
  FiFileText, 
  FiUser, 
  FiCalendar, 
  FiMoreVertical,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiEdit3
} from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocumentQueue } from './_hooks/useDocumentQueue';
import { formatDate } from '@/utils/dateUtils';
import type { DocumentStatus, DocumentPriority, Document } from '@/services/documents/documents.types';

interface DocumentQueueProps {
  onNavigate?: (page: string) => void;
}

const DocumentQueue: React.FC<DocumentQueueProps> = ({ onNavigate }) => {
  const {
    documents,
    statusCounts,
    filters,
    updateFilters,
    clearFilters,
    isLoading,
    isProcessing,
    error,
    actions,
    refetch,
  } = useDocumentQueue();

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  const statusConfig = {
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: FiClock,
      label: 'Pending'
    },
    UNDER_REVIEW: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: FiEye,
      label: 'Under Review'
    },
    APPROVED: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: FiCheck,
      label: 'Approved'
    },
    RELEASED: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: FiFileText,
      label: 'Released'
    },
    REJECTED: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: FiX,
      label: 'Rejected'
    },
    CANCELLED: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: FiX,
      label: 'Cancelled'
    }
  };

  const priorityConfig = {
    LOW: { color: 'text-gray-500', label: 'Low' },
    NORMAL: { color: 'text-blue-500', label: 'Normal' },
    HIGH: { color: 'text-orange-500', label: 'High' },
    URGENT: { color: 'text-red-500', label: 'Urgent' }
  };

  const handleStatusChange = (status: DocumentStatus | 'ALL') => {
    updateFilters({ status });
  };

  const handleSearchChange = (searchTerm: string) => {
    updateFilters({ searchTerm });
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Map backend status values to frontend config keys
  const getStatusConfigKey = (status: string): string => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'processing') return 'UNDER_REVIEW';
    return lowerStatus.toUpperCase();
  };

  const getProcessingProgress = (status: DocumentStatus) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'UNDER_REVIEW': return 25;
      case 'APPROVED': return 75;
      case 'RELEASED': return 100;
      case 'REJECTED': return 0;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiX className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Queue</h3>
          <p className="text-red-700 mb-4">
            {error?.message || 'Failed to load document queue'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-darktext">Document Processing Queue</h1>
            <p className="text-gray-600 mt-1">Track and manage document processing workflow</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              disabled={isLoading}
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-6 divide-x divide-gray-200">
          {/* All Tab */}
          <button
            onClick={() => handleStatusChange('ALL')}
            className={`p-4 text-center hover:bg-gray-50 transition-colors ${
              filters.status === 'ALL' ? 'bg-smblue-50 border-b-2 border-smblue-400' : ''
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <FiFileText className={`w-5 h-5 mr-2 ${
                filters.status === 'ALL' ? 'text-smblue-400' : 'text-gray-400'
              }`} />
              <span className={`text-2xl font-bold ${
                filters.status === 'ALL' ? 'text-smblue-400' : 'text-gray-600'
              }`}>
                {documents.length}
              </span>
            </div>
            <p className={`text-sm font-medium ${
              filters.status === 'ALL' ? 'text-smblue-400' : 'text-gray-600'
            }`}>
              All
            </p>
          </button>

          {/* Status Tabs */}
          {Object.entries(statusConfig).map(([status, config]) => {
            const IconComponent = config.icon;
            const count = statusCounts[status as keyof typeof statusCounts];
            
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status as DocumentStatus)}
                className={`p-4 text-center hover:bg-gray-50 transition-colors ${
                  filters.status === status ? 'bg-smblue-50 border-b-2 border-smblue-400' : ''
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <IconComponent className={`w-5 h-5 mr-2 ${
                    filters.status === status ? 'text-smblue-400' : 'text-gray-400'
                  }`} />
                  <span className={`text-2xl font-bold ${
                    filters.status === status ? 'text-smblue-400' : 'text-gray-600'
                  }`}>
                    {count}
                  </span>
                </div>
                <p className={`text-sm font-medium ${
                  filters.status === status ? 'text-smblue-400' : 'text-gray-600'
                }`}>
                  {config.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Search and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by applicant name, document number, or purpose..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
            />
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {documents.length} documents found
            </span>
            {filters.searchTerm && (
              <button
                onClick={clearFilters}
                className="text-sm text-smblue-400 hover:text-smblue-600"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {documents.map((document) => {
          const statusKey = getStatusConfigKey(document.status);
          const StatusIcon = statusConfig[statusKey as keyof typeof statusConfig].icon;
          const isOverdue = document.needed_date && new Date(document.needed_date) < new Date();
          const progress = getProcessingProgress(document.status as DocumentStatus);
          
          return (
            <div key={document.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-smblue-100 rounded-full flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-smblue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {document.applicant_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {document.applicant_contact || 'No contact provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Priority */}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 ${priorityConfig[document.priority].color}`}>
                        {priorityConfig[document.priority].label}
                      </span>
                      
                      {/* Status */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[statusKey as keyof typeof statusConfig].color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[statusKey as keyof typeof statusConfig].label}
                      </span>
                      
                      {/* Actions */}
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                        onClick={() => {
                          setSelectedDocument(document);
                          setActionModalOpen(true);
                        }}
                        aria-label="Open document actions menu"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Document Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Document Type</p>
                      <p className="text-sm text-gray-900">
                        {formatDocumentType(document.document_type)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Purpose</p>
                      <p className="text-sm text-gray-900 truncate">
                        {document.purpose}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Processing Fee</p>
                      <p className="text-sm text-gray-900">
                        {document.processing_fee === 0 ? 'FREE' : `₱${document.processing_fee}`}
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      <span>
                        Requested: {formatDate(document.created_at || document.request_date)}
                      </span>
                    </div>
                    {document.needed_date && (
                      <div className="flex items-center text-sm">
                        <FiClock className="w-4 h-4 mr-2" />
                        <span className={isOverdue ? 'text-red-600' : 'text-gray-600'}>
                          Needed: {formatDate(document.needed_date)}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Processing Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          statusKey === 'PENDING' ? 'bg-yellow-400' :
                          statusKey === 'UNDER_REVIEW' ? 'bg-blue-400' :
                          statusKey === 'APPROVED' ? 'bg-green-400' :
                          statusKey === 'RELEASED' ? 'bg-green-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {filters.searchTerm 
              ? 'Try adjusting your search criteria'
              : filters.status === 'ALL' 
                ? 'No documents in the queue'
                : `No documents with ${statusConfig[filters.status as DocumentStatus]?.label.toLowerCase()} status`
            }
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner size="md" />
            <span className="text-gray-700">Processing document...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentQueue; 

