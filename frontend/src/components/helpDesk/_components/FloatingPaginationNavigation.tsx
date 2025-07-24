import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FloatingPaginationNavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  containerRef?: React.RefObject<HTMLElement>;
}

export const FloatingPaginationNavigation: React.FC<FloatingPaginationNavigationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  containerRef
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const element = containerRef?.current || window;
  //     const scrollTop = element === window 
  //       ? window.pageYOffset || document.documentElement.scrollTop 
  //       : (element as HTMLElement).scrollTop;
      
  //     // Show pagination when scrolled down more than 100px
  //     setIsVisible(scrollTop > 100);
  //   };

  //   const target = containerRef?.current || window;
  //   target.addEventListener('scroll', handleScroll);
    
  //   // Check initial scroll position
  //   handleScroll();

  //   return () => target.removeEventListener('scroll', handleScroll);
  // }, [containerRef]);

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div 
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
      }`}
    >
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-full shadow-lg shadow-black/10 px-3 py-2">
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`p-2 rounded-full transition-all duration-200 transform group ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 hover:scale-110 active:scale-90'
            }`}
          >
            <ChevronLeft 
              size={16} 
              className="transition-transform duration-200 group-hover:scale-110" 
            />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 mx-2">
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-gray-400 text-sm">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 transform relative overflow-hidden group ${
                      currentPage === page
                        ? 'bg-gray-900 text-white shadow-sm scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:scale-110 active:scale-95'
                    }`}
                  >
                    {/* Subtle hover background for non-active buttons */}
                    {currentPage !== page && (
                      <div className="absolute inset-0 bg-gray-100/70 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200 ease-out" />
                    )}
                    <span className="relative z-10">{page}</span>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full transition-all duration-200 transform group ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 hover:scale-110 active:scale-90'
            }`}
          >
            <ChevronRight 
              size={16} 
              className="transition-transform duration-200 group-hover:scale-110" 
            />
          </button>
        </div>
      </div>
    </div>
  );
};