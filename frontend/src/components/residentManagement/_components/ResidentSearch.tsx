// ============================================================================
// components/residents/ResidentSearch.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiPlus } from 'react-icons/fi';

interface ResidentSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNew: () => void;
  isLoading: boolean;
}

export const ResidentSearch: React.FC<ResidentSearchProps> = ({
  searchTerm,
  onSearchChange,
  onAddNew,
  isLoading
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('residents.search')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
        />
      </div>
      <button
        onClick={onAddNew}
        disabled={isLoading}
        className="ml-4 bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <FiPlus className="w-4 h-4" />
        <span>{t('residents.addNew')}</span>
      </button>
    </div>
  );
};
