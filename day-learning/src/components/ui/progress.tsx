'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  label?: string
  showValue?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, label, showValue = false, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value))

    return (
      <div ref={ref} className={cn('w-full space-y-1.5', className)} {...props}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-navy-700">{label}</span>
            )}
            {showValue && (
              <span className="text-navy-300">{Math.round(clampedValue)}%</span>
            )}
          </div>
        )}
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-warm-200"
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
export type { ProgressProps }
