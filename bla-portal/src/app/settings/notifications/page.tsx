'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  Mail,
  Smartphone,
  FileText,
  AlertCircle,
  Calendar,
  ClipboardCheck,
  Clock,
  Megaphone,
  Save,
  Check,
} from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import { Card, Button, Heading, Subheading, Body, Caption } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NotificationSetting {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  email: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'application_update',
    type: 'application_update',
    label: 'Application Updates',
    description: 'Status changes and updates to your applications',
    icon: <FileText className="w-5 h-5" />,
    enabled: true,
    email: true,
  },
  {
    id: 'document_request',
    type: 'document_request',
    label: 'Document Requests',
    description: 'When additional documents are required',
    icon: <AlertCircle className="w-5 h-5" />,
    enabled: true,
    email: true,
  },
  {
    id: 'appointment_reminder',
    type: 'appointment_reminder',
    label: 'Appointment Reminders',
    description: 'Reminders for upcoming tests and appointments',
    icon: <Calendar className="w-5 h-5" />,
    enabled: true,
    email: true,
  },
  {
    id: 'test_result',
    type: 'test_result',
    label: 'Test Results',
    description: 'When your test results are ready',
    icon: <ClipboardCheck className="w-5 h-5" />,
    enabled: true,
    email: true,
  },
  {
    id: 'licence_expiry',
    type: 'licence_expiry',
    label: 'Licence Expiry',
    description: 'Reminders when your licence is expiring',
    icon: <Clock className="w-5 h-5" />,
    enabled: true,
    email: true,
  },
  {
    id: 'general',
    type: 'general',
    label: 'General Announcements',
    description: 'System updates and important notices',
    icon: <Megaphone className="w-5 h-5" />,
    enabled: true,
    email: false,
  },
];

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors',
        enabled ? 'bg-accent' : 'bg-border',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
          enabled && 'translate-x-5'
        )}
      />
    </button>
  );
}

export default function NotificationPreferencesPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string, field: 'enabled' | 'email') => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, [field]: !s[field] } : s
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Header currentPath="/settings" />

      <div className="min-h-screen bg-surface py-8">
        <Container size="narrow">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/settings"
              className="p-2 -ml-2 text-text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <Heading className="mb-1">Notification Preferences</Heading>
              <Body>Choose how and when you want to be notified</Body>
            </div>
          </div>

          {/* Global Settings */}
          <Card className="p-6 mb-6">
            <Subheading className="mb-6">Notification Channels</Subheading>

            <div className="space-y-6">
              {/* Push Notifications */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Push Notifications</p>
                    <Caption className="block mt-0.5">
                      Receive notifications in your browser
                    </Caption>
                  </div>
                </div>
                <Toggle enabled={true} onChange={() => {}} disabled />
              </div>

              {/* Email Notifications */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Email Notifications</p>
                    <Caption className="block mt-0.5">
                      Receive notifications via email
                    </Caption>
                  </div>
                </div>
                <Toggle
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">SMS Notifications</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Caption>Receive notifications via SMS</Caption>
                      <span className="px-1.5 py-0.5 bg-golden/10 text-golden text-[10px] font-medium rounded">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
                <Toggle
                  enabled={smsNotifications}
                  onChange={setSmsNotifications}
                  disabled
                />
              </div>
            </div>
          </Card>

          {/* Notification Types */}
          <Card className="p-6 mb-6">
            <Subheading className="mb-2">Notification Types</Subheading>
            <Caption className="block mb-6">
              Choose which types of notifications you want to receive
            </Caption>

            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-start gap-4 p-4 rounded-[6px] border border-border"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      setting.enabled ? 'bg-accent/10 text-accent' : 'bg-surface text-text-muted'
                    )}
                  >
                    {setting.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary">{setting.label}</p>
                    <Caption className="block mt-0.5">{setting.description}</Caption>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Push toggle */}
                    <div className="flex flex-col items-center gap-1">
                      <Toggle
                        enabled={setting.enabled}
                        onChange={() => handleToggle(setting.id, 'enabled')}
                      />
                      <span className="text-[10px] text-text-muted">Push</span>
                    </div>

                    {/* Email toggle */}
                    <div className="flex flex-col items-center gap-1">
                      <Toggle
                        enabled={setting.email && emailNotifications}
                        onChange={() => handleToggle(setting.id, 'email')}
                        disabled={!emailNotifications}
                      />
                      <span className="text-[10px] text-text-muted">Email</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={isSaving}>
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </Container>
      </div>

      <Footer />
    </>
  );
}
