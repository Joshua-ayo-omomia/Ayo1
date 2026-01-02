'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  format,
  addDays,
  startOfDay,
  isWeekend,
  isBefore,
  differenceInDays,
} from 'date-fns';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  Bike,
  Truck,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard,
  Info,
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

interface EligibilityStatus {
  hasLearnerPermit: boolean;
  permitIssuedDate: string | null;
  daysSinceIssued: number;
  regulationsTestPassed: boolean;
  isEligible: boolean;
  permitData: any;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const steps = [
  { label: 'Confirm Details' },
  { label: 'Licence Class' },
  { label: 'Book Test' },
  { label: 'Review & Pay' },
];

const licenceClasses = [
  {
    id: 'class_1',
    name: 'Private Vehicle (Class 1)',
    icon: Car,
    description: 'Cars, SUVs, and light vehicles up to 3,500kg',
    requirements: [
      'Must be 17 years or older',
      'Valid learner\'s permit',
      'Passed regulations test',
    ],
    minAge: 17,
  },
  {
    id: 'class_2',
    name: 'Motorcycle (Class 2)',
    icon: Bike,
    description: 'Two and three-wheeled motor vehicles',
    requirements: [
      'Must be 17 years or older',
      'Valid learner\'s permit',
      'Passed regulations test',
      'Motorcycle training recommended',
    ],
    minAge: 17,
  },
  {
    id: 'class_3',
    name: 'Commercial Vehicle (Class 3)',
    icon: Truck,
    description: 'Heavy goods vehicles, buses, and commercial transport',
    requirements: [
      'Must be 20 years or older',
      'Valid Class 1 licence for 2+ years',
      'Medical fitness certificate',
      'Additional written test required',
    ],
    minAge: 20,
  },
];

const testLocations = [
  {
    id: 'pine',
    name: 'The Pine Testing Center',
    address: 'The Pine, St. Michael',
    description: 'Main testing facility',
  },
  {
    id: 'holetown',
    name: 'Holetown Testing Center',
    address: 'Holetown, St. James',
    description: 'West coast facility',
  },
];

const timeSlots: TimeSlot[] = [
  { time: '08:00', available: true },
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: true },
  { time: '13:00', available: true },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
];

export default function DriversLicencePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAge, setUserAge] = useState<number>(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1 - Confirm Details
    addressChanged: false,
    newAddress: {
      street: '',
      city: '',
      parish: '',
    },
    newPhoto: '',
    // Step 2 - Licence Class
    licenceClass: '',
    // Step 3 - Book Test
    testLocation: '',
    testDate: '',
    testTime: '',
  });

  // Check eligibility on mount
  useEffect(() => {
    async function checkEligibility() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push('/auth/sign-in');
          return;
        }

        // Get learner's permit application
        const { data: permitApp } = await supabase
          .from('applications')
          .select('*, test_results(*)')
          .eq('user_id', userData.user.id)
          .eq('type', 'learner_permit')
          .eq('status', 'approved')
          .single();

        if (!permitApp) {
          setEligibility({
            hasLearnerPermit: false,
            permitIssuedDate: null,
            daysSinceIssued: 0,
            regulationsTestPassed: false,
            isEligible: false,
            permitData: null,
          });
          setIsLoading(false);
          return;
        }

        const issuedDate = permitApp.updated_at;
        const daysSince = differenceInDays(new Date(), new Date(issuedDate));
        const testPassed = permitApp.test_results?.some(
          (r: any) => r.test_type === 'regulations_test' && r.passed
        );

        // Calculate user age from permit data
        if (permitApp.data?.personalInfo?.dateOfBirth) {
          const dob = new Date(permitApp.data.personalInfo.dateOfBirth);
          const age = differenceInDays(new Date(), dob) / 365;
          setUserAge(Math.floor(age));
        }

        setEligibility({
          hasLearnerPermit: true,
          permitIssuedDate: issuedDate,
          daysSinceIssued: daysSince,
          regulationsTestPassed: testPassed || false,
          isEligible: daysSince >= 30 && (testPassed || false),
          permitData: permitApp.data,
        });
      } catch (error) {
        console.error('Error checking eligibility:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkEligibility();
  }, [router]);

  // Generate available dates (weekdays, next 30 days)
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const start = addDays(new Date(), 1);
    const end = addDays(new Date(), 30);

    let current = start;
    while (isBefore(current, end)) {
      if (!isWeekend(current)) {
        dates.push(startOfDay(current));
      }
      current = addDays(current, 1);
    }
    return dates;
  }, []);

  // Simulated slot availability (in production, fetch from API)
  const getAvailableSlots = (date: string, location: string): TimeSlot[] => {
    // Simulate some slots being taken
    const seed = date.length + location.length;
    return timeSlots.map((slot, i) => ({
      ...slot,
      available: (seed + i) % 3 !== 0,
    }));
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
      if (!userData.user) throw new Error('Not authenticated');

      // Create application
      const { data: application, error } = await supabase
        .from('applications')
        .insert({
          user_id: userData.user.id,
          type: 'driver_licence',
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          data: {
            licenceClass: formData.licenceClass,
            testLocation: formData.testLocation,
            testDate: formData.testDate,
            testTime: formData.testTime,
            addressUpdate: formData.addressChanged ? formData.newAddress : null,
            newPhoto: formData.newPhoto || null,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Create appointment
      await supabase.from('appointments').insert({
        application_id: application.id,
        type: 'driving_test',
        scheduled_date: formData.testDate,
        scheduled_time: formData.testTime,
        location: testLocations.find((l) => l.id === formData.testLocation)?.name || '',
        status: 'scheduled',
      });

      setApplicationId(application.id);
      setCurrentStep(4); // Success step
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-text-muted">
          Checking eligibility...
        </div>
      </div>
    );
  }

  // Success Screen
  if (currentStep === 4 && applicationId) {
    const selectedLocation = testLocations.find(
      (l) => l.id === formData.testLocation
    );

    return (
      <>
        <Header currentPath="/apply" />
        <div className="min-h-screen bg-surface py-16">
          <Container size="narrow">
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <Heading className="mb-4">Application Submitted!</Heading>
              <Body className="mb-6 max-w-md mx-auto">
                Your driver's licence application has been submitted and your
                driving test has been scheduled.
              </Body>

              <div className="bg-surface rounded-[6px] p-6 mb-8 text-left">
                <Label className="block mb-2">Application Reference</Label>
                <Mono className="text-2xl block mb-6">
                  {applicationId.slice(0, 8).toUpperCase()}
                </Mono>

                <div className="border-t border-border pt-6">
                  <Subheading className="mb-4">Driving Test Appointment</Subheading>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-accent" />
                      <span className="text-text-secondary">
                        {format(new Date(formData.testDate), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-accent" />
                      <span className="text-text-secondary">{formData.testTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="text-text-secondary">
                        {selectedLocation?.name}, {selectedLocation?.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-[6px] p-6 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <Subheading className="mb-2">What to Bring</Subheading>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Your own vehicle (in good working condition)</li>
                      <li>• Valid Learner's Permit</li>
                      <li>• National ID or Passport</li>
                      <li>• Vehicle registration and insurance</li>
                      <li>• Arrive 15 minutes early</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

  // Eligibility Gate
  if (!eligibility?.isEligible) {
    return (
      <>
        <Header currentPath="/apply" />
        <div className="min-h-screen bg-surface py-16">
          <Container size="narrow">
            <Card className="p-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-error" />
                </div>
                <Heading className="mb-2">Not Yet Eligible</Heading>
                <Body>
                  Please complete the following requirements before applying for
                  your driver's licence.
                </Body>
              </div>

              <div className="space-y-4">
                {/* Learner's Permit Check */}
                <div
                  className={cn(
                    'p-4 rounded-[6px] border flex items-start gap-4',
                    eligibility?.hasLearnerPermit
                      ? 'border-success/30 bg-success/5'
                      : 'border-error/30 bg-error/5'
                  )}
                >
                  {eligibility?.hasLearnerPermit ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-primary">
                      Valid Learner's Permit
                    </p>
                    {eligibility?.hasLearnerPermit ? (
                      <Caption>Issued on {format(new Date(eligibility.permitIssuedDate!), 'MMM d, yyyy')}</Caption>
                    ) : (
                      <Caption>
                        You need an approved learner's permit to continue.
                      </Caption>
                    )}
                  </div>
                  {!eligibility?.hasLearnerPermit && (
                    <Link href="/apply/learners-permit" className="ml-auto">
                      <Button size="sm">Apply Now</Button>
                    </Link>
                  )}
                </div>

                {/* 30 Days Requirement */}
                <div
                  className={cn(
                    'p-4 rounded-[6px] border flex items-start gap-4',
                    eligibility?.daysSinceIssued >= 30
                      ? 'border-success/30 bg-success/5'
                      : 'border-error/30 bg-error/5'
                  )}
                >
                  {eligibility?.daysSinceIssued >= 30 ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-primary">
                      30-Day Holding Period
                    </p>
                    {eligibility?.hasLearnerPermit && eligibility?.daysSinceIssued < 30 ? (
                      <Caption>
                        {30 - eligibility.daysSinceIssued} days remaining.
                        Eligible on{' '}
                        {format(
                          addDays(new Date(eligibility.permitIssuedDate!), 30),
                          'MMM d, yyyy'
                        )}
                      </Caption>
                    ) : eligibility?.hasLearnerPermit ? (
                      <Caption>Requirement met</Caption>
                    ) : (
                      <Caption>Get your permit first</Caption>
                    )}
                  </div>
                </div>

                {/* Regulations Test */}
                <div
                  className={cn(
                    'p-4 rounded-[6px] border flex items-start gap-4',
                    eligibility?.regulationsTestPassed
                      ? 'border-success/30 bg-success/5'
                      : 'border-error/30 bg-error/5'
                  )}
                >
                  {eligibility?.regulationsTestPassed ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-primary">
                      Regulations Test Passed
                    </p>
                    {eligibility?.regulationsTestPassed ? (
                      <Caption>Test completed successfully</Caption>
                    ) : (
                      <Caption>
                        You must pass the regulations test to continue.
                      </Caption>
                    )}
                  </div>
                  {!eligibility?.regulationsTestPassed && eligibility?.hasLearnerPermit && (
                    <Link href="/test/regulations" className="ml-auto">
                      <Button size="sm">Take Test</Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/dashboard">
                  <Button variant="ghost">Back to Dashboard</Button>
                </Link>
              </div>
            </Card>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  // Main Form
  return (
    <>
      <Header currentPath="/apply" />
      <div className="min-h-screen bg-surface py-8 md:py-16">
        <Container size="narrow">
          {/* Eligibility Confirmed Banner */}
          <div className="mb-8 p-4 bg-success/10 border border-success/20 rounded-[6px] flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm text-success font-medium">
              You're eligible to apply for your driver's licence
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
                  Please review the information from your learner's permit application.
                </Body>

                <div className="bg-surface rounded-[6px] p-6 mb-8">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="block mb-1">Full Name</Label>
                      <p className="text-primary">
                        {eligibility.permitData?.personalInfo?.fullName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="block mb-1">National ID</Label>
                      <p className="text-primary">
                        {eligibility.permitData?.personalInfo?.nationalId || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="block mb-1">Date of Birth</Label>
                      <p className="text-primary">
                        {eligibility.permitData?.personalInfo?.dateOfBirth
                          ? format(new Date(eligibility.permitData.personalInfo.dateOfBirth), 'MMMM d, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="block mb-1">Phone</Label>
                      <p className="text-primary">
                        {eligibility.permitData?.personalInfo?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="block mb-1">Address</Label>
                      <p className="text-primary">
                        {eligibility.permitData?.personalInfo?.street},{' '}
                        {eligibility.permitData?.personalInfo?.city},{' '}
                        {eligibility.permitData?.personalInfo?.parish}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Update Option */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
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
                </div>

                {formData.addressChanged && (
                  <div className="space-y-4 mb-8 p-6 bg-surface rounded-[6px]">
                    <Input
                      label="New Street Address"
                      value={formData.newAddress.street}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newAddress: { ...prev.newAddress, street: e.target.value },
                        }))
                      }
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="City"
                        value={formData.newAddress.city}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newAddress: { ...prev.newAddress, city: e.target.value },
                          }))
                        }
                      />
                      <Input
                        label="Parish"
                        value={formData.newAddress.parish}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newAddress: { ...prev.newAddress, parish: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* New Photo Option */}
                <div className="mb-8">
                  <FileUpload
                    label="Update Photo (Optional)"
                    description="Upload a new passport-sized photo if your appearance has changed"
                    accept="image/*"
                    maxSizeMB={2}
                    value={formData.newPhoto}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, newPhoto: url || '' }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext}>Continue</Button>
                </div>
              </>
            )}

            {/* Step 2: Licence Class */}
            {currentStep === 1 && (
              <>
                <Heading className="mb-2">Select Licence Class</Heading>
                <Body className="mb-8">
                  Choose the type of licence you wish to apply for.
                </Body>

                <div className="space-y-4 mb-8">
                  {licenceClasses.map((licenceClass) => {
                    const isDisabled = userAge < licenceClass.minAge;
                    const isSelected = formData.licenceClass === licenceClass.id;
                    const Icon = licenceClass.icon;

                    return (
                      <button
                        key={licenceClass.id}
                        onClick={() =>
                          !isDisabled &&
                          setFormData((prev) => ({
                            ...prev,
                            licenceClass: licenceClass.id,
                          }))
                        }
                        disabled={isDisabled}
                        className={cn(
                          'w-full p-6 rounded-[6px] border-2 text-left transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isDisabled
                            ? 'border-border bg-surface opacity-60 cursor-not-allowed'
                            : 'border-border hover:border-text-muted'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-full flex items-center justify-center',
                              isSelected ? 'bg-primary text-white' : 'bg-surface text-text-muted'
                            )}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-primary">
                                {licenceClass.name}
                              </p>
                              {isDisabled && (
                                <Badge variant="default">Age {licenceClass.minAge}+</Badge>
                              )}
                            </div>
                            <p className="text-sm text-text-secondary mb-3">
                              {licenceClass.description}
                            </p>
                            <ul className="text-xs text-text-muted space-y-1">
                              {licenceClass.requirements.map((req, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={!formData.licenceClass}>
                    Continue
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Book Driving Test */}
            {currentStep === 2 && (
              <>
                <Heading className="mb-2">Book Your Driving Test</Heading>
                <Body className="mb-8">
                  Select a convenient date and time for your practical driving test.
                </Body>

                {/* Location Selection */}
                <div className="mb-8">
                  <Label className="block mb-4">Testing Location</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {testLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            testLocation: location.id,
                            testDate: '',
                            testTime: '',
                          }))
                        }
                        className={cn(
                          'p-4 rounded-[6px] border-2 text-left transition-all',
                          formData.testLocation === location.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-text-muted'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-accent" />
                          <span className="font-medium text-primary">
                            {location.name}
                          </span>
                        </div>
                        <Caption>{location.address}</Caption>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                {formData.testLocation && (
                  <div className="mb-8">
                    <Label className="block mb-4">Select Date</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {availableDates.slice(0, 21).map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isSelected = formData.testDate === dateStr;

                        return (
                          <button
                            key={dateStr}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                testDate: dateStr,
                                testTime: '',
                              }))
                            }
                            className={cn(
                              'p-3 rounded-[6px] border text-center transition-all',
                              isSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-border hover:border-text-muted'
                            )}
                          >
                            <p className="text-xs text-current opacity-70">
                              {format(date, 'EEE')}
                            </p>
                            <p className="text-lg font-medium">
                              {format(date, 'd')}
                            </p>
                            <p className="text-xs text-current opacity-70">
                              {format(date, 'MMM')}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Time Selection */}
                {formData.testDate && (
                  <div className="mb-8">
                    <Label className="block mb-4">Select Time</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {getAvailableSlots(formData.testDate, formData.testLocation).map(
                        (slot) => (
                          <button
                            key={slot.time}
                            onClick={() =>
                              slot.available &&
                              setFormData((prev) => ({ ...prev, testTime: slot.time }))
                            }
                            disabled={!slot.available}
                            className={cn(
                              'p-3 rounded-[6px] border text-center transition-all',
                              formData.testTime === slot.time
                                ? 'border-primary bg-primary text-white'
                                : slot.available
                                ? 'border-border hover:border-text-muted'
                                : 'border-border bg-surface text-text-muted cursor-not-allowed'
                            )}
                          >
                            {slot.time}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Reminder */}
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-[6px] flex items-start gap-3 mb-8">
                  <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">
                      Important Reminder
                    </p>
                    <p className="text-sm text-text-secondary">
                      You must bring your own vehicle for the driving test. The vehicle
                      must be in good working condition with valid registration and insurance.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!formData.testLocation || !formData.testDate || !formData.testTime}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}

            {/* Step 4: Review & Pay */}
            {currentStep === 3 && (
              <>
                <Heading className="mb-2">Review & Submit</Heading>
                <Body className="mb-8">
                  Please review your application details before submitting.
                </Body>

                {/* Licence Class */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Subheading>Licence Class</Subheading>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-accent hover:text-primary transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="bg-surface rounded-[6px] p-4">
                    <p className="font-medium text-primary">
                      {licenceClasses.find((c) => c.id === formData.licenceClass)?.name}
                    </p>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Subheading>Driving Test Appointment</Subheading>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-accent hover:text-primary transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-[6px] p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-accent" />
                        <span className="text-primary font-medium">
                          {format(new Date(formData.testDate), 'EEEE, MMMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-accent" />
                        <span className="text-text-secondary">{formData.testTime}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-accent" />
                        <span className="text-text-secondary">
                          {testLocations.find((l) => l.id === formData.testLocation)?.name},{' '}
                          {testLocations.find((l) => l.id === formData.testLocation)?.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="mb-8">
                  <Subheading className="mb-3">Fee Summary</Subheading>
                  <div className="bg-surface rounded-[6px] p-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Driving Test Fee</span>
                        <span className="text-primary">BDS $50.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Driver's Licence Fee</span>
                        <span className="text-primary">BDS $75.00</span>
                      </div>
                      <div className="border-t border-border pt-3 flex justify-between">
                        <span className="font-medium text-primary">Total</span>
                        <span className="text-xl font-semibold text-primary">
                          BDS $125.00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} loading={isSubmitting}>
                    Submit Application
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
