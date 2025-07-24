import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { type Resident } from '@/services/residents/residents.types';
import { STORAGE_BASE_URL } from '@/services/__shared/_storage/storage.types';

interface ResidentTableRowProps {
  resident: Resident;
  onView: (resident: Resident) => void;
  onEdit: (resident: Resident) => void;
  onDelete: (resident: Resident) => void;
  isDeleting: boolean;
}

export const ResidentTableRow: React.FC<ResidentTableRowProps> = ({
  resident,
  onView,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const { t } = useTranslation();

  const getResidentCategory = (resident: Resident): string => {
    const categories = [];
    if (resident.senior_citizen) categories.push(t('residents.categories.seniorCitizen'));
    if (resident.person_with_disability) categories.push(t('residents.categories.pwd'));
    if (resident.four_ps_beneficiary) categories.push(t('residents.categories.fourPs'));
    if (resident.is_household_head) categories.push(t('residents.categories.householdHead'));
    if (resident.indigenous_people) categories.push(t('residents.categories.indigenous'));
    
    return categories.length > 0 ? categories.join(', ') : t('residents.categories.regular');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'DECEASED':
        return 'bg-gray-100 text-gray-800';
      case 'TRANSFERRED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return t(`residents.status.${status.toLowerCase()}`, status);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}${resident.suffix ? ', ' + resident.suffix : ''}`;
  const age = resident.age || calculateAge(resident.birth_date);
  const gender = resident.gender === 'MALE' ? 'Male' : 'Female';
  const phone = resident.mobile_number || resident.landline_number || 'N/A';
  const email = resident.email_address || 'N/A';

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={
              resident.profile_photo_url
                ? `${STORAGE_BASE_URL}/${resident.profile_photo_url}`
                : "https://placehold.co/80"
            }
            alt={fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {fullName}
            </div>
            <div className="text-sm text-gray-500">
              {age} {t('residents.table.yearsOld')}, {gender}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{phone}</div>
        <div className="text-sm text-gray-500">{email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {resident.complete_address}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {getResidentCategory(resident)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resident.status)}`}>
          {getStatusText(resident.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            className="text-smblue-400 hover:text-smblue-300 cursor-pointer"
            title={t('residents.actions.view')}
            onClick={() => onView(resident)}
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            className="text-smblue-400 hover:text-smblue-300 cursor-pointer"
            title={t('residents.actions.edit')}
            onClick={() => onEdit(resident)}
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            className={`text-red-600 hover:text-red-900 cursor-pointer ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={isDeleting ? t('residents.actions.deleting') : t('residents.actions.delete')}
            onClick={() => onDelete(resident)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <FiTrash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};