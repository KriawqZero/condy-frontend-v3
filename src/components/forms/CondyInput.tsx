'use client';

import { InputProps } from '@/types';
import clsx from 'clsx';

interface CondyInputProps extends Omit<InputProps, 'onChange'> {
  icon?: string;
  showValidation?: boolean;
  onToggleVisibility?: () => void;
  isPasswordVisible?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CondyInput({
  label,
  error,
  required = false,
  type = 'text',
  placeholder = ' ',
  value = '',
  name,
  icon,
  showValidation = false,
  onToggleVisibility,
  isPasswordVisible,
  onChange,
  className,
  ...props
}: CondyInputProps) {
  const isValid = value && !error && showValidation;
  const hasError = error && value;
  const isPassword = type === 'password' || (type === 'text' && onToggleVisibility);

  return (
    <>
      <style jsx>{`
        .input-container {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          z-index: 2;
          pointer-events: none;
        }

        .check-icon {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          z-index: 2;
        }

        .form-input {
          height: 56px !important;
          padding-left: ${icon ? '40px' : '16px'} !important;
          padding-right: 40px !important;
          width: 100%;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          color: #111827;
          background-color: #fff;
        }

        .form-input:focus {
          outline: none !important;
          border-color: #1f45ff !important;
          border-width: 2px !important;
          box-shadow: 0 0 0 4px rgba(31, 69, 255, 0.1) !important;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .floating-label {
          position: absolute;
          left: ${icon ? '40px' : '16px'};
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #161616;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          background-color: transparent;
          padding: 0;
          font-weight: normal;
          z-index: 5;
        }

        .form-input:focus ~ .floating-label,
        .form-input:not(:placeholder-shown) ~ .floating-label {
          top: -1px;
          left: 15px;
          transform: translateY(0);
          font-size: 12px;
          font-weight: 600;
          color: #1f45ff;
          background-color: white;
          padding: 0 8px;
          border-radius: 4px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-input.error {
          border-color: #ef4444 !important;
        }

        .form-input.error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
        }

        .text-red-500 {
          color: #ff7387 !important;
        }

        .form-input.error ~ .floating-label.text-red-500 {
          color: #ff7387 !important;
        }
      `}</style>

      <div className="form-group">
        <div className="input-container">
          {/* Ícone à esquerda */}
          {icon && (
            <div className="input-icon">
              <img src={icon} alt="" className="w-5 h-5" />
            </div>
          )}

          {/* Input */}
          <input
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            type={isPassword && isPasswordVisible ? 'text' : type}
            className={clsx('form-input', {
              error: hasError,
            })}
            placeholder={placeholder}
            required={required}
            {...props}
          />

          {/* Label flutuante */}
          <label
            htmlFor={name}
            className={clsx('floating-label', {
              'text-red-500': hasError,
            })}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {/* Ícone de validação/ação à direita */}
          {isPassword ? (
            <div className="check-icon cursor-pointer" onClick={onToggleVisibility}>
              <img
                src={isPasswordVisible ? '/svg/eye_off.svg' : '/svg/eye.svg'}
                alt="Mostrar/Ocultar senha"
                className="w-5 h-5"
              />
            </div>
          ) : showValidation && value ? (
            <div className="check-icon">
              <img
                src={isValid ? '/svg/checkmark_success.svg' : '/svg/checkmark_error.svg'}
                alt={isValid ? 'Sucesso' : 'Erro'}
                className="w-5 h-5"
              />
            </div>
          ) : null}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
    </>
  );
} 