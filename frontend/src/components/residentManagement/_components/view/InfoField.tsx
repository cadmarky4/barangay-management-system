// ============================================================================
// components/residents/view/InfoField.tsx - Reusable info field component
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';

interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
  multiline?: boolean;
  className?: string;
  copyable?: boolean;
}

export const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  multiline = false,
  className = '',
  copyable = false
}) => {
  const { t } = useTranslation();

  const formatValue = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined || val === '') {
      return t('common.notSpecified');
    }
    if (typeof val === 'boolean') {
      return val ? t('common.yes') : t('common.no');
    }
    return String(val);
  };

  const handleCopy = async (text: string) => {
    if (copyable && text !== t('common.notSpecified')) {
      try {
        await navigator.clipboard.writeText(text);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const displayValue = formatValue(value);
  const isEmpty = displayValue === t('common.notSpecified');

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-500">
        {label}
      </label>
      
      {multiline ? (
        <div className={`min-h-[60px] p-3 bg-gray-50 rounded-lg border ${
          isEmpty ? 'text-gray-400 italic' : 'text-gray-900'
        }`}>
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {displayValue}
          </pre>
        </div>
      ) : (
        <div className="flex items-center group">
          <p className={`text-gray-900 ${isEmpty ? 'text-gray-400 italic' : ''}`}>
            {displayValue}
          </p>
          
          {copyable && !isEmpty && (
            <button
              onClick={() => handleCopy(displayValue)}
              className="ml-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all duration-200"
              title={t('common.copy')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};