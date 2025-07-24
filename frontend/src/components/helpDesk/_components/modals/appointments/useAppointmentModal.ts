import { useEffect, useState } from "react";
import {
  useAppointment,
  useUpdateAppointment,
} from "@/services/helpDesk/appointments/useAppointments";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EditAppointmentSchema,
  type EditAppointment,
} from "@/services/helpDesk/appointments/appointments.types";
import { useNotifications } from "@/components/_global/NotificationSystem";
import { useTranslation } from "react-i18next";
import { useResidents } from "@/services/residents/useResidents";
import { residentsService } from "@/services/residents/residents.service";

interface UseAppointmentModalProps {
  appointmentId: string | null;
  mode: "view" | "edit"
  setMode: (mode: "view" | "edit") => void;
  onClose: () => void;
}

export const useAppointmentModal = ({
  appointmentId,
  mode,
  setMode,
  onClose,
}: UseAppointmentModalProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  // Form setup
  const form = useForm<EditAppointment>({
    resolver: zodResolver(EditAppointmentSchema),
    defaultValues: {
      ticket: {},
      appointment: {}
    }
  });

  const {
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  // Fetch appointment data
  const {
    data: appointment,
    isLoading,
    error,
    refetch,
  } = useAppointment(appointmentId || "", !!appointmentId);

  const [isResident, setIsResident] = useState(true);
  const [selectedResidentId, setSelectedResidentId]  = useState<string>('');
  const residentIdField = watch('ticket.resident_id');
  const searchResident = watch('ticket.resident_search');

  // Update appointment mutation
  const updateAppointmentMutation = useUpdateAppointment();
  const { data: filteredResidents, isLoading: isLoadingResidents, error: residentsError } = useResidents({ search: searchResident || "" });

  useEffect(() => {
    setValue('ticket.resident_id', null);
    setValue('ticket.requester_name', "");
    setValue('ticket.contact_number', "");
    setValue('ticket.email_address', "");
    setValue('ticket.complete_address', "");
    setSelectedResidentId('');
    console.log(appointment);
  }, [isResident])

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

  // Reset form when appointment data changes
  useEffect(() => {
    if (!appointment || !appointment.appointment) {
      return; // Exit early if appointment data is not available
    }

    if (appointment) {
      const isoDate = appointment.appointment.date;
      const dateObj = new Date(isoDate);

      // Pad month and day with leading zeros if needed
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");

      const formattedDate = `${yyyy}-${mm}-${dd}`;

      // console.log(appointment);
      setIsResident(appointment.ticket.resident_id !== null && appointment.ticket.resident_id !== undefined);
      
      // console.log("APP",appointment);
      if (appointment) {
        reset({
          ticket: {
            subject: appointment.ticket.subject,
            description: appointment.ticket.description,
            priority: appointment.ticket.priority,
            requester_name: appointment.ticket.requester_name,
            contact_number: appointment.ticket.contact_number,
            email_address: appointment.ticket.email_address,
            complete_address: appointment.ticket.complete_address,
            status: appointment.ticket.status,
          },
          appointment: {
            department: appointment.appointment.department,
            date: formattedDate,
            time: appointment.appointment.time,
            additional_notes: appointment.appointment.additional_notes,
          },
        });
        setValue('ticket.resident_id', appointment.ticket.resident_id);
      }
    }
  }, [appointment, reset]);

  const handleModeToggle = () => {
    setMode(mode === "view" ? "edit" : "view");
  };

  const handleClose = () => {
    setMode("view");
    reset();
    onClose();
  };

  const handleSubmiForm = async (data: EditAppointment) => {
    if (!appointmentId) return;
    // console.log("ERRORS")
    try {
      if (!appointmentId) throw new Error("Ticket ID is null");
      // console.log("ERRORS")
      // console.log(form.formState.errors);
      await updateAppointmentMutation.mutateAsync({ id: appointmentId, data });
      showNotification({
        type: 'success',
        title: t('helpDesk.appointmentsForm.messages.updateSuccess'),
        // message: t('helpDesk.appointmentsForm.messages.updateSuccess'),
        duration: 3000,
        persistent: false,
      });

      setMode('view');
      refetch();
    } catch (error) {
      const errorMessage = (error as Error)?.message || t('helpDesk.appointmentsForm.messages.updateError');
      showNotification({
        type: 'error',
        title: t('helpDesk.appointmentsForm.messages.error'),
        message: errorMessage,
        duration: 3000,
        persistent: false,
      });
      console.error('Form submission error:', error);
    } 
  };

  const handleCancel = () => {
    reset();
    setMode("view");
  };

  return {
    appointment,
    isLoading,

    // RESIDENT STUFF
    isResident,
    setIsResident,
    searchResident,
    filteredResidents,
    isLoadingResidents,
    residentsError,
    residentIdField,
    setSelectedResidentId,

    error,
    mode,
    form,
    errors,
    isDirty,
    isSubmitting: updateAppointmentMutation.isPending,
    handleModeToggle,
    handleClose,
    handleSubmit: handleSubmit(handleSubmiForm),
    handleCancel,
  };
};