'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  ZoomIn,
  X,
  Send,
  MessageSquare,
  History,
  ClipboardCheck,
  CalendarPlus,
  AlertTriangle,
} from 'lucide-react';
import { Card, Button, Input, Badge, Heading, Subheading, Body, Caption, Label, Mono } from '@/components/ui';
import { cn } from '@/lib/utils';

// Types
interface Document {
  id: string;
  type: string;
  label: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
}

interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  action: string;
  details?: string;
  author: string;
  createdAt: string;
}

interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'future';
  date?: string;
}

// Mock Data
const mockApplication = {
  id: 'app-001',
  reference: 'BLA-2025-00147',
  type: 'learner_permit' as const,
  status: 'under_review' as const,
  submittedAt: '2025-01-02T10:30:00Z',
  applicant: {
    fullName: 'Sarah Marie Johnson',
    nationalId: '123456789',
    dateOfBirth: '1998-06-15',
    email: 'sarah.johnson@email.com',
    phone: '+1 246 555 0123',
    address: '45 Palm Beach Drive, Christ Church, Barbados',
  },
  formData: {
    licenceClass: 'class_1',
    hasGlasses: true,
    bloodType: 'O+',
    emergencyContact: 'John Johnson',
    emergencyPhone: '+1 246 555 0456',
    previousLicence: false,
    medicalConditions: 'None',
  },
  documents: [
    {
      id: 'doc-1',
      type: 'national_id',
      label: 'National ID Card',
      url: '/placeholder-id.jpg',
      uploadedAt: '2025-01-02T10:25:00Z',
      status: 'verified' as const,
    },
    {
      id: 'doc-2',
      type: 'proof_of_address',
      label: 'Proof of Address',
      url: '/placeholder-address.jpg',
      uploadedAt: '2025-01-02T10:26:00Z',
      status: 'pending' as const,
    },
    {
      id: 'doc-3',
      type: 'passport_photo',
      label: 'Passport Photo',
      url: '/placeholder-photo.jpg',
      uploadedAt: '2025-01-02T10:27:00Z',
      status: 'pending' as const,
    },
    {
      id: 'doc-4',
      type: 'eye_test',
      label: 'Eye Test Certificate',
      url: '/placeholder-eye.jpg',
      uploadedAt: '2025-01-02T10:28:00Z',
      status: 'rejected' as const,
      rejectionReason: 'Document is expired. Please provide a certificate dated within the last 6 months.',
    },
  ],
  notes: [
    {
      id: 'note-1',
      content: 'Applicant called to check on status. Informed them about the eye test issue.',
      author: 'Admin User',
      createdAt: '2025-01-02T14:30:00Z',
    },
    {
      id: 'note-2',
      content: 'Initial review started. Documents look mostly complete.',
      author: 'Admin User',
      createdAt: '2025-01-02T11:00:00Z',
    },
  ],
  history: [
    {
      id: 'hist-1',
      action: 'Document Rejected',
      details: 'Eye Test Certificate - Expired document',
      author: 'Admin User',
      createdAt: '2025-01-02T12:00:00Z',
    },
    {
      id: 'hist-2',
      action: 'Document Verified',
      details: 'National ID Card',
      author: 'Admin User',
      createdAt: '2025-01-02T11:45:00Z',
    },
    {
      id: 'hist-3',
      action: 'Status Changed',
      details: 'Submitted → Under Review',
      author: 'System',
      createdAt: '2025-01-02T10:35:00Z',
    },
    {
      id: 'hist-4',
      action: 'Application Submitted',
      details: 'Online submission',
      author: 'Sarah Johnson',
      createdAt: '2025-01-02T10:30:00Z',
    },
  ],
};

const typeLabels: Record<string, string> = {
  learner_permit: "Learner's Permit",
  driver_licence: "Driver's Licence",
  renewal: 'Licence Renewal',
};

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  submitted: { label: 'Submitted', variant: 'default' },
  under_review: { label: 'Under Review', variant: 'info' },
  documents_pending: { label: 'Documents Pending', variant: 'warning' },
  test_scheduled: { label: 'Test Scheduled', variant: 'info' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  ready_for_collection: { label: 'Ready for Collection', variant: 'success' },
};

const docStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  pending: { label: 'Pending Review', variant: 'warning' },
  verified: { label: 'Verified', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
};

function getTimeline(status: string): TimelineStep[] {
  const steps = [
    { id: 'submitted', label: 'Submitted' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'documents_verified', label: 'Documents Verified' },
    { id: 'test_scheduled', label: 'Test Scheduled' },
    { id: 'approved', label: 'Approved' },
  ];

  const statusOrder = ['submitted', 'under_review', 'documents_verified', 'test_scheduled', 'approved'];
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((step, index) => ({
    label: step.label,
    status: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'future',
    date: index <= currentIndex ? format(new Date(), 'MMM d') : undefined,
  }));
}

export default function ApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState(mockApplication);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docRejectReason, setDocRejectReason] = useState('');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeline = getTimeline(application.status);
  const pendingDocs = application.documents.filter((d) => d.status === 'pending').length;
  const rejectedDocs = application.documents.filter((d) => d.status === 'rejected').length;

  const handleVerifyDocument = (docId: string) => {
    setApplication((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === docId ? { ...d, status: 'verified' as const } : d
      ),
    }));
  };

  const handleRejectDocument = (docId: string) => {
    if (!docRejectReason) return;
    setApplication((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === docId ? { ...d, status: 'rejected' as const, rejectionReason: docRejectReason } : d
      ),
    }));
    setRejectingDocId(null);
    setDocRejectReason('');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `note-${Date.now()}`,
      content: newNote,
      author: 'Admin User',
      createdAt: new Date().toISOString(),
    };
    setApplication((prev) => ({
      ...prev,
      notes: [note, ...prev.notes],
    }));
    setNewNote('');
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setApplication((prev) => ({ ...prev, status: 'approved' as const }));
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setApplication((prev) => ({ ...prev, status: 'rejected' as const }));
    setShowRejectModal(false);
    setIsSubmitting(false);
  };

  const handleScheduleTest = async () => {
    if (!testDate || !testTime) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setApplication((prev) => ({ ...prev, status: 'test_scheduled' as const }));
    setShowScheduleModal(false);
    setIsSubmitting(false);
  };

  const handleRequestInfo = async () => {
    if (!requestMessage) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setApplication((prev) => ({ ...prev, status: 'documents_pending' as const }));
    setShowRequestInfoModal(false);
    setRequestMessage('');
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Heading>{application.applicant.fullName}</Heading>
            <Badge variant={statusConfig[application.status]?.variant || 'default'}>
              {statusConfig[application.status]?.label || application.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <Mono>{application.reference}</Mono>
            <span>•</span>
            <span>{typeLabels[application.type]}</span>
            <span>•</span>
            <span>Submitted {format(new Date(application.submittedAt), 'MMM d, yyyy h:mm a')}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Column - 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Applicant Info */}
          <Card className="p-6">
            <Subheading className="mb-6">Applicant Information</Subheading>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <Label className="block mb-1">Full Name</Label>
                  <p className="font-medium text-primary">{application.applicant.fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <Label className="block mb-1">National ID</Label>
                  <Mono>{application.applicant.nationalId}</Mono>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <Label className="block mb-1">Date of Birth</Label>
                  <p className="text-primary">
                    {format(new Date(application.applicant.dateOfBirth), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <Label className="block mb-1">Email</Label>
                  <p className="text-primary">{application.applicant.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <Label className="block mb-1">Phone</Label>
                  <p className="text-primary">{application.applicant.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <Label className="block mb-1">Address</Label>
                  <p className="text-primary">{application.applicant.address}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Documents Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Subheading>Documents</Subheading>
              <div className="flex items-center gap-2">
                {pendingDocs > 0 && (
                  <Badge variant="warning">{pendingDocs} Pending</Badge>
                )}
                {rejectedDocs > 0 && (
                  <Badge variant="error">{rejectedDocs} Rejected</Badge>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'border rounded-[6px] overflow-hidden transition-colors',
                    doc.status === 'rejected'
                      ? 'border-error/30 bg-error/5'
                      : doc.status === 'verified'
                      ? 'border-success/30 bg-success/5'
                      : 'border-border'
                  )}
                >
                  {/* Document Preview */}
                  <div
                    className="h-32 bg-surface flex items-center justify-center cursor-pointer group relative"
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <FileText className="w-12 h-12 text-text-muted" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-primary text-sm">{doc.label}</p>
                        <Caption>
                          Uploaded {format(new Date(doc.uploadedAt), 'MMM d, h:mm a')}
                        </Caption>
                      </div>
                      <Badge variant={docStatusConfig[doc.status].variant} className="ml-2">
                        {docStatusConfig[doc.status].label}
                      </Badge>
                    </div>

                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <div className="mt-2 p-2 bg-error/10 rounded text-xs text-error">
                        {doc.rejectionReason}
                      </div>
                    )}

                    {doc.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleVerifyDocument(doc.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-error hover:bg-error/10"
                          onClick={() => setRejectingDocId(doc.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {rejectingDocId === doc.id && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          placeholder="Reason for rejection..."
                          value={docRejectReason}
                          onChange={(e) => setDocRejectReason(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-border rounded-[6px] resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRejectingDocId(null);
                              setDocRejectReason('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            className="bg-error hover:bg-error/90"
                            onClick={() => handleRejectDocument(doc.id)}
                            disabled={!docRejectReason}
                          >
                            Confirm Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Form Data Section */}
          <Card className="p-6">
            <Subheading className="mb-6">Application Details</Subheading>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <Label className="block mb-1">Licence Class</Label>
                <p className="text-primary">
                  {application.formData.licenceClass === 'class_1'
                    ? 'Class 1 - Private Vehicle'
                    : application.formData.licenceClass === 'class_2'
                    ? 'Class 2 - Motorcycle'
                    : 'Class 3 - Commercial'}
                </p>
              </div>
              <div>
                <Label className="block mb-1">Requires Glasses</Label>
                <p className="text-primary">{application.formData.hasGlasses ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label className="block mb-1">Blood Type</Label>
                <p className="text-primary">{application.formData.bloodType}</p>
              </div>
              <div>
                <Label className="block mb-1">Previous Licence</Label>
                <p className="text-primary">{application.formData.previousLicence ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label className="block mb-1">Emergency Contact</Label>
                <p className="text-primary">{application.formData.emergencyContact}</p>
              </div>
              <div>
                <Label className="block mb-1">Emergency Phone</Label>
                <p className="text-primary">{application.formData.emergencyPhone}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="block mb-1">Medical Conditions</Label>
                <p className="text-primary">{application.formData.medicalConditions}</p>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <Subheading className="mb-6">Progress Timeline</Subheading>
            <div className="flex items-center justify-between">
              {timeline.map((step, index) => (
                <div key={step.label} className="flex-1 relative">
                  {index < timeline.length - 1 && (
                    <div
                      className={cn(
                        'absolute top-4 left-1/2 w-full h-0.5',
                        step.status === 'completed' ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center z-10',
                        step.status === 'completed'
                          ? 'bg-primary text-white'
                          : step.status === 'current'
                          ? 'bg-accent text-white'
                          : 'bg-surface border-2 border-border text-text-muted'
                      )}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <p
                      className={cn(
                        'mt-2 text-xs text-center',
                        step.status === 'current' ? 'font-semibold text-primary' : 'text-text-muted'
                      )}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <Caption className="text-center">{step.date}</Caption>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actions Panel - Sticky */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <Card className="p-6">
              <Subheading className="mb-4">Actions</Subheading>

              {/* Current Status */}
              <div className="p-4 bg-surface rounded-[6px] mb-6">
                <Label className="block mb-2">Current Status</Label>
                <Badge
                  variant={statusConfig[application.status]?.variant || 'default'}
                  className="text-sm px-3 py-1"
                >
                  {statusConfig[application.status]?.label || application.status}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {pendingDocs > 0 && (
                  <Button className="w-full" variant="secondary">
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Verify All Documents ({pendingDocs})
                  </Button>
                )}

                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Schedule Test
                </Button>

                <Button
                  className="w-full bg-success hover:bg-success/90 text-white"
                  onClick={handleApprove}
                  loading={isSubmitting}
                  disabled={pendingDocs > 0 || application.status === 'approved'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>

                <Button
                  className="w-full bg-error hover:bg-error/90 text-white"
                  onClick={() => setShowRejectModal(true)}
                  disabled={application.status === 'rejected'}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>

                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => setShowRequestInfoModal(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Request Additional Info
                </Button>
              </div>
            </Card>

            {/* Notes Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-accent" />
                <Subheading>Internal Notes</Subheading>
              </div>

              <div className="space-y-4 mb-4">
                <textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-[6px] resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  Add Note
                </Button>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {application.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-surface rounded-[6px]">
                    <p className="text-sm text-primary mb-2">{note.content}</p>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{note.author}</span>
                      <span>{format(new Date(note.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* History Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-accent" />
                <Subheading>Activity History</Subheading>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {application.history.map((item, index) => (
                  <div key={item.id} className="relative pl-6">
                    {index < application.history.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-surface border-2 border-border" />
                    <div>
                      <p className="text-sm font-medium text-primary">{item.action}</p>
                      {item.details && (
                        <p className="text-xs text-text-muted mt-0.5">{item.details}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                        <span>{item.author}</span>
                        <span>•</span>
                        <span>{format(new Date(item.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="bg-white rounded-[8px] max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <p className="font-medium text-primary">{selectedDocument.label}</p>
                <Caption>
                  Uploaded {format(new Date(selectedDocument.uploadedAt), 'MMM d, yyyy h:mm a')}
                </Caption>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 hover:bg-surface rounded-[6px] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-8 bg-surface flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <FileText className="w-24 h-24 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">Document Preview</p>
                <Caption>Full preview would display the actual document here</Caption>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRejectModal(false)}
        >
          <Card
            className="max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <Subheading>Reject Application</Subheading>
            </div>
            <Body className="mb-4">
              Are you sure you want to reject this application? The applicant will be notified.
            </Body>
            <textarea
              placeholder="Reason for rejection (required)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-[6px] resize-none focus:outline-none focus:ring-2 focus:ring-error/20 focus:border-error mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                className="bg-error hover:bg-error/90 text-white"
                onClick={handleReject}
                loading={isSubmitting}
                disabled={!rejectReason}
              >
                Reject Application
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Schedule Test Modal */}
      {showScheduleModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowScheduleModal(false)}
        >
          <Card
            className="max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <CalendarPlus className="w-5 h-5 text-accent" />
              </div>
              <Subheading>Schedule Test</Subheading>
            </div>
            <Body className="mb-4">
              Schedule a written or driving test for this applicant.
            </Body>
            <div className="space-y-4 mb-6">
              <Input
                label="Test Date"
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
              />
              <Input
                label="Test Time"
                type="time"
                value={testTime}
                onChange={(e) => setTestTime(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleScheduleTest}
                loading={isSubmitting}
                disabled={!testDate || !testTime}
              >
                Schedule Test
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Request Info Modal */}
      {showRequestInfoModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRequestInfoModal(false)}
        >
          <Card
            className="max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-accent" />
              </div>
              <Subheading>Request Additional Information</Subheading>
            </div>
            <Body className="mb-4">
              Send a message to the applicant requesting additional information or documents.
            </Body>
            <textarea
              placeholder="What information do you need from the applicant?"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-[6px] resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowRequestInfoModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRequestInfo}
                loading={isSubmitting}
                disabled={!requestMessage}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
