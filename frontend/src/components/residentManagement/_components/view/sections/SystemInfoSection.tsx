// ============================================================================
// components/residents/view/sections/SystemInfoSection.tsx
// ============================================================================

import { useTranslation } from "react-i18next";
import { InfoField } from "../InfoField";
import type { Resident } from "@/services/residents/residents.types";
import { formatters } from "@/utilities/formatters";

interface SystemInfoSectionProps {
  resident: Resident;
}

export const SystemInfoSection: React.FC<SystemInfoSectionProps> = ({ resident }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField
          label={t('residents.view.system.residentId')}
          value={resident.id?.toString()}
        />
        <InfoField
          label={t('residents.view.system.status')}
          value={formatters.formatResidentStatus(resident.status, t)}
        />
        <InfoField
          label={t('residents.view.system.createdAt')}
          value={formatters.formatDateTime(resident.created_at)}
        />
        <InfoField
          label={t('residents.view.system.updatedAt')}
          value={formatters.formatDateTime(resident.updated_at)}
        />
      </div>
    </div>
  );
};