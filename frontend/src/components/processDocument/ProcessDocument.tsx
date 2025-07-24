// ============================================================================
// processDocument/ProcessDocument.tsx - Modern document processing center
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiPrinter, 
  FiEye, 
  FiClipboard, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiUser, 
  FiCalendar, 
  FiFileText, 
  FiAlertCircle,
  FiRefreshCw,
  FiEdit3,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocumentQueue, SORTABLE_FIELDS } from './_hooks/useDocumentQueue';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { useBarangayOfficials } from '@/services/officials/useBarangayOfficials';
import Breadcrumb from '../_global/Breadcrumb';
import { formatDate } from '@/utils/dateUtils';
import type { Document, DocumentStatus } from '@/services/documents/documents.types';

interface ProcessDocumentProps {
  onNavigate?: (page: string) => void;
}

interface SortableHeaderProps {
  field: string;
  label: string;
  currentSort: string | undefined;
  currentOrder: 'asc' | 'desc' | undefined;
  onSort: (field: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  field, 
  label, 
  currentSort, 
  currentOrder, 
  onSort 
}) => {
  const isActive = currentSort === field;
  
  return (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <div className="flex flex-col">
          <FiChevronUp 
            className={`w-3 h-3 ${
              isActive && currentOrder === 'asc' 
                ? 'text-smblue-400' 
                : 'text-gray-300'
            }`}
          />
          <FiChevronDown 
            className={`w-3 h-3 -mt-1 ${
              isActive && currentOrder === 'desc' 
                ? 'text-smblue-400' 
                : 'text-gray-300'
            }`}
          />
        </div>
      </div>
    </th>
  );
};

const ProcessDocument: React.FC<ProcessDocumentProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  
  const {
    documents,
    statistics,
    statusCounts,
    filters,
    updateFilters,
    clearFilters,
    handleSort,
    isLoading,
    isProcessing,
    error,
    actions,
    refetch,
    pagination,
  } = useDocumentQueue();

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const documentTypes = [
    { value: 'BARANGAY_CLEARANCE', label: 'Barangay Clearance' },
    { value: 'BUSINESS_PERMIT', label: 'Business Permit' },
    { value: 'CERTIFICATE_OF_INDIGENCY', label: 'Certificate of Indigency' },
    { value: 'CERTIFICATE_OF_RESIDENCY', label: 'Certificate of Residency' }
  ];

  const statusConfig = {
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: FiClock,
      label: 'Pending'
    },
    UNDER_REVIEW: {
      color: 'bg-blue-100 text-blue-800',
      icon: FiEye,
      label: 'Processing'
    },
    APPROVED: {
      color: 'bg-green-100 text-green-800',
      icon: FiCheck,
      label: 'Approved'
    },
    RELEASED: {
      color: 'bg-gray-100 text-gray-800',
      icon: FiFileText,
      label: 'Released'
    },
    REJECTED: {
      color: 'bg-red-100 text-red-800',
      icon: FiX,
      label: 'Rejected'
    },
    CANCELLED: {
      color: 'bg-gray-100 text-gray-800',
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

  const handleProcessDocument = async (
    documentId: string,
    action: 'approve' | 'reject' | 'release',
    data?: { notes?: string; certifying_official?: string }
  ) => {
    try {
      switch (action) {
        case 'approve':
          await actions.approveDocument(documentId, {
            notes: data?.notes,
            certifying_official: data?.certifying_official
          });
          break;
        case 'reject':
          await actions.rejectDocument(documentId, data?.notes || 'Document rejected');
          break;
        case 'release':
          await actions.releaseDocument(documentId, data?.notes);
          break;
      }

      setShowProcessModal(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error processing document:', error);
    }
  };

  const handlePrintDocument = (document: Document) => {
    // Map document types to correct print routes
    const printRouteMap: Record<string, string> = {
      'BARANGAY_CLEARANCE': 'barangay-clearance',
      'CERTIFICATE_OF_RESIDENCY': 'certificate-residency', 
      'CERTIFICATE_OF_INDIGENCY': 'certificate-indigency',
      'BUSINESS_PERMIT': 'business-permit'
    };

    const printRoute = printRouteMap[document.document_type];
    if (printRoute) {
      navigate(`/print/${printRoute}/${String(document.id)}`);
    } else {
      console.error('No print route found for document type:', document.document_type);
    }
  };

  const formatDocumentType = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType?.label : type.replace(/_/g, ' ');
  };

  // Map backend status values to frontend config keys
  const getStatusConfigKey = (status: string): string => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'pending':
        return 'PENDING';
      case 'processing':
      case 'under_review':
        return 'UNDER_REVIEW';
      case 'approved':
        return 'APPROVED';
      case 'released':
        return 'RELEASED';
      case 'rejected':
        return 'REJECTED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        // If it's already uppercase, return as is
        return status.toUpperCase();
    }
  };

  const getStatusIcon = (status: string) => {
    const configKey = getStatusConfigKey(status);
    const config = statusConfig[configKey as keyof typeof statusConfig];
    if (!config) return null;
    const IconComponent = config.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: string) => {
    return priorityConfig[priority as keyof typeof priorityConfig]?.color || 'text-gray-500';
  };

  const getPriorityLabel = (priority: string) => {
    return priorityConfig[priority as keyof typeof priorityConfig]?.label || priority;
  };

  // Use backend pagination instead of client-side pagination
  const currentDocuments = documents; // No client-side slicing since backend handles pagination

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
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Documents</h3>
          <p className="text-red-700 mb-4">
            {error?.message || 'Failed to load document processing center'}
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
      {/* Breadcrumb */}
      <Breadcrumb isLoaded={true} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-2xl font-bold text-darktext">Document Processing Center</h1>
        <p className="text-gray-600 mt-1">Manage and process barangay documents and certificates</p>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.UNDER_REVIEW || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiEye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.APPROVED || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Released</p>
              <p className="text-2xl font-bold text-gray-600">{statusCounts.RELEASED || 0}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <FiFileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.REJECTED || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-600">{statusCounts.CANCELLED || 0}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <FiX className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
                placeholder="Search by applicant name, document number, or purpose..."
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value, page: 1 })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value as DocumentStatus | 'ALL', page: 1 })}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 appearance-none bg-white cursor-pointer"
                aria-label="Filter by status"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Processing</option>
                <option value="APPROVED">Approved</option>
                <option value="RELEASED">Released</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Document Type Filter */}
            <div className="relative">
              <FiClipboard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filters.documentType || 'ALL'}
                onChange={(e) => updateFilters({ 
                  documentType: e.target.value === 'ALL' ? undefined : e.target.value as any,
                  page: 1
                })}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 appearance-none bg-white cursor-pointer"
                aria-label="Filter by document type"
              >
                <option value="ALL">All Document Types</option>
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {pagination?.total || documents.length} documents found
            </span>
            {(filters.searchTerm || filters.status !== 'ALL' || filters.documentType) && (
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

      {/* Documents Table with Sortable Headers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  field="applicant_name"
                  label="Resident"
                  currentSort={filters.sortBy}
                  currentOrder={filters.sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="document_type"
                  label="Document Type"
                  currentSort={filters.sortBy}
                  currentOrder={filters.sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="purpose"
                  label="Purpose"
                  currentSort={filters.sortBy}
                  currentOrder={filters.sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="status"
                  label="Status"
                  currentSort={filters.sortBy}
                  currentOrder={filters.sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="priority"
                  label="Priority"
                  currentSort={filters.sortBy}
                  currentOrder={filters.sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="created_at"
                  label="Request Date"
                  currentSort={filters.sortBy}
                  currentOrder={filters.sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="processing_fee"
                  label="Fee"
                  currentSort={filters.sortBy}
                  currentOrder={filters.sortOrder}
                  onSort={handleSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-smblue-100 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-smblue-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {document.applicant_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.applicant_contact || 'No contact'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDocumentType(document.document_type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {document.purpose}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[getStatusConfigKey(document.status) as keyof typeof statusConfig]?.color}`}>
                      {getStatusIcon(document.status)}
                      <span className="ml-1">{statusConfig[getStatusConfigKey(document.status) as keyof typeof statusConfig]?.label}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPriorityColor(document.priority)}`}>
                      {getPriorityLabel(document.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {formatDate(document.created_at || document.request_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.processing_fee === 0 ? 'FREE' : `₱${document.processing_fee}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowProcessModal(true);
                        }}
                        className="text-smblue-400 hover:text-smblue-600 transition-colors p-1 rounded"
                        title="Process Document"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      {document.status.toLowerCase() === 'approved' && (
                        <button
                          onClick={() => handlePrintDocument(document)}
                          className="text-green-600 hover:text-green-800 transition-colors p-1 rounded"
                          title="Print Document"
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/process-document/view/${String(document.id)}`)}
                        className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backend Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateFilters({ page: Math.max((pagination.current_page || 1) - 1, 1) })}
                disabled={pagination.current_page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
                const page = Math.max(1, pagination.current_page - 2) + i;
                if (page <= pagination.last_page) {
                  return (
                    <button
                      key={page}
                      onClick={() => updateFilters({ page })}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pagination.current_page === page
                          ? 'bg-smblue-400 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              })}
              <button
                onClick={() => updateFilters({ page: Math.min((pagination.current_page || 1) + 1, pagination.last_page) })}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {filters.searchTerm || filters.status !== 'ALL' || filters.documentType
              ? 'Try adjusting your search criteria'
              : 'No documents to process at the moment'
            }
          </p>
        </div>
      )}

      {/* Process Document Modal */}
      {showProcessModal && selectedDocument && (
        <ProcessDocumentModal
          document={selectedDocument}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedDocument(null);
          }}
          onProcess={handleProcessDocument}
          isProcessing={isProcessing}
        />
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

// Modern Process Document Modal Component
const ProcessDocumentModal: React.FC<{
  document: Document;
  onClose: () => void;
  onProcess: (
    id: string,
    action: 'approve' | 'reject' | 'release',
    data?: { notes?: string; certifying_official?: string }
  ) => Promise<void>;
  isProcessing: boolean;
}> = ({ document, onClose, onProcess, isProcessing }) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'release'>('approve');
  const [notes, setNotes] = useState('');
  const [certifyingOfficial, setCertifyingOfficial] = useState('');

  // Fetch active barangay officials for the certifying official dropdown
  const { data: officialsData, isLoading: isLoadingOfficials } = useBarangayOfficials({
    status: 'ACTIVE',
    current_term: true,
    per_page: 100 // Get all active officials
  });

  const officials = officialsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      notes: notes.trim() || undefined,
      certifying_official: certifyingOfficial.trim() || undefined,
    };

    await onProcess(String(document.id), action, data);
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Process Document Request
        </h3>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">
            <strong>Resident:</strong> {document.applicant_name}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Document:</strong> {formatDocumentType(document.document_type)}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Purpose:</strong> {document.purpose}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Fee:</strong> {document.processing_fee === 0 ? 'FREE' : `₱${document.processing_fee}`}
          </p>
              </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as 'approve' | 'reject' | 'release')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              disabled={isProcessing}
              aria-label="Select action to perform on document"
            >
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="release">Release</option>
            </select>
              </div>

          {action === 'approve' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifying Official
              </label>
              <select
                value={certifyingOfficial}
                onChange={(e) => setCertifyingOfficial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                disabled={isProcessing || isLoadingOfficials}
                required
              >
                <option value="">
                  {isLoadingOfficials ? 'Loading officials...' : 'Select certifying official'}
                </option>
                {officials.map((official) => {
                  const fullName = `${official.prefix} ${official.first_name} ${official.middle_name ? official.middle_name + ' ' : ''}${official.last_name}${official.suffix ? ' ' + official.suffix : ''}`.trim();
                  const positionText = official.position.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <option key={official.id} value={fullName}>
                      {fullName} ({positionText})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes {action === 'reject' ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Enter ${action === 'reject' ? 'rejection reason' : 'any notes or comments'}`}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              disabled={isProcessing}
              required={action === 'reject'}
            />
          </div>

          <div className="flex justify-end space-x-3">
              <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || (action === 'reject' && !notes.trim())}
              className="px-4 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isProcessing && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isProcessing ? 'Processing...' : 'Process Document'}</span>
            </button>
          </div>
        </form>
          </div>
        </div>
  );
};

export default ProcessDocument;