import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import type { Household } from '@/services/households/households.types';

interface HouseholdActionsProps {
  household: Household;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string, householdNumber: string) => void;
  isDeleting: boolean;
}

const HouseholdActions: React.FC<HouseholdActionsProps> = ({
  household,
  onEdit,
  onView,
  onDelete,
  isDeleting
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={() => onView(household.id)}
        className="cursor-pointer no-underline text-smblue-400 hover:text-smblue-300"
        title={t('households.actions.view')}
      >
        <FiEye className="w-4 h-4" />
      </button>
      <button 
        onClick={() => onEdit(household.id)}
        className="cursor-pointer no-underline text-yellow-600 hover:text-yellow-900"
        title={t('households.actions.edit')}
      >
        <FiEdit className="w-4 h-4" />
      </button>
      <button 
        onClick={() => onDelete(household.id, household.household_number)}
        className="cursor-pointer no-underline text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        title={isDeleting ? t('households.actions.deleting') : t('households.actions.delete')}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <FiTrash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default HouseholdActions;