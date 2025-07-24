// ============================================================================
// services/documents/useDocuments.ts - TanStack Query hooks for documents
// ============================================================================

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  useInfiniteQuery 
} from '@tanstack/react-query';
import type { 
  Document, 
  DocumentParams, 
  DocumentFormData,
  ProcessDocumentData,
  RejectDocumentData,
  ReleaseDocumentData
} from './documents.types';
import { documentsService } from '@/services/documents/documents.service';

// Query keys
export const documentsKeys = {
  all: ['documents'] as const,
  lists: () => [...documentsKeys.all, 'list'] as const,
  list: (params: DocumentParams) => [...documentsKeys.lists(), params] as const,
  details: () => [...documentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentsKeys.details(), id] as const,
  statistics: () => [...documentsKeys.all, 'statistics'] as const,
  search: (term: string) => [...documentsKeys.all, 'search', term] as const,
  tracking: (id: string) => [...documentsKeys.all, 'tracking', id] as const,
  history: (id: string) => [...documentsKeys.all, 'history', id] as const,
  byResident: (residentId: number) => [...documentsKeys.all, 'byResident', residentId] as const,
  byType: (type: string) => [...documentsKeys.all, 'byType', type] as const,
  byStatus: (status: string) => [...documentsKeys.all, 'byStatus', status] as const,
  overdue: () => [...documentsKeys.all, 'overdue'] as const,
  pending: () => [...documentsKeys.all, 'pending'] as const,
};

// Queries
export function useDocuments(params: DocumentParams = {}) {
  return useQuery({
    queryKey: documentsKeys.list(params),
    queryFn: () => documentsService.getDocuments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDocument(id: string, enabled = true) {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => documentsService.getDocument(id),
    enabled: enabled && !!id && id.trim() !== '',
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDocumentStatistics() {
  return useQuery({
    queryKey: documentsKeys.statistics(),
    queryFn: () => documentsService.getStatistics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useDocumentSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: documentsKeys.search(searchTerm),
    queryFn: () => documentsService.searchDocuments(searchTerm),
    enabled: enabled && searchTerm.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDocumentTracking(id: string, enabled = true) {
  return useQuery({
    queryKey: documentsKeys.tracking(id),
    queryFn: () => documentsService.getDocumentTracking(id),
    enabled: enabled && !!id && id.trim() !== '',
    staleTime: 1 * 60 * 1000, // 1 minute - tracking info should be fresh
  });
}

// Documents by filters
export function useDocumentsByResident(residentId: number, enabled = true) {
  return useQuery({
    queryKey: documentsKeys.byResident(residentId),
    queryFn: () => documentsService.getDocumentsByResident(residentId),
    enabled: enabled && !!residentId && residentId > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDocumentsByType(documentType: string, enabled = true) {
  return useQuery({
    queryKey: documentsKeys.byType(documentType),
    queryFn: () => documentsService.getDocumentsByType(documentType),
    enabled: enabled && !!documentType && documentType.trim() !== '',
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDocumentsByStatus(status: string, enabled = true) {
  return useQuery({
    queryKey: documentsKeys.byStatus(status),
    queryFn: () => documentsService.getDocumentsByStatus(status),
    enabled: enabled && !!status && status.trim() !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOverdueDocuments() {
  return useQuery({
    queryKey: documentsKeys.overdue(),
    queryFn: () => documentsService.getOverdueDocuments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePendingDocuments() {
  return useQuery({
    queryKey: documentsKeys.pending(),
    queryFn: () => documentsService.getPendingDocuments(),
    staleTime: 2 * 60 * 1000, // 2 minutes - pending should be fresh
  });
}

// Mutations
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentFormData) => documentsService.createDocument(data),
    onSuccess: (newDocument: Document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.pending() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byResident(newDocument.resident_id) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byType(newDocument.document_type) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus(newDocument.status) });
      queryClient.setQueryData(
        documentsKeys.detail(newDocument.id),
        newDocument
      );
    },
    onError: (error: any) => {
      console.error('Create document error:', error);
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentFormData }) =>
      documentsService.updateDocument(id, data),
    onSuccess: (updatedDocument: Document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byResident(updatedDocument.resident_id) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byType(updatedDocument.document_type) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus(updatedDocument.status) });
      queryClient.setQueryData(
        documentsKeys.detail(updatedDocument.id),
        updatedDocument
      );
    },
    onError: (error: any) => {
      console.error('Update document error:', error);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsService.deleteDocument(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.pending() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.overdue() });
      queryClient.removeQueries({ queryKey: documentsKeys.detail(deletedId) });
    },
    onError: (error: any) => {
      console.error('Delete document error:', error);
    },
  });
}

export function useProcessDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessDocumentData }) =>
      documentsService.processDocument(id, data),
    onSuccess: (processedDocument: Document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.pending() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('PENDING') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus(processedDocument.status) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.tracking(processedDocument.id) });
      queryClient.setQueryData(
        documentsKeys.detail(processedDocument.id),
        processedDocument
      );
    },
    onError: (error: any) => {
      console.error('Process document error:', error);
    },
  });
}

export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessDocumentData }) =>
      documentsService.approveDocument(id, data),
    onSuccess: (approvedDocument: Document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.pending() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('PENDING') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('PROCESSING') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('APPROVED') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.tracking(approvedDocument.id) });
      queryClient.setQueryData(
        documentsKeys.detail(approvedDocument.id),
        approvedDocument
      );
    },
    onError: (error: any) => {
      console.error('Approve document error:', error);
    },
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectDocumentData }) =>
      documentsService.rejectDocument(id, data),
    onSuccess: (rejectedDocument: Document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.pending() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('PENDING') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('PROCESSING') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('UNDER_REVIEW') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('REJECTED') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byResident(rejectedDocument.resident_id) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.tracking(rejectedDocument.id) });
      queryClient.setQueryData(
        documentsKeys.detail(rejectedDocument.id),
        rejectedDocument
      );
    },
    onError: (error: any) => {
      console.error('Reject document error:', error);
    },
  });
}

export function useReleaseDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReleaseDocumentData }) =>
      documentsService.releaseDocument(id, data),
    onSuccess: (releasedDocument: Document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.pending() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('PENDING') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('PROCESSING') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('UNDER_REVIEW') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('APPROVED') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('RELEASED') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byResident(releasedDocument.resident_id) });
      queryClient.invalidateQueries({ queryKey: documentsKeys.tracking(releasedDocument.id) });
      queryClient.setQueryData(
        documentsKeys.detail(releasedDocument.id),
        releasedDocument
      );
    },
    onError: (error: any) => {
      console.error('Release document error:', error);
    },
  });
}

export function useCancelDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      documentsService.cancelDocument(id, reason),
    onSuccess: (cancelledDocument: Document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.pending() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.byStatus('CANCELLED') });
      queryClient.invalidateQueries({ queryKey: documentsKeys.tracking(cancelledDocument.id) });
      queryClient.setQueryData(
        documentsKeys.detail(cancelledDocument.id),
        cancelledDocument
      );
    },
    onError: (error: any) => {
      console.error('Cancel document error:', error);
    },
  });
}

export function useProcessingHistory(documentId: string) {
  return useQuery({
    queryKey: documentsKeys.history(documentId),
    queryFn: () => documentsService.getProcessingHistory(documentId),
    enabled: !!documentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useGenerateDocumentPDF() {
  return useMutation({
    mutationFn: (id: string) => documentsService.generateDocumentPDF(id),
    onError: (error: any) => {
      console.error('Generate PDF error:', error);
    },
  });
}

// Infinite query for large datasets
export function useInfiniteDocuments(params: Omit<DocumentParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['documents', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      documentsService.getDocuments({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Export all hooks for easier imports
export * from './documents.types'; 