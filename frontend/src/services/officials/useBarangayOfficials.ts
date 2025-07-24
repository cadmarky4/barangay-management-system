// ============================================================================
// services/officials/useBarangayOfficials.ts - TanStack Query hooks
// ============================================================================

import { 
    useQuery, 
    useMutation, 
    useQueryClient, 
    useInfiniteQuery 
  } from '@tanstack/react-query';
import type { BarangayOfficial, BarangayOfficialFormData, BarangayOfficialParams } from '@/services/officials/barangayOfficials.types';
import { barangayOfficialsService } from '@/services/officials/barangayOfficials.service';

export const barangayOfficialsKeys = {
    all: ['barangayOfficials'] as const,
    lists: () => [...barangayOfficialsKeys.all, 'list'] as const,
    list: (params: BarangayOfficialParams) => [...barangayOfficialsKeys.lists(), params] as const,
    details: () => [...barangayOfficialsKeys.all, 'detail'] as const,
    detail: (id: string) => [...barangayOfficialsKeys.details(), id] as const,
    statistics: () => [...barangayOfficialsKeys.all, 'statistics'] as const,
    search: (term: string) => [...barangayOfficialsKeys.all, 'search', term] as const,
}

export function useBarangayOfficials(params: BarangayOfficialParams = {}) {
    return useQuery({
        queryKey: barangayOfficialsKeys.list(params),
        queryFn: () => barangayOfficialsService.getBarangayOfficials(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useBarangayOfficial(id: string, enabled = true) {
    return useQuery({
        queryKey: barangayOfficialsKeys.detail(id),
        queryFn: () => barangayOfficialsService.getBarangayOfficial(id),
        enabled: enabled && !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export function useBarangayOfficialStatistics() {
    return useQuery({
        queryKey: barangayOfficialsKeys.statistics(),
        queryFn: () => barangayOfficialsService.getStatistics(),
        staleTime: 15 * 60 * 1000, // 15 minutes
    })
}

export function useBarangayOfficialSearch(searchTerm: string, enabled = true) {
    return useQuery({
        queryKey: barangayOfficialsKeys.search(searchTerm),
        queryFn: () => barangayOfficialsService.searchBarangayOfficials(searchTerm),
        enabled: enabled && searchTerm.trim().length >= 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useCreateBarangayOfficial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BarangayOfficialFormData) => barangayOfficialsService.createBarangayOfficial(data),
        onSuccess: (newBarangayOfficial: BarangayOfficial) => {
            queryClient.invalidateQueries({ queryKey: barangayOfficialsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: barangayOfficialsKeys.statistics() })
            queryClient.setQueryData(
                barangayOfficialsKeys.detail(newBarangayOfficial.id),
                newBarangayOfficial,
            );
        }
        ,
        onError: (error) => {
            console.error('Failed to create barangay official:', error);
        },
    });
}

export function useUpdateBarangayOfficial() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: BarangayOfficialFormData }) => 
            barangayOfficialsService.updateBarangayOfficial(id, data),
        onSuccess: (updatedBarangayOfficial: BarangayOfficial) => {
            queryClient.invalidateQueries({ queryKey: barangayOfficialsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: barangayOfficialsKeys.statistics() });
            queryClient.setQueryData(
                barangayOfficialsKeys.detail(updatedBarangayOfficial.id),
                updatedBarangayOfficial
            )
        }
        ,
        onError: (error) => {
            console.error('Failed to update barangay official :', error);
        },
    })
}

export function useDeleteBarangayOfficial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => barangayOfficialsService.deleteBarangayOfficial(id),
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: barangayOfficialsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: barangayOfficialsKeys.statistics() });
            queryClient.removeQueries({ queryKey: barangayOfficialsKeys.detail(deletedId) });
        },
        onError: (error) => {
            console.error('Failed to delete barangay official :', error);
        },
    });
}

export function useInfiniteBarangayOfficials(params: Omit<BarangayOfficialParams, 'page'> = {}) {
    return useInfiniteQuery({
        queryKey: ['barangayOfficials', 'infinite', params],
        queryFn: ({ pageParam = 1 }) =>
            barangayOfficialsService.getBarangayOfficials({ ...params, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.current_page < lastPage.last_page) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        })
}

