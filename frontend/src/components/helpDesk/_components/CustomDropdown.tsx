import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CustomDropdownProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    options: FilterOption[];
    placeholder: string;
    icon?: React.ReactNode;
}

interface FilterOption {
    label: string,
    value: string | undefined,
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
    value, 
    onChange, 
    options, 
    placeholder, 
    icon,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    const selectedOption = options.find(opt => opt.value === value);
  
    return (
      <div className="relative flex-1" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-smblue-400/20 focus:border-smblue-400 min-w-[140px] text-left"
        >
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="flex-1 text-sm font-medium text-gray-700">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(option.value === 'ALL' ? undefined : option.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                  value === option.value || (!value && option.value === 'ALL')
                    ? 'bg-blue-50 text-smblue-400 font-medium'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };