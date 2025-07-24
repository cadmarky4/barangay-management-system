import React from 'react';
import { useTranslation } from 'react-i18next';
import HouseholdRow from './HouseholdRow';
import type { Household } from '@/services/households/households.types';


interface PaginationData {
 current_page: number;
 last_page: number;
 per_page: number;
 total: number;
}

interface HouseholdTableProps {
 households: Household[];
 pagination?: PaginationData;
 isLoading: boolean;
 currentPage: number;
 onPageChange: (page: number) => void;
 onEdit: (id: string) => void;
 onView: (id: string) => void;
 onDelete: (id: string, householdNumber: string) => void;
 isDeleting: boolean;
 deletingId?: string;
}

const HouseholdTable: React.FC<HouseholdTableProps> = ({
 households,
 pagination,
 isLoading,
 currentPage,
 onPageChange,
 onEdit,
 onView,
 onDelete,
 isDeleting,
 deletingId
}) => {
 const { t } = useTranslation();

 return (
   <>
     {/* Table */}
     <div className="overflow-x-auto">
       {isLoading ? (
         <div className="flex justify-center items-center py-12">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400"></div>
           <span className="ml-2 text-gray-600">{t('households.messages.loading')}</span>
         </div>
       ) : (
         <table className="min-w-full">
           <thead className="bg-gray-50">
             <tr>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 {t('households.table.headers.householdNumber')}
               </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 {t('households.table.headers.headAndAddress')}
               </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 {t('households.table.headers.membersAndIncome')}
               </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 {t('households.table.headers.programs')}
               </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 {t('households.table.headers.status')}
               </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 {t('households.table.headers.actions')}
               </th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {households.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                   {t('households.table.noHouseholdsFound')}
                 </td>
               </tr>
             ) : (
               households.map((household) => (
                 <HouseholdRow
                   key={household.id}
                   household={household}
                   onEdit={onEdit}
                   onView={onView}
                   onDelete={onDelete}
                   isDeleting={isDeleting && deletingId === household.id}
                 />
               ))
             )}
           </tbody>
         </table>
       )}
     </div>

     {/* Pagination */}
     {pagination && (
       <div className="px-6 py-4 border-t border-gray-200">
         <div className="flex items-center justify-between">
           <div className="text-sm text-gray-700">
             {t('households.pagination.showing', {
               from: (pagination.current_page - 1) * pagination.per_page + 1,
               to: Math.min(pagination.current_page * pagination.per_page, pagination.total),
               total: pagination.total
             })}
           </div>
           <div className="flex items-center space-x-2">
             <button
               className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
               onClick={() => onPageChange(Math.max(1, currentPage - 1))}
               disabled={currentPage === 1 || isLoading}
             >
               {t('households.pagination.previous')}
             </button>
             {Array.from(
               { length: Math.min(5, pagination.last_page) },
               (_, i) => {
                 const pageNum = i + 1;
                 const isCurrentPage = currentPage === pageNum;

                 return (
                   <button
                     key={pageNum}
                     className={`px-3 py-1 text-sm rounded ${
                       isCurrentPage
                         ? "bg-smblue-400 text-white"
                         : "text-gray-500 hover:text-gray-700"
                     }`}
                     onClick={() => onPageChange(pageNum)}
                     disabled={isLoading}
                   >
                     {pageNum}
                   </button>
                 );
               }
             )}
             <button
               className="px-3 py-1 text-sm bg-smblue-400 text-white rounded hover:bg-smblue-300 disabled:opacity-50"
               onClick={() =>
                 onPageChange(
                   Math.min(pagination.last_page, currentPage + 1)
                 )
               }
               disabled={currentPage === pagination.last_page || isLoading}
             >
               {t('households.pagination.next')}
             </button>
           </div>
         </div>
       </div>
     )}
   </>
 );
};

export default HouseholdTable;