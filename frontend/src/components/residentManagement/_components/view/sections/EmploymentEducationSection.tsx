// ============================================================================
// components/residents/view/sections/EmploymentEducationSection.tsx
// ============================================================================

import { formatters } from "@/utilities/formatters";
import { InfoField } from "../InfoField";
import type { Resident } from "@/services/residents/residents.types";
import { useTranslation } from "react-i18next";

interface EmploymentEducationSectionProps {
  resident: Resident;
}

export const EmploymentEducationSection: React.FC<EmploymentEducationSectionProps> = ({ resident }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Education */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.education')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label={t('residents.form.fields.educationalAttainment')}
            value={formatters.formatEducationalAttainment(resident.educational_attainment, t)}
          />
        </div>
      </div>

      {/* Employment */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.employment')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label={t('residents.form.fields.employmentStatus')}
            value={formatters.formatEmploymentStatus(resident.employment_status, t)}
          />
          <InfoField
            label={t('residents.form.fields.occupation')}
            value={resident.occupation}
          />
          <InfoField
            label={t('residents.form.fields.employer')}
            value={resident.employer}
            className="md:col-span-2"
          />
        </div>
      </div>
    </div>
  );
};