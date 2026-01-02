'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, differenceInDays, addYears } from 'date-fns';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Search,
  CreditCard,
  Calendar,
  MapPin,
  Clock,
  Download,
  FileText,
  Camera,
  User,
} from 'lucide-react';
import { Container, Header, Footer } from '@/components/layout';
import {
  Card,
  Button,
  Input,
  StepIndicator,
  FileUpload,
  Heading,
  Subheading,
  Body,
  Caption,
  Label,
  Mono,
  Badge,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface LicenceInfo {
  id: string;
  licenceNumber: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  email: string;
  licenceClass: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired';
  photoUrl?: string;
}

const steps = [
  { label: 'Confirm Details' },
  { label: 'Photo & Medical' },
  { label: 'Review & Pay' },
];

function getExpiryStatus(expiryDate: string): { status: 'active' | 'expiring' | 'expired'; daysUntil: number } {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntil = differenceInDays(expiry, today);

  if (daysUntil < 0) {
    return { status: 'expired', daysUntil };
  } else if (daysUntil <= 30) {
    return { status: 'expiring', daysUntil };
  }
  return { status: 'active', daysUntil };
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function RenewalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [licence, setLicence] = useState<LicenceInfo | null>(null);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1 - Confirm Details
    phone: '',
    email: '',
    addressChanged: false,
    newAddress: '',
    // Step 2 - Photo & Medical
    useExistingPhoto: true,
    newPhoto: '',
    medicalCertificate: '',
    // Step 3 - Review & Pay
    renewalPeriod: '1_year' as '1_year' | '5_year',
  });

  // Check for existing licence on mount
  useEffect(() => {
    async function checkExistingLicence() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setIsLoading(false);
          return;
        }

        // Get existing driver's licence
        const { data: licenceApp } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('type', 'driver_licence')
          .eq('status', 'approved')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (licenceApp) {
          // Mock licence data from application
          const expiryDate = addYears(new Date(licenceApp.updated_at), 1).toISOString();
          const { status } = getExpiryStatus(expiryDate);

          setLicence({
            id: licenceApp.id,
            licenceNumber: `BL-${licenceApp.id.slice(0, 8).toUpperCase()}`,
            fullName: licenceApp.data?.personalInfo?.fullName || 'John Doe',
            nationalId: licenceApp.data?.personalInfo?.nationalId || '12345678',
            dateOfBirth: licenceApp.data?.personalInfo?.dateOfBirth || '1990-01-01',
            address: `${licenceApp.data?.personalInfo?.street || '123 Main St'}, ${licenceApp.data?.personalInfo?.parish || 'St. Michael'}`,
            phone: licenceApp.data?.personalInfo?.phone || '+1 246 XXX XXXX',
            email: licenceApp.data?.personalInfo?.email || 'user@example.com',
            licenceClass: licenceApp.data?.licenceClass || 'class_1',
            issueDate: licenceApp.updated_at,
            expiryDate,
            status,
            photoUrl: licenceApp.data?.photo,
          });

          setFormData((prev) => ({
            ...prev,
            phone: licenceApp.data?.personalInfo?.phone || '',
            email: licenceApp.data?.personalInfo?.email || '',
          }));
        }
      } catch (error) {
        console.error('Error checking licence:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkExistingLicence();
  }, []);

  const handleLookup = async () => {
    setLookupError('');
    setIsSearching(true);

    try {
      // Simulate licence lookup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock found licence
      if (lookupQuery.length >= 6) {
        const mockExpiryDate = addYears(new Date(), -0.1).toISOString(); // Slightly expired
        const { status } = getExpiryStatus(mockExpiryDate);

        setLicence({
          id: 'mock-id',
          licenceNumber: lookupQuery.toUpperCase(),
          fullName: 'John Michael Doe',
          nationalId: '123456789',
          dateOfBirth: '1985-06-15',
          address: '45 Palm Beach Drive, Christ Church',
          phone: '+1 246 555 0123',
          email: 'john.doe@email.com',
          licenceClass: 'class_1',
          issueDate: addYears(new Date(), -1).toISOString(),
          expiryDate: mockExpiryDate,
          status,
        });

        setFormData((prev) => ({
          ...prev,
          phone: '+1 246 555 0123',
          email: 'john.doe@email.com',
        }));
      } else {
        setLookupError('No licence found. Please check your licence number or national ID.');
      }
    } catch (error) {
      setLookupError('An error occurred. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      // Create renewal application
      const { data: application, error } = await supabase
        .from('applications')
        .insert({
          user_id: userData?.user?.id || null,
          type: 'renewal',
          status: 'approved', // Auto-approved for renewals
          submitted_at: new Date().toISOString(),
          data: {
            licenceNumber: licence?.licenceNumber,
            renewalPeriod: formData.renewalPeriod,
            updatedPhone: formData.phone,
            updatedEmail: formData.email,
            newAddress: formData.addressChanged ? formData.newAddress : null,
            useExistingPhoto: formData.useExistingPhoto,
            newPhoto: formData.newPhoto || null,
            medicalCertificate: formData.medicalCertificate || null,
            fee: formData.renewalPeriod === '1_year' ? 75 : 300,
          },
        })
        .select()
        .single();

      if (error) throw error;

      setApplicationId(application.id);
      setReceiptNumber(`RCP-${Date.now().toString().slice(-8)}`);
      setCurrentStep(3); // Success step
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to process renewal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const age = licence ? calculateAge(licence.dateOfBirth) : 0;
  const requiresMedical = age >= 70;
  const fee = formData.renewalPeriod === '1_year' ? 75 : 300;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  // Success Screen
  if (currentStep === 3 && applicationId) {
    return (
      <>
        <Header currentPath="/apply" />
        <div className="min-h-screen bg-surface py-16">
          <Container size="narrow">
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <Heading className="mb-4">Renewal Processed!</Heading>
              <Body className="mb-6 max-w-md mx-auto">
                Your licence renewal has been successfully processed. Please
                visit the Licensing Authority to collect your new licence card.
              </Body>

              <div className="bg-surface rounded-[6px] p-6 mb-8 text-left">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="block mb-1">Receipt Number</Label>
                    <Mono className="text-lg">{receiptNumber}</Mono>
                  </div>
                  <div>
                    <Label className="block mb-1">Amount Paid</Label>
                    <p className="text-lg font-semibold text-primary">
                      BDS ${fee}.00
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-accent" />
                    <Subheading>Renewal Period</Subheading>
                  </div>
                  <p className="text-text-secondary">
                    {formData.renewalPeriod === '1_year' ? '1 Year' : '5 Years'} - Valid until{' '}
                    {format(
                      addYears(new Date(), formData.renewalPeriod === '1_year' ? 1 : 5),
                      'MMMM d, yyyy'
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-[6px] p-6 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <Subheading className="mb-2">Collection Instructions</Subheading>
                    <p className="text-sm text-text-secondary mb-4">
                      Visit the Barbados Licensing Authority with your payment
                      receipt to collect your new licence card.
                    </p>
                    <div className="space-y-2 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        The Pine, St. Michael
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Mon-Fri: 8:30 AM - 4:30 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-[6px] p-4 mb-8 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-success" />
                <span className="text-sm text-text-secondary">
                  Your licence is usually ready <strong>same day</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>
            </Card>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  // Licence Lookup Screen
  if (!licence) {
    return (
      <>
        <Header currentPath="/apply" />
        <div className="min-h-screen bg-surface py-16">
          <Container size="narrow">
            <Card className="p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <Search className="w-8 h-8 text-accent" />
                </div>
                <Heading className="mb-2">Renew Your Licence</Heading>
                <Body>
                  Enter your licence number or national ID to find your licence.
                </Body>
              </div>

              <div className="space-y-4">
                <Input
                  label="Licence Number or National ID"
                  placeholder="e.g., BL-A1B2C3D4 or 123456789"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  error={lookupError}
                />

                <Button
                  className="w-full"
                  onClick={handleLookup}
                  loading={isSearching}
                  disabled={!lookupQuery || isSearching}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find My Licence
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-border text-center">
                <Caption className="block mb-4">Don't have a licence yet?</Caption>
                <Link href="/apply/learners-permit">
                  <Button variant="ghost">Apply for a Learner's Permit</Button>
                </Link>
              </div>
            </Card>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  const { status, daysUntil } = getExpiryStatus(licence.expiryDate);

  // Main Renewal Form
  return (
    <>
      <Header currentPath="/apply" />
      <div className="min-h-screen bg-surface py-8 md:py-16">
        <Container size="narrow">
          {/* Expiry Status Banner */}
          <div
            className={cn(
              'mb-8 p-4 rounded-[6px] flex items-center gap-3',
              status === 'expired'
                ? 'bg-error/10 border border-error/20'
                : status === 'expiring'
                ? 'bg-warning/10 border border-warning/20'
                : 'bg-success/10 border border-success/20'
            )}
          >
            {status === 'expired' ? (
              <AlertCircle className="w-5 h-5 text-error" />
            ) : status === 'expiring' ? (
              <AlertTriangle className="w-5 h-5 text-warning" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                status === 'expired'
                  ? 'text-error'
                  : status === 'expiring'
                  ? 'text-warning'
                  : 'text-success'
              )}
            >
              {status === 'expired'
                ? `Your licence expired ${Math.abs(daysUntil)} days ago`
                : status === 'expiring'
                ? `Your licence expires in ${daysUntil} days`
                : `Your licence is valid until ${format(new Date(licence.expiryDate), 'MMM d, yyyy')}`}
            </span>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} className="mb-12" />

          <Card className="p-8 md:p-12">
            {/* Step 1: Confirm Details */}
            {currentStep === 0 && (
              <>
                <Heading className="mb-2">Confirm Your Details</Heading>
                <Body className="mb-8">
                  Review your current licence information and update any details
                  that have changed.
                </Body>

                {/* Current Licence Info */}
                <div className="bg-surface rounded-[6px] p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Subheading>Current Licence</Subheading>
                    <Badge
                      variant={
                        status === 'expired'
                          ? 'error'
                          : status === 'expiring'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {status === 'expired'
                        ? 'Expired'
                        : status === 'expiring'
                        ? 'Expiring Soon'
                        : 'Active'}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="block mb-1">Licence Number</Label>
                      <Mono>{licence.licenceNumber}</Mono>
                    </div>
                    <div>
                      <Label className="block mb-1">Full Name</Label>
                      <p className="text-primary">{licence.fullName}</p>
                    </div>
                    <div>
                      <Label className="block mb-1">Date of Birth</Label>
                      <p className="text-primary">
                        {format(new Date(licence.dateOfBirth), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <Label className="block mb-1">Licence Class</Label>
                      <p className="text-primary">
                        {licence.licenceClass === 'class_1'
                          ? 'Private Vehicle (Class 1)'
                          : licence.licenceClass === 'class_2'
                          ? 'Motorcycle (Class 2)'
                          : 'Commercial (Class 3)'}
                      </p>
                    </div>
                    <div>
                      <Label className="block mb-1">Issue Date</Label>
                      <p className="text-primary">
                        {format(new Date(licence.issueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <Label className="block mb-1">Expiry Date</Label>
                      <p
                        className={cn(
                          'font-medium',
                          status === 'expired'
                            ? 'text-error'
                            : status === 'expiring'
                            ? 'text-warning'
                            : 'text-primary'
                        )}
                      >
                        {format(new Date(licence.expiryDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Renewal Note */}
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-[6px] flex items-start gap-3 mb-8">
                  <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">
                      Renewal Timing
                    </p>
                    <p className="text-sm text-text-secondary">
                      Renewal is due on your birthday and can be paid during your
                      birth month. Early renewal is accepted up to 30 days before
                      expiry.
                    </p>
                  </div>
                </div>

                {/* Update Contact Info */}
                <Subheading className="mb-4">Update Contact Information</Subheading>
                <div className="space-y-4 mb-6">
                  <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                {/* Address Update */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.addressChanged}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          addressChanged: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-text-secondary">
                      My address has changed
                    </span>
                  </label>

                  {formData.addressChanged && (
                    <Input
                      label="New Address"
                      placeholder="Enter your new address"
                      value={formData.newAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newAddress: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext}>Continue</Button>
                </div>
              </>
            )}

            {/* Step 2: Photo & Medical */}
            {currentStep === 1 && (
              <>
                <Heading className="mb-2">Photo & Medical</Heading>
                <Body className="mb-8">
                  {requiresMedical
                    ? 'Update your photo and provide a medical certificate for renewal.'
                    : 'Choose whether to keep your existing photo or upload a new one.'}
                </Body>

                {/* Photo Option */}
                <div className="mb-8">
                  <Subheading className="mb-4">Licence Photo</Subheading>

                  <div className="space-y-3">
                    <label
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-[6px] border-2 cursor-pointer transition-all',
                        formData.useExistingPhoto
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-text-muted'
                      )}
                    >
                      <input
                        type="radio"
                        checked={formData.useExistingPhoto}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            useExistingPhoto: true,
                            newPhoto: '',
                          }))
                        }
                        className="w-4 h-4 text-accent"
                      />
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 rounded bg-surface border border-border flex items-center justify-center">
                          <User className="w-8 h-8 text-text-muted" />
                        </div>
                        <div>
                          <p className="font-medium text-primary">
                            Use existing photo
                          </p>
                          <Caption>Keep my current licence photo</Caption>
                        </div>
                      </div>
                    </label>

                    <label
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-[6px] border-2 cursor-pointer transition-all',
                        !formData.useExistingPhoto
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-text-muted'
                      )}
                    >
                      <input
                        type="radio"
                        checked={!formData.useExistingPhoto}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            useExistingPhoto: false,
                          }))
                        }
                        className="w-4 h-4 text-accent mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-5 h-5 text-accent" />
                          <p className="font-medium text-primary">
                            Upload new photo
                          </p>
                        </div>
                        <Caption className="block mb-4">
                          Take a new passport-sized photo
                        </Caption>

                        {!formData.useExistingPhoto && (
                          <FileUpload
                            label=""
                            description="Recent color photo, white background, 35mm x 45mm"
                            accept="image/*"
                            maxSizeMB={2}
                            value={formData.newPhoto}
                            onChange={(url) =>
                              setFormData((prev) => ({
                                ...prev,
                                newPhoto: url || '',
                              }))
                            }
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Medical Certificate (if required) */}
                {requiresMedical && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Subheading>Medical Certificate</Subheading>
                      <Badge variant="warning">Required</Badge>
                    </div>

                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-[6px] flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-text-secondary">
                        As you are {age} years old, a medical certificate from a
                        registered physician is required for licence renewal.
                      </p>
                    </div>

                    <FileUpload
                      label="Medical Certificate"
                      description="Certificate from a registered physician dated within the last 3 months"
                      accept="image/*,.pdf"
                      maxSizeMB={5}
                      value={formData.medicalCertificate}
                      onChange={(url) =>
                        setFormData((prev) => ({
                          ...prev,
                          medicalCertificate: url || '',
                        }))
                      }
                    />
                  </div>
                )}

                {!requiresMedical && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-[6px] flex items-center gap-3 mb-8">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <p className="text-sm text-success">
                      No medical certificate required for your age group.
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={
                      (!formData.useExistingPhoto && !formData.newPhoto) ||
                      (requiresMedical && !formData.medicalCertificate)
                    }
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Review & Pay */}
            {currentStep === 2 && (
              <>
                <Heading className="mb-2">Review & Pay</Heading>
                <Body className="mb-8">
                  Review your renewal details and select your renewal period.
                </Body>

                {/* Licence Summary */}
                <div className="bg-surface rounded-[6px] p-6 mb-6">
                  <Subheading className="mb-4">Licence Details</Subheading>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="block mb-1">Licence Number</Label>
                      <Mono>{licence.licenceNumber}</Mono>
                    </div>
                    <div>
                      <Label className="block mb-1">Full Name</Label>
                      <p className="text-primary">{licence.fullName}</p>
                    </div>
                    <div>
                      <Label className="block mb-1">Licence Class</Label>
                      <p className="text-primary">
                        {licence.licenceClass === 'class_1'
                          ? 'Private Vehicle (Class 1)'
                          : licence.licenceClass === 'class_2'
                          ? 'Motorcycle (Class 2)'
                          : 'Commercial (Class 3)'}
                      </p>
                    </div>
                    <div>
                      <Label className="block mb-1">Photo</Label>
                      <p className="text-primary">
                        {formData.useExistingPhoto ? 'Using existing photo' : 'New photo uploaded'}
                      </p>
                    </div>
                  </div>

                  {(formData.phone !== licence.phone ||
                    formData.email !== licence.email ||
                    formData.addressChanged) && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Label className="block mb-2">Updated Information</Label>
                      <div className="space-y-1 text-sm">
                        {formData.phone !== licence.phone && (
                          <p className="text-accent">Phone: {formData.phone}</p>
                        )}
                        {formData.email !== licence.email && (
                          <p className="text-accent">Email: {formData.email}</p>
                        )}
                        {formData.addressChanged && (
                          <p className="text-accent">
                            New Address: {formData.newAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Renewal Period Selection */}
                <div className="mb-8">
                  <Subheading className="mb-4">Select Renewal Period</Subheading>
                  <div className="space-y-3">
                    <label
                      className={cn(
                        'flex items-center justify-between p-4 rounded-[6px] border-2 cursor-pointer transition-all',
                        formData.renewalPeriod === '1_year'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-text-muted'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={formData.renewalPeriod === '1_year'}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              renewalPeriod: '1_year',
                            }))
                          }
                          className="w-4 h-4 text-accent"
                        />
                        <div>
                          <p className="font-medium text-primary">1 Year</p>
                          <Caption>
                            Valid until{' '}
                            {format(addYears(new Date(), 1), 'MMMM d, yyyy')}
                          </Caption>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        BDS $75
                      </span>
                    </label>

                    <label
                      className={cn(
                        'flex items-center justify-between p-4 rounded-[6px] border-2 cursor-pointer transition-all',
                        formData.renewalPeriod === '5_year'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-text-muted'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={formData.renewalPeriod === '5_year'}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              renewalPeriod: '5_year',
                            }))
                          }
                          className="w-4 h-4 text-accent"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-primary">5 Years</p>
                            <Badge variant="golden">Best Value</Badge>
                          </div>
                          <Caption>
                            Valid until{' '}
                            {format(addYears(new Date(), 5), 'MMMM d, yyyy')}
                          </Caption>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        BDS $300
                      </span>
                    </label>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="bg-surface rounded-[6px] p-6 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-primary">Total</span>
                    <span className="text-2xl font-semibold text-primary">
                      BDS ${fee}.00
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} loading={isSubmitting}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay & Submit
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
}
