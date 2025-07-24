// ============================================================================
// components/residents/view/ResidentInfoTabs.tsx - Tabbed information component
// ============================================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiUser, 
  FiPhone, 
  FiBriefcase, 
  FiUsers, 
  FiFileText, 
  FiHeart, 
  FiAward,
  FiClock
} from 'react-icons/fi';

import type { Resident } from '@/services/residents/residents.types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { ContactAddressSection } from './sections/ContactAddressSection';
import { EmploymentEducationSection } from './sections/EmploymentEducationSection';
import { FamilyInfoSection } from './sections/FamilyInfoSection';
import { GovernmentIdsSection } from './sections/GovernmentIdsSection';
import { HealthMedicalSection } from './sections/HealthMedicalSection';
import { SpecialClassificationsSection } from './sections/SpecialClassificationsSection';
import { SystemInfoSection } from './sections/SystemInfoSection';

interface ResidentInfoTabsProps {
  resident: Resident;
  isLoaded: boolean;
  onEdit: () => void;
  onClose: () => void;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ resident: Resident }>;
}

const TABS: TabItem[] = [
  {
    id: 'basic',
    label: 'residents.view.tabs.basic',
    icon: FiUser,
    component: BasicInfoSection
  },
  {
    id: 'contact',
    label: 'residents.view.tabs.contact',
    icon: FiPhone,
    component: ContactAddressSection
  },
  {
    id: 'employment',
    label: 'residents.view.tabs.employment',
    icon: FiBriefcase,
    component: EmploymentEducationSection
  },
  {
    id: 'family',
    label: 'residents.view.tabs.family',
    icon: FiUsers,
    component: FamilyInfoSection
  },
  {
    id: 'government',
    label: 'residents.view.tabs.government',
    icon: FiFileText,
    component: GovernmentIdsSection
  },
  {
    id: 'health',
    label: 'residents.view.tabs.health',
    icon: FiHeart,
    component: HealthMedicalSection
  },
  {
    id: 'classifications',
    label: 'residents.view.tabs.classifications',
    icon: FiAward,
    component: SpecialClassificationsSection
  },
  {
    id: 'system',
    label: 'residents.view.tabs.system',
    icon: FiClock,
    component: SystemInfoSection
  }
];

export const ResidentInfoTabs: React.FC<ResidentInfoTabsProps> = ({
  resident,
  isLoaded,
  onEdit,
  onClose
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('basic');

  const activeTabData = TABS.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className={`border-b border-gray-200 mb-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`} style={{ transitionDelay: '400ms' }}>
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-smblue-400 text-smblue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`mr-2 w-4 h-4 ${
                  isActive ? 'text-smblue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {t(tab.label)}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className={`transition-all duration-500 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`} style={{ transitionDelay: '500ms' }}>
        {ActiveComponent && <ActiveComponent resident={resident} />}
      </div>

      {/* Action Buttons */}
      <div className={`flex justify-end space-x-4 pt-8 mt-8 border-t border-gray-200 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`} style={{ transitionDelay: '600ms' }}>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors flex items-center space-x-2"
        >
          <FiUser className="w-4 h-4" />
          <span>{t('residents.view.actions.edit')}</span>
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('residents.view.actions.close')}
        </button>
      </div>
    </div>
  );
};