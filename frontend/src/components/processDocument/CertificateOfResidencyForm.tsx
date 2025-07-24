// ============================================================================
// CertificateOfResidencyForm.tsx - Enhanced with React Hook Form + Zod validation + Abstraction
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSearch, FiUser, FiCheck, FiArrowLeft, FiAlertCircle, FiHome, FiCalendar } from 'react-icons/fi';

import { useResidents } from '../../services/residents/useResidents';
import { useBarangayOfficials } from '../../services/officials/useBarangayOfficials';
import { useDocumentForm } from './_hooks/useDocumentForm';
import { DocumentFormDataSchema, type DocumentFormData } from '../../services/documents/documents.types';
import { type Resident } from '../../services/residents/residents.types';
import { useNotifications } from '../_global/NotificationSystem';
import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { DocumentFormField } from './_components/DocumentFormField';
import Breadcrumb from '../_global/Breadcrumb';

interface CertificateOfResidencyFormProps {
  onNavigate: (page: string) => void;
}

const CertificateOfResidencyForm: React.FC<CertificateOfResidencyFormProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const { showNotification } = useNotifications();

  // React Hook Form setup with Zod validation
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentFormDataSchema),
    defaultValues: {
      document_type: 'CERTIFICATE_OF_RESIDENCY',
      resident_id: '',
      applicant_name: '',
      purpose: '',
      applicant_address: '',
      applicant_contact: '',
      applicant_email: '',
      priority: 'NORMAL',
      needed_date: '',
      processing_fee: 30,
      residency_period: '',
      previous_address: '',
      requirements_submitted: ['Proof of Residency', 'Valid ID'],
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
    documentType: 'CERTIFICATE_OF_RESIDENCY',
    onSuccess: (_document) => {
      showNotification({
        type: 'success',
        title: 'Request Submitted',
        message: 'Certificate of Residency request has been submitted successfully'
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
  const purposeOptions = [
    'Employment',
    'School Enrollment',
    'Bank Account Opening',
    'Loan Application',
    'Government Transaction',
    'Legal Proceedings',
    'Passport Application',
    'Visa Application',
    'Other (Specify in Additional Info)'
  ];

  const residencyStatusOptions = [
    'Permanent Resident',
    'Temporary Resident',
    'Boarder/Renter',
    'Family Member',
    'Caretaker'
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
      setValue('applicant_address', selectedResident.complete_address);
      setValue('applicant_contact', selectedResident.mobile_number || '');
      setValue('applicant_email', selectedResident.email_address || '');
    }
  }, [selectedResident, setValue]);

  // Watch for priority changes to update processing fee
  const priority = watch('priority');
  useEffect(() => {
    setValue('processing_fee', priority === 'HIGH' ? 55 : 30);
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
        message: 'Please select a resident first'
      });
      return;
    }

    try {
      await documentForm.handleSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  // Handle custom field updates
  const handleYearsOfResidenceChange = (value: string) => {
    setValue('residency_period', `${value} years`);

    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Years of Residence: \d+/, '') + ` Years of Residence: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleResidencyStatusChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Residency Status: [^,]*/, '') + ` Residency Status: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleCertifyingOfficialChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Certifying Official: [^,]*/, '') + ` Certifying Official: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleAdditionalInfoChange = (value: string) => {
    setValue('notes', value);
  };

  const renderStep1 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '200ms' }}>
      <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
        Select Resident
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for resident *
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter resident's name..."
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
              Can't find the resident you're looking for?
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
      <form onSubmit={onSubmit} className={`space-y-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '300ms' }}>

        {/* Resident Information Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Resident Information
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
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
              Change Resident
            </button>
          </div>
        </div>

        {/* Certificate Details Form - NOW USING ABSTRACTED COMPONENTS! */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Certificate of Residency Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purpose Field - ABSTRACTED! */}
            <DocumentFormField
              name="purpose"
              label="Purpose"
              type="select"
              options={purposeOptions.map(p => ({ value: p, label: p }))}
              placeholder="Select purpose"
              required
            />

            {/* Years of Residence - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Residence <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Number of years residing in the barangay"
                min="0"
                max="100"
                onChange={(e) => handleYearsOfResidenceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>

            {/* Residency Status - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Residency Status <span className="text-red-500">*</span>
              </label>
              <select
                onChange={(e) => handleResidencyStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              >
                <option value="">Select residency status</option>
                {residencyStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
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

            {/* Previous Address Field - ABSTRACTED! */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="previous_address"
                label="Previous Address (if applicable)"
                type="text"
                placeholder="Previous address if recently moved to the barangay"
              />
            </div>

            {/* Additional Information Field - Custom handling for notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                placeholder="Any additional information or special circumstances..."
                rows={3}
                onChange={(e) => handleAdditionalInfoChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
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
                Urgent Processing Request (+₱25 fee)
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-600">
              Urgent requests are processed within 1-2 business days instead of the standard 3-5 business days.
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
                Includes ₱30 standard fee + ₱25 urgent processing fee
              </p>
            )}
          </div>

          {/* Certificate Validity Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <FiCalendar className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Certificate Validity
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>This Certificate of Residency is valid for <strong>6 months</strong> from the date of issuance.</p>
                  <p className="mt-1">Required for various transactions including employment, school enrollment, and government applications.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <FiHome className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Required Documents
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Valid ID of the applicant</li>
                    <li>Proof of residence (utility bills, lease contract, etc.)</li>
                    <li>Barangay ID or voter's registration (if available)</li>
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
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '200ms' }}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <FiCheck className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-darktext mb-2">Request Submitted Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Your Certificate of Residency request has been submitted and is now being processed.
        You will be notified once it's ready for pickup.
      </p>

      {selectedResident && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Request Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Resident:</strong> {selectedResident.first_name} {selectedResident.last_name}</p>
            <p><strong>Document:</strong> Certificate of Residency</p>
            <p><strong>Purpose:</strong> {watch('purpose')}</p>
            <p><strong>Processing Fee:</strong> ₱{watch('processing_fee')}</p>
            <p><strong>Expected Processing Time:</strong> {watch('priority') === 'HIGH' ? '1-2 business days' : '3-5 business days'}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <FiCalendar className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
          <div className="ml-3 text-left">
            <h3 className="text-sm font-medium text-blue-800">
              Important Reminders
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Certificate is valid for 6 months from issuance date</li>
                <li>Present valid ID when claiming your certificate</li>
                <li>Bring required documents for verification</li>
                <li>Processing may require additional verification</li>
              </ul>
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
            setSearchTerm('');
            reset({
              document_type: 'CERTIFICATE_OF_RESIDENCY',
              resident_id: '',
              applicant_name: '',
              purpose: '',
              applicant_address: '',
              applicant_contact: '',
              applicant_email: '',
              priority: 'NORMAL',
              needed_date: '',
              processing_fee: 30,
              residency_period: '',
              previous_address: '',
              requirements_submitted: ['Proof of Residency', 'Valid ID'],
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
      <div className={`mb-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        <h1 className="text-2xl font-bold text-darktext">Certificate of Residency Request</h1>
        <p className="text-gray-600 mt-1">Request a certificate of residency for various transactions</p>
      </div>

      {/* Step Indicator */}
      <div className={`mb-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '100ms' }}>
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === stepNumber
                ? 'bg-smblue-400 text-white'
                : step > stepNumber
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                }`}>
                {step > stepNumber ? <FiCheck /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 ${step > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-16 mt-2">
          <span className={`text-xs ${step === 1 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Select Resident
          </span>
          <span className={`text-xs ${step === 2 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Residency Details
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

export default CertificateOfResidencyForm;