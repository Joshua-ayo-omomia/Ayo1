'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { cn } from '@/lib/utils'
import { FileText, Users, ClipboardCheck } from 'lucide-react'

const tabs = [
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Assessments', href: '/admin/assessments', icon: ClipboardCheck },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <DashboardLayout pageTitle="Admin Dashboard">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <nav className="rounded-xl bg-navy-700 p-1.5">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive =
                pathname === tab.href || pathname.startsWith(tab.href + '/')

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-navy-800 text-warm-50 shadow-sm border-b-2 border-teal-500'
                      : 'text-warm-50/60 hover:text-warm-50 hover:bg-navy-800/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Page Content */}
        <div>{children}</div>
      </div>
    </DashboardLayout>
  )
}
