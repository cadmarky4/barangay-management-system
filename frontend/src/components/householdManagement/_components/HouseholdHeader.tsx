import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiHome } from 'react-icons/fi';
import { getHouseholdPrograms } from '../_utils/householdUtils';
import type { Household } from '@/services/households/households.types';

interface HouseholdHeaderProps {
 household: Household;
}

const HouseholdHeader: React.FC<HouseholdHeaderProps> = ({ household }) => {
 const { t } = useTranslation();
 const programs = getHouseholdPrograms(household);

 return (
   <div className="flex items-center mb-8 pb-6 border-b border-gray-200">
     <div className="w-24 h-24 bg-smblue-100 rounded-full flex items-center justify-center border-4 border-smblue-200">
       <FiHome className="w-12 h-12 text-smblue-400" />
     </div>
     <div className="ml-6 flex-1">
       <h2 className="text-2xl font-bold text-darktext">{household.household_number || `HH-${household.id}`}</h2>
       <p className="text-lg text-gray-600">
         {t('households.view.head')}: {household.head_resident 
           ? `${household.head_resident.first_name} ${household.head_resident.last_name}`
           : t('households.view.noHeadAssigned')
         }
       </p>
       <p className="text-sm text-gray-500 mt-1">
         {household.members?.length || 0} {household.members?.length === 1 ? t('households.table.members', { count: 1 }) : t('households.table.members_plural', { count: household.members?.length || 0 })} • {household.ownership_status ? t(`households.ownershipStatus.${household.ownership_status}`, { defaultValue: household.ownership_status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) }) : t('households.view.notSpecified')}
       </p>
       
       {/* Programs */}
       {programs.length > 0 && (
         <div className="flex flex-wrap gap-2 mt-3">
           {programs.map((program, index) => (
             <span
               key={index}
               className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
             >
               {program}
             </span>
           ))}
         </div>
       )}
     </div>
   </div>
 );
};

export default HouseholdHeader;