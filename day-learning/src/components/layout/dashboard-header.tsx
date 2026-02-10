'use client'

import { Menu } from 'lucide-react'

interface DashboardHeaderProps {
  title: string
  userName?: string
  onMenuToggle: () => void
}

export function DashboardHeader({
  title,
  userName = 'Learner',
  onMenuToggle,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-navy-700 bg-navy-800 px-4 sm:px-6">
      <button
        onClick={onMenuToggle}
        className="rounded-md p-2 text-warm-300 hover:bg-navy-700 hover:text-white lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="flex-1 font-display text-lg font-bold text-white">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 font-display text-sm font-bold text-white">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
