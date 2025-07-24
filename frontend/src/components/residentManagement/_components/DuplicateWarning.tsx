// ============================================================================
// components/residents/form/DuplicateWarning.tsx - Duplicate warning component
// ============================================================================

import React from 'react';

interface DuplicateWarningProps {
  message: string;
}

export const DuplicateWarning: React.FC<DuplicateWarningProps> = ({ message }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <p className="text-yellow-800 text-sm font-medium">
        ⚠️ {message}
      </p>
    </div>
  );
};