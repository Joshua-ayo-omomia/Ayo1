'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'bg-white rounded-[8px] p-6',
          'border border-[#e6ebf1]',
          'transition-all duration-150 ease-in-out',

          // Hover state (optional)
          hoverable && [
            'hover:border-[#d0d6dd]',
            'hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
          ],

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
