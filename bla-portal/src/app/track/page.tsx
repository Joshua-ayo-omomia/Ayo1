'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Search,
  CheckCircle,
  Clock,
  FileText,
  ClipboardCheck,
  Calendar,
  Award,
  Package,
  AlertCircle,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import {
  Card,
  Button,
  Input,
  Heading,
  Subheading,
  Body,
  Caption,
  Mono,
  Badge,
} from '@/components/ui';
import { cn } from '@/lib/utils';

type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'documents_verified'
  | 'test_scheduled'
  | 'test_completed'
  | 'approved'
  | 'rejected'
  | 'ready_for_collection';

interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'future';
  date?: string;
  note?: string;
  icon: React.ReactNode;
}

interface ApplicationData {
  referenceNumber: string;
  type: 'learner_permit' | 'driver_licence' | 'renewal';
  submittedAt: string;
  status: ApplicationStatus;
  applicantName: string;
  timeline: TimelineStep[];
  nextAction?: string;
  estimatedCompletion?: string;
}

const statusLabels: Record<ApplicationStatus, string> = {
  submitted: 'Application Submitted',
  under_review: 'Under Review',
  documents_verified: 'Documents Verified',
  test_scheduled: 'Test Scheduled',
  test_completed: 'Test Completed',
  approved: 'Approved',
  rejected: 'Rejected',
  ready_for_collection: 'Ready for Collection',
};

const typeLabels: Record<string, string> = {
  learner_permit: "Learner's Permit",
  driver_licence: "Driver's Licence",
  renewal: 'Licence Renewal',
};

function generateMockTimeline(status: ApplicationStatus, type: string): TimelineStep[] {
  const baseSteps = [
    { id: 'submitted', label: 'Application Submitted', icon: <FileText className="w-4 h-4" /> },
    { id: 'under_review', label: 'Under Review', icon: <Clock className="w-4 h-4" /> },
    { id: 'documents_verified', label: 'Documents Verified', icon: <ClipboardCheck className="w-4 h-4" /> },
  ];

  // Add test steps for learner permit
  if (type === 'learner_permit') {
    baseSteps.push(
      { id: 'test_scheduled', label: 'Test Scheduled', icon: <Calendar className="w-4 h-4" /> },
      { id: 'test_completed', label: 'Test Completed', icon: <CheckCircle className="w-4 h-4" /> }
    );
  }

  // Add driving test for driver's licence
  if (type === 'driver_licence') {
    baseSteps.push(
      { id: 'test_scheduled', label: 'Driving Test Scheduled', icon: <Calendar className="w-4 h-4" /> },
      { id: 'test_completed', label: 'Driving Test Completed', icon: <CheckCircle className="w-4 h-4" /> }
    );
  }

  baseSteps.push(
    { id: 'approved', label: 'Approved', icon: <Award className="w-4 h-4" /> },
    { id: 'ready_for_collection', label: 'Ready for Collection', icon: <Package className="w-4 h-4" /> }
  );

  const statusOrder = baseSteps.map((s) => s.id);
  const currentIndex = statusOrder.indexOf(status);

  return baseSteps.map((step, index) => {
    let stepStatus: 'completed' | 'current' | 'future';
    let date: string | undefined;
    let note: string | undefined;

    if (index < currentIndex) {
      stepStatus = 'completed';
      // Mock dates for completed steps
      const daysAgo = (currentIndex - index) * 2;
      date = format(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000), 'MMM d, yyyy h:mm a');
    } else if (index === currentIndex) {
      stepStatus = 'current';
      date = format(new Date(), 'MMM d, yyyy h:mm a');
      if (status === 'under_review') {
        note = 'Your application is being reviewed by our team';
      } else if (status === 'test_scheduled') {
        note = 'Please arrive 15 minutes before your scheduled time';
      }
    } else {
      stepStatus = 'future';
    }

    return {
      ...step,
      status: stepStatus,
      date,
      note,
    };
  });
}

function getNextAction(status: ApplicationStatus, type: string): string | undefined {
  const actions: Record<string, string> = {
    submitted: 'Your application will be reviewed within 2-3 business days.',
    under_review: 'Please ensure all your documents are uploaded correctly.',
    documents_verified: type === 'renewal'
      ? 'Payment verification in progress.'
      : 'You will receive an email when your test is scheduled.',
    test_scheduled: 'Prepare for your examination. Bring valid ID.',
    test_completed: 'Results are being processed.',
    approved: 'Visit the Licensing Authority to collect your licence.',
    ready_for_collection: 'Your licence is ready! Visit The Pine, St. Michael.',
  };
  return actions[status];
}

function getEstimatedCompletion(status: ApplicationStatus): string | undefined {
  if (status === 'approved' || status === 'ready_for_collection' || status === 'rejected') {
    return undefined;
  }
  const daysRemaining = {
    submitted: 5,
    under_review: 3,
    documents_verified: 7,
    test_scheduled: 2,
    test_completed: 1,
  };
  const days = daysRemaining[status as keyof typeof daysRemaining] || 3;
  return format(new Date(Date.now() + days * 24 * 60 * 60 * 1000), 'MMMM d, yyyy');
}

export default function TrackPage() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<ApplicationData | null>(null);

  const handleTrack = async () => {
    setError('');
    setIsSearching(true);

    try {
      // Simulate API lookup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock application data based on reference format
      if (referenceNumber.length >= 8) {
        const mockStatus: ApplicationStatus = 'documents_verified';
        const mockType = 'learner_permit';

        setApplication({
          referenceNumber: referenceNumber.toUpperCase(),
          type: mockType,
          submittedAt: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy'),
          status: mockStatus,
          applicantName: 'John M. Doe',
          timeline: generateMockTimeline(mockStatus, mockType),
          nextAction: getNextAction(mockStatus, mockType),
          estimatedCompletion: getEstimatedCompletion(mockStatus),
        });
      } else {
        setError('Invalid reference number. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    if (status === 'approved' || status === 'ready_for_collection') return 'success';
    if (status === 'rejected') return 'error';
    if (status === 'test_scheduled' || status === 'test_completed') return 'golden';
    return 'info';
  };

  return (
    <>
      <Header currentPath="/track" />

      <div className="min-h-screen bg-surface py-16">
        <Container size="narrow">
          {/* Search Card */}
          {!application && (
            <Card className="p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <Search className="w-8 h-8 text-accent" />
                </div>
                <Heading className="mb-2">Track Your Application</Heading>
                <Body>
                  Enter your reference number to check the status of your application.
                </Body>
              </div>

              <div className="space-y-4">
                <Input
                  label="Reference Number"
                  placeholder="e.g., BLA-2025-XXXXX"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  error={error}
                />

                <Button
                  className="w-full"
                  onClick={handleTrack}
                  loading={isSearching}
                  disabled={!referenceNumber || isSearching}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Track Application
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-border text-center">
                <Caption className="block mb-4">
                  Don't have a reference number?
                </Caption>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign in to view your applications</Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Status Display */}
          {application && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setApplication(null)}
                  className="text-sm text-accent hover:underline"
                >
                  ← Track another application
                </button>
              </div>

              {/* Reference Info Card */}
              <Card className="p-8 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <Caption className="block mb-1">Reference Number</Caption>
                    <Mono className="text-xl">{application.referenceNumber}</Mono>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(application.status)}
                    className="text-sm px-4 py-1.5"
                  >
                    {statusLabels[application.status]}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div>
                    <Caption className="block mb-1">Application Type</Caption>
                    <p className="font-medium text-primary">
                      {typeLabels[application.type]}
                    </p>
                  </div>
                  <div>
                    <Caption className="block mb-1">Applicant</Caption>
                    <p className="font-medium text-primary">
                      {application.applicantName}
                    </p>
                  </div>
                  <div>
                    <Caption className="block mb-1">Submitted</Caption>
                    <p className="font-medium text-primary">
                      {application.submittedAt}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Visual Timeline */}
              <Card className="p-8 mb-6">
                <Subheading className="mb-8">Application Progress</Subheading>

                <div className="relative">
                  {application.timeline.map((step, index) => {
                    const isLast = index === application.timeline.length - 1;
                    const isRejected = application.status === 'rejected' && step.id === 'approved';

                    return (
                      <div key={step.id} className="relative flex gap-4">
                        {/* Connector Line */}
                        {!isLast && (
                          <div
                            className={cn(
                              'absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)]',
                              step.status === 'completed'
                                ? 'bg-primary'
                                : 'border-l-2 border-dashed border-border'
                            )}
                          />
                        )}

                        {/* Dot */}
                        <div
                          className={cn(
                            'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                            step.status === 'completed'
                              ? 'bg-primary text-white'
                              : step.status === 'current'
                              ? 'bg-primary text-white animate-pulse'
                              : 'bg-white border-2 border-border text-text-muted',
                            isRejected && 'bg-error text-white'
                          )}
                        >
                          {step.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isRejected ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            step.icon
                          )}
                        </div>

                        {/* Content */}
                        <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                'text-sm',
                                step.status === 'current'
                                  ? 'font-semibold text-primary'
                                  : step.status === 'completed'
                                  ? 'font-medium text-primary'
                                  : 'text-text-muted',
                                isRejected && 'text-error'
                              )}
                            >
                              {isRejected ? 'Application Rejected' : step.label}
                            </p>
                            {step.status === 'current' && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                              </span>
                            )}
                          </div>

                          {step.date && (
                            <Caption className="block mt-1">{step.date}</Caption>
                          )}

                          {step.note && (
                            <p className="mt-2 text-sm text-text-secondary bg-surface p-3 rounded-[6px]">
                              {step.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Current Status Card */}
              <Card className="p-8">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                      application.status === 'rejected'
                        ? 'bg-error/10'
                        : application.status === 'ready_for_collection'
                        ? 'bg-success/10'
                        : 'bg-accent/10'
                    )}
                  >
                    {application.status === 'rejected' ? (
                      <XCircle className="w-6 h-6 text-error" />
                    ) : application.status === 'ready_for_collection' ? (
                      <Package className="w-6 h-6 text-success" />
                    ) : (
                      <Clock className="w-6 h-6 text-accent" />
                    )}
                  </div>

                  <div className="flex-1">
                    <Subheading className="mb-2">
                      {application.status === 'ready_for_collection'
                        ? 'Your licence is ready!'
                        : application.status === 'rejected'
                        ? 'Application Not Approved'
                        : 'Next Steps'}
                    </Subheading>

                    {application.nextAction && (
                      <Body className="mb-4">{application.nextAction}</Body>
                    )}

                    {application.estimatedCompletion && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Estimated completion:{' '}
                          <strong className="text-primary">
                            {application.estimatedCompletion}
                          </strong>
                        </span>
                      </div>
                    )}

                    {application.status === 'ready_for_collection' && (
                      <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-[6px]">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span className="font-medium text-success">
                            Ready for pickup
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          Visit the Barbados Licensing Authority at The Pine, St. Michael.
                          Office hours: Mon-Fri, 8:30 AM - 4:30 PM.
                        </p>
                      </div>
                    )}

                    {application.status === 'rejected' && (
                      <div className="mt-4">
                        <Link href="/apply/learners-permit">
                          <Button variant="secondary">
                            Submit New Application
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Help Link */}
              <div className="mt-8 text-center">
                <Caption className="block mb-2">Need help with your application?</Caption>
                <Link href="/contact" className="text-sm text-accent hover:underline">
                  Contact Support
                </Link>
              </div>
            </>
          )}
        </Container>
      </div>

      <Footer />
    </>
  );
}
