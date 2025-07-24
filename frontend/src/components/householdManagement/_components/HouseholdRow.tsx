import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import HouseholdActions from './HouseholdActions';
import { getHouseholdPrograms, formatIncomeRange, getProgramBadgeColor } from '../_utils/householdUtils';
import type { Household } from '@/services/households/households.types';

interface HouseholdRowProps {
 household: Household;
 onEdit: (id: string) => void;
 onView: (id: string) => void;
 onDelete: (id: string, householdNumber: string) => void;
 isDeleting: boolean;
}

const HouseholdRow: React.FC<HouseholdRowProps> = ({
 household,
 onEdit,
 onView,
 onDelete,
 isDeleting
}) => {
 const { t } = useTranslation();
 const programs = getHouseholdPrograms(household);
 const headName = household.head_resident 
   ? `${household.head_resident.first_name} ${household.head_resident.last_name}`
   : t('households.table.noHead');
 const memberCount = household.members ? household.members.length : 0;

 return (
   <tr className="hover:bg-gray-50">
     <td className="px-6 py-4 whitespace-nowrap">
       <div className="text-sm font-medium text-gray-900">
         {household.household_number}
       </div>
       <div className="text-sm text-gray-500">
         {household.house_type ? t(`households.houseTypes.${household.house_type}`, { defaultValue: household.house_type.replace('_', ' ').toUpperCase() }) : t('households.view.notSpecified')} • {household.ownership_status ? t(`households.ownershipStatus.${household.ownership_status}`, { defaultValue: household.ownership_status.replace('_', ' ').toUpperCase() }) : t('households.view.notSpecified')}
       </div>
     </td>
     <td className="px-6 py-4 whitespace-nowrap">
       <div className="text-sm font-medium text-gray-900">
         {headName}
       </div>
       <div className="text-sm text-gray-500">
         {household.complete_address}
       </div>
     </td>
     <td className="px-6 py-4 whitespace-nowrap">
       <div className="text-sm text-gray-900">
         {memberCount} {memberCount === 1 ? t('households.table.members', { count: 1 }) : t('households.table.members_plural', { count: memberCount })}
       </div>
       <div className="text-sm text-gray-500">
         {t('households.table.income')}: {household.monthly_income ? t(`households.incomeRanges.${household.monthly_income}`, { defaultValue: formatIncomeRange(household.monthly_income) }) : t('households.view.notSpecified')}
       </div>
     </td>
     <td className="px-6 py-4 whitespace-nowrap">
       <div className="flex flex-wrap gap-1">
         {programs.length > 0 ? (
           programs.map((program: string, index: number) => (
             <span
               key={index}
               className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgramBadgeColor(program)}`}
             >
               {program}
             </span>
           ))
         ) : (
           <span className="text-sm text-gray-500">{t('households.table.none')}</span>
         )}
       </div>
     </td>
     <td className="px-6 py-4 whitespace-nowrap">
       <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
         {t('households.status.active')}
       </span>
     </td>
     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
       <HouseholdActions
         household={household}
         onEdit={onEdit}
         onView={onView}
         onDelete={onDelete}
         isDeleting={isDeleting}
       />
     </td>
   </tr>
 );
};

export default HouseholdRow;