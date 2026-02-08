'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
} as const

type AvatarSize = keyof typeof sizeClasses

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  name?: string
  size?: AvatarSize
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false)

    const fallback = name ? getInitials(name) : '?'

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100 font-medium text-teal-700',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span aria-label={alt || name || 'Avatar'}>{fallback}</span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar }
export type { AvatarProps, AvatarSize }
