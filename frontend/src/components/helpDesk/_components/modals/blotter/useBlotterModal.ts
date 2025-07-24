import { useEffect, useState } from 'react';
import { useBlotter, useUpdateBlotter } from '@/services/helpDesk/blotters/useBlotter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { EditBlotterSchema, type EditBlotter } from '@/services/helpDesk/blotters/blotters.types';
import { useTranslation } from 'react-i18next';
import { useResidents } from '@/services/residents/useResidents';
import { residentsService } from '@/services/residents/residents.service';

interface UseBlotterModalProps {
  blotterId: string | null;
  mode: "view" | "edit",
  onClose: () => void;
  setMode: (mode: "view" | "edit") => void;
}

export const useBlotterModal = ({ blotterId, mode, setMode, onClose }: UseBlotterModalProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();
  
  // Form setup
  const form = useForm<EditBlotter>({
    resolver: zodResolver(EditBlotterSchema),
    defaultValues: {
      ticket: {},
      blotter: {}
    }
  });

  const { setValue, watch, handleSubmit, reset, formState: { errors, isDirty } } = form;

  // Fetch blotter data
  const { 
    data: blotter, 
    isLoading, 
    error,
    refetch,
  } = useBlotter(blotterId || '', !!blotterId);

  const [isResident, setIsResident] = useState(true);
  const [selectedResidentId, setSelectedResidentId]  = useState<string>('');
  const residentIdField = watch('ticket.resident_id');
  const searchResident = watch('ticket.resident_search');

  // Update blotter mutation
  const updateBlotterMutation = useUpdateBlotter();
  const { data: filteredResidents, isLoading: isLoadingResidents, error: residentsError } = useResidents({ search: searchResident || "" });

  useEffect(() => {
    setValue('ticket.resident_id', null);
    setValue('ticket.requester_name', "");
    setValue('ticket.contact_number', "");
    setValue('ticket.email_address', "");
    setValue('ticket.complete_address', "");
    setSelectedResidentId('');

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

  // Reset form when blotter data changes
  useEffect(() => {
    const isoDate = blotter?.blotter.date_of_incident || new Date();
    const dateObj = new Date(isoDate);

    // Pad month and day with leading zeros if needed
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");

    const formattedDate = `${yyyy}-${mm}-${dd}`;

    // console.log(blotter);
    setIsResident(blotter?.ticket.resident_id !== null && blotter?.ticket.resident_id !== undefined);

    if (isResident && blotter) {
      setValue('ticket.resident_id', selectedResidentId)
      setValue('ticket.requester_name', blotter.ticket.requester_name);
      setValue('ticket.contact_number', blotter.ticket.contact_number)
      setValue('ticket.email_address', blotter.ticket.email_address);
      setValue('ticket.complete_address', blotter.ticket.complete_address);
    }

    if (blotter) {
      reset({
        ticket: {
          subject: blotter.ticket.subject,
          description: blotter.ticket.description,
          priority: blotter.ticket.priority,
          requester_name: blotter.ticket.requester_name,
          contact_number: blotter.ticket.contact_number,
          email_address: blotter.ticket.email_address,
          complete_address: blotter.ticket.complete_address,
          status: blotter.ticket.status,
        },
        blotter: {
          type_of_incident: blotter.blotter.type_of_incident,
          date_of_incident: formattedDate,
          time_of_incident: blotter.blotter.time_of_incident,
          location_of_incident: blotter.blotter.location_of_incident,
          other_people_involved: blotter.blotter.other_people_involved,
          supporting_documents: blotter.blotter.supporting_documents
        }
      });
      // console.log(blotter)
    }
  }, [blotter, reset]);

  const handleModeToggle = () => {
    setMode(mode === 'view' ? 'edit' : 'view');
  };

  const handleClose = () => {
    setMode('view');
    reset();
    onClose();
  };

  const handleSubmitForm = async (data: EditBlotter) => {
    if (!blotterId) return;

    try {
      await updateBlotterMutation.mutateAsync({
        id: blotterId,
        data
      });
      
      showNotification({
        type: 'success',
        title: t('helpDesk.blotterForm.messages.updateSuccess'),
        duration: 3000,
        persistent: false,
      });
      
      setMode('view');
      refetch();
    } catch (error) {
      const errorMessage = (error as Error)?.message || t('helpDesk.blotterForm.messages.updateError');
      showNotification({
        type: 'error',
        title: t('helpDesk.blotterForm.messages.error'),
        message: errorMessage,
        duration: 3000,
        persistent: false,
      });
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    reset();
    setMode('view');
  };

  return {
    blotter,
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
    isSubmitting: updateBlotterMutation.isPending,
    handleModeToggle,
    handleClose,
    handleSubmit: handleSubmit(handleSubmitForm),
    handleCancel,
  };
};