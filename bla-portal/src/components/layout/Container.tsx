import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide';
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'default', children, ...props }, ref) => {
    const sizes = {
      narrow: 'max-w-3xl',
      default: 'max-w-content',
      wide: 'max-w-7xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          sizes[size],
          'mx-auto',
          'px-6 md:px-12',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export { Container };
