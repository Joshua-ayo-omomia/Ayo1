'use client';

import React, { ElementType, ComponentPropsWithoutRef } from 'react';

// Typography style definitions
const typographyStyles = {
  hero: {
    fontSize: '56px',
    fontWeight: 600,
    letterSpacing: '-2px',
    color: '#0a2540',
    lineHeight: 1.1,
  },
  title: {
    fontSize: '40px',
    fontWeight: 600,
    letterSpacing: '-1px',
    color: '#0a2540',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 600,
    letterSpacing: '-0.5px',
    color: '#0a2540',
  },
  subheading: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#0a2540',
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.6,
    color: '#425466',
  },
  bodyLarge: {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.7,
    color: '#425466',
  },
  caption: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#8898aa',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#8898aa',
  },
  mono: {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#635bff',
  },
} as const;

// Variant types
type TypographyVariant = keyof typeof typographyStyles;

// Default HTML elements for each variant
const defaultElements: Record<TypographyVariant, ElementType> = {
  hero: 'h1',
  title: 'h2',
  heading: 'h3',
  subheading: 'h4',
  body: 'p',
  bodyLarge: 'p',
  caption: 'span',
  label: 'span',
  mono: 'code',
};

// Polymorphic component props
type PolymorphicProps<E extends ElementType> = {
  as?: E;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'className' | 'style'>;

// Typography component props
type TypographyProps<E extends ElementType = 'span'> = PolymorphicProps<E> & {
  variant: TypographyVariant;
};

/**
 * Unified Typography component with variant prop
 */
export function Typography<E extends ElementType = 'span'>({
  variant,
  as,
  children,
  className = '',
  style,
  ...rest
}: TypographyProps<E>) {
  const Component = as || defaultElements[variant];
  const variantStyles = typographyStyles[variant];

  return React.createElement(
    Component,
    {
      className,
      style: { ...variantStyles, ...style },
      ...rest,
    },
    children
  );
}

// Individual component props type
type IndividualTypographyProps<E extends ElementType = 'span'> = PolymorphicProps<E>;

/**
 * Hero - 56px, weight 600, letter-spacing -2px, color #0a2540, line-height 1.1
 */
export function Hero<E extends ElementType = 'h1'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'h1';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.hero, ...style },
      ...rest,
    },
    children
  );
}

/**
 * Title - 40px, weight 600, letter-spacing -1px, color #0a2540
 */
export function Title<E extends ElementType = 'h2'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'h2';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.title, ...style },
      ...rest,
    },
    children
  );
}

/**
 * Heading - 28px, weight 600, letter-spacing -0.5px, color #0a2540
 */
export function Heading<E extends ElementType = 'h3'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'h3';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.heading, ...style },
      ...rest,
    },
    children
  );
}

/**
 * Subheading - 20px, weight 600, color #0a2540
 */
export function Subheading<E extends ElementType = 'h4'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'h4';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.subheading, ...style },
      ...rest,
    },
    children
  );
}

/**
 * Body - 16px, weight 400, line-height 1.6, color #425466
 */
export function Body<E extends ElementType = 'p'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'p';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.body, ...style },
      ...rest,
    },
    children
  );
}

/**
 * BodyLarge - 18px, weight 400, line-height 1.7, color #425466
 */
export function BodyLarge<E extends ElementType = 'p'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'p';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.bodyLarge, ...style },
      ...rest,
    },
    children
  );
}

/**
 * Caption - 14px, weight 400, color #8898aa
 */
export function Caption<E extends ElementType = 'span'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'span';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.caption, ...style },
      ...rest,
    },
    children
  );
}

/**
 * Label - 13px, weight 500, uppercase, letter-spacing 1px, color #8898aa
 */
export function Label<E extends ElementType = 'span'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'span';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.label, ...style },
      ...rest,
    },
    children
  );
}

/**
 * Mono - 14px, font-family monospace, color #635bff (for reference numbers, IDs)
 */
export function Mono<E extends ElementType = 'code'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'code';
  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles.mono, ...style },
      ...rest,
    },
    children
  );
}

// SectionLabel styles
const sectionLabelStyles: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#d4a012',
  letterSpacing: '2px',
  textTransform: 'uppercase',
};

/**
 * SectionLabel - Golden uppercase labels like "SERVICES"
 * 13px, weight 600, color #d4a012, letter-spacing 2px, uppercase
 */
export function SectionLabel<E extends ElementType = 'span'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: IndividualTypographyProps<E>) {
  const Component = as || 'span';
  return React.createElement(
    Component,
    {
      className,
      style: { ...sectionLabelStyles, ...style },
      ...rest,
    },
    children
  );
}

// Export all variants for convenience
export const TypographyVariants = {
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

export default Typography;
