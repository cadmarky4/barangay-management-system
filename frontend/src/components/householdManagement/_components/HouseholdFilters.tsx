import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch } from 'react-icons/fi';

interface HouseholdFiltersProps {
 searchTerm: string;
 onSearchChange: (value: string) => void;
 onAddHousehold: () => void;
}

const HouseholdFilters: React.FC<HouseholdFiltersProps> = ({
 searchTerm,
 onSearchChange,
 onAddHousehold
}) => {
 const { t } = useTranslation();

 return (
   <div className="p-6 border-b border-gray-200">
     <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
       {t('households.title')}
     </h3>

     {/* Search and Add Button */}
     <div className="flex justify-between items-center">
       <div className="relative flex-1 max-w-md">
         <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
         <input
           type="text"
           placeholder={t('households.search')}
           value={searchTerm}
           onChange={(e) => onSearchChange(e.target.value)}
           className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
         />
       </div>
       
       {/* Add Button */}
       <button 
         onClick={onAddHousehold}
         className="cursor-pointer no-underline bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap"
       >
         <FiPlus className="w-4 h-4" />
         <span>{t('households.addNew')}</span>
       </button>
     </div>
   </div>
 );
};

export default HouseholdFilters;