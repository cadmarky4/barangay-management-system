/**
 * Future implementation idea
 * if i had more time: ability to toggle anonymity in update complaint modal
 */

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { BaseModal } from '../BaseModal';
import { useComplaintModal } from './useComplaintModal';
import { ComplaintModalContent } from './_components/ComplaintModalContent';
import { ComplaintModalFooter } from './_components/ComplaintModalFooter';
import { Loader2, AlertCircle } from 'lucide-react';
import { SearchResidentContext } from '../../_contexts/searchResidentContex';

interface ComplaintModalProps {
  complaintId: string | null;
  isOpen: boolean;
  mode: "view" | "edit"
  setMode: (mode: "view" | "edit") => void;
  onClose: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  complaintId,
  isOpen,
  mode,
  setMode,
  onClose,
}) => {
  const {
    complaint,
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
  } = useComplaintModal({ complaintId, onClose, mode, setMode });

  if (!isOpen) return null;

  const getTitle = () => {
    const modeText = mode === 'view' ? 'View' : 'Edit';
    const ticketNumber = complaint?.ticket.ticket_number;
    return `${modeText} Complaint ${ticketNumber ? `#${ticketNumber}` : ''}`;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      maxWidth="4xl"
      footer={
        <ComplaintModalFooter
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
          <span className="ml-2">Loading complaint...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 rounded-md">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load complaint details</span>
        </div>
      )}

      {complaint && (
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
              <ComplaintModalContent
                complaint={complaint}
                mode={mode}
              />
            </SearchResidentContext.Provider>
          </form>
        </FormProvider>
      )}
    </BaseModal>
  );
};