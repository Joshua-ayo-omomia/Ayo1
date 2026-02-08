'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId()
    const checkboxId = id || generatedId

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            'h-4 w-4 shrink-0 rounded border border-warm-300 text-teal-500 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
            'checked:bg-teal-500 checked:border-teal-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'accent-teal-500',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              'text-sm text-navy-700 select-none',
              props.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export type { CheckboxProps }
