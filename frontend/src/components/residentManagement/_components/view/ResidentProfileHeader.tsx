// ============================================================================
// components/residents/view/ResidentProfileHeader.tsx - Profile header component
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Resident } from '@/services/residents/residents.types';
import { STORAGE_BASE_URL } from '@/services/__shared/_storage/storage.types';
import { formatters } from '@/utilities/formatters';

interface ResidentProfileHeaderProps {
  resident: Resident;
  isLoaded: boolean;
}

export const ResidentProfileHeader: React.FC<ResidentProfileHeaderProps> = ({
  resident,
  isLoaded
}) => {
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

  const getAgeDisplay = (): string => {
    if (resident.age) {
      return t('residents.view.profile.ageYears', { age: resident.age });
    }
    
    // Calculate age from birth_date if age is not provided
    if (resident.birth_date) {
      const birthDate = new Date(resident.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return t('residents.view.profile.ageYears', { age });
    }
    
    return t('common.notSpecified');
  };

  return (
    <div className={`flex items-center p-6 pb-6 border-b border-gray-200 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`} style={{ transitionDelay: '300ms' }}>
      
      {/* Profile Photo */}
      <div className="relative">
        <img
          src={resident.profile_photo_url
            ? `${STORAGE_BASE_URL}/${resident.profile_photo_url}`
            : "https://placehold.co/96x96/e5e7eb/6b7280?text=No+Photo"
          }
          alt={getFullName()}
          className="w-24 h-24 rounded-full object-cover border-4 border-smblue-100 shadow-sm"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://placehold.co/96x96/e5e7eb/6b7280?text=No+Photo";
          }}
        />
        
        {/* Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-sm ${
          resident.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>

      {/* Profile Info */}
      <div className="ml-6 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-darktext mb-1">
              {getFullName()}
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              {getAgeDisplay()}, {formatters.formatGender(resident.gender, t)}
            </p>
            
            {/* Basic Details */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="font-medium mr-1">
                  {t('residents.view.profile.birthDate')}:
                </span>
                {resident.birth_date 
                  ? formatters.formatDate(resident.birth_date)
                  : t('common.notSpecified')
                }
              </span>
              
              <span className="flex items-center">
                <span className="font-medium mr-1">
                  {t('residents.view.profile.civilStatus')}:
                </span>
                {formatters.formatCivilStatus(resident.civil_status, t)}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            resident.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : resident.status === 'INACTIVE'
              ? 'bg-yellow-100 text-yellow-800'
              : resident.status === 'DECEASED'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {formatters.formatResidentStatus(resident.status, t)}
          </span>
        </div>

        {/* Special Classifications Preview */}
        <div className="mt-3 flex flex-wrap gap-2">
          {resident.senior_citizen && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              {t('residents.view.classifications.seniorCitizen')}
            </span>
          )}
          {resident.person_with_disability && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {t('residents.view.classifications.pwd')}
            </span>
          )}
          {resident.indigenous_people && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
              {t('residents.view.classifications.indigenous')}
            </span>
          )}
          {resident.four_ps_beneficiary && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {t('residents.view.classifications.fourPs')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};