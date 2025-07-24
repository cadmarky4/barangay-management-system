import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';
import { useResidentSearch } from '@/services/residents/useResidents';

interface ResidentSearchDropdownProps {
 searchTerm: string;
 onSearchChange: (term: string) => void;
 onSelectResident: (id: string, name: string) => void;
 excludeIds?: string[];
 placeholder?: string;
 disabled?: boolean;
}

const ResidentSearchDropdown: React.FC<ResidentSearchDropdownProps> = ({
 searchTerm,
 onSearchChange,
 onSelectResident,
 excludeIds = [],
 placeholder,
 disabled = false
}) => {
 const { t } = useTranslation();
 const [showDropdown, setShowDropdown] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 // Use the existing resident search hook
 const { data: searchResults = [], isLoading } = useResidentSearch(
   searchTerm,
   searchTerm.trim().length >= 2
 );

 // Filter out excluded residents
 const filteredResults = searchResults.filter(
   resident => !excludeIds.includes(resident.id)
 );

 // Handle click outside to close dropdown
 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
       setShowDropdown(false);
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const value = e.target.value;
   onSearchChange(value);
   setShowDropdown(value.trim().length >= 2);
 };

 const handleSelectResident = (resident: any) => {
   const fullName = `${resident.first_name} ${resident.last_name}`;
   onSelectResident(resident.id, fullName);
   setShowDropdown(false);
 };

 const handleInputFocus = () => {
   if (searchTerm.trim().length >= 2 && filteredResults.length > 0) {
     setShowDropdown(true);
   }
 };

 const defaultPlaceholder = placeholder || t('households.form.residentSearch.placeholder', { 
   defaultValue: 'Search residents...' 
 });

 return (
   <div className="relative" ref={dropdownRef}>
     <div className="relative">
       <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
       <input
         type="text"
         value={searchTerm}
         onChange={handleInputChange}
         onFocus={handleInputFocus}
         placeholder={defaultPlaceholder}
         disabled={disabled}
         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
       />

       {/* Loading indicator */}
       {isLoading && (
         <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-smblue-400"></div>
         </div>
       )}
     </div>

     {/* Search Results Dropdown */}
     {showDropdown && (
       <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
         {isLoading ? (
           <div className="px-4 py-3 text-center text-gray-500 text-sm">
             {t('households.form.residentSearch.searching')}
           </div>
         ) : filteredResults.length > 0 ? (
           filteredResults.map((resident) => (
             <button
               key={resident.id}
               type="button"
               onClick={() => handleSelectResident(resident)}
               className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
             >
               <div className="flex flex-col">
                 <span className="font-medium text-gray-900">
                   {resident.first_name} {resident.last_name}
                 </span>
                 <span className="text-sm text-gray-500">
                   {resident.mobile_number || resident.landline_number || t('households.form.residentSearch.noPhone')} • ID: {resident.id}
                 </span>
               </div>
             </button>
           ))
         ) : searchTerm.trim().length >= 2 ? (
           <div className="px-4 py-3 text-center text-gray-500 text-sm">
             {t('households.form.residentSearch.noResults', { searchTerm })}
           </div>
         ) : null}
       </div>
     )}
   </div>
 );
};

export default ResidentSearchDropdown;