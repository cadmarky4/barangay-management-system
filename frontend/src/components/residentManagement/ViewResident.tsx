// ============================================================================
// pages/residents/ViewResident.tsx - Main view resident component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiX, FiEdit } from 'react-icons/fi';

import { useResident } from '@/services/residents/useResidents';
import { LoadingSpinner } from '@/components/__shared/LoadingSpinner';
import { ErrorDisplay } from '@/components/__shared/ErrorDisplay';
import Breadcrumb from '@/components/_global/Breadcrumb';

import { ResidentProfileHeader } from './_components/view/ResidentProfileHeader';
import { ResidentInfoTabs } from './_components/view/ResidentInfoTabs';

const ViewResident: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const residentId = id as string;

  // Query hook for resident data
  const { 
    data: resident, 
    isLoading, 
    error,
    isError
  } = useResident(residentId, !!residentId);

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    navigate('/residents');
  };

  const handleEdit = () => {
    navigate(`/residents/edit/${id}`);
  };

  // Validate ID
  if (!residentId) {
    return (
      <ErrorDisplay
        title="Invalid Resident ID"
        message="The resident ID provided in the URL is not valid."
        onBack={handleClose}
        showRetry={false}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">
            {t('residents.view.messages.loading')}
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (isError || !resident) {
    let errorMessage = t('residents.view.messages.notFound');
    
    if (error) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        errorMessage = t('residents.view.messages.notFound');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = t('residents.view.messages.networkError');
      } else {
        errorMessage = t('residents.view.messages.loadError');
      }
    }

    return (
      <ErrorDisplay
        title={t('residents.view.messages.errorTitle')}
        message={errorMessage}
        onBack={handleClose}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Breadcrumbs */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div className={`mb-2 flex justify-between items-center transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h1 className="text-2xl font-bold text-darktext pl-0">
          {t('residents.view.title')}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="p-2 text-smblue-400 hover:text-smblue-300 hover:bg-smblue-50 rounded-lg transition-colors"
            title={t('residents.view.actions.edit')}
          >
            <FiEdit className="w-6 h-6" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('residents.view.actions.close')}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '200ms' }}>
        
        {/* Profile Header */}
        <ResidentProfileHeader 
          resident={resident} 
          isLoaded={isLoaded} 
        />

        {/* Tabbed Information */}
        <ResidentInfoTabs 
          resident={resident} 
          isLoaded={isLoaded}
          onEdit={handleEdit}
          onClose={handleClose}
        />
      </div>
    </main>
  );
};

export default ViewResident;