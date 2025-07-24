import React from 'react';

interface PaginationNavigationProps {
  isLoading: boolean;
  currentPage: number;
  lastPage: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export const PaginationNavigation: React.FC<PaginationNavigationProps> = ({
  isLoading,
  currentPage,
  lastPage,
  totalPages,
  perPage,
  onPageChange,
}) => {
  // Generate visible page numbers with max 3 consecutive pages
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    
    if (lastPage <= 6) {
      // Show all pages if 6 or fewer total pages
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always show first page
    pages.push(1);
    
    // Determine the group of 3 consecutive pages around current page
    let groupStart: number;
    let groupEnd: number;
    
    if (currentPage <= 3) {
      // Current page is near the beginning
      groupStart = 2;
      groupEnd = 4;
    } else if (currentPage >= lastPage - 2) {
      // Current page is near the end
      groupStart = lastPage - 3;
      groupEnd = lastPage - 1;
    } else {
      // Current page is in the middle
      groupStart = currentPage - 1;
      groupEnd = currentPage + 1;
    }
    
    // Add ellipsis after first page if needed
    if (groupStart > 2) {
      pages.push('...');
    }
    
    // Add the group of 3 consecutive pages
    for (let i = groupStart; i <= groupEnd; i++) {
      if (i > 1 && i < lastPage) {
        pages.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (groupEnd < lastPage - 1) {
      pages.push('...');
    }
    
    // Always show last page
    pages.push(lastPage);
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-gray-200 rounded-b-xl bg-white w-full">
      <div className="flex flex-col @2xl/main:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * perPage + 1} to{" "}
          {Math.min(currentPage * perPage, totalPages)} of {totalPages}{" "}
          results
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            className="cursor-pointer px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-400">
                  ...
                </span>
              );
            }
            
            const pageNum = page as number;
            const isCurrentPage = currentPage === pageNum;
            
            return (
              <button
                key={pageNum}
                className={`cursor-pointer px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors min-w-[28px] sm:min-w-[32px] ${
                  isCurrentPage
                    ? "bg-smblue-300 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            className="cursor-pointer px-2 sm:px-3 py-1 text-xs sm:text-sm bg-smblue-300 text-white rounded hover:bg-smblue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
            disabled={currentPage === lastPage || isLoading}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};