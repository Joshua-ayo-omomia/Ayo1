'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  showCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, id, maxLength, showCount = false, value, defaultValue, onChange, ...props },
    ref
  ) => {
    const generatedId = React.useId()
    const textareaId = id || generatedId
    const [charCount, setCharCount] = React.useState(() => {
      const initial = (value ?? defaultValue ?? '') as string
      return initial.length
    })

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    React.useEffect(() => {
      if (value !== undefined) {
        setCharCount((value as string).length)
      }
    }, [value])

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-navy-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border border-warm-300 bg-white px-3 py-2 text-sm text-navy-700 placeholder:text-navy-200 transition-colors duration-150 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-100',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        <div className="flex justify-between">
          {error ? (
            <p id={`${textareaId}-error`} className="text-sm text-red-500">
              {error}
            </p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span
              className={cn(
                'text-xs text-navy-300',
                charCount >= maxLength && 'text-red-500 font-medium'
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
export type { TextareaProps }
