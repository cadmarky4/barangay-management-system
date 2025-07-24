// ============================================================================
// components/ui/TimeInput.tsx - Time input component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

interface TimeInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  error?: string | null;
}

const TimeInput: React.FC<TimeInputProps> = ({
  name,
  value,
  onChange,
  className = '',
  placeholder = 'Select time',
  required = false,
  disabled = false,
  hasError = false,
  error = null
}) => {
  const [inputValue, setInputValue] = useState('');

  // Convert display value (e.g., "8:00 AM") to 24-hour format for input
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return '';
    
    const time12hPattern = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = time12h.match(time12hPattern);
    
    if (!match) return '';
    
    const [, hours, minutes, period] = match;
    let hour24 = parseInt(hours, 10);
    
    if (period.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (period.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  };

  // Convert 24-hour format to display format (e.g., "08:00" to "8:00 AM")
  const convertTo12Hour = (time24h: string): string => {
    if (!time24h) return '';
    
    const [hours, minutes] = time24h.split(':');
    const hour24 = parseInt(hours, 10);
    
    if (isNaN(hour24)) return '';
    
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    
    return `${hour12}:${minutes} ${period}`;
  };

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(convertTo24Hour(value));
  }, [value]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time24h = e.target.value;
    setInputValue(time24h);
    
    // Convert to 12-hour format for form state
    const time12h = convertTo12Hour(time24h);
    
    // Create synthetic event with the converted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: time12h
      }
    };
    
    onChange(syntheticEvent);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiClock className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="time"
        name={name}
        value={inputValue}
        onChange={handleTimeChange}
        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 ${
          hasError || error ? 'border-red-300' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TimeInput;
