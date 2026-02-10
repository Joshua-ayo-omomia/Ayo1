'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = {
  variant: {
    primary:
      'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 shadow-sm',
    secondary:
      'bg-navy-700 text-white hover:bg-navy-600 active:bg-navy-500 shadow-sm',
    outline:
      'border-2 border-navy-200 text-navy-700 hover:bg-navy-50 active:bg-navy-100 bg-transparent',
    ghost:
      'text-navy-700 hover:bg-navy-50 active:bg-navy-100 bg-transparent',
  },
  size: {
    sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
    md: 'h-10 px-4 text-sm rounded-xl gap-2',
    lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  },
} as const

type Variant = keyof typeof buttonVariants.variant
type Size = keyof typeof buttonVariants.size

type ButtonBaseProps = {
  variant?: Variant
  size?: Size
  loading?: boolean
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: 'button'
  }

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    as: 'a'
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

function isAnchor(props: ButtonProps): props is ButtonAsLink {
  return props.as === 'a'
}

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
)

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    className,
    children,
    ...rest
  } = props

  const classes = cn(
    'inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    buttonVariants.variant[variant],
    buttonVariants.size[size],
    loading && 'pointer-events-none opacity-70',
    className
  )

  if (isAnchor(props)) {
    const { as: _as, variant: _v, size: _s, loading: _l, ...anchorProps } = props
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...anchorProps}
      >
        {loading && <Spinner />}
        {children}
      </a>
    )
  }

  const { as: _as, variant: _v, size: _s, loading: _l, ...buttonProps } = rest as Omit<ButtonAsButton, 'children'>

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      disabled={(rest as ButtonAsButton).disabled || loading}
      {...buttonProps}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonProps }
