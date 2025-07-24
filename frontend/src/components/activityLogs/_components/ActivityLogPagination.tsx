// ============================================================================
// components/activity-logs/ActivityLogPagination.tsx
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ActivityLogPaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export const ActivityLogPagination: React.FC<ActivityLogPaginationProps> = ({
  pagination,
  onPageChange,
  isLoading
}) => {
  const { t } = useTranslation();

  const { current_page, last_page, per_page, total } = pagination;

  // Calculate shown entries
  const startEntry = (current_page - 1) * per_page + 1;
  const endEntry = Math.min(current_page * per_page, total);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Pages to show on each side of current page
    const pages: (number | string)[] = [];
    
    // Always show first page
    if (last_page > 1) {
      pages.push(1);
    }
    
    // Add ellipsis if needed
    if (current_page - delta > 2) {
      pages.push('...');
    }
    
    // Add pages around current page
    const start = Math.max(2, current_page - delta);
    const end = Math.min(last_page - 1, current_page + delta);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (current_page + delta < last_page - 1) {
      pages.push('...');
    }
    
    // Always show last page (if different from first)
    if (last_page > 1) {
      pages.push(last_page);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (last_page <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile View */}
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => onPageChange(current_page - 1)}
            disabled={current_page <= 1 || isLoading}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('activityLogs.pagination.previous')}
          </button>
          <button
            onClick={() => onPageChange(current_page + 1)}
            disabled={current_page >= last_page || isLoading}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('activityLogs.pagination.next')}
          </button>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          {/* Results Info */}
          <div>
            <p className="text-sm text-gray-700">
              {t('activityLogs.pagination.showing')}{' '}
              <span className="font-medium">{startEntry.toLocaleString()}</span>{' '}
              {t('activityLogs.pagination.to')}{' '}
              <span className="font-medium">{endEntry.toLocaleString()}</span>{' '}
              {t('activityLogs.pagination.of')}{' '}
              <span className="font-medium">{total.toLocaleString()}</span>{' '}
              {t('activityLogs.pagination.results')}
            </p>
          </div>

          {/* Page Numbers */}
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {/* First Page Button */}
              <button
                onClick={() => onPageChange(1)}
                disabled={current_page <= 1 || isLoading}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('activityLogs.pagination.firstPage')}
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Previous Button */}
              <button
                onClick={() => onPageChange(current_page - 1)}
                disabled={current_page <= 1 || isLoading}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('activityLogs.pagination.previousPage')}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page Numbers */}
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
                    >
                      ...
                    </span>
                  );
                }

                const pageNumber = page as number;
                const isCurrentPage = pageNumber === current_page;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    disabled={isLoading}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed ${
                      isCurrentPage
                        ? 'z-10 bg-smblue-50 border-smblue-500 text-smblue-600'
                        : 'bg-white text-gray-500'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => onPageChange(current_page + 1)}
                disabled={current_page >= last_page || isLoading}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('activityLogs.pagination.nextPage')}
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last Page Button */}
              <button
                onClick={() => onPageChange(last_page)}
                disabled={current_page >= last_page || isLoading}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('activityLogs.pagination.lastPage')}
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};