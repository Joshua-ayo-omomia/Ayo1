'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-[#f0f2f4]',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rectangular' && 'rounded-[6px]',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Common skeleton layouts
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-card border border-border p-6', className)}>
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="80%" height={16} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-surface">
        <Skeleton width="15%" height={16} />
        <Skeleton width="25%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="20%" height={16} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
          <Skeleton width="15%" height={16} />
          <Skeleton width="25%" height={16} />
          <Skeleton width="15%" height={16} />
          <Skeleton width="15%" height={16} />
          <Skeleton width="20%" height={32} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-card border border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <Skeleton variant="rectangular" width={48} height={48} />
            <Skeleton width={40} height={20} />
          </div>
          <Skeleton variant="text" width="50%" height={32} className="mb-2" />
          <Skeleton variant="text" width="70%" height={16} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton variant="text" width={100} height={14} className="mb-2" />
          <Skeleton height={44} />
        </div>
      ))}
      <Skeleton height={44} width={120} className="mt-4" />
    </div>
  );
}

export function SkeletonLicenceCard() {
  return (
    <div className="w-[340px] h-[214px] md:w-[420px] md:h-[264px] bg-white rounded-[12px] border-2 border-border p-4 md:p-5">
      <div className="text-center mb-4">
        <Skeleton width="60%" height={12} className="mx-auto mb-2" />
        <Skeleton width="40%" height={10} className="mx-auto" />
      </div>
      <div className="flex gap-4">
        <Skeleton width={96} height={112} className="rounded-[6px]" />
        <div className="flex-1 space-y-3">
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="70%" height={14} />
          <Skeleton width="50%" height={14} />
        </div>
      </div>
    </div>
  );
}

// Page loading wrapper with fade-in animation
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up">
      {children}
    </div>
  );
}

// Button loading spinner
export function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={cn('animate-spin', sizes[size])}
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
