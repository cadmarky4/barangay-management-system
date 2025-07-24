import { useNotifications } from "@/components/_global/NotificationSystem";
import { CreateBlotterSchema, type CreateBlotter } from "@/services/helpDesk/blotters/blotters.types";
import { useCreateBlotter } from "@/services/helpDesk/blotters/useBlotter";
import { residentsService } from "@/services/residents/residents.service";
import { useResidents } from "@/services/residents/useResidents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";


interface useCreateBlotterFormProps {
    onSuccess?: () => void;
}

export function useCreateBlotterForm({ onSuccess }: useCreateBlotterFormProps) {
    const { t } = useTranslation();
    const { showNotification } = useNotifications();
    
    const form = useForm<CreateBlotter>({
        resolver: zodResolver(CreateBlotterSchema),
        mode: 'onBlur',
    })

    const { watch, setValue } = form;
    const [selectedResidentId, setSelectedResidentId]  = useState<string>('');
    const residentIdField = watch('ticket.resident_id');
    const searchResident = watch('ticket.resident_search');

    // PALAGING  BLOTTER TO
    setValue("ticket.category", "BLOTTER");

    const { data: filteredResidents, isLoading: isLoadingResidents, error: residentsError } = useResidents({ search: searchResident || "" });

    const createBlotter = useCreateBlotter();
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

     const handleSubmit = form.handleSubmit(async (data: CreateBlotter) => {
         try {
             await createBlotter.mutateAsync(data);
                 showNotification({
                     type: 'success',
                     title: t('helpDesk.blotterForm.messages.createSuccess'),
                     message: t('helpDesk.blotterForm.messages.createSuccess'),
                     duration: 3000,
                     persistent: false,
                 });
             onSuccess?.();
             
         } catch (error) {
             const errorMessage = (error as Error)?.message || t('helpDesk.blotterForm.messages.createError');
             showNotification({
               type: 'error',
               title: t('helpDesk.blotterForm.messages.error'),
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
        isSubmitting: createBlotter.isPending,
        residentIdField,
        setSelectedResidentId,
        handleSubmit,
     }
}