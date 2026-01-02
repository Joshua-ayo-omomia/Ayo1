'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Container } from './Container';

interface NavItem {
  label: string;
  href: string;
}

interface User {
  name: string;
  email: string;
}

export interface HeaderProps {
  currentPath?: string;
  user?: User | null;
  onSignOut?: () => void;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Apply', href: '/apply' },
  { label: 'Track Status', href: '/track' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Header({ currentPath = '/', user, onSignOut }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-border">
      <Container className="h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-semibold text-primary">
              BLA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[15px] font-medium transition-colors duration-150',
                    isActive
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-primary'
                  )}
                >
                  <span
                    className={cn(
                      'py-1',
                      isActive && 'border-b-2 border-golden'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-card shadow-md z-20">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-primary truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-text-muted truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onSignOut?.();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-[15px] font-medium text-text-secondary hover:text-primary transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Button size="sm">Get Started</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <Container>
            <nav className="py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'block py-2 text-[15px] font-medium transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-text-secondary hover:text-primary'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-border space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {getInitials(user.name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {user.name}
                        </p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block py-2 text-[15px] font-medium text-text-secondary hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSignOut?.();
                      }}
                      className="block py-2 text-[15px] font-medium text-text-secondary hover:text-primary"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="block py-2 text-[15px] font-medium text-text-secondary hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Button
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
