import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiX, FiHome, FiUsers, FiDollarSign, FiMapPin, FiFileText, FiEdit } from 'react-icons/fi';
import Breadcrumb from '../_global/Breadcrumb';
import HouseholdHeader from './_components/HouseholdHeader';
import HouseholdInfoSection from './_components/HouseholdInfoSection';
import HouseholdMembersTable from './_components/HouseholdMembersTable';
import HouseholdClassificationGrid from './_components/HouseholdClassificationGrid';
import { useHousehold } from '@/services/households/useHouseholds';
import { formatHouseholdType, formatOwnershipStatus } from './_utils/householdUtils';


const ViewHousehold: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Validate ID format - simplified validation
  const isValidId = (id: string) => {
    // Just check if it's a non-empty string
    const isValid = !!(id && id.trim().length > 0);
    
    // Log for debugging
    console.log('ID validation:', { id, isValid });
    
    return isValid;
  };

  // Use our household hook
  const { 
    data: household, 
    isLoading, 
    error 
  } = useHousehold(id || '', !!id && isValidId(id || ''));

  const handleClose = () => {
    navigate('/household');
  };

  const handleEdit = () => {
    navigate(`/household/edit/${id}`);
  };

  // Handle invalid ID
  if (!id || !isValidId(id)) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-400 mb-2">400</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Invalid Household ID</h2>
            <p className="text-gray-600 mb-6">
              The household ID provided is not in the correct format.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
            >
              Back to Households List
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading household data...</p>
        </div>
      </main>
    );
  }

  // Handle error state
  if (error || !household) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-400 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Household Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error instanceof Error 
                ? error.message.includes('not found')
                  ? 'The household you are looking for does not exist.'
                  : error.message.includes('network') || error.message.includes('fetch')
                  ? 'Unable to connect to server. Please check your connection.'
                  : 'Unable to load household data.'
                : 'The household you are looking for does not exist.'}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
            >
              Back to Households List
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Breadcrumb */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div className={`mb-2 flex justify-between items-center transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h1 className="text-2xl font-bold text-darktext pl-0">View Household Profile</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="p-2 text-smblue-400 hover:text-smblue-300 hover:bg-smblue-50 rounded-lg transition-colors"
            title="Edit Household"
          >
            <FiEdit className="w-6 h-6" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Household Header */}
        <HouseholdHeader 
          household={household}
        />

        {/* Basic Information */}
        <HouseholdInfoSection
          title="Household Information"
          icon={FiFileText}
          data={[
            { label: "Household Number", value: household.household_number || 'Auto-generated' },
            { label: "Head of Family", value: household.head_resident 
              ? `${household.head_resident.first_name} ${household.head_resident.last_name}`
              : 'No Head Assigned' },
            { label: "Total Members", value: `${household.members?.length || 0} member${(household.members?.length || 0) !== 1 ? 's' : ''}` },
            { label: "Household Type", value: household.household_type ? formatHouseholdType(household.household_type) : 'Not specified' },
            { label: "Ownership Status", value: household.ownership_status ? formatOwnershipStatus(household.ownership_status) : 'Not specified' }
          ]}
        />

        {/* Address Information */}
        <HouseholdInfoSection
          title="Address Information"
          icon={FiMapPin}
          data={[
            { label: "Complete Address", value: household.complete_address || 'Not specified' }
          ]}
          columns={1}
        />

        {/* Economic Information */}
        <HouseholdInfoSection
          title="Economic Information"
          icon={FiDollarSign}
          data={[
            { 
              label: "Monthly Income", 
              value: household.monthly_income 
                ? household.monthly_income.replace('BELOW_', 'Below ₱').replace('RANGE_', '₱').replace('ABOVE_', 'Above ₱').replace('_', ',000 - ₱') + (household.monthly_income.includes('ABOVE') ? '' : ',000')
                : 'Not specified' 
            },
            { label: "Primary Income Source", value: household.primary_income_source || 'Not specified' }
          ]}
          columns={2}
        />

        {/* Household Members */}
        <HouseholdMembersTable 
          household={household}
        />

        {/* Housing Information */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 flex items-center">
            <FiHome className="mr-2" />
            Housing Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">House Type</label>
              <p className="text-gray-900">{household.house_type || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Ownership Status</label>
              <p className="text-gray-900">{household.ownership_status ? formatOwnershipStatus(household.ownership_status) : 'Not specified'}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">Utilities Access</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${household.has_electricity ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-700">Electricity</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${household.has_water_supply ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-700">Water Supply</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${household.has_internet_access ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-700">Internet Access</span>
              </div>
            </div>
          </div>
        </section>

        {/* Household Classification */}
        <HouseholdClassificationGrid 
          household={household}
        />

        {/* Additional Information */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Additional Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Remarks</label>
            <p className="text-gray-900">{household.remarks || 'No additional remarks'}</p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleEdit}
            className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
          >
            Edit Household
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </main>
  );
};

export default ViewHousehold;