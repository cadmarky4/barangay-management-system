import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { HouseholdFormData } from '@/services/households/households.types';

interface SocioeconomicSectionProps {
 form: UseFormReturn<HouseholdFormData>;
}

const SocioeconomicSection: React.FC<SocioeconomicSectionProps> = ({ form }) => {
 const { t } = useTranslation();
 const { register, formState: { errors } } = form;

 return (
   <section className="mb-8">
     <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
       {t('households.form.sections.economicInfo')}
     </h2>
     <div className="border-b border-gray-200 mb-6"></div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           {t('households.form.fields.monthlyIncome')}
         </label>
         <select
           {...register('monthly_income')}
           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
         >
           <option value="">{t('households.form.options.selectIncomeRange')}</option>
           <option value="BELOW_10000">{t('households.incomeRanges.BELOW_10000')}</option>
           <option value="RANGE_10000_25000">{t('households.incomeRanges.RANGE_10000_25000')}</option>
           <option value="RANGE_25000_50000">{t('households.incomeRanges.RANGE_25000_50000')}</option>
           <option value="RANGE_50000_100000">{t('households.incomeRanges.RANGE_50000_100000')}</option>
           <option value="ABOVE_100000">{t('households.incomeRanges.ABOVE_100000')}</option>
         </select>
         {errors.monthly_income && (
           <p className="mt-1 text-sm text-red-600">{errors.monthly_income.message}</p>
         )}
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           {t('households.form.fields.primaryIncomeSource')}
         </label>
         <input
           {...register('primary_income_source')}
           type="text"
           placeholder={t('households.form.placeholders.primaryIncomeSource')}
           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
         />
         {errors.primary_income_source && (
           <p className="mt-1 text-sm text-red-600">{errors.primary_income_source.message}</p>
         )}
       </div>
     </div>

     <div>
       <label className="block text-sm font-medium text-gray-700 mb-3">
         {t('households.form.sections.classificationsInfo')}
       </label>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <label className="flex items-center">
           <input
             {...register('four_ps_beneficiary')}
             type="checkbox"
             className="mr-2 rounded border-gray-300 text-smblue-500 focus:ring-smblue-500"
           />
           <span className="text-sm text-gray-700">{t('households.classifications.fourPsBeneficiary')}</span>
         </label>

         <label className="flex items-center">
           <input
             {...register('indigent_family')}
             type="checkbox"
             className="mr-2 rounded border-gray-300 text-smblue-500 focus:ring-smblue-500"
           />
           <span className="text-sm text-gray-700">{t('households.classifications.indigentFamily')}</span>
         </label>

         <label className="flex items-center">
           <input
             {...register('has_senior_citizen')}
             type="checkbox"
             className="mr-2 rounded border-gray-300 text-smblue-500 focus:ring-smblue-500"
           />
           <span className="text-sm text-gray-700">{t('households.classifications.hasSeniorCitizen')}</span>
         </label>

         <label className="flex items-center">
           <input
             {...register('has_pwd_member')}
             type="checkbox"
             className="mr-2 rounded border-gray-300 text-smblue-500 focus:ring-smblue-500"
           />
           <span className="text-sm text-gray-700">{t('households.classifications.hasPwdMember')}</span>
         </label>
       </div>
     </div>
   </section>
 );
};

export default SocioeconomicSection;