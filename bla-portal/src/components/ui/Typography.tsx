import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
};

// Hero: 56px, weight 600, letter-spacing -2px, line-height 1.1
const Hero = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = 'h1', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-[56px] font-semibold tracking-[-2px] leading-[1.1] text-primary',
        className
      )}
      {...props}
    />
  )
);
Hero.displayName = 'Hero';

// Title: 40px, weight 600, letter-spacing -1px
const Title = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = 'h1', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-[40px] font-semibold tracking-[-1px] text-primary',
        className
      )}
      {...props}
    />
  )
);
Title.displayName = 'Title';

// Heading: 28px, weight 600, letter-spacing -0.5px
const Heading = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = 'h2', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-[28px] font-semibold tracking-[-0.5px] text-primary',
        className
      )}
      {...props}
    />
  )
);
Heading.displayName = 'Heading';

// Subheading: 20px, weight 600
const Subheading = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-[20px] font-semibold text-primary',
        className
      )}
      {...props}
    />
  )
);
Subheading.displayName = 'Subheading';

// Body: 16px, weight 400, line-height 1.6
const Body = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = 'p', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-base font-normal leading-[1.6] text-text-secondary',
        className
      )}
      {...props}
    />
  )
);
Body.displayName = 'Body';

// BodyLarge: 18px, weight 400, line-height 1.7
const BodyLarge = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = 'p', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-lg font-normal leading-[1.7] text-text-secondary',
        className
      )}
      {...props}
    />
  )
);
BodyLarge.displayName = 'BodyLarge';

// Caption: 14px, weight 400
const Caption = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = 'p', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-sm font-normal text-text-muted',
        className
      )}
      {...props}
    />
  )
);
Caption.displayName = 'Caption';

// Label: 13px, weight 500, uppercase, letter-spacing 1px
const Label = forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className, as: Component = 'span', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-[13px] font-medium uppercase tracking-[1px] text-text-muted',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

// Mono: 14px, font-family monospace, for reference numbers, IDs
const Mono = forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className, as: Component = 'span', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-sm font-mono text-accent',
        className
      )}
      {...props}
    />
  )
);
Mono.displayName = 'Mono';

// SectionLabel: 13px, weight 600, uppercase, letter-spacing 2px, golden
const SectionLabel = forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className, as: Component = 'span', ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        'text-[13px] font-semibold uppercase tracking-[2px] text-golden',
        className
      )}
      {...props}
    />
  )
);
SectionLabel.displayName = 'SectionLabel';

export {
  Hero,
  Title,
  Heading,
  Subheading,
  Body,
  BodyLarge,
  Caption,
  Label,
  Mono,
  SectionLabel,
};
