'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'golden';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'px-2.5 py-0.5 rounded-full',
          'text-xs font-semibold uppercase tracking-wide',

          // Variants
          {
            // Success - green
            'bg-emerald-50 text-emerald-700': variant === 'success',

            // Warning - yellow
            'bg-amber-50 text-amber-700': variant === 'warning',

            // Error - red
            'bg-red-50 text-red-700': variant === 'error',

            // Info - blue
            'bg-blue-50 text-blue-700': variant === 'info',

            // Golden - premium/verified
            'bg-[#fef7e0] text-[#9a7b0a]': variant === 'golden',
          },

          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
