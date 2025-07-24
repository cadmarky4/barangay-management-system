import { useEffect, useState } from 'react';
import { useComplaint, useUpdateComplaint } from '@/services/helpDesk/complaints/useComplaints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { EditComplaintSchema, type EditComplaint } from '@/services/helpDesk/complaints/complaints.types';
import { useTranslation } from 'react-i18next';
import { useResidents } from '@/services/residents/useResidents';
import { residentsService } from '@/services/residents/residents.service';

interface UseComplaintModalProps {
  complaintId: string | null;
  onClose: () => void;
  mode: "view" | "edit"
  setMode: (mode: "view" | "edit") => void;
}

export const useComplaintModal = ({ complaintId, onClose, mode, setMode }: UseComplaintModalProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  // Form setup
  const form = useForm<EditComplaint>({
    resolver: zodResolver(EditComplaintSchema),
    defaultValues: {
      ticket: {},
      complaint: {}
    }
  });

  const { setValue, watch, handleSubmit, reset, formState: { errors, isDirty } } = form;

  // Fetch complaint data
  const { 
    data: complaint, 
    isLoading, 
    error,
    refetch 
  } = useComplaint(complaintId || '', !!complaintId);

  const [isResident, setIsResident] = useState(true);
  const [selectedResidentId, setSelectedResidentId]  = useState<string>('');
  const residentIdField = watch('ticket.resident_id');
  const searchResident = watch('ticket.resident_search');

  // Update complaint mutation
  const updateComplaintMutation = useUpdateComplaint();
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

  // Reset form when complaint data changes
  useEffect(() => {
    if (complaint) {

      // console.log(appointment);
      setIsResident(complaint.ticket.resident_id !== null && complaint.ticket.resident_id !== undefined);

      reset({
        ticket: {
          subject: complaint.ticket.subject,
          description: complaint.ticket.description,
          priority: complaint.ticket.priority,
          requester_name: complaint.ticket.requester_name,
          contact_number: complaint.ticket.contact_number,
          email_address: complaint.ticket.email_address,
          complete_address: complaint.ticket.complete_address,
          status: complaint.ticket.status,
        },
        complaint: {
          c_category: complaint.complaint.c_category,
          department: complaint.complaint.department,
          location: complaint.complaint.location
        }
      });
    }
  }, [complaint, reset]);

  const handleModeToggle = () => {
    setMode(mode === 'view' ? 'edit' : 'view');
  };

  const handleClose = () => {
    setMode('view');
    reset();
    onClose();
  };

  const handleSubmitForm = async (data: EditComplaint) => {
    if (!complaintId) return;

    try {
      await updateComplaintMutation.mutateAsync({
        id: complaintId,
        data
      });
      
      showNotification({
        type: 'success',
        title: t('helpDesk.complaintsForm.messages.updateSuccess'),
        duration: 3000,
        persistent: false,
      });
      
      setMode('view');
      refetch();
    } catch (error) {
      const errorMessage = (error as Error)?.message || t('helpDesk.complaintsForm.messages.updateError');
      showNotification({
        type: 'error',
        title: t('helpDesk.complaintsForm.messages.error'),
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
    complaint,
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
    isSubmitting: updateComplaintMutation.isPending,
    handleModeToggle,
    handleClose,
    handleSubmit: handleSubmit(handleSubmitForm),
    handleCancel,
  };
};