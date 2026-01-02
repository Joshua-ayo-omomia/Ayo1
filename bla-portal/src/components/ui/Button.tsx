'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'rounded-[6px] transition-colors duration-150 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',

          // Variants
          {
            // Primary - solid dark blue
            'bg-[#0a2540] text-white hover:bg-[#0d3154] focus-visible:ring-[#0a2540]':
              variant === 'primary',

            // Secondary - border only
            'bg-transparent border border-[#0a2540] text-[#0a2540] hover:bg-[#0a2540]/5 focus-visible:ring-[#0a2540]':
              variant === 'secondary',

            // Ghost - text only
            'bg-transparent text-[#0a2540] hover:bg-[#0a2540]/5 focus-visible:ring-[#0a2540]':
              variant === 'ghost',

            // Accent - golden (rare use)
            'bg-[#d4a012] text-white hover:bg-[#c49410] focus-visible:ring-[#d4a012]':
              variant === 'accent',
          },

          // Sizes
          {
            'h-8 px-3 text-sm gap-1.5': size === 'sm',
            'h-10 px-4 text-sm gap-2': size === 'md',
            'h-12 px-6 text-base gap-2.5': size === 'lg',
          },

          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',

          className
        )}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn('animate-spin', {
              'h-3.5 w-3.5': size === 'sm',
              'h-4 w-4': size === 'md',
              'h-5 w-5': size === 'lg',
            })}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
