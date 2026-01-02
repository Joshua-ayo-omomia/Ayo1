import Link from 'next/link';
import { format } from 'date-fns';
import {
  FileText,
  Car,
  RefreshCw,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { Container, PageHeader, Header, Footer } from '@/components/layout';
import {
  Card,
  Badge,
  Button,
  Heading,
  Subheading,
  Body,
  Mono,
  Label,
} from '@/components/ui';
import { getUser, createServerClient } from '@/lib/supabase';
import type { Application, Appointment } from '@/types';

async function getDashboardData(userId: string) {
  const supabase = await createServerClient();

  const [applicationsResult, appointmentsResult, documentsResult] =
    await Promise.all([
      supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
      supabase
        .from('appointments')
        .select('*, applications!inner(user_id)')
        .eq('applications.user_id', userId)
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true }),
      supabase
        .from('documents')
        .select('*, applications!inner(user_id)')
        .eq('applications.user_id', userId)
        .eq('status', 'pending'),
    ]);

  return {
    applications: (applicationsResult.data || []) as Application[],
    appointments: (appointmentsResult.data || []) as Appointment[],
    pendingDocuments: documentsResult.data?.length || 0,
  };
}

function getStatusBadgeVariant(
  status: string
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'draft':
      return 'default';
    case 'submitted':
    case 'under_review':
    case 'documents_verified':
      return 'info';
    case 'test_scheduled':
      return 'warning';
    default:
      return 'default';
  }
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatApplicationType(type: string): string {
  switch (type) {
    case 'learner_permit':
      return "Learner's Permit";
    case 'driver_licence':
      return "Driver's Licence";
    case 'renewal':
      return 'Licence Renewal';
    default:
      return type;
  }
}

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { applications, appointments, pendingDocuments } =
    await getDashboardData(user.id);

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'there';
  const activeApplications = applications.filter(
    (app) => !['approved', 'rejected'].includes(app.status)
  );

  const stats = [
    {
      label: 'Active Applications',
      value: activeApplications.length,
    },
    {
      label: 'Upcoming Appointments',
      value: appointments.length,
    },
    {
      label: 'Documents Pending',
      value: pendingDocuments,
    },
    {
      label: 'Licence Status',
      value: applications.some(
        (app) => app.type === 'driver_licence' && app.status === 'approved'
      )
        ? 'Active'
        : 'None',
    },
  ];

  const quickActions = [
    {
      icon: FileText,
      title: "Apply for Learner's Permit",
      href: '/apply/learner-permit',
    },
    {
      icon: Car,
      title: "Apply for Driver's Licence",
      href: '/apply/driver-licence',
    },
    {
      icon: RefreshCw,
      title: 'Renew Licence',
      href: '/apply/renewal',
    },
    {
      icon: Calendar,
      title: 'Book a Test',
      href: '/appointments/book',
    },
  ];

  return (
    <>
      <Header currentPath="/dashboard" user={{ name: firstName, email: user.email || '' }} />

      <div className="bg-surface min-h-screen pb-16">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${firstName}. Here's what's happening with your applications.`}
        />

        <Container>
          {/* Quick Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6">
                <Label className="block mb-2">{stat.label}</Label>
                <p className="text-4xl font-semibold text-primary">
                  {stat.value}
                </p>
              </Card>
            ))}
          </section>

          {/* Quick Actions */}
          <section className="mb-12">
            <Subheading className="mb-6">Quick Actions</Subheading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Card
                    hoverable
                    className="p-5 group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                        <action.icon className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {action.title}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Applications */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <Subheading>Your Applications</Subheading>
              {applications.length > 0 && (
                <Link
                  href="/applications"
                  className="text-sm text-accent hover:text-primary transition-colors"
                >
                  View all
                </Link>
              )}
            </div>

            {applications.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-text-muted" />
                </div>
                <Subheading className="mb-2">No applications yet</Subheading>
                <Body className="mb-6 max-w-sm mx-auto">
                  Start your driver licensing journey by applying for a
                  learner's permit.
                </Body>
                <Link href="/apply/learner-permit">
                  <Button>Apply Now</Button>
                </Link>
              </Card>
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface text-left">
                        <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                          Type
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map((application) => (
                        <tr
                          key={application.id}
                          className="border-t border-border"
                        >
                          <td className="px-6 py-4 text-sm text-primary">
                            {formatApplicationType(application.type)}
                          </td>
                          <td className="px-6 py-4">
                            <Mono>
                              {application.id.slice(0, 8).toUpperCase()}
                            </Mono>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={getStatusBadgeVariant(application.status)}
                            >
                              {formatStatus(application.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {application.submitted_at
                              ? format(
                                  new Date(application.submitted_at),
                                  'MMM d, yyyy'
                                )
                              : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/applications/${application.id}`}
                              className="text-sm text-accent hover:text-primary transition-colors"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </section>

          {/* Appointments */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <Subheading>Upcoming Appointments</Subheading>
              {appointments.length > 0 && (
                <Link
                  href="/appointments"
                  className="text-sm text-accent hover:text-primary transition-colors"
                >
                  View all
                </Link>
              )}
            </div>

            {appointments.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-text-muted" />
                </div>
                <Subheading className="mb-2">No upcoming appointments</Subheading>
                <Body className="max-w-sm mx-auto">
                  Once you have an active application, you'll be able to
                  schedule your tests here.
                </Body>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-primary mb-1">
                          {appointment.type === 'regulations_test'
                            ? 'Regulations Test'
                            : 'Driving Test'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(
                              new Date(appointment.scheduled_date),
                              'MMM d, yyyy'
                            )}{' '}
                            at {appointment.scheduled_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {appointment.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </Container>
      </div>

      <Footer />
    </>
  );
}
