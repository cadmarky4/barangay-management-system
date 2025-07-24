// ============================================================================
// components/residents/view/sections/HealthMedicalSection.tsx
// ============================================================================

import { useTranslation } from "react-i18next";
import { InfoField } from "../InfoField";
import type { Resident } from "@/services/residents/residents.types";

interface HealthMedicalSectionProps {
  resident: Resident;
}

export const HealthMedicalSection: React.FC<HealthMedicalSectionProps> = ({ resident }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField
          label={t('residents.form.fields.medicalConditions')}
          value={resident.medical_conditions}
          multiline
        />
        <InfoField
          label={t('residents.form.fields.allergies')}
          value={resident.allergies}
          multiline
        />
      </div>
    </div>
  );
};