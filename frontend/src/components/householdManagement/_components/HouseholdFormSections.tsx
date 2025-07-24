import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import HouseholdIdentificationSection from './HouseholdIdentificationSection';
import HouseholdHeadSection from './HouseholdHeadSection';
import HouseholdMembersSection from './HouseholdMembersSection';
import SocioeconomicSection from './SocioeconomicSection';
import HousingSection from './HousingSection';
import RemarksSection from './RemarksSection';
import type { HouseholdFormData } from '@/services/households/households.types';

interface HouseholdFormSectionsProps {
  form: UseFormReturn<HouseholdFormData>;
}

const HouseholdFormSections: React.FC<HouseholdFormSectionsProps> = ({ form }) => {
  return (
    <>
      {/* Household Identification */}
      <HouseholdIdentificationSection form={form} />

      {/* Household Head Information */}
      <HouseholdHeadSection form={form} />

      {/* Household Members */}
      <HouseholdMembersSection form={form} />

      {/* Socioeconomic Information */}
      <SocioeconomicSection form={form} />

      {/* Housing Information */}
      <HousingSection form={form} />

      {/* Remarks */}
      <RemarksSection form={form} />
    </>
  );
};

export default HouseholdFormSections;