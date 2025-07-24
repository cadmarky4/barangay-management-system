// ============================================================================
// components/ui/StatCardSkeleton.tsx - Loading skeleton for stat cards
// ============================================================================

import React from 'react';

interface StatCardSkeletonProps {
  count?: number;
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({
  count = 4,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
};