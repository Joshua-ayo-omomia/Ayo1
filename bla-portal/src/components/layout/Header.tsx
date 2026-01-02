'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Menu,
  X,
  ChevronDown,
  Bell,
  FileText,
  AlertCircle,
  Calendar,
  ClipboardCheck,
  Clock,
  Megaphone,
  ChevronRight,
} from 'lucide-react';
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

export type NotificationType =
  | 'application_update'
  | 'document_request'
  | 'appointment_reminder'
  | 'test_result'
  | 'licence_expiry'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface HeaderProps {
  currentPath?: string;
  user?: User | null;
  onSignOut?: () => void;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
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

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  application_update: <FileText className="w-4 h-4" />,
  document_request: <AlertCircle className="w-4 h-4" />,
  appointment_reminder: <Calendar className="w-4 h-4" />,
  test_result: <ClipboardCheck className="w-4 h-4" />,
  licence_expiry: <Clock className="w-4 h-4" />,
  general: <Megaphone className="w-4 h-4" />,
};

const notificationColors: Record<NotificationType, string> = {
  application_update: 'bg-accent/10 text-accent',
  document_request: 'bg-warning/10 text-warning',
  appointment_reminder: 'bg-success/10 text-success',
  test_result: 'bg-golden/10 text-golden',
  licence_expiry: 'bg-error/10 text-error',
  general: 'bg-primary/10 text-primary',
};

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'application_update',
    title: 'Application Status Updated',
    message: 'Your learner\'s permit application has been approved.',
    link: '/dashboard',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'appointment_reminder',
    title: 'Driving Test Tomorrow',
    message: 'Your driving test is scheduled for tomorrow at 10:00 AM.',
    link: '/dashboard',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'document_request',
    title: 'Additional Documents Required',
    message: 'Please upload a new eye test certificate.',
    link: '/apply/learners-permit',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'test_result',
    title: 'Test Results Ready',
    message: 'Your regulations test results are now available.',
    link: '/test/regulations/results',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'licence_expiry',
    title: 'Licence Expiring Soon',
    message: 'Your licence expires in 30 days. Renew now to avoid penalties.',
    link: '/apply/renewal',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick?: () => void;
}) {
  return (
    <Link
      href={notification.link || '#'}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-surface transition-colors',
        !notification.read && 'bg-accent/5'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          notificationColors[notification.type]
        )}
      >
        {notificationIcons[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm truncate',
            notification.read ? 'text-text-secondary' : 'text-primary font-medium'
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
          {notification.message}
        </p>
      </div>
      <span className="text-[10px] text-text-muted whitespace-nowrap flex-shrink-0">
        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
      </span>
    </Link>
  );
}

export function Header({
  currentPath = '/',
  user,
  onSignOut,
  notifications = mockNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const unreadCount = localNotifications.filter((n) => !n.read).length;

  const handleNotificationClick = (id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    onMarkAsRead?.(id);
    setNotificationsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAllAsRead?.();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notifications]') && notificationsOpen) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [notificationsOpen]);

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

          {/* Desktop Auth & Notifications */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <>
                {/* Notification Bell */}
                <div className="relative" data-notifications>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotificationsOpen(!notificationsOpen);
                      setUserMenuOpen(false);
                    }}
                    className="relative p-2 text-text-secondary hover:text-primary transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-card shadow-md z-30">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="text-sm font-semibold text-primary">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-accent hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-border">
                        {localNotifications.slice(0, 5).map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onClick={() => handleNotificationClick(notification.id)}
                          />
                        ))}
                        {localNotifications.length === 0 && (
                          <div className="p-6 text-center">
                            <Bell className="w-8 h-8 text-text-muted mx-auto mb-2" />
                            <p className="text-sm text-text-muted">
                              No notifications yet
                            </p>
                          </div>
                        )}
                      </div>

                      <Link
                        href="/notifications"
                        className="flex items-center justify-center gap-1 px-4 py-3 border-t border-border text-sm text-accent hover:bg-surface transition-colors"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        View All
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setNotificationsOpen(false);
                  }}
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
                          href="/dashboard/licence"
                          className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Digital Licence
                        </Link>
                        <Link
                          href="/notifications"
                          className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-error text-white text-[10px] rounded-full">
                              {unreadCount}
                            </span>
                          )}
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
                  href="/auth/signin"
                  className="text-[15px] font-medium text-text-secondary hover:text-primary transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-text-secondary hover:text-primary transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Notifications Dropdown */}
      {notificationsOpen && (
        <div className="md:hidden bg-white border-b border-border shadow-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-primary">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-accent hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-border">
            {localNotifications.slice(0, 5).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification.id)}
              />
            ))}
          </div>
          <Link
            href="/notifications"
            className="flex items-center justify-center gap-1 px-4 py-3 border-t border-border text-sm text-accent"
            onClick={() => setNotificationsOpen(false)}
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

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
                    <Link
                      href="/notifications"
                      className="flex items-center justify-between py-2 text-[15px] font-medium text-text-secondary hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Notifications
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-error text-white text-xs rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/settings"
                      className="block py-2 text-[15px] font-medium text-text-secondary hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
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
                      href="/auth/signin"
                      className="block py-2 text-[15px] font-medium text-text-secondary hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
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
