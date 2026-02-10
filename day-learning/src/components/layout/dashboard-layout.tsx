'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeader } from './dashboard-header'

interface DashboardLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  userName?: string
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/course': 'My Course',
  '/dashboard/assessments': 'Assessments',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
}

export function DashboardLayout({
  children,
  pageTitle,
  userName,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = pageTitle ?? pageTitles[pathname] ?? 'Dashboard'

  return (
    <div className="dark flex h-screen bg-navy-900 font-body text-warm-100">
      <DashboardSidebar
        pathname={pathname}
        userName={userName}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          title={title}
          userName={userName}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
