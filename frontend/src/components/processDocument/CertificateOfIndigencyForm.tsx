import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSearch, FiUser, FiCheck, FiArrowLeft, FiAlertCircle, FiInfo } from 'react-icons/fi';

import { useResidents } from '../../services/residents/useResidents';
import { useDocumentForm } from './_hooks/useDocumentForm';
import { DocumentFormDataSchema, type DocumentFormData } from '../../services/documents/documents.types';
import { type Resident } from '../../services/residents/residents.types';
import { useNotifications } from '../_global/NotificationSystem';
import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { DocumentFormField } from './_components/DocumentFormField';
import Breadcrumb from '../_global/Breadcrumb';

interface CertificateOfIndigencyFormProps {
  onNavigate: (page: string) => void;
}

const CertificateOfIndigencyForm: React.FC<CertificateOfIndigencyFormProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const { showNotification } = useNotifications();

  // React Hook Form setup with Zod validation
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentFormDataSchema),
    defaultValues: {
      document_type: 'CERTIFICATE_OF_INDIGENCY',
      resident_id: '',
      applicant_name: '',
      purpose: '',
      applicant_address: '',
      applicant_contact: '',
      applicant_email: '',
      priority: 'NORMAL',
      needed_date: '',
      processing_fee: 0, // Always FREE by law
      indigency_reason: '',
      monthly_income: 0,
      family_size: 1,
      requirements_submitted: ['Declaration of Indigency'],
      notes: '',
      remarks: '',
    },
    mode: 'onChange',
  });

  const { 
    register, 
    setValue, 
    watch, 
    handleSubmit, 
    formState: { errors, isValid },
    getValues,
    reset
  } = form;

  // Document form hook for API integration
  const documentForm = useDocumentForm({
    documentType: 'CERTIFICATE_OF_INDIGENCY',
    onSuccess: (document) => {
      showNotification({
        type: 'success',
        title: 'Request Submitted',
        message: 'Certificate of Indigency request has been submitted successfully'
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
  const commonPurposes = [
    'Medical Assistance',
    'Educational Scholarship',
    'DSWD AICS Program',
    'PCSO Medical Assistance',
    'Burial Assistance',
    'Calamity Relief',
    'Food Assistance',
    'Housing Program',
    'Legal Aid Services',
    'Government Benefits'
  ];

  const incomeSources = [
    'No Regular Income',
    'Daily Labor/Casual Work',
    'Unemployment',
    'Senior Citizen Pension',
    'PWD Benefits',
    'Informal Vending',
    'Dependent on Family',
    'Other (Specify in Additional Info)'
  ];

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

    if (!declarationAgreed) {
      showNotification({
        type: 'error',
        title: 'Declaration Required',
        message: 'Please agree to the declaration of indigency'
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
  const handleMonthlyIncomeChange = (value: string) => {
    const income = parseFloat(value) || 0;
    setValue('monthly_income', income);
    
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Monthly Income: ₱[\d,]+\.?\d*/, '') + ` Monthly Income: ₱${income}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleFamilySizeChange = (value: string) => {
    const size = parseInt(value) || 1;
    setValue('family_size', size);
    
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Household Members: \d+/, '') + ` Household Members: ${size}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleIncomeSourceChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Source: [^,]*/, '') + ` Source: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const handleAdditionalInfoChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Additional Info: [^,]*/, '') + ` Additional Info: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const renderStep1 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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
      <form onSubmit={onSubmit} className={`space-y-6 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '300ms' }}>
        
        {/* FREE Certificate Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex">
            <FiInfo className="flex-shrink-0 h-5 w-5 text-orange-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Certificate of Indigency is FREE
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  In accordance with DILG Memorandum Circular 2019-72 and R.A. 11261 (First Time Jobseekers Assistance Act), 
                  this certificate is issued <strong>FREE OF CHARGE</strong>. Any person demanding payment may be held liable under applicable laws.
                </p>
              </div>
            </div>
          </div>
        </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
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

        {/* Indigency Information Form - NOW USING ABSTRACTED COMPONENTS! */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Indigency Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purpose Field - ABSTRACTED! */}
            <DocumentFormField
              name="purpose"
              label="Purpose of Request"
              type="select"
              options={commonPurposes.map(p => ({ value: p, label: p }))}
              placeholder="Select purpose"
              required
            />

            {/* Monthly Income - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Household Income <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter monthly income in pesos"
                min="0"
                step="0.01"
                onChange={(e) => handleMonthlyIncomeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
              <p className="text-xs text-gray-500 mt-1">Enter 0 if no income</p>
            </div>

            {/* Family Size - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Household Members <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Total family members"
                min="1"
                onChange={(e) => handleFamilySizeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>

            {/* Income Source - Custom field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Source of Income <span className="text-red-500">*</span>
              </label>
              <select
                onChange={(e) => handleIncomeSourceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              >
                <option value="">Select income source</option>
                {incomeSources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Additional Information Field - Custom handling for remarks */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                placeholder="Provide additional details about family situation, special circumstances, or other relevant information..."
                rows={4}
                onChange={(e) => handleAdditionalInfoChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
              />
            </div>
          </div>

          {/* Declaration */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={declarationAgreed}
                onChange={(e) => setDeclarationAgreed(e.target.checked)}
                className="h-4 w-4 text-orange-500 focus:ring-orange-200 border-gray-300 rounded mt-1"
                required
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Declaration:</strong> I hereby declare that the information provided above is true and correct. 
                I understand that providing false information may result in legal consequences. I also acknowledge that 
                my family belongs to the indigent sector and requires assistance from government programs and institutions.
              </span>
            </label>
          </div>

          {/* Processing Fee Display */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Processing Fee:</span>
              <span className="text-lg font-bold text-orange-600">FREE</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              As mandated by law, Certificate of Indigency is issued free of charge
            </p>
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
              disabled={documentForm.isSubmitting || !isValid || !declarationAgreed}
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
        Your Certificate of Indigency request has been submitted and is now being processed. 
        You will be notified once it's ready for pickup.
      </p>
      
      {selectedResident && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Request Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Resident:</strong> {selectedResident.first_name} {selectedResident.last_name}</p>
            <p><strong>Document:</strong> Certificate of Indigency</p>
            <p><strong>Purpose:</strong> {watch('purpose')}</p>
            <p><strong>Processing Fee:</strong> FREE</p>
            <p><strong>Expected Processing Time:</strong> 24-48 hours</p>
          </div>
        </div>
      )}
      
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-orange-800">
          <strong>Important:</strong> This certificate is issued free of charge. Please present a valid ID 
          when claiming your certificate. Processing may require verification of the information provided.
        </p>
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
            document_type: 'CERTIFICATE_OF_INDIGENCY',
            resident_id: '',
              applicant_name: '',
              purpose: '',
              applicant_address: '',
              applicant_contact: '',
              applicant_email: '',
              priority: 'NORMAL',
              needed_date: '',
              processing_fee: 0,
              indigency_reason: '',
              monthly_income: 0,
              family_size: 1,
              requirements_submitted: ['Declaration of Indigency'],
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
        <h1 className="text-2xl font-bold text-darktext">Certificate of Indigency Request</h1>
        <p className="text-gray-600 mt-1">Request a certificate of indigency for various assistance programs</p>
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
            Select Resident
          </span>
          <span className={`text-xs ${step === 2 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Indigency Details
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

export default CertificateOfIndigencyForm;