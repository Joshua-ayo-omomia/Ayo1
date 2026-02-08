import { PublicNav } from './public-nav'
import { PublicFooter } from './public-footer'

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-warm-50 font-body text-navy-700">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
