import React from 'react';

interface CloseIconProps {
  size?: number;
  className?: string;
}

export function CloseIcon({ size = 24, className = '' }: CloseIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    > 
      <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> 
      <path d="M9.16992 14.83L14.8299 9.16998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> 
      <path d="M14.8299 14.83L9.16992 9.16998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> 
    </svg>
  );
}