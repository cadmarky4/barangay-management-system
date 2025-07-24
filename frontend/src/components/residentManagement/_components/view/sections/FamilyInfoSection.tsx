// ============================================================================
// components/residents/view/sections/FamilyInfoSection.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Resident } from '@/services/residents/residents.types';
import { InfoField } from '../InfoField';

interface FamilyInfoSectionProps {
  resident: Resident;
}

export const FamilyInfoSection: React.FC<FamilyInfoSectionProps> = ({ resident }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Parents Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.parentsInfo')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label={t('residents.form.fields.motherName')}
            value={resident.mother_name}
          />
          <InfoField
            label={t('residents.form.fields.fatherName')}
            value={resident.father_name}
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.emergencyContact')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField
            label={t('residents.form.fields.emergencyContactName')}
            value={resident.emergency_contact_name}
          />
          <InfoField
            label={t('residents.form.fields.emergencyContactNumber')}
            value={resident.emergency_contact_number}
          />
          <InfoField
            label={t('residents.form.fields.emergencyContactRelationship')}
            value={resident.emergency_contact_relationship}
          />
        </div>
      </div>
    </div>
  );
};
