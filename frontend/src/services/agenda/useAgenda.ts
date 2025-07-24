// ============================================================================
// services/agenda/useAgenda.ts - React Query hooks for agenda management
// ============================================================================

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
} from '@tanstack/react-query';

import type {  
  AgendaParams,
  AgendaFormData,
  UpdateAgendaStatus
} from '@/services/agenda/agenda.types';
import { agendaService } from '@/services/agenda/agenda.service';

// Query keys factory
export const agendaKeys = {
  all: ['agendas'] as const,
  lists: () => [...agendaKeys.all, 'list'] as const,
  list: (params?: AgendaParams) => [...agendaKeys.lists(), params] as const,
  details: () => [...agendaKeys.all, 'detail'] as const,
  detail: (id: string) => [...agendaKeys.details(), id] as const,
  statistics: () => [...agendaKeys.all, 'statistics'] as const,
  calendar: (month?: number, year?: number) => [...agendaKeys.all, 'calendar', month, year] as const,
  dateRange: (from: string, to: string) => [...agendaKeys.all, 'date-range', from, to] as const,
  upcoming: (days: number) => [...agendaKeys.all, 'upcoming', days] as const,
  today: () => [...agendaKeys.all, 'today'] as const,
  search: (query: string) => [...agendaKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch paginated agendas list
 */
export function useAgendas(params?: AgendaParams, enabled = true) {
  return useQuery({
    queryKey: agendaKeys.list(params),
    queryFn: () => agendaService.getAgendas(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a specific agenda by ID
 */
export function useAgenda(id: string, enabled = true) {
  return useQuery({
    queryKey: agendaKeys.detail(id),
    queryFn: () => agendaService.getAgenda(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch agenda statistics
 */
export function useAgendaStatistics(enabled = true) {
  return useQuery({
    queryKey: agendaKeys.statistics(),
    queryFn: () => agendaService.getStatistics(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch calendar events
 */
export function useCalendarEvents(month?: number, year?: number, enabled = true) {
  return useQuery({
    queryKey: agendaKeys.calendar(month, year),
    queryFn: () => agendaService.getCalendarEvents(month, year),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch agendas by date range
 */
export function useAgendasByDateRange(dateFrom: string, dateTo: string, enabled = true) {
  return useQuery({
    queryKey: agendaKeys.dateRange(dateFrom, dateTo),
    queryFn: () => agendaService.getAgendasByDateRange(dateFrom, dateTo),
    enabled: enabled && !!dateFrom && !!dateTo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch today's agendas
 */
export function useTodaysAgendas(enabled = true) {
  return useQuery({
    queryKey: agendaKeys.today(),
    queryFn: () => agendaService.getTodaysAgendas(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch upcoming agendas
 */
export function useUpcomingAgendas(days: number = 7, enabled = true) {
  return useQuery({
    queryKey: agendaKeys.upcoming(days),
    queryFn: () => agendaService.getUpcomingAgendas(days),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search agendas
 */
export function useSearchAgendas(query: string, enabled = true) {
  return useQuery({
    queryKey: agendaKeys.search(query),
    queryFn: () => agendaService.searchAgendas(query),
    enabled: enabled && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new agenda
 */
export function useCreateAgenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AgendaFormData) => agendaService.createAgenda(data),
    onSuccess: (newAgenda) => {
      // Invalidate and refetch agenda lists
      queryClient.invalidateQueries({ queryKey: agendaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.calendar() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.today() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.upcoming(7) });
      
      // Add the new agenda to the cache
      queryClient.setQueryData(agendaKeys.detail(newAgenda.id), newAgenda);
    },
    onError: (error) => {
      console.error('Failed to create agenda:', error);
    },
  });
}

/**
 * Hook to update an existing agenda
 */
export function useUpdateAgenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AgendaFormData> }) =>
      agendaService.updateAgenda(id, data),
    onSuccess: (updatedAgenda) => {
      // Update the agenda in cache
      queryClient.setQueryData(agendaKeys.detail(updatedAgenda.id), updatedAgenda);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: agendaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.calendar() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.today() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.upcoming(7) });
    },
    onError: (error) => {
      console.error('Failed to update agenda:', error);
    },
  });
}

/**
 * Hook to update agenda status
 */
export function useUpdateAgendaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgendaStatus }) =>
      agendaService.updateAgendaStatus(id, data),
    onSuccess: (updatedAgenda) => {
      // Update the agenda in cache
      queryClient.setQueryData(agendaKeys.detail(updatedAgenda.id), updatedAgenda);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: agendaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.calendar() });
    },
    onError: (error) => {
      console.error('Failed to update agenda status:', error);
    },
  });
}

/**
 * Hook to delete an agenda
 */
export function useDeleteAgenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agendaService.deleteAgenda(id),
    onSuccess: (_, deletedId) => {
      // Remove the agenda from cache
      queryClient.removeQueries({ queryKey: agendaKeys.detail(deletedId) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: agendaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.calendar() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.today() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.upcoming(7) });
    },
    onError: (error) => {
      console.error('Failed to delete agenda:', error);
    },
  });
}

/**
 * Hook to duplicate an agenda
 */
export function useDuplicateAgenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDate }: { id: string; newDate?: string }) =>
      agendaService.duplicateAgenda(id, newDate),
    onSuccess: (duplicatedAgenda) => {
      // Add the duplicated agenda to cache
      queryClient.setQueryData(agendaKeys.detail(duplicatedAgenda.id), duplicatedAgenda);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: agendaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaKeys.calendar() });
    },
    onError: (error) => {
      console.error('Failed to duplicate agenda:', error);
    },
  });
}

/**
 * Hook to export agendas
 */
export function useExportAgendas() {
  return useMutation({
    mutationFn: (params?: AgendaParams) => agendaService.exportAgendas(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agendas-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Failed to export agendas:', error);
    },
  });
}
