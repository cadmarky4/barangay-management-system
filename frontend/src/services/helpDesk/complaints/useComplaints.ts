import { 
    useQuery, 
    useMutation, 
    useQueryClient, 
} from '@tanstack/react-query';
import type {  
    ViewComplaint, 
    CreateComplaint, 
    EditComplaint
} from '@/services/helpDesk/complaints/complaints.types';
import { complaintService } from '@/services/helpDesk/complaints/complaints.service';
import { helpDeskKeys } from '../useHelpDesk';

// Query keys factory
export const complaintKeys = {
    all: ['complaints'] as const,
    lists: () => [...complaintKeys.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...complaintKeys.lists(), params] as const,
    details: () => [...complaintKeys.all, 'detail'] as const,
    detail: (id: string) => [...complaintKeys.details(), id] as const,
    statistics: () => [...complaintKeys.all, 'statistics'] as const,
    search: (term: string) => [...complaintKeys.all, 'search', term] as const,
}

/**
 * Hook to fetch a specific complaint by ID
 */
export function useComplaint(id: string, enabled = true) {
    return useQuery({
        queryKey: complaintKeys.detail(id),
        queryFn: () => complaintService.viewComplaint(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}

/**
 * Hook to create a new complaint
 */
export function useCreateComplaint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateComplaint) => complaintService.createComplaint(data),
        onSuccess: (newComplaint: ViewComplaint) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
            queryClient.invalidateQueries({ queryKey: complaintKeys.statistics() });
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() });
            
            // Set the new complaint data in cache
            queryClient.setQueryData(
                complaintKeys.detail(newComplaint.ticket.id!),
                {
                    ticket: newComplaint.ticket,
                    complaint: newComplaint.complaint
                } as ViewComplaint
            );
        },
        onError: (error) => {
            console.error('Failed to create complaint:', error);
        },
    });
}

/**
 * Hook to update an existing complaint
 */
export function useUpdateComplaint() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: EditComplaint }) => 
            complaintService.updateComplaint(id, data),
        onSuccess: (updatedComplaint: ViewComplaint, { id }) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
            queryClient.invalidateQueries({ queryKey: complaintKeys.statistics() });
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.statistics() }) // this one does the REAL thing
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() })

            // Update the specific complaint in cache
            queryClient.setQueryData(
                complaintKeys.detail(id),
                {
                    ticket: updatedComplaint.ticket,
                    complaint: updatedComplaint.complaint
                } as ViewComplaint
            );
        },
        onError: (error) => {
            console.error('Failed to update complaint:', error);
        },
    });
}

/**
 * Hook to prefetch a complaint (useful for preloading)
 */
export function usePrefetchComplaint() {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: complaintKeys.detail(id),
            queryFn: () => complaintService.viewComplaint(id),
            staleTime: 5 * 60 * 1000,
        });
    };
}

/**
 * Hook to invalidate complaint queries (useful for manual cache invalidation)
 */
export function useInvalidateComplaints() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: complaintKeys.all }),
        invalidateLists: () => queryClient.invalidateQueries({ queryKey: complaintKeys.lists() }),
        invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: complaintKeys.detail(id) }),
        invalidateStatistics: () => queryClient.invalidateQueries({ queryKey: complaintKeys.statistics() }),
    };
}