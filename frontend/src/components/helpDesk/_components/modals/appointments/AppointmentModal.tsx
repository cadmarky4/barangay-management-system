import React from 'react';
import { FormProvider } from 'react-hook-form';
import { BaseModal } from '../BaseModal';
import { useAppointmentModal } from './useAppointmentModal';
import { AppointmentModalContent } from './_components/AppointmentModalContent';
import { AppointmentModalFooter } from './_components/AppointmentModalFooter';
import { Loader2, AlertCircle } from 'lucide-react';
import { SearchResidentContext } from '../../_contexts/searchResidentContex';

interface AppointmentModalProps {
  appointmentId: string | null;
  isOpen: boolean;
  mode: "view" | "edit",
  setMode: (mode: "view" | "edit") => void;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointmentId,
  isOpen,
  mode,
  setMode,
  onClose,
}) => {
  const {
    appointment,
    isLoading,

    // RESIDENT FIELDS
    isResident,
    setIsResident,
    searchResident,
    filteredResidents,
    isLoadingResidents,
    residentsError,
    residentIdField,
    setSelectedResidentId,

    error,
    form,
    isDirty,
    isSubmitting,
    handleModeToggle,
    handleClose,
    handleSubmit,
    handleCancel,
  } = useAppointmentModal({ appointmentId, onClose, mode, setMode });

  if (!isOpen) return null;

  const getTitle = () => {
    const modeText = mode === 'view' ? 'View' : 'Edit';
    const ticketNumber = appointment?.ticket.ticket_number;
    return `${modeText} Appointment ${ticketNumber ? `#${ticketNumber}` : ''}`;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      maxWidth="4xl"
      footer={
        <AppointmentModalFooter
          mode={mode}
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onModeToggle={handleModeToggle}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      }
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading appointment...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 rounded-md">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load appointment details</span>
        </div>
      )}

      {appointment && (
        <FormProvider {...form}>
          <form onSubmit={handleSubmit}>
            <SearchResidentContext.Provider value={{
              isResident: isResident,
              setIsResident: setIsResident,
              searchResident: searchResident,
              filteredResidents: filteredResidents,
              isLoadingResidents: isLoadingResidents,
              residentsError: residentsError,
              residentIdField: residentIdField,
              setSelectedResidentId: setSelectedResidentId,
            }}>
              <AppointmentModalContent
                appointment={appointment}
                mode={mode}
              />
            </SearchResidentContext.Provider>
          </form>
        </FormProvider>
      )}
    </BaseModal>
  );
};