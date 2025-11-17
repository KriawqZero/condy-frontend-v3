'use client';

import { ButtonProps } from '@/types';
import clsx from 'clsx';

interface CondyButtonProps extends ButtonProps {
  fullWidth?: boolean;
  leftIcon?: string;
  rightIcon?: string;
}

export default function CondyButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className,
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}: CondyButtonProps) {
  return (
    <>
      <style jsx>{`
        .btn-primary {
          width: ${fullWidth ? '100%' : 'auto'};
          height: 58px;
          font-size: 20px;
          background-color: #2563eb;
          color: white;
          border-radius: 12px;
          font-weight: 500;
          transition: background-color 0.2s;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 24px;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        .btn-primary:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          width: ${fullWidth ? '100%' : 'auto'};
          height: 58px;
          font-size: 20px;
          background-color: #f3f4f6;
          color: #374151;
          border: 2px solid #d1d5db;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 24px;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
          border-color: #9ca3af;
        }

        .btn-secondary:disabled {
          background-color: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .btn-danger {
          width: ${fullWidth ? '100%' : 'auto'};
          height: 58px;
          font-size: 20px;
          background-color: #dc2626;
          color: white;
          border-radius: 12px;
          font-weight: 500;
          transition: background-color 0.2s;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 24px;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #b91c1c;
        }

        .btn-danger:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .btn-sm {
          height: 40px;
          font-size: 14px;
          padding: 0 16px;
        }

        .btn-lg {
          height: 64px;
          font-size: 24px;
          padding: 0 32px;
        }
      `}</style>

      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={clsx(
          {
            'btn-primary': variant === 'primary',
            'btn-secondary': variant === 'secondary',
            'btn-danger': variant === 'danger',
            'btn-sm': size === 'sm',
            'btn-lg': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {/* Ícone esquerdo */}
        {leftIcon && !loading && <img src={leftIcon} alt='' className='w-5 h-5 mr-2' />}

        {/* Loading spinner */}
        {loading && <img src='/loading.gif' alt='Carregando' className='w-6 h-6 mr-2' />}

        {/* Texto do botão */}
        {children}

        {/* Ícone direito */}
        {rightIcon && !loading && <img src={rightIcon} alt='' className='w-5 h-5 ml-2' />}
      </button>
    </>
  );
}
