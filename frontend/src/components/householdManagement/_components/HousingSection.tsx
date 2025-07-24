import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { HouseholdFormData } from '@/services/households/households.types';

interface HousingSectionProps {
 form: UseFormReturn<HouseholdFormData>;
}

const HousingSection: React.FC<HousingSectionProps> = ({ form }) => {
 const { t } = useTranslation();
 const { register, formState: { errors } } = form;

 return (
   <section className="mb-8">
     <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
       {t('households.form.sections.housingInfo')}
     </h2>
     <div className="border-b border-gray-200 mb-6"></div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           {t('households.form.fields.houseType')}
         </label>
         <select
           {...register('house_type')}
           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
         >
           <option value="">{t('households.form.options.selectHouseType')}</option>
           <option value="CONCRETE">{t('households.houseTypes.CONCRETE')}</option>
           <option value="SEMI_CONCRETE">{t('households.houseTypes.SEMI_CONCRETE')}</option>
           <option value="WOOD">{t('households.houseTypes.WOOD')}</option>
           <option value="BAMBOO">{t('households.houseTypes.BAMBOO')}</option>
           <option value="MIXED">{t('households.houseTypes.MIXED')}</option>
         </select>
         {errors.house_type && (
           <p className="mt-1 text-sm text-red-600">{errors.house_type.message}</p>
         )}
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           {t('households.form.fields.ownershipStatus')}
         </label>
         <select
           {...register('ownership_status')}
           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
         >
           <option value="">{t('households.form.options.selectOwnershipStatus')}</option>
           <option value="OWNED">{t('households.ownershipStatus.OWNED')}</option>
           <option value="RENTED">{t('households.ownershipStatus.RENTED')}</option>
           <option value="SHARED">{t('households.ownershipStatus.SHARED')}</option>
           <option value="INFORMAL_SETTLER">{t('households.ownershipStatus.INFORMAL_SETTLER')}</option>
         </select>
         {errors.ownership_status && (
           <p className="mt-1 text-sm text-red-600">{errors.ownership_status.message}</p>
         )}
       </div>
     </div>

     <div>
       <label className="block text-sm font-medium text-gray-700 mb-3">
         {t('households.form.sections.utilitiesAccess')}
       </label>
       <div className="grid grid-cols-3 gap-4">
         <label className="flex items-center">
           <input
             {...register('has_electricity')}
             type="checkbox"
             className="mr-2 rounded border-gray-300 text-smblue-500 focus:ring-smblue-500"
           />
           <span className="text-sm text-gray-700">{t('households.classifications.hasElectricity')}</span>
         </label>

         <label className="flex items-center">
           <input
             {...register('has_water_supply')}
             type="checkbox"
             className="mr-2 rounded border-gray-300 text-smblue-500 focus:ring-smblue-500"
           />
           <span className="text-sm text-gray-700">{t('households.classifications.hasWaterSupply')}</span>
         </label>

         <label className="flex items-center">
           <input
             {...register('has_internet_access')}
             type="checkbox"
             className="mr-2 rounded border-gray-300 text-smblue-500 focus:ring-smblue-500"
           />
           <span className="text-sm text-gray-700">{t('households.classifications.hasInternetAccess')}</span>
         </label>
       </div>
     </div>
   </section>
 );
};

export default HousingSection;