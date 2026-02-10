'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/tracks', label: 'Tracks' },
  { href: '/apply', label: 'Apply' },
]

export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-warm-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-bold text-navy-700">
          Day Learning
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-sm font-medium text-navy-500 transition-colors hover:text-navy-700"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/apply"
            className="rounded-lg bg-teal-500 px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-teal-600"
          >
            Apply Now
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-navy-200 px-5 py-2 font-body text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-navy-500 hover:bg-warm-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile slide-in menu */}
      <div
        className={cn(
          'fixed inset-0 top-16 z-40 transform bg-white transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col gap-2 border-t border-warm-200 px-4 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 font-body text-base font-medium text-navy-500 transition-colors hover:bg-warm-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-3 border-t border-warm-200 pt-4">
            <Link
              href="/apply"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-teal-500 px-5 py-3 text-center font-body text-sm font-semibold text-white transition-colors hover:bg-teal-600"
            >
              Apply Now
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg border border-navy-200 px-5 py-3 text-center font-body text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </header>
  )
}
