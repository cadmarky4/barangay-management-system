// ============================================================================
// components/residents/ResidentStatistics.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaWheelchair, FaUserFriends, FaChild } from 'react-icons/fa';
import { useResidentStatistics } from '@/services/residents/useResidents';
import { StatCard } from '@/components/__shared/StatCard';

interface ResidentStatisticsProps {
  isLoaded: boolean;
}

export const ResidentStatistics: React.FC<ResidentStatisticsProps> = ({ isLoaded }) => {
  const { t } = useTranslation();
  const { data: statistics, isLoading, error } = useResidentStatistics();

  const stats = [
    { 
      title: t('residents.statistics.totalResidents'), 
      value: statistics?.total_residents || 0, 
      icon: FaUsers 
    },
    { 
      title: t('residents.statistics.pwd'), 
      value: statistics?.pwd_residents || 0, 
      icon: FaWheelchair 
    },
    { 
      title: t('residents.statistics.seniorCitizens'), 
      value: statistics?.senior_citizens || 0, 
      icon: FaUserFriends 
    },
    { 
      title: t('residents.statistics.children'), 
      value: statistics?.by_age_group?.children || 0, 
      icon: FaChild 
    }
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-800 text-sm">{t('residents.messages.statisticsError')}</p>
      </div>
    );
  }

  return (
    <section className={`w-full bg-white flex flex-col gap-3 border p-6 rounded-2xl border-gray-100 shadow-sm transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: '300ms' }}>
      <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">
        {t('residents.statistics.title')}
      </h3>
      
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => (
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
