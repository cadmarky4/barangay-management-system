import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { FiPlus, FiX } from 'react-icons/fi';
import ResidentSearchDropdown from '../_components/ResidentSearchDropdown';
import { useResident } from '@/services/residents/useResidents';
import { useNotifications } from '@/components/_global/NotificationSystem';
import type { HouseholdFormData } from '@/services/households/households.types';

interface HouseholdHeadSectionProps {
 form: UseFormReturn<HouseholdFormData>;
}

const HouseholdHeadSection: React.FC<HouseholdHeadSectionProps> = ({ form }) => {
 const { t } = useTranslation();
 const { showNotification } = useNotifications();
 const [searchTerm, setSearchTerm] = useState('');
 
 const selectedHeadId = form.watch('head_resident_id');
 const { data: selectedHead } = useResident(selectedHeadId || '', !!selectedHeadId);

 const handleSelectHead = (residentId: string, residentName: string) => {
   // Check if this resident is already a member
   const currentMembers = form.getValues('memberRelationships') || [];
   const isAlreadyMember = currentMembers.some(member => member.residentId === residentId);
   
   if (isAlreadyMember) {
     showNotification({
       type: 'error',
       title: 'Cannot Select as Head',
       message: `${residentName} is already listed as a household member. A resident cannot be both head and member.`
     });
     return;
   }

   form.setValue('head_resident_id', residentId);
   setSearchTerm(residentName);
   
   showNotification({
     type: 'success',
     title: 'Household Head Selected',
     message: `${residentName} has been selected as the household head.`
   });
 };

 const handleClearHead = () => {
   form.setValue('head_resident_id', null);
   setSearchTerm('');
 };

 const handleAddNewResident = () => {
   // Navigate to add resident page with return context
   const currentUrl = window.location.pathname;
   const returnUrl = encodeURIComponent(currentUrl);
   window.location.href = `/residents/create?return=${returnUrl}&context=household`;
 };

 return (
   <section className="mb-8">
     <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
       {t('households.form.sections.headInfo')}
     </h2>
     <div className="border-b border-gray-200 mb-6"></div>

     <div className="space-y-4">
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           {t('households.form.headSection.searchExistingResident')}
         </label>
         
         <ResidentSearchDropdown
           searchTerm={searchTerm}
           onSearchChange={setSearchTerm}
           onSelectResident={handleSelectHead}
           excludeIds={form.getValues('members') || []}
           placeholder={t('households.form.headSection.searchPlaceholder')}
         />
       </div>

       {/* Selected Household Head Preview */}
       {selectedHead && (
         <div className="mt-4">
           <h3 className="text-sm font-medium text-gray-700 mb-4">{t('households.form.headSection.selectedHead')}:</h3>
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
                     {t('households.form.headSection.table.role')}
                   </th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                     {t('households.form.headSection.table.actions')}
                   </th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                 <tr className="hover:bg-gray-50">
                   <td className="px-4 py-3 whitespace-nowrap">
                     <div className="text-sm font-medium text-gray-900">
                       {selectedHead.first_name} {selectedHead.last_name}
                     </div>
                     <div className="text-sm text-gray-500">ID: {selectedHead.id}</div>
                   </td>
                   <td className="px-4 py-3 whitespace-nowrap">
                     <div className="text-sm text-gray-900">
                       {selectedHead.mobile_number || selectedHead.landline_number || t('households.form.headSection.noContact')}
                     </div>
                   </td>
                   <td className="px-4 py-3 whitespace-nowrap">
                     <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                       {t('households.form.headSection.householdHead')}
                     </span>
                   </td>
                   <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                     <button
                       type="button"
                       onClick={handleClearHead}
                       className="text-red-600 hover:text-red-900 hover:bg-red-100 p-1 rounded"
                       title={t('households.form.headSection.removeHead')}
                     >
                       <FiX className="w-4 h-4" />
                     </button>
                   </td>
                 </tr>
               </tbody>
             </table>
           </div>
         </div>
       )}

       <div className="text-center">
         <span className="text-gray-500 font-medium">{t('households.form.headSection.or')}</span>
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           {t('households.form.headSection.addNewResident')}
         </label>
         <button
           type="button"
           onClick={handleAddNewResident}
           className="bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
         >
           <FiPlus className="w-4 h-4" />
           <span>{t('residents.addNew')}</span>
         </button>
       </div>
     </div>

     {/* Form validation error for head_resident_id */}
     {form.formState.errors.head_resident_id && (
       <p className="mt-2 text-sm text-red-600">
         {form.formState.errors.head_resident_id.message}
       </p>
     )}
   </section>
 );
};

export default HouseholdHeadSection;