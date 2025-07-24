import { 
    useQuery, 
    useMutation, 
    useQueryClient, 
} from '@tanstack/react-query';
import type {  
    ViewBlotter, 
    CreateBlotter, 
    EditBlotter,
    UploadSupportingDocuments 
} from '@/services/helpDesk/blotters/blotters.types';
import { blotterService } from '@/services/helpDesk/blotters/blotters.service';
import { helpDeskKeys } from '../useHelpDesk';

// Query keys factory
export const blotterKeys = {
    all: ['blotters'] as const,
    lists: () => [...blotterKeys.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...blotterKeys.lists(), params] as const,
    details: () => [...blotterKeys.all, 'detail'] as const,
    detail: (id: string) => [...blotterKeys.details(), id] as const,
    statistics: () => [...blotterKeys.all, 'statistics'] as const,
    search: (term: string) => [...blotterKeys.all, 'search', term] as const,
}

/**
 * Hook to fetch a specific blotter by ID
 */
export function useBlotter(id: string, enabled = true) {
    return useQuery({
        queryKey: blotterKeys.detail(id),
        queryFn: () => blotterService.viewBlotter(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}

/**
 * Hook to create a new blotter
 */
export function useCreateBlotter() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBlotter) => blotterService.createBlotter(data),
        onSuccess: (newBlotter: ViewBlotter) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: blotterKeys.lists() });
            queryClient.invalidateQueries({ queryKey: blotterKeys.statistics() });
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() });
            
            // Set the new blotter data in cache
            queryClient.setQueryData(
                blotterKeys.detail(newBlotter.ticket.id!),
                {
                    ticket: newBlotter.ticket,
                    blotter: newBlotter.blotter
                } as ViewBlotter
            );
        },
        onError: (error) => {
            console.error('Failed to create blotter:', error);
        },
    });
}

/**
 * Hook to update an existing blotter
 */
export function useUpdateBlotter() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: EditBlotter }) => 
            blotterService.updateBlotter(id, data),
        onSuccess: (updatedBlotter: ViewBlotter, { id }) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: blotterKeys.lists() });
            queryClient.invalidateQueries({ queryKey: blotterKeys.statistics() });
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.statistics() }) // this one does the REAL thing
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() })
            
            // Update the specific blotter in cache
            queryClient.setQueryData(
                blotterKeys.detail(id),
                {
                    ticket: updatedBlotter.ticket,
                    blotter: updatedBlotter.blotter
                } as ViewBlotter
            );
        },
        onError: (error) => {
            console.error('Failed to update blotter:', error);
        },
    });
}

/**
 * Hook to upload supporting documents for a blotter
 */
export function useUploadSupportingDocuments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (document: UploadSupportingDocuments) => 
            blotterService.uploadSupportingDocuments(document),
        onSuccess: (updatedBlotter: ViewBlotter, { blotter_id }) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: blotterKeys.lists() });
            
            // Update the specific blotter in cache with new supporting documents
            queryClient.setQueryData(
                blotterKeys.detail(blotter_id),
                {
                    ticket: updatedBlotter.ticket,
                    blotter: updatedBlotter.blotter
                } as ViewBlotter
            );
        },
        onError: (error) => {
            console.error('Failed to upload supporting documents:', error);
        },
    });
}

/**
 * Hook to prefetch a blotter (useful for preloading)
 */
export function usePrefetchBlotter() {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: blotterKeys.detail(id),
            queryFn: () => blotterService.viewBlotter(id),
            staleTime: 5 * 60 * 1000,
        });
    };
}

/**
 * Hook to invalidate blotter queries (useful for manual cache invalidation)
 */
export function useInvalidateBlotters() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: blotterKeys.all }),
        invalidateLists: () => queryClient.invalidateQueries({ queryKey: blotterKeys.lists() }),
        invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: blotterKeys.detail(id) }),
        invalidateStatistics: () => queryClient.invalidateQueries({ queryKey: blotterKeys.statistics() }),
    };
}