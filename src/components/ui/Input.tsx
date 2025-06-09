import { InputProps } from '@/types';
import clsx from 'clsx';

export default function Input({
  label,
  error,
  required = false,
  type = 'text',
  placeholder,
  value,
  name,
  onChange,
  className,
  ...props
}: InputProps) {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors',
    {
      'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !error,
      'border-red-300 focus:ring-red-500 focus:border-red-500': error,
    },
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 