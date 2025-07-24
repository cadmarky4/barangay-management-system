// ============================================================================
// processDocument/_hooks/useDocumentQueue.ts - Custom hook for document queue management
// ============================================================================

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/components/_global/NotificationSystem';

import { 
  useDocuments, 
  useDocumentStatistics,
  useProcessDocument,
  useApproveDocument,
  useRejectDocument,
  useReleaseDocument,
  useCancelDocument,
  documentsKeys
} from '@/services/documents/useDocuments';
import type { DocumentStatus, DocumentPriority, Document, DocumentType } from '@/services/documents/documents.types';

export interface QueueFilters {
  status: DocumentStatus | 'ALL';
  priority?: DocumentPriority;
  documentType?: DocumentType;
  searchTerm: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
}

export interface QueueActions {
  processDocument: (id: string, data: { status: DocumentStatus; notes?: string }) => Promise<void>;
  approveDocument: (id: string, data: { notes?: string; certifying_official?: string }) => Promise<void>;
  rejectDocument: (id: string, reason: string) => Promise<void>;
  releaseDocument: (id: string, notes?: string) => Promise<void>;
  cancelDocument: (id: string, reason: string) => Promise<void>;
}

// Available sortable fields
export const SORTABLE_FIELDS = {
  applicant_name: 'Applicant Name',
  document_type: 'Document Type', 
  status: 'Status',
  priority: 'Priority',
  processing_fee: 'Processing Fee',
  request_date: 'Request Date',
  created_at: 'Date Added',
  needed_date: 'Needed Date',
  purpose: 'Purpose'
} as const;

export function useDocumentQueue() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();
  
  // State
  const [filters, setFilters] = useState<QueueFilters>({
    status: 'ALL',
    searchTerm: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
  });

  // Queries
  const { 
    data: documentsData, 
    isLoading: documentsLoading, 
    error: documentsError,
    refetch: refetchDocuments 
  } = useDocuments({
    status: filters.status !== 'ALL' ? filters.status : undefined,
    priority: filters.priority,
    document_type: filters.documentType,
    search: filters.searchTerm || undefined,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    sort_by: filters.sortBy,
    sort_order: filters.sortOrder,
    page: filters.page || 1,
    per_page: 50,
  });

  const { 
    data: statistics, 
    isLoading: statisticsLoading 
  } = useDocumentStatistics();

  // Mutations
  const processDocumentMutation = useProcessDocument();
  const approveDocumentMutation = useApproveDocument();
  const rejectDocumentMutation = useRejectDocument();
  const releaseDocumentMutation = useReleaseDocument();
  const cancelDocumentMutation = useCancelDocument();

  // Get documents from API response (no client-side filtering since backend handles it)
  const documents = useMemo(() => {
    return documentsData?.data || [];
  }, [documentsData?.data]);

  // Status counts from statistics
  const statusCounts = useMemo(() => {
    if (!statistics) {
      return {
        PENDING: 0,
        UNDER_REVIEW: 0,
        APPROVED: 0,
        RELEASED: 0,
        REJECTED: 0,
        CANCELLED: 0,
      };
    }
    return {
      PENDING: statistics.pending_documents,
      UNDER_REVIEW: statistics.processing_documents,
      APPROVED: statistics.approved_documents,
      RELEASED: statistics.released_documents,
      REJECTED: statistics.rejected_documents,
      CANCELLED: statistics.cancelled_documents || 0,
    };
  }, [statistics]);

  // Actions
  const actions: QueueActions = {
    processDocument: async (id: string, data: { status: DocumentStatus; notes?: string }) => {
      try {
        await processDocumentMutation.mutateAsync({ 
          id, 
          data: { 
            status: data.status,
            notes: data.notes 
          } 
        });
        
        showNotification({
          type: 'success',
          title: 'Document Processed',
          message: `Document status updated to ${data.status.toLowerCase().replace('_', ' ')}`
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      } catch (error: any) {
        showNotification({
          type: 'error',
          title: 'Processing Failed',
          message: error.message || 'Failed to process document'
        });
        throw error;
      }
    },

    approveDocument: async (id: string, data: { notes?: string; certifying_official?: string }) => {
      try {
        await approveDocumentMutation.mutateAsync({ 
          id, 
          data: {
            status: 'APPROVED' as DocumentStatus,
            notes: data.notes,
            certifying_official: data.certifying_official
          }
        });
        
        showNotification({
          type: 'success',
          title: 'Document Approved',
          message: 'Document has been approved successfully'
        });
        
        queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      } catch (error: any) {
        showNotification({
          type: 'error',
          title: 'Approval Failed',
          message: error.message || 'Failed to approve document'
        });
        throw error;
      }
    },

    rejectDocument: async (id: string, reason: string) => {
      try {
        await rejectDocumentMutation.mutateAsync({ 
          id, 
          data: { reason } 
        });
        
        showNotification({
          type: 'success',
          title: 'Document Rejected',
          message: 'Document has been rejected'
        });
        
        queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      } catch (error: any) {
        showNotification({
          type: 'error',
          title: 'Rejection Failed',
          message: error.message || 'Failed to reject document'
        });
        throw error;
      }
    },

    releaseDocument: async (id: string, notes?: string) => {
      try {
        await releaseDocumentMutation.mutateAsync({ 
          id, 
          data: { notes } 
        });
        
        showNotification({
          type: 'success',
          title: 'Document Released',
          message: 'Document has been released'
        });
        
        queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      } catch (error: any) {
        showNotification({
          type: 'error',
          title: 'Release Failed',
          message: error.message || 'Failed to release document'
        });
        throw error;
      }
    },

    cancelDocument: async (id: string, reason: string) => {
      try {
        await cancelDocumentMutation.mutateAsync({ 
          id, 
          reason 
        });
        
        showNotification({
          type: 'success',
          title: 'Document Cancelled',
          message: 'Document has been cancelled'
        });
        
        queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
        queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      } catch (error: any) {
        showNotification({
          type: 'error',
          title: 'Cancellation Failed',
          message: error.message || 'Failed to cancel document'
        });
        throw error;
      }
    },
  };

  // Filter functions
  const updateFilters = (newFilters: Partial<QueueFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      searchTerm: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
    });
  };

  // Sorting helper
  const handleSort = (field: string) => {
    const newSortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({
      sortBy: field,
      sortOrder: newSortOrder,
      page: 1, // Reset to first page when sorting changes
    });
  };

  return {
    // Data
    documents,
    statistics,
    statusCounts,
    pagination: documentsData ? {
      current_page: documentsData.current_page,
      last_page: documentsData.last_page,
      per_page: documentsData.per_page,
      total: documentsData.total,
    } : undefined,
    
    // State
    filters,
    updateFilters,
    clearFilters,
    handleSort,
    
    // Loading states
    isLoading: documentsLoading || statisticsLoading,
    documentsLoading,
    statisticsLoading,
    isProcessing: processDocumentMutation.isPending ||
                  approveDocumentMutation.isPending ||
                  rejectDocumentMutation.isPending ||
                  releaseDocumentMutation.isPending ||
                  cancelDocumentMutation.isPending,
    
    // Error states
    error: documentsError,
    
    // Actions
    actions,
    
    // Utils
    refetch: refetchDocuments,
  };
} 