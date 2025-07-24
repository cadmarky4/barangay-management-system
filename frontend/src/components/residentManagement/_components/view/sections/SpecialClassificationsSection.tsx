// ============================================================================
// components/residents/view/sections/SpecialClassificationsSection.tsx
// ============================================================================

import type { Resident } from "@/services/residents/residents.types";
import { InfoField } from "../InfoField";
import { useTranslation } from "react-i18next";

interface SpecialClassificationsSectionProps {
  resident: Resident;
}

export const SpecialClassificationsSection: React.FC<SpecialClassificationsSectionProps> = ({ resident }) => {
  const { t } = useTranslation();

  const classifications = [
    {
      key: 'senior_citizen',
      label: t('residents.form.fields.seniorCitizen'),
      value: resident.senior_citizen,
      color: 'purple'
    },
    {
      key: 'person_with_disability',
      label: t('residents.form.fields.personWithDisability'),
      value: resident.person_with_disability,
      color: 'blue',
      additionalInfo: resident.disability_type ? {
        label: t('residents.form.fields.disabilityType'),
        value: resident.disability_type
      } : undefined
    },
    {
      key: 'indigenous_people',
      label: t('residents.form.fields.indigenousPeople'),
      value: resident.indigenous_people,
      color: 'orange',
      additionalInfo: resident.indigenous_group ? {
        label: t('residents.form.fields.indigenousGroup'),
        value: resident.indigenous_group
      } : undefined
    },
    {
      key: 'four_ps_beneficiary',
      label: t('residents.form.fields.fourPsBeneficiary'),
      value: resident.four_ps_beneficiary,
      color: 'green',
      additionalInfo: resident.four_ps_household_id ? {
        label: t('residents.form.fields.fourPsHouseholdId'),
        value: resident.four_ps_household_id
      } : undefined
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      purple: isActive ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      blue: isActive ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      orange: isActive ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      green: isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="space-y-6">
      {/* Classification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classifications.map(classification => (
          <div
            key={classification.key}
            className={`p-4 rounded-lg border-2 transition-colors ${
              getColorClasses(classification.color, classification.value)
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">{classification.label}</h5>
              <div className={`w-3 h-3 rounded-full ${
                classification.value ? 'bg-current' : 'bg-gray-400'
              }`} />
            </div>
            <p className="text-sm opacity-75">
              {classification.value ? t('common.yes') : t('common.no')}
            </p>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        {classifications
          .filter(c => c.value && c.additionalInfo)
          .map(classification => (
            <InfoField
              key={`${classification.key}_info`}
              label={classification.additionalInfo!.label}
              value={classification.additionalInfo!.value}
            />
          ))}
      </div>
    </div>
  );
};