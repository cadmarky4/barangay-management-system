// ============================================================================
// BusinessPermitForm.tsx - Enhanced with React Hook Form + Zod validation + Abstraction
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSearch, FiUser, FiCheck, FiArrowLeft, FiAlertCircle, FiBriefcase, FiMapPin } from 'react-icons/fi';

import { useResidents } from '../../services/residents/useResidents';
import { useBarangayOfficials } from '../../services/officials/useBarangayOfficials';
import { useDocumentForm } from './_hooks/useDocumentForm';
import { DocumentFormDataSchema, type DocumentFormData } from '../../services/documents/documents.types';
import { type Resident } from '../../services/residents/residents.types';
import { useNotifications } from '../_global/NotificationSystem';
import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { DocumentFormField } from './_components/DocumentFormField';
import Breadcrumb from '../_global/Breadcrumb';

interface BusinessPermitFormProps {
  onNavigate: (page: string) => void;
}

const BusinessPermitForm: React.FC<BusinessPermitFormProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const { showNotification } = useNotifications();

  // React Hook Form setup with Zod validation
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentFormDataSchema),
    defaultValues: {
      document_type: 'BUSINESS_PERMIT',
      resident_id: '',
      applicant_name: '',
      purpose: '',
      applicant_address: '',
      applicant_contact: '',
      applicant_email: '',
      priority: 'NORMAL',
      needed_date: '',
      processing_fee: 100,
      business_name: '',
      business_type: '',
      business_address: '',
      business_owner: '',
      requirements_submitted: [],
      notes: '',
      remarks: '',
    },
    mode: 'onChange',
  });

  const { 
    setValue, 
    watch, 
    handleSubmit, 
    formState: { errors, isValid },
    getValues,
    reset
  } = form;

  // Document form hook for API integration
  const documentForm = useDocumentForm({
    documentType: 'BUSINESS_PERMIT',
    onSuccess: (_document) => {
      showNotification({
        type: 'success',
        title: 'Request Submitted',
        message: 'Business Permit request has been submitted successfully'
      });
      setStep(3);
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.message
      });
    }
  });

  // Residents query for search  
  const { 
    data: residentsData, 
    isLoading: searchLoading 
  } = useResidents({ 
    search: searchTerm, 
    per_page: 10 
  });

  const residents = residentsData?.data || [];

  // Static data for form options
  const businessTypes = [
    'Retail Store',
    'Sari-sari Store',
    'Restaurant/Eatery',
    'Beauty Salon/Barbershop',
    'Internet Cafe',
    'Repair Shop',
    'Tailoring/Dressmaking',
    'Bakery',
    'Pharmacy/Drugstore',
    'Hardware Store',
    'Grocery Store',
    'Service Provider',
    'Manufacturing',
    'Other (Specify in Additional Info)'
  ];

  const commonPurposes = [
    'New Business Operation',
    'Business Renewal',
    'Business Expansion',
    'Change of Business Name',
    'Change of Business Location',
    'Bank Loan Application',
    'Government Compliance',
    'Tax Registration',
    'License Application',
    'Legal Requirements'
  ];

  // Fetch active barangay officials for the certifying official dropdown
  const { data: officialsData, isLoading: isLoadingOfficials } = useBarangayOfficials({
    status: 'ACTIVE',
    current_term: true,
    per_page: 100 // Get all active officials
  });

  const officials = officialsData?.data || [];

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update form when resident is selected
  useEffect(() => {
    if (selectedResident) {
      const fullName = `${selectedResident.first_name} ${selectedResident.middle_name || ''} ${selectedResident.last_name}`.trim();
      
      setValue('resident_id', selectedResident.id);
      setValue('applicant_name', fullName);
      setValue('business_owner', fullName);
      setValue('applicant_address', selectedResident.complete_address);
      setValue('applicant_contact', selectedResident.mobile_number || '');
      setValue('applicant_email', selectedResident.email_address || '');
    }
  }, [selectedResident, setValue]);

  // Watch for priority changes to update processing fee
  const priority = watch('priority');
  useEffect(() => {
    setValue('processing_fee', priority === 'HIGH' ? 150 : 100);
  }, [priority, setValue]);

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    setSearchTerm(`${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.trim());
    setStep(2);
  };

  // Enhanced submit handler using the existing DocumentFormData
  const onSubmit = handleSubmit(async (formData) => {
    if (!selectedResident) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a business owner first'
      });
      return;
    }

    try {
      // Update purpose with business name if provided
      if (formData.business_name) {
        formData.purpose = `Business Permit for ${formData.business_name}`;
      }
      
      await documentForm.handleSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  // Handle custom field updates
  const handleBusinessDescriptionChange = (value: string) => {
    const _currentNotes = getValues('notes') || '';
    setValue('notes', `Business Description: ${value}`);
  };

  const handleCapitalAmountChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Capital Amount: ₱[\d,]+/, '') + ` Capital Amount: ₱${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleEmployeesChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Number of Employees: \d+/, '') + ` Number of Employees: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleOperatingHoursChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Operating Hours: [^,]*/, '') + ` Operating Hours: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleCertifyingOfficialChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Certifying Official: [^,]*/, '') + ` Certifying Official: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const renderStep1 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: '200ms' }}>
      <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
        Select Business Owner
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for business owner *
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter business owner's name..."
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
          />
        </div>
        
        {searchLoading && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
            <LoadingSpinner size="sm" />
            <span>Searching...</span>
          </div>
        )}
        
        {residents.length > 0 && searchTerm && (
          <div className="mt-2 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
            {residents.map((resident) => (
              <div
                key={resident.id}
                onClick={() => handleResidentSelect(resident)}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-smblue-100 rounded-full flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-smblue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {resident.first_name} {resident.middle_name} {resident.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{resident.complete_address}</div>
                    <div className="text-xs text-gray-400">
                      Age: {resident.age} • {resident.civil_status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Always show "Add New Resident" option */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Can't find the business owner you're looking for?
            </p>
            <button
              onClick={() => onNavigate('residents/add')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiUser className="w-4 h-4 mr-2" />
              Add New Resident
            </button>
          </div>
        </div>

        {/* Show specific message when no results found */}
        {!residents.length && searchTerm && !searchLoading && (
          <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm text-center">
              No residents found matching "{searchTerm}". Try a different search term or add a new resident.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className={`space-y-6 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '300ms' }}>
        
        {/* Business Owner Information Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Business Owner Information
          </h2>
          
          {selectedResident && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="text-sm text-gray-900">
                  {selectedResident.first_name} {selectedResident.middle_name} {selectedResident.last_name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <div className="text-sm text-gray-900">{selectedResident.age}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                <div className="text-sm text-gray-900">{selectedResident.civil_status}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <div className="text-sm text-gray-900">{selectedResident.nationality}</div>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Residence Address</label>
                <div className="text-sm text-gray-900">{selectedResident.complete_address}</div>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center text-sm text-smblue-400 hover:text-smblue-300"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Change Business Owner
            </button>
          </div>
        </div>

        {/* Business Details Form - NOW USING ABSTRACTED COMPONENTS! */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Business Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name Field - ABSTRACTED! */}
            <DocumentFormField
              name="business_name"
              label="Business Name"
              type="text"
              placeholder="Enter business name"
              required
            />

            {/* Business Type Field - ABSTRACTED! */}
            <DocumentFormField
              name="business_type"
              label="Business Type"
              type="select"
              options={businessTypes.map(type => ({ value: type, label: type }))}
              placeholder="Select business type"
              required
            />

            {/* Business Address Field - ABSTRACTED! */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="business_address"
                label="Business Address"
                type="text"
                placeholder="Complete business address"
                required
              />
            </div>

            {/* Purpose Field - ABSTRACTED! */}
            <DocumentFormField
              name="purpose"
              label="Purpose of Request"
              type="select"
              options={commonPurposes.map(p => ({ value: p, label: p }))}
              placeholder="Select purpose"
              required
            />

            {/* Capital Amount - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Business capital in pesos"
                min="0"
                step="0.01"
                onChange={(e) => handleCapitalAmountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>

            {/* Number of Employees - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees
              </label>
              <input
                type="number"
                placeholder="Total number of employees"
                min="0"
                onChange={(e) => handleEmployeesChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>

            {/* Operating Hours - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Hours <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 8:00 AM - 6:00 PM, Monday to Saturday"
                onChange={(e) => handleOperatingHoursChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>

            {/* Certifying Official - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifying Official <span className="text-red-500">*</span>
              </label>
              <select
                onChange={(e) => handleCertifyingOfficialChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                disabled={isLoadingOfficials}
              >
                <option value="">
                  {isLoadingOfficials ? 'Loading officials...' : 'Select official'}
                </option>
                {officials.map((official) => {
                  const fullName = `${official.prefix} ${official.first_name} ${official.middle_name ? official.middle_name + ' ' : ''}${official.last_name}${official.suffix ? ' ' + official.suffix : ''}`.trim();
                  const positionText = official.position.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <option key={official.id} value={fullName}>
                      {fullName} ({positionText})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Business Description Field - Custom handling for notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe the nature of your business, products/services offered..."
                rows={3}
                onChange={(e) => handleBusinessDescriptionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>

            {/* Additional Information Field - ABSTRACTED! */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="notes"
                label="Additional Information"
                type="textarea"
                placeholder="Any additional information about the business, special requirements, etc..."
                rows={3}
              />
            </div>
          </div>

          {/* Urgent Request Option */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={watch('priority') === 'HIGH'}
                onChange={(e) => {
                  setValue('priority', e.target.checked ? 'HIGH' : 'NORMAL');
                }}
                className="h-4 w-4 text-smblue-400 focus:ring-smblue-200 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Urgent Processing Request (+₱50 fee)
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-600">
              Urgent requests are processed within 3-5 business days instead of the standard 7-10 business days.
            </p>
          </div>

          {/* Processing Fee Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Processing Fee:</span>
              <span className="text-lg font-bold text-smblue-400">
                ₱{watch('processing_fee')}
              </span>
            </div>
            {watch('priority') === 'HIGH' && (
              <p className="text-xs text-gray-600 mt-1">
                Includes ₱100 standard fee + ₱50 urgent processing fee
              </p>
            )}
          </div>

          {/* Requirements Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <FiBriefcase className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Required Documents for Business Permit
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Valid ID of business owner</li>
                    <li>Proof of business address (lease contract or property title)</li>
                    <li>Business registration documents (if applicable)</li>
                    <li>Sanitary permit (for food establishments)</li>
                    <li>Fire safety inspection certificate</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Form-level Error Display */}
          {errors.root && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">{errors.root.message}</p>
              </div>
            </div>
          )}

          {/* Document Form Error Display */}
          {documentForm.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-red-800 text-sm">{documentForm.error}</p>
                </div>
                <button 
                  type="button"
                  onClick={documentForm.clearError}
                  className="text-red-600 underline text-sm hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setStep(1)} 
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={documentForm.isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={documentForm.isSubmitting || !isValid}
              className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {documentForm.isSubmitting && (
                <LoadingSpinner size="sm" />
              )}
              <span>{documentForm.isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );

  const renderStep3 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: '200ms' }}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <FiCheck className="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-darktext mb-2">Request Submitted Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Your Business Permit request has been submitted and is now being processed. 
        You will be notified once it's ready for pickup.
      </p>
      
      {selectedResident && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Application Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Business Owner:</strong> {selectedResident.first_name} {selectedResident.last_name}</p>
            <p><strong>Business Name:</strong> {watch('business_name')}</p>
            <p><strong>Business Type:</strong> {watch('business_type')}</p>
            <p><strong>Processing Fee:</strong> ₱{watch('processing_fee')}</p>
            <p><strong>Expected Processing Time:</strong> {watch('priority') === 'HIGH' ? '3-5 business days' : '7-10 business days'}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <FiMapPin className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
          <div className="ml-3 text-left">
            <h3 className="text-sm font-medium text-blue-800">
              Next Steps
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>Prepare required documents listed above</li>
                <li>Wait for approval notification</li>
                <li>Visit barangay office for document verification</li>
                <li>Pay processing fee and claim your permit</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => onNavigate('process-document')}
          className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
        >
          Back to Documents
        </button>
        <button
          onClick={() => {
            setStep(1);
            setSelectedResident(null);
            setSearchTerm('');          reset({
            document_type: 'BUSINESS_PERMIT',
            resident_id: '',
              applicant_name: '',
              purpose: '',
              applicant_address: '',
              applicant_contact: '',
              applicant_email: '',
              priority: 'NORMAL',
              needed_date: '',
              processing_fee: 100,
              business_name: '',
              business_type: '',
              business_address: '',
              business_owner: '',
              requirements_submitted: [],
              notes: '',
              remarks: '',
            });
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div className={`mb-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-2xl font-bold text-darktext">Business Permit Application</h1>
        <p className="text-gray-600 mt-1">Barangay Business Clearance and Operating Permit</p>
      </div>

      {/* Step Indicator */}
      <div className={`mb-8 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '100ms' }}>
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepNumber
                  ? 'bg-smblue-400 text-white' 
                  : step > stepNumber
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step > stepNumber ? <FiCheck /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 ${
                  step > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-16 mt-2">
          <span className={`text-xs ${step === 1 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Select Owner
          </span>
          <span className={`text-xs ${step === 2 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Business Details
          </span>
          <span className={`text-xs ${step === 3 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Confirmation
          </span>
        </div>
      </div>

      {/* Form Steps */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default BusinessPermitForm;