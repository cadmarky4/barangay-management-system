// ============================================================================
// components/residents/ResidentTable.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { type Resident } from '@/services/residents/residents.types';
import { ResidentTableRow } from './ResidentTableRow';

interface ResidentTableProps {
  residents: Resident[];
  isLoading: boolean;
  searchTerm: string;
  onView: (resident: Resident) => void;
  onEdit: (resident: Resident) => void;
  onDelete: (resident: Resident) => void;
  deletingId: string | null;
}

export const ResidentTable: React.FC<ResidentTableProps> = ({
  residents,
  isLoading,
  searchTerm,
  onView,
  onEdit,
  onDelete,
  deletingId
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400"></div>
        <span className="ml-2 text-gray-600">{t('residents.messages.loading')}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('residents.table.headers.resident')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('residents.table.headers.contact')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('residents.table.headers.address')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('residents.table.headers.category')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('residents.table.headers.status')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('residents.table.headers.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {residents.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                {searchTerm
                  ? t('residents.table.noResultsSearch', { searchTerm })
                  : t('residents.table.noResults')}
              </td>
            </tr>
          ) : (
            residents.map((resident) => (
              <ResidentTableRow
                key={resident.id}
                resident={resident}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingId === resident.id}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
