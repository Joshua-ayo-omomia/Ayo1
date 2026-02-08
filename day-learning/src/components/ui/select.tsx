'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, placeholder, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id || generatedId

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-navy-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'flex h-10 w-full appearance-none rounded-xl border border-warm-300 bg-white px-3 py-2 pr-8 text-sm text-navy-700 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-100',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%235C6E8A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps }
