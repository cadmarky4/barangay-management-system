// ============================================================================
// components/residents/form/ResidentForm.tsx - Multi-step form component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiX, FiChevronLeft, FiChevronRight, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useResidentForm } from '../_hooks/useResidentsForm';
import { ResidentFormSection } from './ResidentFormSection';
import { ResidentFormField } from './ResidentFormField';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { DuplicateWarning } from './DuplicateWarning';
import { LoadingSpinner } from '@/components/__shared/LoadingSpinner';
import { usePhilippineAddress } from '../_hooks/usePhilippineAddress';
import { type ResidentFormData } from '@/services/residents/residents.types';

interface ResidentFormProps {
  mode: 'create' | 'edit';
  residentId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isComplete?: boolean;
}

const FORM_STEPS: FormStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Personal details and demographics',
    fields: ['first_name', 'last_name', 'middle_name', 'suffix', 'birth_date', 'birth_place', 'gender', 'civil_status', 'nationality', 'religion']
  },
  {
    id: 'contact',
    title: 'Contact & Address',
    description: 'Contact information and current address',
    fields: ['mobile_number', 'landline_number', 'email_address', 'region', 'province', 'city', 'barangay', 'house_number', 'street', 'complete_address']
  },
  {
    id: 'employment',
    title: 'Employment & Education',
    description: 'Work and educational background',
    fields: ['educational_attainment', 'employment_status', 'occupation', 'employer']
  },
  {
    id: 'family',
    title: 'Family Information',
    description: 'Family members and emergency contacts',
    fields: ['mother_name', 'father_name', 'emergency_contact_name', 'emergency_contact_number', 'emergency_contact_relationship']
  },
  {
    id: 'government',
    title: 'Government IDs',
    description: 'Government identification and voter information',
    fields: ['primary_id_type', 'id_number', 'philhealth_number', 'sss_number', 'tin_number', 'voters_id_number', 'voter_status', 'precinct_number']
  },
  {
    id: 'health',
    title: 'Health & Medical',
    description: 'Medical conditions and health information',
    fields: ['medical_conditions', 'allergies']
  },
  {
    id: 'classifications',
    title: 'Special Classifications',
    description: 'Special status and government programs',
    fields: ['senior_citizen', 'person_with_disability', 'disability_type', 'indigenous_people', 'indigenous_group', 'four_ps_beneficiary', 'four_ps_household_id']
  },
  {
    id: 'photo',
    title: 'Profile Photo',
    description: 'Upload profile picture (optional)',
    fields: ['profile_photo_url']
  }
];

export const ResidentForm: React.FC<ResidentFormProps> = ({
  mode,
  residentId,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const {
    regions,
    provinces,
    cities,
    barangays,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    isLoadingAddress,
    error: addressError,
    retry: retryAddressLoad
  } = usePhilippineAddress();

  const {
    form,
    isLoadingResident,
    profilePhotoPreview,
    duplicateWarning,
    isSubmitting,
    isUploadingFile,
    handleSubmit,
    handleFileUpload,
    saveDraft,
    clearDraft,
  } = useResidentForm({ mode, residentId, onSuccess });

  const currentStepData = FORM_STEPS[currentStep];
  // const isLastStep = currentStep === FORM_STEPS.length - 2;
  const isLastStep = currentStep === 7;
  const isFirstStep = currentStep === 0;

  // Watch for address changes to load dependent options - only clear dependent fields when user changes selection
  const selectedRegion = form.watch('region');
  const selectedProvince = form.watch('province');
  const selectedCity = form.watch('city');
  const watchPersonWithDisability = form.watch('person_with_disability');
  const watchIndigenousPeople = form.watch('indigenous_people');
  const watchFourPsBeneficiary = form.watch('four_ps_beneficiary');

  // State to track if we're initially loading data (to prevent clearing dependent fields)
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (selectedRegion) {
      handleRegionChange(selectedRegion);
      // Only clear dependent fields if this is user interaction, not initial load
      if (!isInitialLoad) {
        form.setValue('province', '');
        form.setValue('city', '');
        form.setValue('barangay', '');
      }
    }
  }, [selectedRegion, handleRegionChange, form, isInitialLoad]);

  useEffect(() => {
    if (selectedProvince) {
      handleProvinceChange(selectedProvince);
      // Only clear dependent fields if this is user interaction, not initial load
      if (!isInitialLoad) {
        form.setValue('city', '');
        form.setValue('barangay', '');
      }
    }
  }, [selectedProvince, handleProvinceChange, form, isInitialLoad]);

  useEffect(() => {
    if (selectedCity) {
      handleCityChange(selectedCity);
      // Only clear dependent fields if this is user interaction, not initial load
      if (!isInitialLoad) {
        form.setValue('barangay', '');
      }
    }
  }, [selectedCity, handleCityChange, form, isInitialLoad]);

  // Handle initial address cascade when form data is loaded (draft or edit)
  useEffect(() => {
    const handleInitialAddressCascade = async () => {
      const formValues = form.getValues();
      console.log('Address cascade triggered with values:', formValues);
      
      // If we have complete address data, load all cascading options sequentially
      if (formValues.region && formValues.province && formValues.city) {
        console.log('Loading full address cascade for:', formValues.region, formValues.province, formValues.city, formValues.barangay);
        
        try {
          // Load provinces first
          handleRegionChange(formValues.region);
          
          // Wait for provinces to load, then load cities
          await new Promise(resolve => setTimeout(resolve, 500));
          handleProvinceChange(formValues.province);
          
          // Wait for cities to load, then load barangays
          await new Promise(resolve => setTimeout(resolve, 500));
          handleCityChange(formValues.city);
          
          // Mark initial load as complete after everything is loaded
          await new Promise(resolve => setTimeout(resolve, 300));
          console.log('Address cascade completed, setting initial load to false');
          setIsInitialLoad(false);
        } catch (error) {
          console.error('Error loading address cascade:', error);
          setIsInitialLoad(false);
        }
      } else if (formValues.region) {
        // Partial address data - load what we can
        console.log('Loading partial address cascade for region:', formValues.region);
        try {
          handleRegionChange(formValues.region);
          if (formValues.province) {
            await new Promise(resolve => setTimeout(resolve, 500));
            handleProvinceChange(formValues.province);
          }
          setTimeout(() => setIsInitialLoad(false), 300);
        } catch (error) {
          console.error('Error loading partial address cascade:', error);
          setIsInitialLoad(false);
        }
      } else {
        // No address data
        console.log('No address data found, setting initial load to false');
        setIsInitialLoad(false);
      }
    };

    // Subscribe to form watch for reset events
    const subscription = form.watch((value, { name, type }) => {
      // Only run on form reset (when data is loaded)
      if (type === 'change' && !name) {
        console.log('Form reset detected, triggering address cascade');
        // Use setTimeout to ensure the form values are set before running cascade
        setTimeout(() => {
          handleInitialAddressCascade();
        }, 100);
      }
    });

    // Also run on mount
    handleInitialAddressCascade();

    return () => subscription.unsubscribe();
  }, [form, handleRegionChange, handleProvinceChange, handleCityChange]);

  // Debug form values (can be removed in production)
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'region' || name === 'province' || name === 'city' || name === 'barangay' || name === 'profile_photo_url') {
        console.log(`Form field ${name} changed:`, value[name], 'type:', type);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Check if current step is valid
  const validateCurrentStep = () => {
    const stepFields = currentStepData.fields;
    const formValues = form.getValues();
    const errors = form.formState.errors;

    // Check for required fields in current step
    const requiredFields = [
      'first_name', 'last_name', 'birth_date', 'birth_place', 'gender', 
      'civil_status', 'nationality', 'religion', 'complete_address', 
      'voter_status', 'region', 'province', 'city', 'barangay'
    ];
    
    const hasErrors = stepFields.some(field => errors[field as keyof typeof errors]);
    const missingRequired = stepFields.some(field => 
      requiredFields.includes(field) && !formValues[field as keyof typeof formValues]
    );

    // Log validation details for debugging
    if (currentStepData.id === 'contact') {
      console.log('Contact step validation:', {
        stepFields,
        hasErrors,
        missingRequired,
        formValues: {
          region: formValues.region,
          province: formValues.province,
          city: formValues.city,
          barangay: formValues.barangay,
          complete_address: formValues.complete_address
        },
        errors: {
          region: errors.region,
          province: errors.province,
          city: errors.city,
          barangay: errors.barangay,
          complete_address: errors.complete_address
        }
      });
    }
    
    return !hasErrors && !missingRequired;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (!isLastStep) {
        setCurrentStep(prev => prev + 1);
      }
      console.log("Going next!");
    } else {
      form.trigger(currentStepData.fields as (keyof ResidentFormData)[]);
    }
    console.log("last?",currentStep, FORM_STEPS.length-1);
    console.log("is last?",isLastStep)
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to previous steps or next step if current is valid
    if (stepIndex < currentStep || (stepIndex === currentStep + 1 && validateCurrentStep())) {
      if (stepIndex === currentStep + 1) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      }
      setCurrentStep(stepIndex);
    }
  };

  if (isLoadingResident && mode === 'edit') {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">
          {t('residents.form.messages.loadingResident')}
        </span>
      </div>
    );
  }

  const title = mode === 'create'
    ? t('residents.form.addTitle')
    : t('residents.form.editTitle');

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'basic':
        return (
          <ResidentFormSection title={t('residents.form.sections.basicInfo')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="first_name"
                label={t('residents.form.fields.firstName')}
                placeholder={t('residents.form.placeholders.firstName')}
                required
              />
              <ResidentFormField
                name="last_name"
                label={t('residents.form.fields.lastName')}
                placeholder={t('residents.form.placeholders.lastName')}
                required
              />
              <ResidentFormField
                name="middle_name"
                label={t('residents.form.fields.middleName')}
                placeholder={t('residents.form.placeholders.middleName')}
              />
              <ResidentFormField
                name="suffix"
                label={t('residents.form.fields.suffix')}
                type="select"
                placeholder={t('residents.form.options.selectSuffix')}
                options={[
                  { value: 'Jr.', label: 'Jr.' },
                  { value: 'Sr.', label: 'Sr.' },
                  { value: 'II', label: 'II' },
                  { value: 'III', label: 'III' },
                  { value: 'IV', label: 'IV' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="birth_date"
                label={t('residents.form.fields.birthDate')}
                type="date"
                required
              />
              <ResidentFormField
                name="age"
                label={t('residents.form.fields.age')}
                type="number"
                readOnly
              />
              <ResidentFormField
                name="birth_place"
                label={t('residents.form.fields.birthPlace')}
                placeholder={t('residents.form.placeholders.birthPlace')}
                required
              />
              <ResidentFormField
                name="gender"
                label={t('residents.form.fields.gender')}
                type="select"
                placeholder={t('residents.form.options.selectGender')}
                required
                options={[
                  { value: 'MALE', label: t('residents.form.genderOptions.male') },
                  { value: 'FEMALE', label: t('residents.form.genderOptions.female') },
                  { value: 'NON_BINARY', label: t('residents.form.genderOptions.nonBinary') },
                  { value: 'PREFER_NOT_TO_SAY', label: t('residents.form.genderOptions.preferNotToSay') },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResidentFormField
                name="civil_status"
                label={t('residents.form.fields.civilStatus')}
                type="select"
                placeholder={t('residents.form.options.selectCivilStatus')}
                required
                options={[
                  { value: 'SINGLE', label: t('residents.form.civilStatusOptions.single') },
                  { value: 'LIVE_IN', label: t('residents.form.civilStatusOptions.liveIn') },
                  { value: 'MARRIED', label: t('residents.form.civilStatusOptions.married') },
                  { value: 'WIDOWED', label: t('residents.form.civilStatusOptions.widowed') },
                  { value: 'DIVORCED', label: t('residents.form.civilStatusOptions.divorced') },
                  { value: 'SEPARATED', label: t('residents.form.civilStatusOptions.separated') },
                  { value: 'ANNULLED', label: t('residents.form.civilStatusOptions.annulled') },
                  { value: 'PREFER_NOT_TO_SAY', label: t('residents.form.civilStatusOptions.preferNotToSay') },
                ]}
              />
              <ResidentFormField
                name="nationality"
                label={t('residents.form.fields.nationality')}
                type="select"
                placeholder={t('residents.form.placeholders.nationality')}
                required
                options={[
                  { value: 'FILIPINO', label: 'Filipino' },
                  { value: 'AMERICAN', label: 'American' },
                  { value: 'BRITISH', label: 'British' },
                  { value: 'CANADIAN', label: 'Canadian' },
                  { value: 'AUSTRALIAN', label: 'Australian' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
              <ResidentFormField
                name="religion"
                label={t('residents.form.fields.religion')}
                type="select"
                placeholder={t('residents.form.placeholders.religion')}
                required
                options={[
                  { value: 'CATHOLIC', label: t('residents.form.religionOptions.catholic') },
                  { value: 'IGLESIA_NI_CRISTO', label: t('residents.form.religionOptions.iglesiaNiCristo') },
                  { value: 'EVANGELICAL', label: t('residents.form.religionOptions.evangelical') },
                  { value: 'PROTESTANT', label: t('residents.form.religionOptions.protestant') },
                  { value: 'ISLAM', label: t('residents.form.religionOptions.islam') },
                  { value: 'BUDDHIST', label: t('residents.form.religionOptions.buddhist') },
                  { value: 'HINDU', label: t('residents.form.religionOptions.hindu') },
                  { value: 'SEVENTH_DAY_ADVENTIST', label: t('residents.form.religionOptions.seventhDayAdventist') },
                  { value: 'JEHOVAHS_WITNESS', label: t('residents.form.religionOptions.jehovahsWitness') },
                  { value: 'BORN_AGAIN_CHRISTIAN', label: t('residents.form.religionOptions.bornAgainChristian') },
                  { value: 'ORTHODOX', label: t('residents.form.religionOptions.orthodox') },
                  { value: 'JUDAISM', label: t('residents.form.religionOptions.judaism') },
                  { value: 'ATHEIST', label: t('residents.form.religionOptions.atheist') },
                  { value: 'AGLIPAYAN', label: t('residents.form.religionOptions.aglipayan') },
                  { value: 'OTHER', label: t('residents.form.options.other') },
                  { value: 'PREFER_NOT_TO_SAY', label: t('residents.form.religionOptions.preferNotToSay') },
                ]}
              />
            </div>
          </ResidentFormSection>
        );

      case 'contact':
        return (
          <ResidentFormSection title={t('residents.form.sections.contactInfo')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="mobile_number"
                label={t('residents.form.fields.mobileNumber')}
                type="tel"
                placeholder={t('residents.form.placeholders.mobileNumber')}
              />
              <ResidentFormField
                name="landline_number"
                label={t('residents.form.fields.landlineNumber')}
                type="tel"
                placeholder={t('residents.form.placeholders.landlineNumber')}
              />
              <div className="md:col-span-2">
                <ResidentFormField
                  name="email_address"
                  label={t('residents.form.fields.emailAddress')}
                  type="email"
                  placeholder={t('residents.form.placeholders.emailAddress')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="region"
                label={t('residents.form.fields.region')}
                type="select"
                placeholder={t('residents.form.placeholders.region')}
                required
                options={regions.map(region => ({ value: region.code, label: region.name }))}
                loading={isLoadingAddress}
              />
              <ResidentFormField
                name="province"
                label={t('residents.form.fields.province')}
                type="select"
                placeholder={t('residents.form.placeholders.province')}
                required
                options={provinces.map(province => ({ value: province.code, label: province.name }))}
                disabled={!selectedRegion}
                loading={isLoadingAddress}
              />
              <ResidentFormField
                name="city"
                label={t('residents.form.fields.city')}
                type="select"
                placeholder={t('residents.form.placeholders.city')}
                required
                options={cities.map(city => ({ value: city.code, label: city.name }))}
                disabled={!selectedProvince}
                loading={isLoadingAddress}
              />
              <ResidentFormField
                name="barangay"
                label={t('residents.form.fields.barangay')}
                type="select"
                placeholder={t('residents.form.placeholders.barangay')}
                required
                options={barangays.map(barangay => ({ value: barangay.code, label: barangay.name }))}
                disabled={!selectedCity}
                loading={isLoadingAddress}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="house_number"
                label={t('residents.form.fields.houseNumber')}
                placeholder={t('residents.form.placeholders.houseNumber')}
              />
              <ResidentFormField
                name="street"
                label={t('residents.form.fields.street')}
                placeholder={t('residents.form.placeholders.street')}
              />
            </div>

            <ResidentFormField
              name="complete_address"
              label={t('residents.form.fields.completeAddress')}
              type="textarea"
              placeholder={t('residents.form.placeholders.completeAddress')}
              required
            />
          </ResidentFormSection>
        );

      case 'employment':
        return (
          <ResidentFormSection title={t('residents.form.sections.employmentEducation')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="educational_attainment"
                label={t('residents.form.fields.educationalAttainment')}
                type="select"
                placeholder={t('residents.form.options.selectEducationalAttainment')}
                options={[
                  { value: 'NO_FORMAL_EDUCATION', label: t('residents.form.educationalAttainmentOptions.noFormalEducation') },
                  { value: 'ELEMENTARY_UNDERGRADUATE', label: t('residents.form.educationalAttainmentOptions.elementaryUndergraduate') },
                  { value: 'ELEMENTARY_GRADUATE', label: t('residents.form.educationalAttainmentOptions.elementaryGraduate') },
                  { value: 'HIGH_SCHOOL_UNDERGRADUATE', label: t('residents.form.educationalAttainmentOptions.highSchoolUndergraduate') },
                  { value: 'HIGH_SCHOOL_GRADUATE', label: t('residents.form.educationalAttainmentOptions.highSchoolGraduate') },
                  { value: 'COLLEGE_UNDERGRADUATE', label: t('residents.form.educationalAttainmentOptions.collegeUndergraduate') },
                  { value: 'COLLEGE_GRADUATE', label: t('residents.form.educationalAttainmentOptions.collegeGraduate') },
                  { value: 'POST_GRADUATE', label: t('residents.form.educationalAttainmentOptions.postGraduate') },
                  { value: 'VOCATIONAL', label: t('residents.form.educationalAttainmentOptions.vocational') },
                  { value: 'OTHER', label: t('residents.form.options.other') },
                ]}
              />

              <ResidentFormField
                name="employment_status"
                label={t('residents.form.fields.employmentStatus')}
                type="select"
                placeholder={t('residents.form.options.selectEmploymentStatus')}
                options={[
                  { value: 'EMPLOYED', label: t('residents.form.employmentStatusOptions.employed') },
                  { value: 'UNEMPLOYED', label: t('residents.form.employmentStatusOptions.unemployed') },
                  { value: 'SELF_EMPLOYED', label: t('residents.form.employmentStatusOptions.selfEmployed') },
                  { value: 'RETIRED', label: t('residents.form.employmentStatusOptions.retired') },
                  { value: 'STUDENT', label: t('residents.form.employmentStatusOptions.student') },
                  { value: 'OFW', label: t('residents.form.employmentStatusOptions.overseasWorker') },
                ]}
              />

              <ResidentFormField
                name="occupation"
                label={t('residents.form.fields.occupation')}
                placeholder={t('residents.form.placeholders.occupation')}
              />

              <ResidentFormField
                name="employer"
                label={t('residents.form.fields.employer')}
                placeholder={t('residents.form.placeholders.employer')}
              />
            </div>
          </ResidentFormSection>
        );

      case 'family':
        return (
          <ResidentFormSection title={t('residents.form.sections.familyInfo')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="mother_name"
                label={t('residents.form.fields.motherName')}
                placeholder={t('residents.form.placeholders.motherName')}
              />
              <ResidentFormField
                name="father_name"
                label={t('residents.form.fields.fatherName')}
                placeholder={t('residents.form.placeholders.fatherName')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResidentFormField
                name="emergency_contact_name"
                label={t('residents.form.fields.emergencyContactName')}
                placeholder={t('residents.form.placeholders.emergencyContactName')}
              />
              <ResidentFormField
                name="emergency_contact_number"
                label={t('residents.form.fields.emergencyContactNumber')}
                type="tel"
                placeholder={t('residents.form.placeholders.emergencyContactNumber')}
              />
              <div className="md:col-span-2">
                <ResidentFormField
                  name="emergency_contact_relationship"
                  label={t('residents.form.fields.emergencyContactRelationship')}
                  placeholder={t('residents.form.placeholders.emergencyContactRelationship')}
                />
              </div>
            </div>
          </ResidentFormSection>
        );

      case 'government':
        return (
          <ResidentFormSection title={t('residents.form.sections.governmentIds')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="primary_id_type"
                label={t('residents.form.fields.primaryIdType')}
                type="select"
                placeholder={t('residents.form.placeholders.primaryIdType')}
                options={[
                  { value: 'NATIONAL_ID', label: t('residents.form.idTypeOptions.nationalId') },
                  { value: 'PASSPORT', label: t('residents.form.idTypeOptions.passport') },
                  { value: "DRIVER'S_LICENSE", label: t('residents.form.idTypeOptions.driversLicense') },
                  { value: "VOTER'S_ID", label: t('residents.form.idTypeOptions.votersId') },
                  { value: 'PHILHEALTH_ID', label: t('residents.form.idTypeOptions.philhealthId') },
                  { value: 'SSS_ID', label: t('residents.form.idTypeOptions.sssId') },
                  { value: 'UMID', label: t('residents.form.idTypeOptions.umid') },
                ]}
              />
              <ResidentFormField
                name="id_number"
                label={t('residents.form.fields.idNumber')}
                placeholder={t('residents.form.placeholders.idNumber')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResidentFormField
                name="philhealth_number"
                label={t('residents.form.fields.philhealthNumber')}
                placeholder={t('residents.form.placeholders.philhealthNumber')}
              />
              <ResidentFormField
                name="sss_number"
                label={t('residents.form.fields.sssNumber')}
                placeholder={t('residents.form.placeholders.sssNumber')}
              />
              <ResidentFormField
                name="tin_number"
                label={t('residents.form.fields.tinNumber')}
                placeholder={t('residents.form.placeholders.tinNumber')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResidentFormField
                name="voters_id_number"
                label={t('residents.form.fields.votersIdNumber')}
                placeholder={t('residents.form.placeholders.votersIdNumber')}
              />
              <ResidentFormField
                name="voter_status"
                label={t('residents.form.fields.voterStatus')}
                type="select"
                placeholder={t('residents.form.placeholders.voterStatus')}
                required
                options={[
                  { value: 'NOT_REGISTERED', label: t('residents.form.voterStatusOptions.notRegistered') },
                  { value: 'REGISTERED', label: t('residents.form.voterStatusOptions.registered') },
                  { value: 'DECEASED', label: t('residents.form.voterStatusOptions.deceased') },
                  { value: 'TRANSFERRED', label: t('residents.form.voterStatusOptions.transferred') },
                ]}
              />
              <ResidentFormField
                name="precinct_number"
                label={t('residents.form.fields.precinctNumber')}
                placeholder={t('residents.form.placeholders.precinctNumber')}
              />
            </div>
          </ResidentFormSection>
        );

      case 'health':
        return (
          <ResidentFormSection title={t('residents.form.sections.healthMedical')}>
            <div className="grid grid-cols-1 gap-6">
              <ResidentFormField
                name="medical_conditions"
                label={t('residents.form.fields.medicalConditions')}
                type="textarea"
                placeholder={t('residents.form.placeholders.medicalConditions')}
              />
              <ResidentFormField
                name="allergies"
                label={t('residents.form.fields.allergies')}
                type="textarea"
                placeholder={t('residents.form.placeholders.allergies')}
              />
            </div>
          </ResidentFormSection>
        );

      case 'classifications':
        return (
          <ResidentFormSection title={t('residents.form.sections.specialClassifications')}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResidentFormField
                  name="senior_citizen"
                  label={t('residents.form.fields.seniorCitizen')}
                  type="checkbox"
                />
                <ResidentFormField
                  name="person_with_disability"
                  label={t('residents.form.fields.personWithDisability')}
                  type="checkbox"
                />
              </div>

              {watchPersonWithDisability && (
                <ResidentFormField
                  name="disability_type"
                  label={t('residents.form.fields.disabilityType')}
                  placeholder={t('residents.form.placeholders.disabilityType')}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResidentFormField
                  name="indigenous_people"
                  label={t('residents.form.fields.indigenousPeople')}
                  type="checkbox"
                />
                <ResidentFormField
                  name="four_ps_beneficiary"
                  label={t('residents.form.fields.fourPsBeneficiary')}
                  type="checkbox"
                />
              </div>

              {watchIndigenousPeople && (
                <ResidentFormField
                  name="indigenous_group"
                  label={t('residents.form.fields.indigenousGroup')}
                  placeholder={t('residents.form.placeholders.indigenousGroup')}
                />
              )}

              {watchFourPsBeneficiary && (
                <ResidentFormField
                  name="four_ps_household_id"
                  label={t('residents.form.fields.fourPsHouseholdId')}
                  placeholder={t('residents.form.placeholders.fourPsHouseholdId')}
                />
              )}
            </div>
          </ResidentFormSection>
        );

      case 'photo':
        return (
          <ResidentFormSection title={t('residents.form.sections.profilePhoto')}>
            <ProfilePhotoUpload
              preview={profilePhotoPreview}
              onFileSelect={handleFileUpload}
              isUploading={isUploadingFile}
            />
          </ResidentFormSection>
        );

      default:
        return null;
    }
  };

  return (
    <FormProvider {...form}>
      <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
        {/* Header */}
        <div className="mb-2 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-darktext">{title}</h1>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('residents.form.actions.close')}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Step {currentStep + 1} of {FORM_STEPS.length}
            </h2>
            <div className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / FORM_STEPS.length) * 100)}% Complete
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            {FORM_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(index)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentStep
                      ? 'bg-smblue-400 text-white'
                      : completedSteps.has(index)
                      ? 'bg-green-500 text-white'
                      : index < currentStep
                      ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                  disabled={index > currentStep && !completedSteps.has(currentStep)}
                >
                  {completedSteps.has(index) ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </button>
                {index < FORM_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${
                    completedSteps.has(index) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {currentStepData.title}
            </h3>
            <p className="text-sm text-gray-500">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {/* Duplicate Warning */}
        {duplicateWarning && (
          <DuplicateWarning message={duplicateWarning} />
        )}

        {/* Address Loading Error */}
        {addressError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  {addressError}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={retryAddressLoad}
                  className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        <form className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {renderStepContent()}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              {mode === 'create' && (
                <>
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('residents.form.actions.saveDraft')}
                  </button>
                  <button
                    type="button"
                    onClick={clearDraft}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('residents.form.actions.clearDraft')}
                  </button>
                </>
              )}
            </div>

            <div className="flex space-x-4">
              
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span>{t('residents.form.actions.previous')}</span>
                </button>
              )}

              {!isLastStep ? (
                <button
                  key="2"
                  type="button"
                  // onClick={handleNext}
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>{t('residents.form.actions.next')}</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>
                    {isSubmitting
                      ? (mode === 'create'
                        ? t('residents.form.actions.registering')
                        : t('residents.form.actions.updating'))
                      : (mode === 'create'
                        ? t('residents.form.actions.register')
                        : t('residents.form.actions.update'))
                    }
                  </span>
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </FormProvider>
  );
};