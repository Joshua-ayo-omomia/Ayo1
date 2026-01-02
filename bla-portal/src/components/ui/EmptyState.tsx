'use client';

import Link from 'next/link';
import {
  FileText,
  Calendar,
  Bell,
  Search,
  ClipboardList,
  Users,
  Inbox,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Heading, Body } from './Typography';

type EmptyStateType =
  | 'applications'
  | 'appointments'
  | 'notifications'
  | 'search'
  | 'tests'
  | 'users'
  | 'documents'
  | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const defaultContent: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  applications: {
    icon: <FileText className="w-12 h-12" />,
    title: 'No applications yet',
    description: 'Start your journey by applying for a learner\'s permit or driver\'s licence.',
  },
  appointments: {
    icon: <Calendar className="w-12 h-12" />,
    title: 'No appointments scheduled',
    description: 'Your upcoming tests and appointments will appear here.',
  },
  notifications: {
    icon: <Bell className="w-12 h-12" />,
    title: 'No notifications',
    description: 'You\'re all caught up! New notifications will appear here.',
  },
  search: {
    icon: <Search className="w-12 h-12" />,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
  },
  tests: {
    icon: <ClipboardList className="w-12 h-12" />,
    title: 'No test results',
    description: 'Your test results will appear here after you complete an exam.',
  },
  users: {
    icon: <Users className="w-12 h-12" />,
    title: 'No users found',
    description: 'Users matching your criteria will appear here.',
  },
  documents: {
    icon: <FolderOpen className="w-12 h-12" />,
    title: 'No documents uploaded',
    description: 'Upload your required documents to proceed with your application.',
  },
  generic: {
    icon: <Inbox className="w-12 h-12" />,
    title: 'Nothing here yet',
    description: 'Content will appear here once available.',
  },
};

const defaultActions: Record<EmptyStateType, { label: string; href: string }> = {
  applications: { label: 'Start Application', href: '/apply' },
  appointments: { label: 'View Applications', href: '/dashboard' },
  notifications: { label: 'Go to Dashboard', href: '/dashboard' },
  search: { label: 'Clear Search', href: '#' },
  tests: { label: 'Take Practice Test', href: '/test/regulations' },
  users: { label: 'Refresh', href: '#' },
  documents: { label: 'Upload Document', href: '#' },
  generic: { label: 'Go Home', href: '/' },
};

export function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const content = defaultContent[type];
  const action = defaultActions[type];

  const finalTitle = title || content.title;
  const finalDescription = description || content.description;
  const finalActionLabel = actionLabel || action.label;
  const finalActionHref = actionHref || action.href;

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center text-text-muted mb-6">
        {content.icon}
      </div>
      <h3 className="text-xl font-semibold text-primary mb-2">{finalTitle}</h3>
      <p className="text-text-secondary max-w-sm mb-6">{finalDescription}</p>
      {(onAction || finalActionHref !== '#') && (
        onAction ? (
          <Button onClick={onAction}>{finalActionLabel}</Button>
        ) : (
          <Link href={finalActionHref}>
            <Button>{finalActionLabel}</Button>
          </Link>
        )
      )}
    </div>
  );
}

// Inline empty state for tables
export function EmptyTableRow({
  colSpan,
  message = 'No data available',
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          <Inbox className="w-10 h-10 text-text-muted mb-3" />
          <p className="text-text-muted">{message}</p>
        </div>
      </td>
    </tr>
  );
}
