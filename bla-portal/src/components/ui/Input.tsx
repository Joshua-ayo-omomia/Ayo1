'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#0a2540] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base styles
            'w-full h-12 px-4',
            'text-[#0a2540] text-base',
            'bg-white border rounded-[6px]',
            'placeholder:text-[#8898aa]',
            'transition-all duration-150 ease-in-out',
            'focus:outline-none',

            // Default border
            'border-[#e6ebf1]',

            // Focus state
            'focus:border-[#635bff] focus:shadow-[0_0_0_3px_rgba(99,91,255,0.1)]',

            // Error state
            error && 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',

            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',

            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
