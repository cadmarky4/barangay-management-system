// ============================================================================
// components/residents/view/sections/BasicInfoSection.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Resident } from '@/services/residents/residents.types';
import { formatters } from '@/utilities/formatters';
import { InfoField } from '../InfoField';

interface BasicInfoSectionProps {
  resident: Resident;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ resident }) => {
  const { t } = useTranslation();

  const getFullName = (): string => {
    const parts = [
      resident.first_name,
      resident.middle_name,
      resident.last_name,
      resident.suffix
    ].filter(Boolean);
    return parts.join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField
          label={t('residents.form.fields.firstName')}
          value={resident.first_name}
        />
        <InfoField
          label={t('residents.form.fields.middleName')}
          value={resident.middle_name}
        />
        <InfoField
          label={t('residents.form.fields.lastName')}
          value={resident.last_name}
        />
        <InfoField
          label={t('residents.form.fields.suffix')}
          value={resident.suffix}
        />
        <InfoField
          label={t('residents.view.fields.fullName')}
          value={getFullName()}
          className="md:col-span-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField
          label={t('residents.form.fields.birthDate')}
          value={resident.birth_date ? formatters.formatDate(resident.birth_date) : undefined}
        />
        <InfoField
          label={t('residents.form.fields.age')}
          value={resident.age ? `${resident.age} years old` : undefined}
        />
        <InfoField
          label={t('residents.form.fields.birthPlace')}
          value={resident.birth_place}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField
          label={t('residents.form.fields.gender')}
          value={formatters.formatGender(resident.gender, t)}
        />
        <InfoField
          label={t('residents.form.fields.civilStatus')}
          value={formatters.formatCivilStatus(resident.civil_status, t)}
        />
        <InfoField
          label={t('residents.form.fields.nationality')}
          value={formatters.formatNationality(resident.nationality, t)}
        />
        <InfoField
          label={t('residents.form.fields.religion')}
          value={formatters.formatReligion(resident.religion, t)}
        />
      </div>
    </div>
  );
};