import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
  customIcon?: React.ReactNode;
}

export function CondySelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  error,
  disabled = false,
  customIcon,
}: CondySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  
  // Verifica se estamos no navegador (client-side)
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // Atualiza a posição do dropdown quando o botão é redimensionado ou a janela é redimensionada
  useEffect(() => {
    if (!isOpen || !buttonRef) return;
    
    const updateRect = () => {
      setButtonRect(buttonRef.getBoundingClientRect());
    };
    
    updateRect();
    window.addEventListener('resize', updateRect);
    
    // Adiciona listener para fechar o dropdown quando o usuário pressiona Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, buttonRef]);

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
          ref={setButtonRef}
          className={`w-full border-2 rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all ${
            error 
              ? 'border-red-500' 
              : isOpen 
                ? 'border-[#1F45FF] ring-2 ring-blue-100' 
                : 'border-[#1F45FF]'
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-2">
            {customIcon || (
              <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.3701 9.53234H17.6201" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> 
                <path d="M6.37988 9.53234L7.12988 10.2823L9.37988 8.03234" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> 
                <path d="M12.3701 16.5323H17.6201" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> 
                <path d="M6.37988 16.5323L7.12988 17.2823L9.37988 15.0323" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> 
                <path d="M9 22.6523H15C20 22.6523 22 20.6523 22 15.6523V9.65234C22 4.65234 20 2.65234 15 2.65234H9C4 2.65234 2 4.65234 2 9.65234V15.6523C2 20.6523 4 22.6523 9 22.6523Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> 
              </svg>
            )}
            <span className={selectedOption ? 'text-black' : 'text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown 
            size={20} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${
              disabled ? 'text-gray-400' : 'text-[#1F45FF]'
            }`} 
          />
        </button>

        {isOpen && (
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {isOpen && buttonRect && isBrowser && createPortal(
          <div 
            className="fixed z-[9999] bg-white border-2 border-[#1F45FF] rounded-xl shadow-lg max-h-60 overflow-y-auto"
            style={{
              width: buttonRect.width,
              top: buttonRect.bottom + window.scrollY + 4,
              left: buttonRect.left + window.scrollX,
            }}
          >
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
          </div>,
          document.body
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}