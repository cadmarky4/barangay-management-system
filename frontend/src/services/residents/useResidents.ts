// Mali yung file path btw
// ============================================================================
// hooks/residents/use-residents.ts - TanStack Query hooks
// ============================================================================

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  useInfiniteQuery 
} from '@tanstack/react-query';

import { useNotifications } from '@/components/_global/NotificationSystem';
import type { Resident, ResidentParams, ResidentFormData } from './residents.types';
import { residentsService } from '@/services/residents/residents.service';
import { useTranslation } from 'react-i18next';

// Query keys
export const residentsKeys = {
  all: ['residents'] as const,
  lists: () => [...residentsKeys.all, 'list'] as const,
  list: (params: ResidentParams) => [...residentsKeys.lists(), params] as const,
  details: () => [...residentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...residentsKeys.details(), id] as const,
  statistics: () => [...residentsKeys.all, 'statistics'] as const,
  ageGroups: () => [...residentsKeys.all, 'ageGroups'] as const,
  search: (term: string) => [...residentsKeys.all, 'search', term] as const,
  specialLists: () => [...residentsKeys.all, 'specialLists'] as const,
  seniorCitizens: () => [...residentsKeys.specialLists(), 'seniors'] as const,
  pwd: () => [...residentsKeys.specialLists(), 'pwd'] as const,
  fourPs: () => [...residentsKeys.specialLists(), 'fourPs'] as const,
  householdHeads: () => [...residentsKeys.specialLists(), 'householdHeads'] as const,
};

// Queries
export function useResidents(params: ResidentParams = {}) {
  return useQuery({
    queryKey: residentsKeys.list(params),
    queryFn: () => residentsService.getResidents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useResident(id: string, enabled = true) {
  return useQuery({
    queryKey: residentsKeys.detail(id),
    queryFn: () => residentsService.getResident(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useResidentStatistics() {
  return useQuery({
    queryKey: residentsKeys.statistics(),
    queryFn: () => residentsService.getStatistics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useAgeGroupStatistics() {
  return useQuery({
    queryKey: residentsKeys.ageGroups(),
    queryFn: () => residentsService.getAgeGroupStatistics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useResidentSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: residentsKeys.search(searchTerm),
    queryFn: () => residentsService.searchResidents(searchTerm),
    enabled: enabled && searchTerm.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Special lists
export function useSeniorCitizens() {
  return useQuery({
    queryKey: residentsKeys.seniorCitizens(),
    queryFn: () => residentsService.getSeniorCitizens(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePWD() {
  return useQuery({
    queryKey: residentsKeys.pwd(),
    queryFn: () => residentsService.getPWD(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFourPs() {
  return useQuery({
    queryKey: residentsKeys.fourPs(),
    queryFn: () => residentsService.getFourPs(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHouseholdHeads() {
  return useQuery({
    queryKey: residentsKeys.householdHeads(),
    queryFn: () => residentsService.getHouseholdHeads(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutations
export function useCreateResident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (data: ResidentFormData) => residentsService.createResident(data),
    onSuccess: (newResident: Resident) => {
      queryClient.invalidateQueries({ queryKey: residentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: residentsKeys.statistics() });
      queryClient.setQueryData(
        residentsKeys.detail(newResident.id),
        newResident
      );
    },
    onError: (error) => {
      const title = t('residents.form.messages.createErrorTitle');
      const message = t('residents.form.messages.createError');

      showNotification({
        type: 'error',
        title: title,
        message: message,
      });

      console.error('Create Resident Error:', error);
    },
  });
}

export function useUpdateResident() {
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResidentFormData }) =>
      residentsService.updateResident(id, data),
    onSuccess: (updatedResident: Resident) => {
      queryClient.invalidateQueries({ queryKey: residentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: residentsKeys.statistics() });
      queryClient.setQueryData(
        residentsKeys.detail(updatedResident.id),
        updatedResident
      );
    },
    onError: (error) => {
      const title = t('residents.form.messages.updateErrorTitle');
      const message = t('residents.form.messages.updateError');
      showNotification({
        type: 'error',
        title: title,
        message: message,
      });
      console.error('Update Resident Error:', error);
      // Handle error notification or logging here
    },
  });
}

export function useDeleteResident() {
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: (id: string) => residentsService.deleteResident(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: residentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: residentsKeys.statistics() });
      queryClient.removeQueries({ queryKey: residentsKeys.detail(deletedId) });
    },
    onError: (error) => {
      const title = t('residents.messages.deleteErrorTitle');
      const message = t('residents.messages.deleteError');
      showNotification({
        type: 'error',
        title: title,
        message: message,
      });
      console.error('Delete Resident Error:', error);
    },
  });
}

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, photo }: { id: string; photo: File }) =>
      residentsService.uploadProfilePhoto(id, photo),
    onSuccess: (updatedResident: Resident) => {
      queryClient.setQueryData(
        residentsKeys.detail(updatedResident.id),
        updatedResident
      );
      queryClient.invalidateQueries({ queryKey: residentsKeys.lists() });
    },
    onError: (error) => {
      const title = t('residents.form.messages.uploadErrorTitle');
      const message = t('residents.form.messages.uploadError');

      showNotification({
        type: 'error',
        title: title,
        message: message,
      });

      console.error('Upload Profile Photo Error:', error);
    },
  });
}

// Infinite query for large datasets
export function useInfiniteResidents(params: Omit<ResidentParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['residents', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      residentsService.getResidents({ ...params, page: pageParam }),
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