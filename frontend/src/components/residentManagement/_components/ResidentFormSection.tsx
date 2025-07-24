// ============================================================================
// components/residents/form/ResidentFormSection.tsx - Form section wrapper
// ============================================================================

import React from 'react';

interface ResidentFormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ResidentFormSection: React.FC<ResidentFormSectionProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
        {title}
      </h2>
      <div className="border-b border-gray-200 mb-6"></div>
      {children}
    </section>
  );
};
