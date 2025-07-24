// ============================================================================
// pages/residents/ResidentManagement.tsx - Main component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  useResidents,
  useDeleteResident
} from '@/services/residents/useResidents';
import { useNotifications } from '../_global/NotificationSystem';
import { type Resident, type ResidentParams } from '@/services/residents/residents.types';
import { useDebounce } from '@/hooks/useDebounce';
import Breadcrumb from '../_global/Breadcrumb';
import { ResidentStatistics } from './_components/ResidentStatistics';
import { ResidentSearch } from './_components/ResidentSearch';
import { ResidentTable } from './_components/ResidentTable';
import { ResidentPagination } from './_components/ResidentPagination';

const ResidentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Notifications
  const { showNotification } = useNotifications();
  
  // Local state
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Query parameters
  const queryParams: ResidentParams = {
    page: currentPage,
    per_page: 15,
    search: debouncedSearchTerm,
  };
  
  // Queries and mutations
  const {
    data: residentsData,
    isLoading,
    error,
    refetch
  } = useResidents(queryParams);
  
  const deleteResident = useDeleteResident();
  
  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);
  
  // Handlers
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleAddNew = () => {
    navigate('/residents/add');
  };
  
  const handleView = (resident: Resident) => {
    navigate(`/residents/view/${resident.id}`);
  };
  
  const handleEdit = (resident: Resident) => {
    navigate(`/residents/edit/${resident.id}`);
  };
  
  const handleDelete = async (resident: Resident) => {
    // const fullName = `${resident.first_name} ${resident.last_name}`;
    
    if (window.confirm(t('residents.messages.deleteConfirm'))) {
      try {
        await deleteResident.mutateAsync(resident.id);
        showNotification({
          type: 'success',
          title: t('residents.messages.deleteSuccess'),
          message: t('residents.messages.deleteSuccess'),
          duration: 3000,
          persistent: false
        });
        refetch(); // Refresh the data
      } catch (error) {
        console.error('Delete error:', error);

        showNotification({
          type: 'error',
          title: t('residents.messages.deleteError'),
          message: t('residents.messages.deleteError'),
          duration: 3000,
          persistent: false
        });
      }
    }
  };
  
  // Prepare data
  const residents = residentsData?.data || [];
  const pagination = residentsData ? {
    current_page: residentsData.current_page,
    last_page: residentsData.last_page,
    per_page: residentsData.per_page,
    total: residentsData.total,
  } : {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  };

  console.log(residents);

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Breadcrumbs */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Page Header */}
      <div className={`mb-2 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h1 className="text-2xl font-bold text-darktext pl-0">
          {t('residents.title')}
        </h1>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '200ms' }}>
          <p className="text-red-800 text-sm">{t('residents.messages.loadError')}</p>
        </div>
      )}

      {/* Statistics Overview */}
      <ResidentStatistics isLoaded={isLoaded} />

      {/* Residents Section */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '850ms' }}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            {t('residents.title')}
          </h3>

          {/* Search and Add Button */}
          <ResidentSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddNew={handleAddNew}
            isLoading={isLoading}
          />
        </div>
        
        {/* Table */}
        <ResidentTable
          residents={residents}
          isLoading={isLoading}
          searchTerm={debouncedSearchTerm}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deleteResident.isPending ? deleteResident.variables : null}
        />
        
        {/* Pagination */}
        {residents.length > 0 && (
          <ResidentPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}
      </section>
    </main>
  );
};

export default ResidentManagement;