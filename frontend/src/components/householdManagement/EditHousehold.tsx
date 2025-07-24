import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';
import Breadcrumb from '../_global/Breadcrumb';
import HouseholdFormSections from './_components/HouseholdFormSections';
import { useHouseholdForm } from './_hooks/useHouseholdForm';
import { useHousehold } from '@/services/households/useHouseholds';
import { transformHouseholdToFormData } from '@/services/households/households.types';
import LoadingState from './_components/LoadingState';
import ErrorState from './_components/ErrorState';

const EditHousehold: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch household data
  const { data: household, isLoading, error } = useHousehold(id || '');

  // Use the shared household form hook in edit mode
  const {
    form,
    formError,
    isSubmitting,
    onSubmit,
    saveDraft,
    isSavingDraft,
  } = useHouseholdForm({ 
    initialData: household, 
    mode: 'edit' 
  });

  // Reset form when household data changes
  useEffect(() => {
    if (household) {
      form.reset(transformHouseholdToFormData(household));
    }
  }, [household, form]);

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    const isDirty = form.formState.isDirty;
    
    if (isDirty) {
      if (window.confirm(t('households.form.messages.unsavedChanges'))) {
        navigate('/household');
      }
    } else {
      navigate('/household');
    }
  };

  const handleSaveDraft = () => {
    // For edit mode, save draft with household ID to avoid conflicts
    saveDraft(form.getValues());
  };

  const handleFormSubmit = (data: any) => {
    onSubmit(data, () => {
      navigate('/household');
    });
  };

  // Loading state
  if (isLoading) {
    return <LoadingState message={t('households.messages.loadingHousehold')} />;
  }

  // Error state
  if (error || !household) {
    return (
      <ErrorState 
        error={error}
        onRetry={() => window.location.reload()}
        onBack={() => navigate('/household')}
      />
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Automatic Breadcrumbs */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div className={`mb-2 flex justify-between items-center transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div>
          <h1 className="text-2xl font-bold text-darktext pl-0">
            {t('households.form.editTitle')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('households.form.editingLabel', { 
              householdNumber: household.household_number, 
              address: household.complete_address 
            }) || `Editing: ${household.household_number} - ${household.complete_address}`}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title={t('households.form.actions.close')}
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      {/* Error Display */}
      {formError && (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '200ms' }}>
          <p className="text-red-800 text-sm">{formError}</p>
        </div>
      )}

      <form 
        onSubmit={form.handleSubmit(handleFormSubmit)} 
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} 
        style={{ transitionDelay: '300ms' }}
      >
        {/* Form Sections - Reusing the same components from AddNewHousehold */}
        <HouseholdFormSections form={form} />

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSavingDraft && (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>
              {isSavingDraft ? t('households.form.actions.savingDraft') : t('households.form.actions.saveDraft')}
            </span>
          </button>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              {t('households.form.actions.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting || !form.formState.isDirty}
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>
                {isSubmitting ? t('households.form.actions.updating') : t('households.form.actions.update')}
              </span>
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default EditHousehold;