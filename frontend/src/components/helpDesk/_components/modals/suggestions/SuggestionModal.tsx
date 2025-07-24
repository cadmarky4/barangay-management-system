/**
 * Future implementation idea
 * if i had more time: ability to toggle anonymity in update suggestion modal
 */

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { BaseModal } from '../BaseModal';
import { useSuggestionModal } from './useSuggestionModal';
import { SuggestionModalContent } from './_components/SuggestionModalContent';
import { SuggestionModalFooter } from './_components/SuggestionModalFooter';
import { Loader2, AlertCircle } from 'lucide-react';
import { SearchResidentContext } from '../../_contexts/searchResidentContex';

interface SuggestionModalProps {
  suggestionId: string | null;
  isOpen: boolean;
  mode: "view" | "edit"
  setMode: (mode: "view" | "edit") => void;
  onClose: () => void;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({
  suggestionId,
  isOpen,
  mode,
  setMode,
  onClose,
}) => {
  const {
    suggestion,
    isLoading,
    error,

    // RESIDENT FIELDS
    isResident,
    setIsResident,
    searchResident,
    filteredResidents,
    isLoadingResidents,
    residentsError,
    residentIdField,
    setSelectedResidentId,

    form,
    isDirty,
    isSubmitting,
    handleModeToggle,
    handleClose,
    handleSubmit,
    handleCancel,
  } = useSuggestionModal({ suggestionId, onClose, mode, setMode });

  if (!isOpen) return null;

  const getTitle = () => {
    const modeText = mode === 'view' ? 'View' : 'Edit';
    const ticketNumber = suggestion?.ticket.ticket_number;
    return `${modeText} Suggestion ${ticketNumber ? `#${ticketNumber}` : ''}`;
  };

  const handleSB = () => {
    console.log(form.formState.errors);
    handleSubmit();
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      maxWidth="4xl"
      footer={
        <SuggestionModalFooter
          mode={mode}
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onModeToggle={handleModeToggle}
          onCancel={handleCancel}
          onSubmit={handleSB}
          onClose={handleClose}
        />
      }
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading suggestion...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 rounded-md">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load suggestion details</span>
        </div>
      )}

      {suggestion && (
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
              <SuggestionModalContent
                suggestion={suggestion}
                mode={mode}
              />
            </SearchResidentContext.Provider>
          </form>
        </FormProvider>
      )}
    </BaseModal>
  );
};
