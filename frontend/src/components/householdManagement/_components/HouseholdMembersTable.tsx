import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiUsers } from 'react-icons/fi';
import { useResident } from '@/services/residents/useResidents';
import type { Household, HouseholdMember } from '@/services/households/households.types';

interface HouseholdMembersTableProps {
  household: Household;
}

// Extended type to handle pivot data from backend
interface HouseholdMemberWithPivot extends HouseholdMember {
  pivot?: {
    relationship?: string;
  };
}

const MemberRow: React.FC<{ memberId: string; relationship: string; index: number }> = ({ 
  memberId, 
  relationship, 
  index 
}) => {
  const { t } = useTranslation();
  const { data: resident, isLoading } = useResident(memberId);

  if (isLoading) {
    return (
      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
        <td className="px-4 py-3 border-b" colSpan={3}>
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-4 w-20"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  if (!resident) {
    return (
      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
        <td className="px-4 py-3 border-b" colSpan={3}>
          <span className="text-red-500 text-sm">{t('households.form.membersSection.residentNotFound')}</span>
        </td>
      </tr>
    );
  }

 return (
   <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
     <td className="px-4 py-3 border-b">
       {resident.first_name} {resident.last_name}
     </td>
     <td className="px-4 py-3 border-b text-sm text-gray-600">
       {resident.mobile_number || resident.landline_number || t('households.view.membersTable.noContact')}
     </td>
     <td className="px-4 py-3 border-b">
       <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
         {t(`households.relationships.${relationship}`, { defaultValue: relationship })}
       </span>
     </td>
   </tr>
 );
};

const HouseholdMembersTable: React.FC<HouseholdMembersTableProps> = ({ household }) => {
 const { t } = useTranslation();
 const totalMembers = (household.members?.length || 0) + (household.head_resident ? 1 : 0);

 return (
   <section className="mb-8">
     <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4 flex items-center">
       <FiUsers className="mr-2" />
       {t('households.view.householdMembers')}
     </h3>
     
     {/* Household Head */}
     {household.head_resident && (
       <div className="mb-4">
         <h4 className="font-medium text-darktext mb-2">{t('households.view.membersTable.householdHead')}:</h4>
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
           <div className="flex justify-between items-center">
             <div>
               <p className="font-medium text-darktext">
                 {household.head_resident.first_name} {household.head_resident.last_name}
               </p>
               <p className="text-sm text-gray-600">{t('households.view.membersTable.useFullDetails', { defaultValue: 'Use full resident details if needed' })}</p>
             </div>
             <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
               {t('households.relationships.HEAD')}
             </span>
           </div>
         </div>
       </div>
     )}

     {/* Other Members */}
     {household.members && household.members.length > 0 ? (
       <div>
         <h4 className="font-medium text-darktext mb-2">{t('households.view.membersTable.otherMembers')}:</h4>
         <div className="overflow-x-auto">
           <table className="w-full border border-gray-200 rounded-lg">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">{t('households.view.membersTable.name')}</th>
                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">{t('households.view.membersTable.contact')}</th>
                 <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">{t('households.view.membersTable.relationship')}</th>
               </tr>
             </thead>
             <tbody>
               {household.members.map((member, index) => {
                 const memberWithPivot = member as HouseholdMemberWithPivot;
                 return (
                   <MemberRow
                     key={member.id}
                     memberId={member.id}
                     relationship={memberWithPivot.pivot?.relationship || member.relationship || 'OTHER'}
                     index={index}
                   />
                 );
               })}
             </tbody>
           </table>
         </div>
       </div>
     ) : (
       <div className="bg-gray-50 rounded-lg p-4">
         <p className="text-gray-600 text-center">
           {household.head_resident 
             ? t('households.view.membersTable.noAdditionalMembers')
             : t('households.view.membersTable.noMembersYet')
           }
         </p>
       </div>
     )}
     
     <div className="mt-4 text-sm text-gray-600">
       {t('households.view.membersTable.totalHouseholdSize')}: {totalMembers} {totalMembers === 1 ? t('households.table.members', { count: 1 }) : t('households.table.members_plural', { count: totalMembers })}
     </div>
   </section>
 );
};

export default HouseholdMembersTable;