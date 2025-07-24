// ============================================================================
// services/helpDesk/useHelpDesk.ts - TanStack Query hooks
// ============================================================================

import { 
    useQuery, 
    useMutation, 
    useQueryClient
 } from '@tanstack/react-query';
 import type { BaseTicket, HelpDeskTicketParams } from '@/services/helpDesk/helpDesk.type';
 import { HelpDeskService } from '@/services/helpDesk/helpDesk.service';
 
 const helpDeskService = new HelpDeskService();

 export const helpDeskKeys = {
    all: ['helpDeskTickets'] as const,
    lists: () => [...helpDeskKeys.all, 'list'] as const,
    list: (params: HelpDeskTicketParams) => [...helpDeskKeys.lists(), params] as const,
    details: () => [...helpDeskKeys.all, 'detail'] as const,
    detail: (id: string) => [...helpDeskKeys.details(), id] as const,
    statistics: () => [...helpDeskKeys.all, 'statistics'] as const,
    search: (term: string) => [...helpDeskKeys.all, 'search', term] as const,
 }
 
 export function useHelpDeskTickets(params: HelpDeskTicketParams = {}) {
    return useQuery({
        queryKey: helpDeskKeys.list(params),
        queryFn: () => helpDeskService.getTickets(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
 }
 
 export function useHelpDeskStatistics() {
    return useQuery({
        queryKey: helpDeskKeys.statistics(),
        queryFn: () => helpDeskService.getStatistics(),
        staleTime: 15 * 60 * 1000, // 15 minutes
    })
 }
 
 export function useHelpDeskSearch(searchTerm: string, enabled = true) {
    return useQuery({
        queryKey: helpDeskKeys.search(searchTerm),
        queryFn: () => helpDeskService.getTickets({search: searchTerm}),
        enabled: enabled && searchTerm.trim().length >= 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
 }
 
 export function useDeleteHelpDeskTicket() {
    const queryClient = useQueryClient();
 
    return useMutation({
        mutationFn: (id: string) => helpDeskService.deleteTicket(id),
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.statistics() });
            queryClient.removeQueries({ queryKey: helpDeskKeys.detail(deletedId) });
        },
        onError: (error) => {
            console.error('Failed to delete help desk ticket:', error);
        },
    });
 }