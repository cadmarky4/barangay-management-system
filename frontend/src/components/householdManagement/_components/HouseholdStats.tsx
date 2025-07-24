import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaHome, FaUserFriends, FaDollarSign } from 'react-icons/fa';
import StatCard from '../../_global/StatCard';
import type { HouseholdStatistics } from '@/services/households/households.types';

interface HouseholdStatsProps {
 statistics?: HouseholdStatistics;
 isLoading: boolean;
 isLoaded: boolean;
}

const HouseholdStats: React.FC<HouseholdStatsProps> = ({
 statistics,
 isLoading,
 isLoaded
}) => {
 const { t } = useTranslation();

 const statsData = [
   { 
     title: t('households.statistics.totalHouseholds'), 
     value: statistics?.total_households || 0, 
     icon: FaHome 
   },
   { 
     title: t('households.statistics.fourPsBeneficiaries'), 
     value: statistics?.classifications?.four_ps_beneficiaries || 0, 
     icon: FaUsers 
   },
   { 
     title: t('households.statistics.withSeniorCitizens'), 
     value: statistics?.classifications?.with_senior_citizens || 0, 
     icon: FaUserFriends 
   },
   { 
     title: t('households.statistics.indigentFamilies'), 
     value: statistics?.classifications?.indigent_families || 0, 
     icon: FaDollarSign 
   }
 ];

 return (
   <section className={`w-full bg-white flex flex-col gap-3 border p-6 rounded-2xl border-gray-100 shadow-sm transition-all duration-700 ease-out ${
     isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
   }`} style={{ transitionDelay: '300ms' }}>
     <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">
       {t('households.statistics.title')}
     </h3>
     
     {isLoading ? (
       <div className="grid grid-cols-4 gap-4">
         {Array.from({ length: 4 }).map((_, index) => (
           <div key={index} className="animate-pulse">
             <div className="bg-gray-200 rounded-lg h-24"></div>
           </div>
         ))}
       </div>
     ) : (
       <div className="grid grid-cols-4 gap-4">
         {statsData.map((stat, index) => (
           <div
             key={stat.title}
             className={`transition-all duration-700 ease-out ${
               isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
             }`}
             style={{ 
               transitionDelay: `${450 + (index * 100)}ms`,
               transformOrigin: 'center bottom'
             }}
           >
             <StatCard
               title={stat.title}
               value={stat.value}
               icon={stat.icon}
             />
           </div>
         ))}
       </div>
     )}
   </section>
 );
};

export default HouseholdStats;