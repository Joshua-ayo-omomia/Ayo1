'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/course', label: 'My Course', icon: BookOpen },
  { href: '/dashboard/assessments', label: 'Assessments', icon: ClipboardCheck },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface DashboardSidebarProps {
  pathname: string
  userName?: string
  userAvatar?: string
  open: boolean
  onToggle: () => void
}

export function DashboardSidebar({
  pathname,
  userName = 'Learner',
  open,
  onToggle,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-800 transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="font-display text-lg font-bold text-white">
            Day Learning
          </Link>
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-warm-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle()
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm font-medium transition-colors',
                  active
                    ? 'border-l-2 border-teal-500 bg-navy-700/50 text-teal-400'
                    : 'text-warm-300 hover:bg-navy-700/30 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-navy-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 font-display text-sm font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm font-medium text-white">
                {userName}
              </p>
            </div>
            <button
              className="rounded-md p-1.5 text-warm-400 transition-colors hover:bg-navy-700 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
