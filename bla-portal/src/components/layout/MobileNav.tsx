'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  match?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: <Home className="w-5 h-5" />,
    match: ['/'],
  },
  {
    label: 'Apply',
    href: '/apply',
    icon: <FileText className="w-5 h-5" />,
    match: ['/apply'],
  },
  {
    label: 'Track',
    href: '/track',
    icon: <Search className="w-5 h-5" />,
    match: ['/track'],
  },
  {
    label: 'Profile',
    href: '/dashboard',
    icon: <User className="w-5 h-5" />,
    match: ['/dashboard', '/settings', '/notifications'],
  },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.match) {
      return item.match.some((path) =>
        path === '/' ? pathname === '/' : pathname.startsWith(path)
      );
    }
    return pathname === item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                active ? 'text-accent' : 'text-text-muted'
              )}
            >
              <span className={cn(active && 'scale-110 transition-transform')}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Spacer to prevent content from being hidden behind the mobile nav
export function MobileNavSpacer() {
  return <div className="h-16 md:hidden" />;
}
