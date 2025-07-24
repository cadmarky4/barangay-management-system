import { useNotifications } from "@/components/_global/NotificationSystem";
import { BarangayOfficialFormDataSchema, transformBarangayOfficialToFormData, type BarangayOfficialFormData } from "@/services/officials/barangayOfficials.types";
import { useBarangayOfficial, useCreateBarangayOfficial, useUpdateBarangayOfficial } from "@/services/officials/useBarangayOfficials";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useIsAlreadyRegisteredAsOfficial } from "./useIsAlreadyOfficial";
import { useEffect, useState } from "react";
import { useResidents } from "@/services/residents/useResidents";
import { useTranslation } from "react-i18next";
import { residentsService } from "@/services/residents/residents.service";

interface useBarangayOfficialsFormProps {
    mode: 'create' | 'edit',
    barangayOfficialId?: string,
    onSuccess?: () => void;
}

export function useBarangayOfficialsForm({ mode, barangayOfficialId, onSuccess }: useBarangayOfficialsFormProps) {    
    const { t } = useTranslation(); 
    const { showNotification } = useNotifications();
    const [ isAlreadyRegisteredAsOfficialWarning, setIsAlreadyRegisteredAsOfficialWarning ] = useState<string | null>(null);
    
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

    const form = useForm<BarangayOfficialFormData>({
        resolver: zodResolver(BarangayOfficialFormDataSchema),
        defaultValues: {
            resident_search: '',
            resident_id: '',
            prefix: 'Mr.',
            first_name: '',
            middle_name: '',
            last_name: '',
            suffix: '',
            birth_date: '',
            gender: 'MALE',
            nationality: 'FILIPINO',
            civil_status: 'SINGLE',
            educational_attainment: 'NO_FORMAL_EDUCATION',
            mobile_number: '',
            email_address: '',
            complete_address: '',
            position: 'KAGAWAD',
            committee_assignment: 'Health',
            term_start: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            term_end: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 years from now
            term_number: 1,
            is_current_term: true,
            status: 'ACTIVE',
            profile_photo_url: '',
        },
        mode: 'onBlur',
    })

    const { watch, setValue, reset } = form;
    const [selectedResidentId, setSelectedResidentId]  = useState<string>('');
    const residentIdField = watch('resident_id');
    const searchResident = watch('resident_search');
    const [ isResidentValidNewOfficial, setIsResidentValidNewOfficial ] = useState(false);

    // Queries and mutations
    const { data: official, isLoading: isLoadingOfficial } = useBarangayOfficial(
        barangayOfficialId || '',
        mode === 'edit' && !!barangayOfficialId
    );

    const { data: filteredResidents, isLoading: isLoadingResidents, error: residentsError } = useResidents({ search: searchResident });

    const createBarangayOfficial = useCreateBarangayOfficial();
    const updateBarangayOfficial = useUpdateBarangayOfficial();
    
    const { getOfficialRegistrationStatus, isChecking } = useIsAlreadyRegisteredAsOfficial();
    // set default values of dropdowns to empty strings
    // useEffect(() => {
    //     setValue("committee_assignment", "");
    // },[])

    // Check if barangay official already registered when key fields change
    // Potential bug: When the user chooses the same residentId but a new error occurs,
    // the error message won't update because the dependency array only includes residentId.
    // The effect won't re-execute unless residentId changes.
    useEffect(() => {
        if (selectedResidentId) {
            const timeoutId = setTimeout(() => {
                (async () => {
                    const result = await getOfficialRegistrationStatus(selectedResidentId);
                    if (mode === 'create' && result.result > 0) {
                        setIsAlreadyRegisteredAsOfficialWarning('Official already registered');
                    } else if (result.result === -1) {
                        setIsAlreadyRegisteredAsOfficialWarning(result.errorMessage);
                    } else {
                        // backend search
                        const res = await residentsService.getResident(
                            selectedResidentId
                          );
                        // frontend search
                        // const res = residents?.data.find(resident => 
                        //     resident.id === (residentId ? Number(residentId) : -1)
                        // );
                        setIsResidentValidNewOfficial(true);
                        setIsAlreadyRegisteredAsOfficialWarning(null);
                        setValue('resident_id', selectedResidentId)
                        setValue('first_name', res.first_name);
                        setValue('middle_name', res.middle_name || '');
                        setValue('last_name', res.last_name);
                        setValue('gender', res.gender);
                        setValue('birth_date', new Date(res.birth_date).toISOString().split('T')[0]);
                        setValue('mobile_number', res.mobile_number || '');
                        setValue('email_address', res.email_address || '');
                        setValue('complete_address', res.complete_address);
                        setValue('civil_status', res.civil_status);
                        setValue('educational_attainment', res.educational_attainment);
                        setValue('profile_photo_url', res.profile_photo_url || '');
                    }
                })();
            }, 1000);
    
            return () => clearTimeout(timeoutId);
        } else {
            setIsAlreadyRegisteredAsOfficialWarning(null);
        }
    }, [selectedResidentId, getOfficialRegistrationStatus, mode, setValue]);
    
    // Load official data for edit mode
    useEffect(() => {
        if (mode === 'edit' && official) {
            const formData = transformBarangayOfficialToFormData(official);
            setIsResidentValidNewOfficial(true);
            setSelectedResidentId(formData.resident_id);
            reset(formData);

            if (official.profile_photo_url) {
                setProfilePhotoPreview(official.profile_photo_url);
            }
        }
    }, [mode, official, reset, setSelectedResidentId])

    // Load draft on mount for create mode
    useEffect(() => {
        if (mode === 'create') {
            try {
                const savedDraft = localStorage.getItem('barangayOfficialDraft');
                if (savedDraft) {
                const draftData = JSON.parse(savedDraft);
                reset(draftData);
                }
            } catch (error) {
                console.error('Failed to load draft:', error);
            }
        }
    }, [mode, reset]);

    // Form submission
    const handleSubmit = form.handleSubmit(async (data: BarangayOfficialFormData) => {
        console.log('Form handleSubmit called with data:', data);
        
        // Transform data to ensure null values become empty strings
        const transformedData = {
            ...data,
            mobile_number: data.mobile_number || '',
            email_address: data.email_address || '',
            middle_name: data.middle_name || '',
            suffix: data.suffix || '',
            profile_photo_url: data.profile_photo_url || '',
        };
        
        try {
            if (mode === 'create') {
                console.log('Creating barangay official...');
                const result = await createBarangayOfficial.mutateAsync(transformedData);
                console.log('Create result:', result);
                showNotification({
                    type: 'success',
                    title: t('barangayOfficials.form.messages.createSuccess'),
                    message: t('barangayOfficials.form.messages.createSuccess'),
                    duration: 3000,
                    persistent: false,
                });
            } else if (mode === 'edit' && barangayOfficialId) {
                console.log('Updating barangay official...');
                const result = await updateBarangayOfficial.mutateAsync({ id: barangayOfficialId, data: transformedData });
                console.log('Update result:', result);
                showNotification({
                    type: 'success',
                    title: t('barangayOfficials.form.messages.updateSuccess'),
                    message: t('barangayOfficials.form.messages.updateSuccess'),
                    duration: 3000,
                    persistent: false,
                });
            }
            onSuccess?.();
            
        } catch (error) {
            console.error('Form submission error details:', error);
            const errorMessage = (error as Error)?.message || 
              (mode === 'create' 
                ? t('barangayOfficials.form.messages.createError')
                : t('barangayOfficials.form.messages.updateError')
              );
            showNotification({
              type: 'error',
              title: t('barangayOfficials.form.messages.error'),
              message: errorMessage,
              duration: 3000,
              persistent: false,
            });
            console.error('Form submission error:', error);
        }
    }, (errors) => {
        console.log('Form validation errors:', errors);
    });

    // Draft management
    const saveDraft = () => {
        try {
          const draftData = form.getValues();
          localStorage.setItem('barangayOfficialDraft', JSON.stringify(draftData));
          showNotification({
            type: 'info',
            title: t('barangayOfficials.form.messages.draftSaved'),
            message: t('barangayOfficials.form.messages.draftSaved'),
            duration: 3000,
            persistent: false,
          });
        } catch (error) {
          console.error('Failed to save draft:', error);
          showNotification({
            type: 'error',
            title: t('barangayOfficials.form.messages.draftError'),
            message: t('barangayOfficials.form.messages.draftError'),
            duration: 3000,
            persistent: false,
          });
        }
      };
    
      const clearDraft = () => {
        try {
          localStorage.removeItem('barangayOfficialDraft');
        } catch (error) {
          console.error('Failed to clear draft:', error);
        }
    };

    return {
        form,
        searchResident,
        official,
        isLoadingOfficial,
        filteredResidents,
        isLoadingResidents,
        residentsError,
        profilePhotoPreview,
        isAlreadyRegisteredAsOfficialWarning,
        isSubmitting: createBarangayOfficial.isPending || updateBarangayOfficial.isPending,
        isCheckingAlreadyRegisteredAsOfficial: isChecking,
        isResidentValidNewOfficial,
        residentIdField,
        setSelectedResidentId,
        handleSubmit,
        saveDraft,
        clearDraft,
    };
};