import { 
    useQuery, 
    useMutation, 
    useQueryClient, 
} from '@tanstack/react-query';
import type {  
    ViewAppointment, 
    CreateAppointment, 
    EditAppointment,
    CheckScheduleAvailability 
} from '@/services/helpDesk/appointments/appointments.types';
import { appointmentsService } from '@/services/helpDesk/appointments/appointments.service';
import { helpDeskKeys } from '../useHelpDesk';

// Query keys factory
export const appointmentsKeys = {
    all: ['appointments'] as const,
    lists: () => [...appointmentsKeys.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...appointmentsKeys.lists(), params] as const,
    details: () => [...appointmentsKeys.all, 'detail'] as const,
    detail: (id: string) => [...appointmentsKeys.details(), id] as const,
    scheduleCheck: (schedule: CheckScheduleAvailability) => [...appointmentsKeys.all, 'schedule-check', schedule] as const,
    statistics: () => [...appointmentsKeys.all, 'statistics'] as const,
    search: (term: string) => [...appointmentsKeys.all, 'search', term] as const,
}

/**
 * Hook to fetch a specific appointment by ID
 */
export function useAppointment(id: string, enabled = true) {
    return useQuery({
        queryKey: appointmentsKeys.detail(id),
        queryFn: () => appointmentsService.viewAppointment(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAppointment) => appointmentsService.createAppointment(data),
        onSuccess: (newAppointment: ViewAppointment) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.statistics() });
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.statistics() }) // this one does the REAL thing
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() })
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.detail(newAppointment.ticket.id!) })
            
            // Set the new appointment data in cache
            // queryClient.setQueryData(
            //     appointmentsKeys.detail(newAppointment.ticket.id!),
            //     {
            //         ticket: newAppointment.ticket,
            //         appointment: newAppointment.appointment
            //     } as ViewAppointment
            // );
        },
        onError: (error) => {
            console.error('Failed to create appointment:', error);
        },
    });
}

/**
 * Hook to update an existing appointment
 */
export function useUpdateAppointment() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: EditAppointment }) => 
            appointmentsService.updateAppointment(id, data),
        onSuccess: (_: ViewAppointment, { id }) => {
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.statistics() }); // does not really do anything lol
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.statistics() }) // this one does the REAL thing
            queryClient.invalidateQueries({ queryKey: helpDeskKeys.lists() })
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.detail(id) })

            // queryClient.setQueryData(
            //     appointmentsKeys.detail(id),
            //     {
            //         ticket: updatedAppoinment.ticket,
            //         appointment: updatedAppoinment.appointment
            //     } as ViewAppointment
            // );
        },
        onError: (error) => {
            console.error('Failed to update appointment:', error);
        },
    });
}

/**
 * Hook to check if a schedule is available
 */
export function useCheckScheduleAvailability(schedule: CheckScheduleAvailability, enabled = true) {
    return useQuery({
        queryKey: appointmentsKeys.scheduleCheck(schedule),
        queryFn: () => appointmentsService.isScheduleVacant(schedule),
        enabled: enabled && !!schedule.date && !!schedule.time,
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 1,
    });
}

/**
 * Hook to check schedule availability with mutation (for manual checking)
 */
export function useCheckScheduleAvailabilityMutation() {
    return useMutation({
        mutationFn: (schedule: CheckScheduleAvailability) => 
            appointmentsService.isScheduleVacant(schedule),
        onError: (error) => {
            console.error('Failed to check schedule availability:', error);
        },
    });
}

// /**
//  * Hook to prefetch an appointment (useful for preloading)
//  */
// export function usePrefetchAppointment() {
//     const queryClient = useQueryClient();

//     return (id: string) => {
//         queryClient.prefetchQuery({
//             queryKey: appointmentsKeys.detail(id),
//             queryFn: () => appointmentsService.ViewAppointment(id),
//             staleTime: 5 * 60 * 1000,
//         });
//     };
// }

// /**
//  * Hook to invalidate appointment queries (useful for manual cache invalidation)
//  */
// export function useInvalidateAppointments() {
//     const queryClient = useQueryClient();

//     return {
//         invalidateAll: () => queryClient.invalidateQueries({ queryKey: appointmentsKeys.all }),
//         invalidateLists: () => queryClient.invalidateQueries({ queryKey: appointmentsKeys.lists() }),
//         invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: appointmentsKeys.detail(id) }),
//         invalidateStatistics: () => queryClient.invalidateQueries({ queryKey: appointmentsKeys.statistics() }),
//     };
// }