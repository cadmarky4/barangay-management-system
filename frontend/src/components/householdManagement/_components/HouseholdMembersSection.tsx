import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import ResidentSearchDropdown from './ResidentSearchDropdown';
import { useResident } from '@/services/residents/useResidents';
import { useNotifications } from '@/components/_global/NotificationSystem';
import type { HouseholdFormData } from '@/services/households/households.types';

interface HouseholdMembersSectionProps {
 form: UseFormReturn<HouseholdFormData>;
}

const RELATIONSHIP_OPTIONS = [
 'SPOUSE',
 'SON', 
 'DAUGHTER',
 'FATHER',
 'MOTHER',
 'BROTHER',
 'SISTER',
 'GRANDFATHER',
 'GRANDMOTHER',
 'GRANDSON',
 'GRANDDAUGHTER',
 'UNCLE',
 'AUNT',
 'NEPHEW',
 'NIECE',
 'COUSIN',
 'IN_LAW',
 'OTHER'
];

const MemberRow: React.FC<{ 
 memberId: string; 
 index: number; 
 onRemove: () => void;
 onRelationshipChange: (relationship: string) => void;
 relationship: string;
}> = ({ memberId, index, onRemove, onRelationshipChange, relationship }) => {
 const { t } = useTranslation();
 const { data: resident, isLoading } = useResident(memberId);

 if (isLoading) {
   return (
     <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
       <td className="px-4 py-3 border-b" colSpan={4}>
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
       <td className="px-4 py-3 border-b" colSpan={4}>
         <span className="text-red-500 text-sm">
           {t('households.form.membersSection.residentNotFound', { 
             defaultValue: 'Resident not found',
             id: memberId
           })} (ID: {memberId})
         </span>
       </td>
     </tr>
   );
 }

 return (
   <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
     <td className="px-4 py-3 border-b">
       <div className="text-sm font-medium text-gray-900">
         {resident.first_name} {resident.last_name}
       </div>
       <div className="text-sm text-gray-500">ID: {resident.id}</div>
     </td>
     <td className="px-4 py-3 border-b">
       <div className="text-sm text-gray-900">
         {resident.mobile_number || resident.landline_number || t('households.form.headSection.noContact')}
       </div>
     </td>
     <td className="px-4 py-3 border-b">
       <select
         value={relationship}
         onChange={(e) => onRelationshipChange(e.target.value)}
         className="text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 w-full"
       >
         {RELATIONSHIP_OPTIONS.map(option => (
           <option key={option} value={option}>
             {t(`households.relationships.${option}`)}
           </option>
         ))}
       </select>
     </td>
     <td className="px-4 py-3 border-b text-right">
       <button
         type="button"
         onClick={onRemove}
         className="text-red-600 hover:text-red-900 hover:bg-red-100 p-1 rounded"
         title={t('households.form.members.removeMember')}
       >
         <FiX className="w-4 h-4" />
       </button>
     </td>
   </tr>
 );
};

const HouseholdMembersSection: React.FC<HouseholdMembersSectionProps> = ({ form }) => {
 const { t } = useTranslation();
 const { showNotification } = useNotifications();
 const [memberSearchTerm, setMemberSearchTerm] = useState('');
 
 // Use field array for members with relationships
 const { fields, append, remove, update } = useFieldArray({
   control: form.control,
   name: 'memberRelationships'
 });

 const headResidentId = form.watch('head_resident_id');
 const currentMemberIds = fields.map(field => field.residentId);

 const handleSelectMember = (residentId: string, residentName: string) => {
   // Check if already selected as head
   if (headResidentId === residentId) {
     showNotification({
       type: 'error',
       title: 'Cannot Add Member',
       message: `${residentName} is already selected as the household head. A resident cannot be both head and member.`
     });
     return;
   }

   // Check if already a member
   if (currentMemberIds.includes(residentId)) {
     showNotification({
       type: 'error',
       title: 'Already a Member',
       message: `${residentName} is already added as a household member.`
     });
     return;
   }

   // Add member with default relationship
   append({
     residentId,
     relationship: 'SON' // Default relationship
   });

   // Clear search
   setMemberSearchTerm('');
   
   showNotification({
     type: 'success',
     title: 'Member Added',
     message: `${residentName} has been added as a household member.`
   });
 };

 const handleRemoveMember = (index: number) => {
   remove(index);
 };

 const handleRelationshipChange = (index: number, relationship: string) => {
   update(index, {
     ...fields[index],
     relationship
   });
 };

 return (
   <section className="mb-8">
     <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
       {t('households.form.sections.membersInfo')}
     </h2>
     <div className="border-b border-gray-200 mb-6"></div>

     <div className="space-y-4">
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           {t('households.form.membersSection.addMembersFromResidents')}
         </label>
         
         <ResidentSearchDropdown
           searchTerm={memberSearchTerm}
           onSearchChange={setMemberSearchTerm}
           onSelectResident={handleSelectMember}
           excludeIds={[...(headResidentId ? [headResidentId] : []), ...currentMemberIds]}
           placeholder={t('households.form.membersSection.searchPlaceholder')}
         />
       </div>

       {/* Display added members */}
       {fields.length > 0 && (
         <div className="mt-4">
           <h3 className="text-sm font-medium text-gray-700 mb-4">{t('households.form.membersSection.householdMembers')}:</h3>
           <div className="overflow-x-auto">
             <table className="min-w-full bg-white border border-gray-200 rounded-lg">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                     {t('households.form.headSection.table.name')}
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                     {t('households.form.headSection.table.contact')}
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                     {t('households.form.membersSection.relationshipToHead')}
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                     {t('households.form.headSection.table.actions')}
                   </th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                 {fields.map((field, index) => (
                   <MemberRow
                     key={field.id}
                     memberId={field.residentId}
                     index={index}
                     relationship={field.relationship}
                     onRemove={() => handleRemoveMember(index)}
                     onRelationshipChange={(relationship) => handleRelationshipChange(index, relationship)}
                   />
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}

       {fields.length === 0 && (
         <div className="bg-gray-50 rounded-lg p-4">
           <p className="text-gray-600 text-center text-sm">
             {t('households.form.membersSection.noMembersYet')}
           </p>
         </div>
       )}

       <div className="text-sm text-gray-600">
         {t('households.form.membersSection.totalMembers')}: {fields.length}
       </div>
     </div>
   </section>
 );
};

export default HouseholdMembersSection;