// ============================================================================
// hooks/residents/useResidentForm.ts - Enhanced form hook with multi-step support
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { 
  useResident, 
  useCreateResident, 
  useUpdateResident, 
  useUploadProfilePhoto
} from '@/services/residents/useResidents';

import { 
  ResidentFormDataSchema, 
  transformResidentToFormData,
  type ResidentFormData 
} from '@/services/residents/residents.types';

interface UseResidentFormProps {
  mode: 'create' | 'edit';
  residentId?: string;
  onSuccess?: () => void;
}

const DRAFT_STORAGE_KEY = 'resident-form-draft';

export function useResidentForm({ mode, residentId, onSuccess }: UseResidentFormProps) {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();
  
  // State management
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Query hooks
  const { data: resident, isLoading: isLoadingResident } = useResident(
    residentId as string, 
    mode === 'edit' && !!residentId
  );

  // Mutation hooks
  const createResidentMutation = useCreateResident();
  const updateResidentMutation = useUpdateResident();
  const uploadPhotoMutation = useUploadProfilePhoto();

  // Form setup
  const form = useForm<ResidentFormData>({
    resolver: zodResolver(ResidentFormDataSchema),
    defaultValues: transformResidentToFormData(null),
    mode: 'onBlur'
  });

  // Auto-calculate age from birth date
  const watchBirthDate = form.watch('birth_date');
  useEffect(() => {
    if (watchBirthDate) {
      const birthDate = new Date(watchBirthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (isNaN(age) || age < 0 || age > 150) {
        form.setValue('age', 0);
      } else {
        form.setValue('age', age);
      }
    } else {
      form.setValue('age', 0);
    }
  }, [watchBirthDate, form]);

  // Auto-populate senior citizen status based on age
  const watchAge = form.watch('age');
  useEffect(() => {
    if (watchAge) {
      const age = watchAge
      if (age >= 60) {
        form.setValue('senior_citizen', true);
      }
    }
  }, [watchAge, form]);

  // Watch profile_photo_url field and sync with preview state
  const watchProfilePhotoUrl = form.watch('profile_photo_url');
  useEffect(() => {
    if (watchProfilePhotoUrl && watchProfilePhotoUrl !== profilePhotoPreview) {
      setProfilePhotoPreview(watchProfilePhotoUrl);
    } else if (!watchProfilePhotoUrl && profilePhotoPreview) {
      setProfilePhotoPreview(null);
    }
  }, [watchProfilePhotoUrl, profilePhotoPreview]);

  // Load existing resident data in edit mode
  useEffect(() => {
    if (mode === 'edit' && resident) {
      const formData = transformResidentToFormData(resident);
      // Reset form synchronously first
      form.reset(formData);
      
      // Then set photo preview
      if (resident.profile_photo_url) {
        setProfilePhotoPreview(resident.profile_photo_url);
      }
    }
  }, [mode, resident, form]);

  // Load draft data in create mode
  useEffect(() => {
    if (mode === 'create') {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          // Reset form synchronously first
          form.reset(draftData);
          
          // Then set photo preview
          if (draftData.profile_photo_url) {
            setProfilePhotoPreview(draftData.profile_photo_url);
          }
          
          showNotification({
            type: 'info',
            title: t('residents.form.messages.draftLoadedTitle'),
            message: t('residents.form.messages.draftLoaded'),
          });
        } catch (error) {
          console.error('Failed to load draft:', error);
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
    }
  }, [mode, form, t, showNotification]);

  // Check for duplicate residents
  const checkDuplicates = useCallback(async (firstName: string, lastName: string, birthDate: string) => {
    if (!firstName || !lastName || !birthDate) return;

    try {
      // This would be implemented with your actual duplicate check service
      // const duplicates = await residentsService.checkDuplicate(firstName, lastName, birthDate);
      // if (duplicates.length > 0) {
      //   setDuplicateWarning(
      //     t('residents.form.messages.duplicateWarning', { 
      //       count: duplicates.length,
      //       name: `${firstName} ${lastName}`
      //     })
      //   );
      // } else {
      //   setDuplicateWarning(null);
      // }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
  }, []);

  // Watch for changes that might indicate duplicates
  const watchFirstName = form.watch('first_name');
  const watchLastName = form.watch('last_name');
  
  useEffect(() => {
    if (mode === 'create' && watchFirstName && watchLastName && watchBirthDate) {
      const debounceTimer = setTimeout(() => {
        checkDuplicates(watchFirstName, watchLastName, watchBirthDate);
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [mode, watchFirstName, watchLastName, watchBirthDate, checkDuplicates]);

  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data: ResidentFormData) => {
    try {
      if (mode === 'create') {
        await createResidentMutation.mutateAsync(data);
        showNotification({
          type: 'success',
          title: t('residents.form.messages.createSuccessTitle'),
          message: t('residents.form.messages.createSuccess'),
        });
        
        // Clear draft on successful creation
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } else {
        await updateResidentMutation.mutateAsync({
          id: residentId!,
          data
        });
        showNotification({
          type: 'success',
          title: t('residents.form.messages.updateSuccessTitle'),
          message: t('residents.form.messages.updateSuccess'),
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done in the mutation hooks
    }
  });

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showNotification({
        type: 'error',
        title: t('residents.form.messages.uploadErrorTitle'),
        message: t('residents.form.messages.invalidFileType'),
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showNotification({
        type: 'error',
        title: t('residents.form.messages.uploadErrorTitle'),
        message: t('residents.form.messages.fileTooLarge'),
      });
      return;
    }

    // Create preview for immediate display
    const previewUrl = URL.createObjectURL(file);
    setProfilePhotoPreview(previewUrl);      // Always upload the file first (for both create and edit modes)
      setIsUploadingFile(true);
      try {
        // Use the file upload service to upload the file
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://127.0.0.1:8000/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadResult = await response.json();
        const uploadedFilename = uploadResult.filename;

        // Store the uploaded filename in form field and update preview
        form.setValue('profile_photo_url', uploadedFilename);
        // Clean up the blob URL and use the server URL
        URL.revokeObjectURL(previewUrl);
        setProfilePhotoPreview(uploadedFilename);

      // If in edit mode, also update the resident's photo immediately
      if (mode === 'edit' && residentId) {
        try {
          const updatedResident = await uploadPhotoMutation.mutateAsync({
            id: residentId,
            photo: file
          });
          
          // Update form with the resident's photo URL from the response
          form.setValue('profile_photo_url', updatedResident.profile_photo_url || '');
          setProfilePhotoPreview(updatedResident.profile_photo_url || null);
        } catch (error) {
          console.error('Resident photo update error:', error);
          // Keep the uploaded file URL in form even if resident update fails
        }
      }

      showNotification({
        type: 'success',
        title: t('residents.form.messages.uploadSuccessTitle'),
        message: t('residents.form.messages.uploadSuccess'),
      });

    } catch (error) {
      console.error('Photo upload error:', error);
      
      showNotification({
        type: 'error',
        title: t('residents.form.messages.uploadErrorTitle'),
        message: t('residents.form.messages.uploadError'),
      });

      // Reset preview on error
      setProfilePhotoPreview(resident?.profile_photo_url || null);
      form.setValue('profile_photo_url', resident?.profile_photo_url || '');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Save draft
  const saveDraft = useCallback(() => {
    if (mode === 'create') {
      const formData = form.getValues();
      // Include profile photo in draft
      const draftData = {
        ...formData,
        profile_photo_url: profilePhotoPreview || formData.profile_photo_url
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      
      showNotification({
        type: 'success',
        title: t('residents.form.messages.draftSavedTitle'),
        message: t('residents.form.messages.draftSaved'),
      });
    }
  }, [mode, form, profilePhotoPreview, t, showNotification]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (mode === 'create') {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      form.reset(transformResidentToFormData(null));
      setProfilePhotoPreview(null);
      setDuplicateWarning(null);
      
      showNotification({
        type: 'info',
        title: t('residents.form.messages.draftClearedTitle'),
        message: t('residents.form.messages.draftCleared'),
      });
    }
  }, [mode, form, t, showNotification]);

  // Auto-save draft periodically
  useEffect(() => {
    if (mode === 'create') {
      const autoSaveInterval = setInterval(() => {
        const formData = form.getValues();
        // Only save if form has meaningful data
        if (formData.first_name || formData.last_name || formData.email_address) {
          const draftData = {
            ...formData,
            profile_photo_url: profilePhotoPreview || formData.profile_photo_url
          };
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        }
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [mode, form, profilePhotoPreview]);

  return {
    form,
    isLoadingResident,
    profilePhotoPreview,
    duplicateWarning,
    isSubmitting: createResidentMutation.isPending || updateResidentMutation.isPending,
    isUploadingFile,
    handleSubmit,
    handleFileUpload,
    saveDraft,
    clearDraft,
  };
}