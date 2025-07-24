// ============================================================================
// components/residents/form/ResidentFormField.tsx - Reusable form field
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, type FieldErrors, type FieldValues } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  readOnly = false,
  rows = 3,
  options = [],
  className = '',
}) => {
  const { t } = useTranslation();
  const { register, formState: { errors } } = useFormContext();
  
  const fieldError = (name.includes('.') ? (errors[name.split('.')[0]] as FieldErrors<FieldValues>)?.[name.split('.')[1]] : errors[name]);

  const baseClassName = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
    fieldError 
      ? 'border-red-300 focus:ring-red-200 focus:border-red-300' 
      : 'border-gray-300'
  } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''} ${className}`;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...register(name)}
            placeholder={placeholder}
            rows={rows}
            readOnly={readOnly}
            className={baseClassName}
          />
        );
      
      case 'select':
        return (
          <select
            {...register(name)}
            defaultValue=""
            className={baseClassName}
            disabled={readOnly}
          >
            <option disabled value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            {...register(name)}
            type={type}
            placeholder={placeholder}
            readOnly={readOnly}
            className={baseClassName}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {fieldError && (
        <p className="mt-1 text-sm text-red-600">
          {t(fieldError.message as string)}
        </p>
      )}
    </div>
  );
};