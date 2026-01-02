'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Bell,
  FileText,
  AlertCircle,
  Calendar,
  ClipboardCheck,
  Clock,
  Megaphone,
  CheckCheck,
  ChevronRight,
  Settings,
  Trash2,
} from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import { Card, Button, Badge, Heading, Body, Caption } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { NotificationType, Notification } from '@/components/layout/Header';

type FilterTab = 'all' | 'unread' | 'applications' | 'appointments';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  application_update: <FileText className="w-5 h-5" />,
  document_request: <AlertCircle className="w-5 h-5" />,
  appointment_reminder: <Calendar className="w-5 h-5" />,
  test_result: <ClipboardCheck className="w-5 h-5" />,
  licence_expiry: <Clock className="w-5 h-5" />,
  general: <Megaphone className="w-5 h-5" />,
};

const notificationColors: Record<NotificationType, string> = {
  application_update: 'bg-accent/10 text-accent',
  document_request: 'bg-warning/10 text-warning',
  appointment_reminder: 'bg-success/10 text-success',
  test_result: 'bg-golden/10 text-golden',
  licence_expiry: 'bg-error/10 text-error',
  general: 'bg-primary/10 text-primary',
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'application_update',
    title: 'Application Status Updated',
    message: 'Your learner\'s permit application has been approved. You can now proceed to schedule your regulations test.',
    link: '/dashboard',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'appointment_reminder',
    title: 'Driving Test Tomorrow',
    message: 'Your driving test is scheduled for tomorrow at 10:00 AM at The Pine, St. Michael. Please arrive 15 minutes early.',
    link: '/dashboard',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'document_request',
    title: 'Additional Documents Required',
    message: 'Please upload a new eye test certificate. Your current certificate has expired.',
    link: '/apply/learners-permit',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'test_result',
    title: 'Test Results Ready',
    message: 'Your regulations test results are now available. View your score and category breakdown.',
    link: '/test/regulations/results',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'application_update',
    title: 'Documents Verified',
    message: 'All your submitted documents have been verified. Your application is now under final review.',
    link: '/track',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'licence_expiry',
    title: 'Licence Expiring Soon',
    message: 'Your driver\'s licence expires in 30 days. Renew now to avoid penalties and ensure continuous driving privileges.',
    link: '/apply/renewal',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'general',
    title: 'System Maintenance Notice',
    message: 'The BLA online portal will undergo scheduled maintenance on Sunday from 2:00 AM to 6:00 AM.',
    read: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    type: 'appointment_reminder',
    title: 'Appointment Completed',
    message: 'Your regulations test appointment has been completed. Results will be available within 24 hours.',
    link: '/dashboard',
    read: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'applications', label: 'Applications' },
  { id: 'appointments', label: 'Appointments' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    switch (activeTab) {
      case 'unread':
        return !n.read;
      case 'applications':
        return ['application_update', 'document_request', 'test_result'].includes(n.type);
      case 'appointments':
        return n.type === 'appointment_reminder';
      default:
        return true;
    }
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    // Mark as read when expanded
    if (expandedId !== id) {
      handleMarkAsRead(id);
    }
  };

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = format(date, 'MMMM d, yyyy');
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <>
      <Header currentPath="/notifications" />

      <div className="min-h-screen bg-surface py-8">
        <Container>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Heading className="mb-1">Notifications</Heading>
              <Body>
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'You\'re all caught up!'}
              </Body>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Button variant="secondary" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              )}
              <Link href="/settings/notifications">
                <Button variant="ghost">
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {filterTabs.map((tab) => {
              const count =
                tab.id === 'all'
                  ? notifications.length
                  : tab.id === 'unread'
                  ? unreadCount
                  : notifications.filter((n) =>
                      tab.id === 'applications'
                        ? ['application_update', 'document_request', 'test_result'].includes(n.type)
                        : n.type === 'appointment_reminder'
                    ).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-white text-text-secondary hover:bg-surface border border-border'
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'ml-2 px-1.5 py-0.5 rounded-full text-xs',
                        activeTab === tab.id
                          ? 'bg-white/20'
                          : 'bg-surface'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
                <Bell className="w-8 h-8 text-text-muted" />
              </div>
              <Heading className="mb-2 text-xl">No notifications</Heading>
              <Body>
                {activeTab === 'unread'
                  ? 'You have no unread notifications.'
                  : activeTab === 'applications'
                  ? 'No application notifications yet.'
                  : activeTab === 'appointments'
                  ? 'No appointment notifications yet.'
                  : 'You have no notifications yet.'}
              </Body>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-text-muted mb-3">{date}</h3>
                  <Card className="divide-y divide-border overflow-hidden">
                    {items.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'transition-colors',
                          !notification.read && 'bg-accent/5'
                        )}
                      >
                        <div
                          className="flex items-start gap-4 p-4 cursor-pointer hover:bg-surface/50"
                          onClick={() => handleToggleExpand(notification.id)}
                        >
                          {/* Icon */}
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                              notificationColors[notification.type]
                            )}
                          >
                            {notificationIcons[notification.type]}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={cn(
                                  'text-sm',
                                  notification.read
                                    ? 'text-text-secondary'
                                    : 'text-primary font-medium'
                                )}
                              >
                                {notification.title}
                              </p>
                              <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-sm text-text-muted mt-1',
                                expandedId !== notification.id && 'line-clamp-2'
                              )}
                            >
                              {notification.message}
                            </p>

                            {/* Expanded Actions */}
                            {expandedId === notification.id && (
                              <div className="flex items-center gap-3 mt-4">
                                {notification.link && (
                                  <Link href={notification.link}>
                                    <Button size="sm">
                                      View Details
                                      <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  </Link>
                                )}
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                  >
                                    <CheckCheck className="w-3 h-3 mr-1" />
                                    Mark as read
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-error hover:bg-error/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Container>
      </div>

      <Footer />
    </>
  );
}
