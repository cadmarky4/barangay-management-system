import { 
    useQuery, 
    useMutation, 
    useQueryClient, 
} from '@tanstack/react-query';
import type {  
    ViewSuggestion, 
    CreateSuggestion, 
    EditSuggestion
} from '@/services/helpDesk/suggestions/suggestions.types';
import { suggestionService } from '@/services/helpDesk/suggestions/suggestions.service';
import { helpDeskKeys } from '../useHelpDesk';

// Query keys factory
export const suggestionKeys = {
    all: ['suggestions'] as const,
    lists: () => [...suggestionKeys.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...suggestionKeys.lists(), params] as const,
    details: () => [...suggestionKeys.all, 'detail'] as const,
    detail: (id: string) => [...suggestionKeys.details(), id] as const,
    statistics: () => [...suggestionKeys.all, 'statistics'] as const,
    search: (term: string) => [...suggestionKeys.all, 'search', term] as const,
}

/**
 * Hook to fetch a specific suggestion by ID
 */
export function useSuggestion(id: string, enabled = true) {
    return useQuery({
        queryKey: suggestionKeys.detail(id),
        queryFn: () => suggestionService.viewSuggestion(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}

/**
 * Hook to create a new suggestion
 */
export function useCreateSuggestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSuggestion) => suggestionService.createSuggestion(data),
        onSuccess: (newSuggestion: ViewSuggestion) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: suggestionKeys.statistics() });
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() });
            
            // Set the new suggestion data in cache
            queryClient.setQueryData(
                suggestionKeys.detail(newSuggestion.ticket.id!),
                {
                    ticket: newSuggestion.ticket,
                    suggestion: newSuggestion.suggestion
                } as ViewSuggestion
            );
        },
        onError: (error) => {
            console.error('Failed to create suggestion:', error);
        },
    });
}

/**
 * Hook to update an existing suggestion
 */
export function useUpdateSuggestion() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: EditSuggestion }) => 
            suggestionService.updateSuggestion(id, data),
        onSuccess: (updatedSuggestion: ViewSuggestion, { id }) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: suggestionKeys.statistics() });
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.statistics() }) // this one does the REAL thing
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() })

            // Update the specific suggestion in cache
            queryClient.setQueryData(
                suggestionKeys.detail(id),
                {
                    ticket: updatedSuggestion.ticket,
                    suggestion: updatedSuggestion.suggestion
                } as ViewSuggestion
            );
        },
        onError: (error) => {
            console.error('Failed to update suggestion:', error);
        },
    });
}

/**
 * Hook to prefetch a suggestion (useful for preloading)
 */
export function usePrefetchSuggestion() {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: suggestionKeys.detail(id),
            queryFn: () => suggestionService.viewSuggestion(id),
            staleTime: 5 * 60 * 1000,
        });
    };
}

/**
 * Hook to invalidate suggestion queries (useful for manual cache invalidation)
 */
export function useInvalidateSuggestions() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: suggestionKeys.all }),
        invalidateLists: () => queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() }),
        invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: suggestionKeys.detail(id) }),
        invalidateStatistics: () => queryClient.invalidateQueries({ queryKey: suggestionKeys.statistics() }),
    };
}