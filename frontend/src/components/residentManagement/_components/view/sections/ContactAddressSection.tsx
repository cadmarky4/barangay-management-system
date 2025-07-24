// ============================================================================
// components/residents/view/sections/ContactAddressSection.tsx
// ============================================================================

import type { Resident } from "@/services/residents/residents.types";
import { useTranslation } from "react-i18next";
import { InfoField } from "../InfoField";

interface ContactAddressSectionProps {
  resident: Resident;
}

export const ContactAddressSection: React.FC<ContactAddressSectionProps> = ({ resident }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.contactInfo')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField
            label={t('residents.form.fields.mobileNumber')}
            value={resident.mobile_number}
          />
          <InfoField
            label={t('residents.form.fields.landlineNumber')}
            value={resident.landline_number}
          />
          <InfoField
            label={t('residents.form.fields.emailAddress')}
            value={resident.email_address}
          />
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {t('residents.view.sections.addressInfo')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <InfoField
            label={t('residents.form.fields.region')}
            value={resident.region}
          />
          <InfoField
            label={t('residents.form.fields.province')}
            value={resident.province}
          />
          <InfoField
            label={t('residents.form.fields.city')}
            value={resident.city}
          />
          <InfoField
            label={t('residents.form.fields.barangay')}
            value={resident.barangay}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InfoField
            label={t('residents.form.fields.houseNumber')}
            value={resident.house_number}
          />
          <InfoField
            label={t('residents.form.fields.street')}
            value={resident.street}
          />
        </div>

        <InfoField
          label={t('residents.form.fields.completeAddress')}
          value={resident.complete_address}
          className="w-full"
        />
      </div>
    </div>
  );
};
