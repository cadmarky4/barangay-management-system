// ============================================================================
// components/residents/form/ResidentFormField.tsx - Enhanced form field component
// ============================================================================

import { t } from 'i18next';
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
}

interface ResidentFormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const ResidentFormField: React.FC<ResidentFormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  options = [],
  required = false,
  disabled = false,
  readOnly = false,
  loading = false,
  rows = 3,
  min,
  max,
  step,
  className = ''
}) => {
  const {
    control,
    formState: { errors },
    register
  } = useFormContext();

  const error = errors[name];
  const hasError = !!error;

  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg text-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-smblue-400 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${hasError 
      ? 'border-red-300 bg-red-50 focus:ring-red-400' 
      : 'border-gray-300 bg-white hover:border-gray-400'
    }
    ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}
    ${className}
  `;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...register(name, { required })}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            className={`${baseInputClasses} resize-vertical`}
          />
        );

      case 'select':
        return (
          <Controller
            name={name}
            control={control}
            rules={{ required }}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="relative">
                <select
                  {...field}
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled || loading}
                  className={`${baseInputClasses} pr-8 ${loading ? 'pl-8' : ''}`}
                >
                  {placeholder && (
                    <option value="" disabled>
                      {placeholder}
                    </option>
                  )}
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {loading && (
                  <FiLoader className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="flex items-center">
                <input
                  {...field}
                  type="checkbox"
                  checked={value || false}
                  onChange={(e) => onChange(e.target.checked)}
                  disabled={disabled}
                  className={`
                    w-4 h-4 text-smblue-400 border-gray-300 rounded
                    focus:ring-smblue-400 focus:ring-2 focus:ring-offset-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${hasError ? 'border-red-300' : ''}
                  `}
                />
                <span className="ml-2 text-sm text-gray-700 select-none">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </div>
            )}
          />
        );

      case 'number':
        return (
          <input
            {...register(name, { 
              required,
              min,
              max,
              valueAsNumber: true
            })}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            min={min}
            max={max}
            step={step}
            className={baseInputClasses}
          />
        );

      case 'date':
        return (
          <input
            {...register(name, { required })}
            type="date"
            disabled={disabled}
            readOnly={readOnly}
            className={baseInputClasses}
          />
        );

      case 'email':
        return (
          <input
            {...register(name, { 
              required,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={baseInputClasses}
          />
        );

      case 'tel':
        return (
          <input
            {...register(name, { required })}
            type="tel"
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={baseInputClasses}
          />
        );

      default:
        return (
          <input
            {...register(name, { required })}
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={baseInputClasses}
          />
        );
    }
  };

  // For checkbox type, render differently
  if (type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderField()}
        {hasError && (
          <div className="flex items-center text-red-600 text-xs">
            <FiAlertCircle className="w-3 h-3 mr-1" />
            <span>{error?.message as string}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {hasError && (
        <div className="flex items-center text-red-600 text-xs">
          <FiAlertCircle className="w-3 h-3 mr-1" />
          <span>{t(error?.message as string)}</span>
        </div>
      )}
    </div>
  );
};