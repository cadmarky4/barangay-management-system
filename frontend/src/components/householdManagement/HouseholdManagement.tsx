import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '../_global/Breadcrumb';
import HouseholdStats from './_components/HouseholdStats';
import HouseholdFilters from './_components/HouseholdFilters';
import HouseholdTable from './_components/HouseholdTables';
import { useHouseholds, useHouseholdStatistics, useDeleteHousehold } from '@/services/households/useHouseholds';

const HouseholdManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Animation state
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Hooks for data fetching
  const { 
    data: householdsData, 
    isLoading: isLoadingHouseholds, 
    error: householdsError 
  } = useHouseholds({
    page: currentPage,
    per_page: 15,
    search: searchTerm || undefined,
  });
  
  const { 
    data: statistics, 
    isLoading: isLoadingStats 
  } = useHouseholdStatistics();
  
  const deleteHouseholdMutation = useDeleteHousehold();

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset to first page when searching
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const handleAddHousehold = () => {
    navigate('/household/add');
  };

  const handleEditHousehold = (householdId: string) => {
    navigate(`/household/edit/${householdId}`);
  };

  const handleViewHousehold = (householdId: string) => {
    navigate(`/household/view/${householdId}`);
  };

  const handleDeleteHousehold = async (householdId: string, householdNumber: string) => {
    if (
      window.confirm(
        t('households.messages.deleteConfirm')
      )
    ) {
      deleteHouseholdMutation.mutate(householdId);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Automatic Breadcrumbs */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Page Header */}
      <div className={`mb-2 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h1 className="text-2xl font-bold text-darktext pl-0">
          {t('households.title')}
        </h1>
      </div>

      {/* Error Display */}
      {householdsError && (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '200ms' }}>
          <p className="text-red-800 text-sm">
            {householdsError instanceof Error ? householdsError.message : t('households.messages.loadError')}
          </p>
        </div>
      )}

      {/* Statistics Overview */}
      <HouseholdStats 
        statistics={statistics}
        isLoading={isLoadingStats}
        isLoaded={isLoaded}
      />

      {/* Households Section */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '850ms' }}>
        
        {/* Filters and Search */}
        <HouseholdFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddHousehold={handleAddHousehold}
        />

        {/* Table */}
        <HouseholdTable
          households={householdsData?.data || []}
          pagination={householdsData ? {
            current_page: householdsData.current_page,
            last_page: householdsData.last_page,
            per_page: householdsData.per_page,
            total: householdsData.total,
          } : undefined}
          isLoading={isLoadingHouseholds}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onEdit={handleEditHousehold}
          onView={handleViewHousehold}
          onDelete={handleDeleteHousehold}
          isDeleting={deleteHouseholdMutation.isPending}
          deletingId={deleteHouseholdMutation.variables}
        />
      </section>
    </main>
  );
};

export default HouseholdManagement;