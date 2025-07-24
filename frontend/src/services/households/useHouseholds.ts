// ============================================================================
// hooks/households/use-households.ts - TanStack Query hooks
// ============================================================================

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  useInfiniteQuery 
} from '@tanstack/react-query';

import { useNotifications } from '@/components/_global/NotificationSystem';
import type { Household, HouseholdParams, HouseholdFormData } from './households.types';
import { householdsService } from '@/services/households/households.service';
import { useTranslation } from 'react-i18next';

// Query keys
export const householdsKeys = {
  all: ['households'] as const,
  lists: () => [...householdsKeys.all, 'list'] as const,
  list: (params: HouseholdParams) => [...householdsKeys.lists(), params] as const,
  details: () => [...householdsKeys.all, 'detail'] as const,
  detail: (id: string) => [...householdsKeys.details(), id] as const,
  statistics: () => [...householdsKeys.all, 'statistics'] as const,
  search: (term: string) => [...householdsKeys.all, 'search', term] as const,
  specialLists: () => [...householdsKeys.all, 'specialLists'] as const,
  fourPs: () => [...householdsKeys.specialLists(), 'fourPs'] as const,
  withSeniorCitizens: () => [...householdsKeys.specialLists(), 'withSeniorCitizens'] as const,
  withPWD: () => [...householdsKeys.specialLists(), 'withPWD'] as const,
  byType: (householdType: string, barangay?: string) => [...householdsKeys.specialLists(), 'byType', householdType, barangay] as const,
  byOwnership: (ownershipStatus: string, barangay?: string) => [...householdsKeys.specialLists(), 'byOwnership', ownershipStatus, barangay] as const,
  byBarangay: (barangay: string) => [...householdsKeys.all, 'byBarangay', barangay] as const,
  byHead: (headResidentId: string) => [...householdsKeys.all, 'byHead', headResidentId] as const,
};

// Queries
export function useHouseholds(params: HouseholdParams = {}) {
  return useQuery({
    queryKey: householdsKeys.list(params),
    queryFn: () => householdsService.getHouseholds(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useHousehold(id: string, enabled = true) {
  return useQuery({
    queryKey: householdsKeys.detail(id),
    queryFn: () => householdsService.getHousehold(id),
    enabled: enabled && !!id && id.trim().length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHouseholdStatistics() {
  return useQuery({
    queryKey: householdsKeys.statistics(),
    queryFn: () => householdsService.getStatistics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useHouseholdSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: householdsKeys.search(searchTerm),
    queryFn: () => householdsService.searchHouseholds(searchTerm),
    enabled: enabled && searchTerm.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCheckHouseholdDuplicate(completeAddress: string, headResidentId?: string, enabled = true) {
  return useQuery({
    queryKey: ['households', 'checkDuplicate', completeAddress, headResidentId],
    queryFn: () => householdsService.checkDuplicate(completeAddress, headResidentId),
    enabled: enabled && completeAddress.trim().length >= 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useHouseholdsByBarangay(barangay: string, enabled = true) {
  return useQuery({
    queryKey: householdsKeys.byBarangay(barangay),
    queryFn: () => householdsService.getHouseholdsByBarangay(barangay),
    enabled: enabled && !!barangay.trim(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHouseholdsByHead(headResidentId: string, enabled = true) {
  return useQuery({
    queryKey: householdsKeys.byHead(headResidentId),
    queryFn: () => householdsService.getHouseholdsByHead(headResidentId),
    enabled: enabled && !!headResidentId && headResidentId.trim().length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Special lists
export function useFourPsHouseholds() {
  return useQuery({
    queryKey: householdsKeys.fourPs(),
    queryFn: () => householdsService.getFourPsHouseholds(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHouseholdsWithSeniorCitizens() {
  return useQuery({
    queryKey: householdsKeys.withSeniorCitizens(),
    queryFn: () => householdsService.getHouseholdsWithSeniorCitizens(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHouseholdsWithPWD() {
  return useQuery({
    queryKey: householdsKeys.withPWD(),
    queryFn: () => householdsService.getHouseholdsWithPWD(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHouseholdsByType(householdType: string, barangay?: string, enabled = true) {
  return useQuery({
    queryKey: householdsKeys.byType(householdType, barangay),
    queryFn: () => householdsService.getHouseholdsByType(householdType, barangay),
    enabled: enabled && !!householdType.trim(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHouseholdsByOwnership(ownershipStatus: string, barangay?: string, enabled = true) {
  return useQuery({
    queryKey: householdsKeys.byOwnership(ownershipStatus, barangay),
    queryFn: () => householdsService.getHouseholdsByOwnership(ownershipStatus, barangay),
    enabled: enabled && !!ownershipStatus.trim(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutations
export function useCreateHousehold() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (data: HouseholdFormData) => householdsService.createHousehold(data),
    onSuccess: (newHousehold: Household) => {
      queryClient.invalidateQueries({ queryKey: householdsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: householdsKeys.statistics() });
      queryClient.setQueryData(
        householdsKeys.detail(newHousehold.id),
        newHousehold
      );
    },
    onError: (error) => {
      const title = t('households.form.messages.createErrorTitle');
      const message = t('households.form.messages.createError');

      showNotification({
        type: 'error',
        title: title,
        message: message,
      });

      console.error('Create Household Error:', error);
    },
  });
}

export function useUpdateHousehold() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HouseholdFormData }) =>
      householdsService.updateHousehold(id, data),
    onSuccess: (updatedHousehold: Household) => {
      queryClient.invalidateQueries({ queryKey: householdsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: householdsKeys.statistics() });
      queryClient.setQueryData(
        householdsKeys.detail(updatedHousehold.id),
        updatedHousehold
      );
    },
    onError: (error) => {
      const title = t('households.form.messages.updateErrorTitle');
      const message = t('households.form.messages.updateError');
      showNotification({
        type: 'error',
        title: title,
        message: message,
      });
      console.error('Update Household Error:', error);
    },
  });
}

export function useDeleteHousehold() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (id: string) => householdsService.deleteHousehold(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: householdsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: householdsKeys.statistics() });
      queryClient.removeQueries({ queryKey: householdsKeys.detail(deletedId) });
    },
    onError: (error) => {
      const title = t('households.messages.deleteErrorTitle');
      const message = t('households.messages.deleteError');
      showNotification({
        type: 'error',
        title: title,
        message: message,
      });
      console.error('Delete Household Error:', error);
    },
  });
}

// Infinite query for large datasets
export function useInfiniteHouseholds(params: Omit<HouseholdParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['households', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      householdsService.getHouseholds({ ...params, page: pageParam }),
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