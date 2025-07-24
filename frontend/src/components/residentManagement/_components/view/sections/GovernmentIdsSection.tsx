// ============================================================================
// components/residents/view/sections/GovernmentIdsSection.tsx
// ============================================================================

import { useTranslation } from "react-i18next";
import { InfoField } from "../InfoField";
import type { Resident } from "@/services/residents/residents.types";
import { formatters } from "@/utilities/formatters";

interface GovernmentIdsSectionProps {
  resident: Resident;
}

export const GovernmentIdsSection: React.FC<GovernmentIdsSectionProps> = ({ resident }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Primary ID */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.primaryId')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label={t('residents.form.fields.primaryIdType')}
            value={formatters.formatIdType(resident?.primary_id_type ?? "No ID", t)}
          />
          <InfoField
            label={t('residents.form.fields.idNumber')}
            value={resident.id_number}
          />
        </div>
      </div>

      {/* Government IDs */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.governmentIds')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField
            label={t('residents.form.fields.philhealthNumber')}
            value={resident.philhealth_number}
          />
          <InfoField
            label={t('residents.form.fields.sssNumber')}
            value={resident.sss_number}
          />
          <InfoField
            label={t('residents.form.fields.tinNumber')}
            value={resident.tin_number}
          />
        </div>
      </div>

      {/* Voter Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.voterInfo')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField
            label={t('residents.form.fields.voterStatus')}
            value={formatters.formatVoterStatus(resident.voter_status, t)}
          />
          <InfoField
            label={t('residents.form.fields.votersIdNumber')}
            value={resident.voters_id_number}
          />
          <InfoField
            label={t('residents.form.fields.precinctNumber')}
            value={resident.precinct_number}
          />
        </div>
      </div>
    </div>
  );
};