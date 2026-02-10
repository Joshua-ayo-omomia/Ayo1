import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'bg-teal-100 text-teal-700 border-teal-200',
  secondary: 'bg-navy-100 text-navy-700 border-navy-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  destructive: 'bg-red-100 text-red-700 border-red-200',
} as const

type BadgeVariant = keyof typeof badgeVariants

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
export type { BadgeProps, BadgeVariant }
