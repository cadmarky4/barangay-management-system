import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import { residentsService } from '../../../services/residents/residents.service';
import { householdsService } from '../../../services/households/households.service';
import type { Resident } from '../../../services/residents/residents.types';
import type { HouseholdMember, RelationshipType, Household } from '../../../services/households/households.types';

interface HouseholdMembersProps {
  householdId: string;
  householdHead: Resident | null;
  onMembersUpdate?: (members: HouseholdMemberWithResident[]) => void;
}

interface HouseholdMemberWithResident extends HouseholdMember {
  resident: Resident;
  household_id: string;
  resident_id: string;
  relationship_to_head: RelationshipType;
  is_household_head: boolean;
}

const HouseholdMembers: React.FC<HouseholdMembersProps> = ({ 
  householdId, 
  householdHead, 
  onMembersUpdate 
}) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<HouseholdMemberWithResident[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [relationship, setRelationship] = useState<RelationshipType | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Resident[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const relationshipOptions: RelationshipType[] = [
    'SPOUSE',
    'SON',
    'DAUGHTER',
    'FATHER',
    'MOTHER',
    'BROTHER',
    'SISTER',
    'GRANDSON',
    'GRANDDAUGHTER',
    'GRANDFATHER',
    'GRANDMOTHER',
    'UNCLE',
    'AUNT',
    'NEPHEW',
    'NIECE',
    'COUSIN',
    'IN_LAW',
    'BOARDER',
    'OTHER'
  ];  // Fetch household members
  const fetchMembers = useCallback(async () => {
    if (!householdId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the actual households service to get members
      const response = await householdsService.getHousehold(householdId);
      // Assuming the backend returns members with full resident data
      setMembers((response as Household & { members: HouseholdMemberWithResident[] }).members || []);
    } catch (err) {
      setError(t('households.form.members.loadError', { defaultValue: 'Failed to load household members' }));
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  }, [householdId, t]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

 // Search for residents to add
 const searchResidents = useCallback(async (term: string) => {
   if (!term.trim()) {
     setSearchResults([]);
     return;
   }

   setIsSearching(true);
   try {
     const results = await residentsService.searchResidents(term);
        // Filter out the household head and existing members
    const filteredResults = results.filter((resident: Resident) => 
      resident.id !== householdHead?.id &&
      !members.some((member: HouseholdMemberWithResident) => member.resident_id === resident.id)
    );
     
     setSearchResults(filteredResults);
   } catch (err) {
     console.error('Error searching residents:', err);
     setSearchResults([]);
   } finally {
     setIsSearching(false);
   }
 }, [householdHead?.id, members]);

 // Handle search input change
 useEffect(() => {
   const delayedSearch = setTimeout(() => {
     searchResidents(searchTerm);
   }, 300);

   return () => clearTimeout(delayedSearch);
 }, [searchTerm, searchResidents]);  const handleAddMember = async () => {
    if (!selectedResident || !relationship) {
      setError(t('households.form.members.selectResidentAndRelationship', { 
        defaultValue: 'Please select a resident and relationship' 
      }));
      return;
    }

    try {
      const newMember: HouseholdMemberWithResident = {
        id: `temp-${Date.now()}`, // Temporary ID until saved
        household_id: householdId,
        resident_id: selectedResident.id,
        relationship: relationship as RelationshipType,
        relationship_to_head: relationship as RelationshipType,
        is_household_head: false,
        resident: selectedResident
      };

      setMembers((prev) => [...prev, newMember]);
      
      setSelectedResident(null);
      setRelationship('');
      setSearchTerm('');
      setSearchResults([]);
      setShowAddMember(false);
      setError(null);

      if (onMembersUpdate) {
        onMembersUpdate([...members, newMember]);
      }

    } catch (err) {
      setError(t('households.form.members.addError', { defaultValue: 'Failed to add household member' }));
      console.error('Error adding member:', err);
    }
  };  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm(t('households.form.confirmations.removeMember'))) {
      return;
    }

    try {
      const updatedMembers = members.filter(member => member.id !== memberId);
      setMembers(updatedMembers);
      
      if (onMembersUpdate) {
        onMembersUpdate(updatedMembers);
      }

    } catch (err) {
      setError(t('households.form.members.removeError', { defaultValue: 'Failed to remove household member' }));
      console.error('Error removing member:', err);
    }
  };

 return (
   <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
     <div className="flex justify-between items-center mb-6">
       <h3 className="text-lg font-semibold text-darktext border-l-4 border-smblue-400 pl-4">
         {t('households.form.members.title')}
       </h3>
       <button
         onClick={() => setShowAddMember(true)}
         className="bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
       >
         <FiPlus className="w-4 h-4" />
         <span>{t('households.form.members.addMember')}</span>
       </button>
     </div>

     {error && (
       <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
         <p className="text-red-800 text-sm">{error}</p>
       </div>
     )}

     {/* Household Head Display */}
     <div className="bg-blue-50 rounded-lg p-4 mb-4">
       <h4 className="font-medium text-blue-900 mb-2">{t('households.form.members.headOfFamily')}</h4>
       <div className="flex items-center justify-between">
         <div>
           <p className="font-medium text-blue-800">
             {householdHead?.first_name} {householdHead?.last_name}
           </p>
           <p className="text-sm text-blue-600">
             {t('households.form.members.age')}: {householdHead?.age} | {t('households.form.members.gender')}: {householdHead?.gender}
           </p>
         </div>
         <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
           {t('households.relationships.HEAD')}
         </span>
       </div>
     </div>

     {/* Add Member Form */}
     {showAddMember && (
       <div className="bg-gray-50 rounded-lg p-4 mb-4">
         <h4 className="font-medium text-gray-900 mb-4">{t('households.form.members.addNewMember', { defaultValue: 'Add New Member' })}</h4>
         
         <div className="space-y-4">
           {/* Resident Search */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               {t('households.form.members.searchResident', { defaultValue: 'Search for Resident' })} *
             </label>
             <div className="relative">
               <input
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder={t('households.form.members.searchPlaceholder', { defaultValue: 'Type name to search...' })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
               />
               <FiSearch className="absolute right-3 top-3 text-gray-400" />
               {isSearching && (
                 <div className="absolute right-10 top-3 text-gray-400">
                   <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-smblue-400 rounded-full"></div>
                 </div>
               )}
             </div>
             
             {/* Search Results */}
             {searchResults.length > 0 && (
               <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                 {searchResults.map((resident: Resident) => (
                   <button
                     key={resident.id}
                     type="button"
                     onClick={() => {
                       setSelectedResident(resident);
                       setSearchTerm(`${resident.first_name} ${resident.last_name}`);
                       setSearchResults([]);
                     }}
                     className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                       selectedResident?.id === resident.id ? 'bg-smblue-50 text-smblue-700' : ''
                     }`}
                   >
                     <div>
                       <p className="font-medium">{resident.first_name} {resident.last_name}</p>
                       <p className="text-sm text-gray-600">Age: {resident.age} | Gender: {resident.gender}</p>
                     </div>
                   </button>
                 ))}
               </div>
             )}
             
             {searchTerm && searchResults.length === 0 && !isSearching && (
               <p className="mt-2 text-sm text-gray-500">
                 {t('households.form.members.noResidentsFound', { defaultValue: 'No residents found. Try a different search term.' })}
               </p>
             )}
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               {t('households.form.members.relationshipToHead', { defaultValue: 'Relationship to Household Head' })} *
             </label>
             <select
               value={relationship}
               onChange={(e) => setRelationship(e.target.value as RelationshipType)}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
               required
             >
               <option value="">{t('households.form.options.selectRelationship')}</option>
               {relationshipOptions.map((option) => (
                 <option key={option} value={option}>
                   {t(`households.relationships.${option}`)}
                 </option>
               ))}
             </select>
           </div>

           <div className="flex space-x-3">
             <button
               onClick={handleAddMember}
               disabled={!selectedResident || !relationship}
               className="bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {t('households.form.members.addMember')}
             </button>
             <button
               onClick={() => {
                 setShowAddMember(false);
                 setSelectedResident(null);
                 setRelationship('');
                 setSearchTerm('');
                 setSearchResults([]);
                 setError(null);
               }}
               className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
             >
               {t('households.form.actions.cancel')}
             </button>
           </div>
         </div>
       </div>
     )}

     {/* Members Table */}
     {members.length === 0 ? (
       <div className="text-center py-8">
         <p className="text-gray-600">{t('households.form.members.noMembers')}</p>
         <p className="text-sm text-gray-500 mt-1">{t('households.form.members.noMembersDescription', { defaultValue: 'Click "Add Member" to start adding family members.' })}</p>
       </div>
     ) : (
       <div className="overflow-x-auto">
         <table className="w-full">
           <thead>
             <tr className="border-b border-gray-200">
               <th className="text-left py-3 px-4 font-medium text-gray-700">{t('households.form.members.memberName', { defaultValue: 'Name' })}</th>
               <th className="text-left py-3 px-4 font-medium text-gray-700">{t('households.form.members.relationship')}</th>
               <th className="text-left py-3 px-4 font-medium text-gray-700">{t('households.form.members.actions')}</th>
             </tr>
           </thead>
           <tbody>
             {members.map((member) => (
               <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                 <td className="py-3 px-4">
                   <p className="font-medium text-gray-900">
                     {member.resident?.first_name} {member.resident?.last_name}
                   </p>
                 </td>
                 <td className="py-3 px-4 text-gray-700">
                   {t(`households.relationships.${member.relationship_to_head}`, { 
                     defaultValue: member.relationship_to_head 
                   })}
                 </td>
                 <td className="py-3 px-4">
                   <button
                     onClick={() => handleRemoveMember(member.id)}
                     className="text-red-600 hover:text-red-800"
                     title={t('households.form.members.removeMember')}
                   >
                     <FiTrash2 className="w-4 h-4" />
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     )}
   </div>
 );
};

export default HouseholdMembers;