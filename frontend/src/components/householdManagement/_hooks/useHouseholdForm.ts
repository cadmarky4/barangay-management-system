import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';
import { HouseholdFormDataSchema, transformHouseholdToFormData, type HouseholdFormData, type Household } from '@/services/households/households.types';
import { useCreateHousehold, useUpdateHousehold } from '@/services/households/useHouseholds';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { generateHouseholdNumber } from '@/utils/householdNumberGenerator';

interface UseHouseholdFormProps {
  initialData?: Household; // For edit mode - changed from any to Household
  mode?: 'create' | 'edit';
}

export const useHouseholdForm = ({ initialData, mode = 'create' }: UseHouseholdFormProps = {}) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { showNotification } = useNotifications();

  // Initialize form with React Hook Form + Zod validation
  const form = useForm<HouseholdFormData>({
    resolver: zodResolver(HouseholdFormDataSchema),
    defaultValues: initialData ? transformHouseholdToFormData(initialData) : transformHouseholdToFormData(null),
    mode: 'onChange',
  });

  // TanStack Query mutations
  const createHouseholdMutation = useCreateHousehold();
  const updateHouseholdMutation = useUpdateHousehold();

  // Get draft key based on mode
  const getDraftKey = useCallback(() => {
    if (mode === 'edit' && initialData?.id) {
      return `householdDraft_${initialData.id}`;
    }
    return 'householdDraft';
  }, [mode, initialData?.id]);

  const loadDraftData = useCallback(() => {
    try {
      const draftKey = getDraftKey();
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        form.reset(draftData);
        showNotification({
          type: 'info',
          title: 'Draft Loaded',
          message: 'Previous draft data has been loaded'
        });
      }
    } catch (error) {
      console.error('Failed to load draft data:', error);
    }
  }, [getDraftKey, form, showNotification]);

  // Load draft data on mount
  useEffect(() => {
    loadDraftData();
  }, [loadDraftData]);

  const saveDraft = (data: HouseholdFormData) => {
    setIsSavingDraft(true);
    try {
      const draftKey = getDraftKey();
      localStorage.setItem(draftKey, JSON.stringify(data));
      showNotification({
        type: 'success',
        title: 'Draft Saved',
        message: 'Your changes have been saved as draft'
      });
      setTimeout(() => setIsSavingDraft(false), 500);
    } catch (error) {
      console.error('Failed to save draft:', error);
      showNotification({
        type: 'error',
        title: 'Draft Save Failed',
        message: 'Could not save draft to local storage'
      });
      setIsSavingDraft(false);
    }
  };

  const clearDraft = () => {
    try {
      const draftKey = getDraftKey();
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  const onSubmit = async (data: HouseholdFormData, onSuccess?: () => void) => {
    setFormError(null);
    
    try {
      // Validate that head resident is selected
      if (!data.head_resident_id) {
        setFormError('Please select a household head before saving.');
        return;
      }

      // Validate that head resident is not also a member
      const memberIds = data.memberRelationships?.map(mr => mr.residentId) || [];
      if (memberIds.includes(data.head_resident_id)) {
        setFormError('The household head cannot also be listed as a member. Please remove them from the members list.');
        return;
      }

      // Auto-generate household number if not provided (frontend-side generation)
      if (!data.household_number || data.household_number.trim() === '') {
        data.household_number = generateHouseholdNumber();
      }

      // Transform memberRelationships to member_ids format expected by backend
      const submitData = {
        ...data,
        member_ids: data.memberRelationships?.map(mr => ({
          resident_id: mr.residentId,
          relationship: mr.relationship
        })) || null
      };
      
      // Remove memberRelationships and members from submitData as they're not needed by backend
      delete submitData.memberRelationships;
      delete submitData.members;

      if (mode === 'create') {
        await createHouseholdMutation.mutateAsync(submitData);
        showNotification({
          type: 'success',
          title: 'Household Created',
          message: 'New household has been created successfully'
        });
      } else {
        // For edit mode, need household ID
        if (!initialData?.id) {
          throw new Error('Household ID is required for update');
        }
        await updateHouseholdMutation.mutateAsync({ 
          id: initialData.id, 
          data: submitData 
        });
        showNotification({
          type: 'success',
          title: 'Household Updated',
          message: `Household ${initialData.household_number} has been updated successfully`
        });
      }

      clearDraft(); // Clear draft after successful submission

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      
      // Handle validation errors from backend
      const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
      if (axiosError.response?.status === 422 && axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        setFormError(`Validation errors:\n${errorMessages}`);
      } else if (axiosError.response?.data?.message) {
        setFormError(axiosError.response.data.message);
      } else {
        const errorMessage = (error instanceof Error ? error.message : 'Unknown error') || `Failed to ${mode} household. Please try again.`;
        setFormError(errorMessage);
      }
      
      showNotification({
        type: 'error',
        title: `${mode === 'create' ? 'Create' : 'Update'} Failed`,
        message: axiosError.response?.data?.message || (error instanceof Error ? error.message : 'Unknown error') || `Failed to ${mode} household. Please try again.`
      });
    }
  };

  return {
    form,
    formError,
    setFormError,
    isSubmitting: createHouseholdMutation.isPending || updateHouseholdMutation.isPending,
    onSubmit,
    saveDraft,
    isSavingDraft,
    clearDraft,
    // Expose mutation states for additional handling if needed
    createMutation: createHouseholdMutation,
    updateMutation: updateHouseholdMutation,
  };
};