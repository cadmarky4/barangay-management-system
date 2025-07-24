import { useNotifications } from "@/components/_global/NotificationSystem";
import { appointmentsService } from "@/services/helpDesk/appointments/appointments.service";
import { CreateAppointmentSchema, type CheckScheduleAvailability, type CreateAppointment } from "@/services/helpDesk/appointments/appointments.types";
import { useCreateAppointment } from "@/services/helpDesk/appointments/useAppointments";
import { residentsService } from "@/services/residents/residents.service";
import { useResidents } from "@/services/residents/useResidents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface useCreateAppointmentFormProps {
    onSuccess?: () => void;
}

export function useCreateAppointmentForm ({ onSuccess }: useCreateAppointmentFormProps) {
    const { t } = useTranslation();
    const { showNotification } = useNotifications();
    const [isScheduleUnavailableWarning, setIsScheduleUnavailableWarning] = useState<string | null>(null);

    const form = useForm<CreateAppointment>({
        resolver: zodResolver(CreateAppointmentSchema),
        mode: 'onBlur',
    })

    const { watch, setValue } = form;
    const [selectedResidentId, setSelectedResidentId]  = useState<string>('');
    const residentIdField = watch('ticket.resident_id');
    const searchResident = watch('ticket.resident_search');
    // real-time validation of booked schedule
    // NO implementation for now
    // const date = watch('appointment.date');
    // const time = watch('appointment.time');
    // const department = watch('appointment.department')

    // PALAGING  APPOINTMENT TO
    setValue("ticket.category", "APPOINTMENT");

    const { data: filteredResidents, isLoading: isLoadingResidents, error: residentsError } = useResidents({ search: searchResident || "" });

    const createAppointment = useCreateAppointment();
    const [isResident, setIsResident] = useState(false);
    
    useEffect(() => {
        setValue('ticket.resident_id', null);
        setValue('ticket.resident_id', null);
        setValue('ticket.requester_name', "");
        setValue('ticket.contact_number', "");
        setValue('ticket.email_address', "");
        setValue('ticket.complete_address', "");
        setSelectedResidentId('');
    }, [isResident])

    // real-time validation of booked schedule
    // NO implementation for now
    // useEffect(() => {
    //     if (date && time) {
    //         const timeoutId = setTimeout(() => {
    //             (async () => {
    //                 const res = await appointmentsService.isScheduleVacant({date: date, time: time, department: department} as CheckScheduleAvailability);
    //                 if (res !== true) {
    //                     setIsScheduleUnavailableWarning(t('helpDesk.appointmentsForm.validation.scheduleAlreadyBooked'));
    //                 }
    //             })();
    //         }, 1000);
    
    //         return () => clearTimeout(timeoutId);      
    //     }
    // }, [date, time])

    // selects the resident
    // The effect won't re-execute unless residentId changes.
    useEffect(() => {
        if (selectedResidentId.trim().length !== 0) {
            const timeoutId = setTimeout(() => {
                (async () => {
                    // backend search
                    const res = await residentsService.getResident(
                        selectedResidentId
                        );
                    console.log(res);
                    // frontend search
                    // const res = residents?.data.find(resident => 
                    //     resident.id === (residentId ? Number(residentId) : -1)
                    // );
                    // backend search

                    setValue('ticket.resident_id', selectedResidentId)
                    setValue('ticket.requester_name', res.first_name + " " + (res.middle_name ? res.middle_name + " " : '') + res.last_name);
                    setValue('ticket.contact_number', res.mobile_number || "");
                    setValue('ticket.email_address', res.email_address || "");
                    setValue('ticket.complete_address', res.complete_address);
                })();
            }, 1000);
    
            return () => clearTimeout(timeoutId);
        }
    }, [selectedResidentId]);

    const handleSubmit = form.handleSubmit(async (data: CreateAppointment) => {
        try {
            await createAppointment.mutateAsync(data);
                showNotification({
                    type: 'success',
                    title: t('helpDesk.appointmentsForm.messages.createSuccess'),
                    message: t('helpDesk.appointmentsForm.messages.createSuccess'),
                    duration: 3000,
                    persistent: false,
                });
            onSuccess?.();
            
        } catch (error) {
            const errorMessage = (error as Error)?.message || t('helpDesk.appointmentsForm.messages.createError');
            showNotification({
              type: 'error',
              title: t('helpDesk.appointmentsForm.messages.error'),
              message: errorMessage,
              duration: 3000,
              persistent: false,
            });
            console.error('Form submission error:', error);
        }
    });

    return {
        form,
        isResident,
        setIsResident,
        searchResident,
        filteredResidents,
        isLoadingResidents,
        residentsError,
        isSubmitting: createAppointment.isPending,
        residentIdField,
        isScheduleUnavailableWarning,
        setSelectedResidentId,
        handleSubmit,
    }
}