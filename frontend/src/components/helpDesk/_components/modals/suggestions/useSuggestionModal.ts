// ============================================================================
// hooks/suggestions/useSuggestionModal.ts - Modal state management hook
// ============================================================================

import { useEffect, useState } from 'react';
import { useSuggestion, useUpdateSuggestion } from '@/services/helpDesk/suggestions/useSuggestions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { EditSuggestionSchema, type EditSuggestion } from '@/services/helpDesk/suggestions/suggestions.types';
import { useTranslation } from 'react-i18next';
import { useResidents } from '@/services/residents/useResidents';
import { residentsService } from '@/services/residents/residents.service';

interface UseSuggestionModalProps {
  suggestionId: string | null;
  onClose: () => void;
  mode: "view" | "edit",
  setMode: (mode: "view" | "edit") => void;
}

export const useSuggestionModal = ({ suggestionId, onClose, mode, setMode }: UseSuggestionModalProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();

  // Form setup
  const form = useForm<EditSuggestion>({
    resolver: zodResolver(EditSuggestionSchema),
    defaultValues: {
      ticket: {},
      suggestion: {}
    }
  });

  const { setValue, watch, handleSubmit, reset, formState: { errors, isDirty } } = form;
  
  // Fetch suggestion data
  const { 
    data: suggestion, 
    isLoading, 
    error,
    refetch 
  } = useSuggestion(suggestionId || '', !!suggestionId);

  const [isResident, setIsResident] = useState(true);
  const [selectedResidentId, setSelectedResidentId]  = useState<string>('');
  const residentIdField = watch('ticket.resident_id');
  const searchResident = watch('ticket.resident_search');

  // Update suggestion mutation
  const updateSuggestionMutation = useUpdateSuggestion();
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

  // Reset form when suggestion data changes
  useEffect(() => {
    if (suggestion) {

      // console.log(appointment);
      setIsResident(suggestion.ticket.resident_id !== null && suggestion.ticket.resident_id !== undefined);

      reset({
        ticket: {
          subject: suggestion.ticket.subject,
          description: suggestion.ticket.description,
          priority: suggestion.ticket.priority,
          requester_name: suggestion.ticket.requester_name,
          contact_number: suggestion.ticket.contact_number,
          email_address: suggestion.ticket.email_address,
          complete_address: suggestion.ticket.complete_address,
          status: suggestion.ticket.status,
        },
        suggestion: {
          s_category: suggestion.suggestion.s_category,
          expected_benefits: suggestion.suggestion.expected_benefits,
          implementation_ideas: suggestion.suggestion.implementation_ideas,
          resources_needed: suggestion.suggestion.resources_needed
        }
      });
    }
  }, [suggestion, reset]);

  const handleModeToggle = () => {
    setMode(mode === 'view' ? 'edit' : 'view');
  };

  const handleClose = () => {
    setMode('view');
    reset();
    onClose();
  };

  const handleSubmitForm = async (data: EditSuggestion) => {
    console.log("HEREEE");
    if (!suggestionId) return;

    try {
      await updateSuggestionMutation.mutateAsync({
        id: suggestionId,
        data
      });
      
      showNotification({
        type: 'success',
        title: t('helpDesk.suggestionsForm.messages.updateSuccess'),
        duration: 3000,
        persistent: false,
      });
      
      setMode('view');
      refetch();
    } catch (error) {
      const errorMessage = (error as Error)?.message || t('helpDesk.suggestionsForm.messages.updateError');
      showNotification({
        type: 'error',
        title: t('helpDesk.suggestionsForm.messages.error'),
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
    suggestion,
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
    isSubmitting: updateSuggestionMutation.isPending,
    handleModeToggle,
    handleClose,
    handleSubmit: handleSubmit(handleSubmitForm),
    handleCancel,
  };
};