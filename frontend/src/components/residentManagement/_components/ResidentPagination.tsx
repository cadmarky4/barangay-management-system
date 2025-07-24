// ============================================================================
// components/residents/ResidentPagination.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';

interface ResidentPaginationProps {
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export const ResidentPagination: React.FC<ResidentPaginationProps> = ({
  pagination,
  onPageChange,
  isLoading
}) => {
  const { t } = useTranslation();

  const from = (pagination.current_page - 1) * pagination.per_page + 1;
  const to = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  const getVisiblePages = () => {
    const maxVisible = 5;
    const current = pagination.current_page;
    const total = pagination.last_page;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible - 1);
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {t('residents.pagination.showing', { from, to, total: pagination.total })}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
            onClick={() => onPageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1 || isLoading}
          >
            {t('residents.pagination.previous')}
          </button>
          
          {getVisiblePages().map((pageNum) => (
            <button
              key={pageNum}
              className={`px-3 py-1 text-sm rounded ${
                pagination.current_page === pageNum
                  ? 'bg-smblue-400 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            className="px-3 py-1 text-sm bg-smblue-400 text-white rounded hover:bg-smblue-300 disabled:opacity-50 cursor-pointer"
            onClick={() => onPageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page || isLoading}
          >
            {t('residents.pagination.next')}
          </button>
        </div>
      </div>
    </div>
  );
};
