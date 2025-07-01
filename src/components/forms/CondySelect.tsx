import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface CondySelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function CondySelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  error,
  disabled = false,
}: CondySelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full border-2 rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all ${
            error 
              ? 'border-red-500' 
              : isOpen 
                ? 'border-[#1F45FF] ring-2 ring-blue-100' 
                : 'border-[#1F45FF]'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-400'}`}
        >
          <span className={selectedOption ? 'text-black' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={20} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${
              disabled ? 'text-gray-400' : 'text-[#1F45FF]'
            }`} 
          />
        </button>

        {isOpen && !disabled && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border-2 border-[#1F45FF] rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
} 