'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle, FileText, Image } from 'lucide-react';
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
} from '@/components/ui';
import { supabase } from '@/lib/supabase';
import {
  eligibilitySchema,
  personalInfoSchema,
  documentsSchema,
  reviewSchema,
  type EligibilityFormData,
  type PersonalInfoFormData,
  type DocumentsFormData,
  type ReviewFormData,
} from '@/lib/validations/learners-permit';

const steps = [
  { label: 'Eligibility' },
  { label: 'Personal Info' },
  { label: 'Documents' },
  { label: 'Review & Pay' },
];

const parishes = [
  'Christ Church',
  'St. Andrew',
  'St. George',
  'St. James',
  'St. John',
  'St. Joseph',
  'St. Lucy',
  'St. Michael',
  'St. Peter',
  'St. Philip',
  'St. Thomas',
];

export default function LearnersPermitPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{
    eligibility?: EligibilityFormData;
    personalInfo?: PersonalInfoFormData;
    documents?: DocumentsFormData;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);

  // Calculate age when date of birth changes
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Step 1: Eligibility Form
  const eligibilityForm = useForm<EligibilityFormData>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues: formData.eligibility,
  });

  // Step 2: Personal Info Form
  const personalInfoForm = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: formData.personalInfo,
  });

  // Step 3: Documents Form
  const documentsForm = useForm<DocumentsFormData>({
    resolver: zodResolver(documentsSchema),
    defaultValues: formData.documents,
  });

  // Step 4: Review Form
  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { agreedToTerms: false },
  });

  // Watch date of birth for medical certificate requirement
  const watchDob = personalInfoForm.watch('dateOfBirth');
  useEffect(() => {
    if (watchDob) {
      setUserAge(calculateAge(watchDob));
    }
  }, [watchDob]);

  const handleEligibilitySubmit = (data: EligibilityFormData) => {
    setFormData((prev) => ({ ...prev, eligibility: data }));
    setCurrentStep(1);
  };

  const handlePersonalInfoSubmit = (data: PersonalInfoFormData) => {
    setFormData((prev) => ({ ...prev, personalInfo: data }));
    setUserAge(calculateAge(data.dateOfBirth));
    setCurrentStep(2);
  };

  const handleDocumentsSubmit = (data: DocumentsFormData) => {
    setFormData((prev) => ({ ...prev, documents: data }));
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Not authenticated');
      }

      // Create application
      const { data: application, error } = await supabase
        .from('applications')
        .insert({
          user_id: userData.user.id,
          type: 'learner_permit',
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          data: {
            eligibility: formData.eligibility,
            personalInfo: formData.personalInfo,
            documents: formData.documents,
          },
        })
        .select()
        .single();

      if (error) throw error;

      setApplicationId(application.id);
      setCurrentStep(4); // Success step
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Success screen
  if (currentStep === 4 && applicationId) {
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
                Your learner's permit application has been successfully
                submitted. You will receive an email confirmation shortly.
              </Body>

              <div className="bg-surface rounded-[6px] p-6 mb-8">
                <Label className="block mb-2">Application Reference</Label>
                <Mono className="text-2xl">
                  {applicationId.slice(0, 8).toUpperCase()}
                </Mono>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-[6px] p-6 mb-8 text-left">
                <Subheading className="mb-3">Next Steps</Subheading>
                <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
                  <li>Your documents will be reviewed within 24-48 hours</li>
                  <li>Once approved, you'll receive an email to schedule your regulations test</li>
                  <li>Pass the test to receive your learner's permit</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
                <Link href="/appointments/book">
                  <Button variant="secondary">Schedule Test</Button>
                </Link>
              </div>
            </Card>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header currentPath="/apply" />
      <div className="min-h-screen bg-surface py-8 md:py-16">
        <Container size="narrow">
          {/* Step Indicator */}
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            className="mb-12"
          />

          <Card className="p-8 md:p-12">
            {/* Step 1: Eligibility */}
            {currentStep === 0 && (
              <form onSubmit={eligibilityForm.handleSubmit(handleEligibilitySubmit)}>
                <Heading className="mb-2">Check Your Eligibility</Heading>
                <Body className="mb-8">
                  Please answer the following questions to confirm you're
                  eligible for a learner's permit.
                </Body>

                <div className="space-y-8">
                  {/* Age Question */}
                  <div>
                    <Label className="block mb-4">
                      Are you 16 years of age or older?
                    </Label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="yes"
                          {...eligibilityForm.register('isOver16')}
                          className="w-4 h-4 text-accent"
                        />
                        <span className="text-text-secondary">Yes</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="no"
                          {...eligibilityForm.register('isOver16')}
                          className="w-4 h-4 text-accent"
                        />
                        <span className="text-text-secondary">No</span>
                      </label>
                    </div>
                    {eligibilityForm.formState.errors.isOver16 && (
                      <p className="mt-2 text-sm text-error">
                        {eligibilityForm.formState.errors.isOver16.message}
                      </p>
                    )}
                  </div>

                  {/* Residency Question */}
                  <div>
                    <Label className="block mb-4">
                      Are you a resident of Barbados?
                    </Label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="yes"
                          {...eligibilityForm.register('isResident')}
                          className="w-4 h-4 text-accent"
                        />
                        <span className="text-text-secondary">Yes</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="no"
                          {...eligibilityForm.register('isResident')}
                          className="w-4 h-4 text-accent"
                        />
                        <span className="text-text-secondary">No</span>
                      </label>
                    </div>
                    {eligibilityForm.formState.errors.isResident && (
                      <p className="mt-2 text-sm text-error">
                        {eligibilityForm.formState.errors.isResident.message}
                      </p>
                    )}
                  </div>

                  {/* Ineligibility Warning */}
                  {(eligibilityForm.watch('isOver16') === 'no' ||
                    eligibilityForm.watch('isResident') === 'no') && (
                    <div className="flex gap-3 p-4 bg-error/10 border border-error/20 rounded-[6px]">
                      <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-error">
                          You are not eligible
                        </p>
                        <p className="text-sm text-error/80 mt-1">
                          {eligibilityForm.watch('isOver16') === 'no'
                            ? 'You must be 16 years or older to apply for a learner's permit.'
                            : 'You must be a resident of Barbados to apply.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      eligibilityForm.watch('isOver16') === 'no' ||
                      eligibilityForm.watch('isResident') === 'no'
                    }
                  >
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 1 && (
              <form onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)}>
                <Heading className="mb-2">Personal Information</Heading>
                <Body className="mb-8">
                  Please provide your personal details as they appear on your
                  official documents.
                </Body>

                <div className="space-y-6">
                  <Input
                    label="Full Name"
                    placeholder="As shown on your ID"
                    {...personalInfoForm.register('fullName')}
                    error={personalInfoForm.formState.errors.fullName?.message}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="National ID"
                      placeholder="Enter your national ID"
                      {...personalInfoForm.register('nationalId')}
                      error={personalInfoForm.formState.errors.nationalId?.message}
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      {...personalInfoForm.register('dateOfBirth')}
                      error={personalInfoForm.formState.errors.dateOfBirth?.message}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="+1 246 XXX XXXX"
                      {...personalInfoForm.register('phone')}
                      error={personalInfoForm.formState.errors.phone?.message}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      {...personalInfoForm.register('email')}
                      error={personalInfoForm.formState.errors.email?.message}
                    />
                  </div>

                  <Subheading className="pt-4">Address</Subheading>

                  <Input
                    label="Street Address"
                    placeholder="123 Main Street"
                    {...personalInfoForm.register('street')}
                    error={personalInfoForm.formState.errors.street?.message}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="City"
                      placeholder="Bridgetown"
                      {...personalInfoForm.register('city')}
                      error={personalInfoForm.formState.errors.city?.message}
                    />
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Parish
                      </label>
                      <select
                        {...personalInfoForm.register('parish')}
                        className="w-full h-12 px-4 bg-white border border-border rounded-[6px] text-text focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/10"
                      >
                        <option value="">Select parish</option>
                        {parishes.map((parish) => (
                          <option key={parish} value={parish}>
                            {parish}
                          </option>
                        ))}
                      </select>
                      {personalInfoForm.formState.errors.parish && (
                        <p className="mt-2 text-sm text-error">
                          {personalInfoForm.formState.errors.parish.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Subheading className="pt-4">Emergency Contact</Subheading>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Contact Name"
                      placeholder="Full name"
                      {...personalInfoForm.register('emergencyContactName')}
                      error={personalInfoForm.formState.errors.emergencyContactName?.message}
                    />
                    <Input
                      label="Relationship"
                      placeholder="e.g., Parent, Spouse"
                      {...personalInfoForm.register('emergencyContactRelationship')}
                      error={personalInfoForm.formState.errors.emergencyContactRelationship?.message}
                    />
                  </div>

                  <Input
                    label="Contact Phone"
                    type="tel"
                    placeholder="+1 246 XXX XXXX"
                    {...personalInfoForm.register('emergencyContactPhone')}
                    error={personalInfoForm.formState.errors.emergencyContactPhone?.message}
                  />
                </div>

                <div className="mt-10 flex justify-between">
                  <Button type="button" variant="ghost" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            )}

            {/* Step 3: Documents */}
            {currentStep === 2 && (
              <form onSubmit={documentsForm.handleSubmit(handleDocumentsSubmit)}>
                <Heading className="mb-2">Upload Documents</Heading>
                <Body className="mb-8">
                  Please upload clear, legible copies of the required documents.
                </Body>

                <div className="space-y-8">
                  <FileUpload
                    label="Passport-sized Photograph"
                    description="Recent color photo, white background, 35mm x 45mm, JPEG or PNG format"
                    accept="image/*"
                    maxSizeMB={2}
                    value={documentsForm.watch('photo')}
                    onChange={(url) =>
                      documentsForm.setValue('photo', url || '', {
                        shouldValidate: true,
                      })
                    }
                    error={documentsForm.formState.errors.photo?.message}
                  />

                  <FileUpload
                    label="Proof of Age"
                    description="Birth certificate or passport (valid, government-issued)"
                    accept="image/*,.pdf"
                    maxSizeMB={5}
                    value={documentsForm.watch('proofOfAge')}
                    onChange={(url) =>
                      documentsForm.setValue('proofOfAge', url || '', {
                        shouldValidate: true,
                      })
                    }
                    error={documentsForm.formState.errors.proofOfAge?.message}
                  />

                  <FileUpload
                    label="Proof of Residence"
                    description="Utility bill or bank statement dated within the last 3 months"
                    accept="image/*,.pdf"
                    maxSizeMB={5}
                    value={documentsForm.watch('proofOfResidence')}
                    onChange={(url) =>
                      documentsForm.setValue('proofOfResidence', url || '', {
                        shouldValidate: true,
                      })
                    }
                    error={documentsForm.formState.errors.proofOfResidence?.message}
                  />

                  {userAge !== null && userAge >= 70 && (
                    <FileUpload
                      label="Medical Certificate"
                      description="Required for applicants 70 years and older. Must be issued by a registered physician."
                      accept="image/*,.pdf"
                      maxSizeMB={5}
                      value={documentsForm.watch('medicalCertificate')}
                      onChange={(url) =>
                        documentsForm.setValue(
                          'medicalCertificate',
                          url || '',
                          { shouldValidate: true }
                        )
                      }
                      error={documentsForm.formState.errors.medicalCertificate?.message}
                    />
                  )}
                </div>

                <div className="mt-10 flex justify-between">
                  <Button type="button" variant="ghost" onClick={goBack}>
                    Back
                  </Button>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            )}

            {/* Step 4: Review & Pay */}
            {currentStep === 3 && (
              <form onSubmit={reviewForm.handleSubmit(handleFinalSubmit)}>
                <Heading className="mb-2">Review Your Application</Heading>
                <Body className="mb-8">
                  Please review your information before submitting.
                </Body>

                <div className="space-y-8">
                  {/* Personal Info Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Subheading>Personal Information</Subheading>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-sm text-accent hover:text-primary transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="bg-surface rounded-[6px] p-6 space-y-3">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-muted">Full Name:</span>
                          <p className="text-primary">{formData.personalInfo?.fullName}</p>
                        </div>
                        <div>
                          <span className="text-text-muted">National ID:</span>
                          <p className="text-primary">{formData.personalInfo?.nationalId}</p>
                        </div>
                        <div>
                          <span className="text-text-muted">Date of Birth:</span>
                          <p className="text-primary">
                            {formData.personalInfo?.dateOfBirth &&
                              format(new Date(formData.personalInfo.dateOfBirth), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <span className="text-text-muted">Phone:</span>
                          <p className="text-primary">{formData.personalInfo?.phone}</p>
                        </div>
                        <div>
                          <span className="text-text-muted">Email:</span>
                          <p className="text-primary">{formData.personalInfo?.email}</p>
                        </div>
                        <div>
                          <span className="text-text-muted">Parish:</span>
                          <p className="text-primary">{formData.personalInfo?.parish}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Subheading>Documents</Subheading>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-sm text-accent hover:text-primary transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="bg-surface rounded-[6px] p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.documents?.photo && (
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded overflow-hidden border border-border bg-white">
                              <img
                                src={formData.documents.photo}
                                alt="Photo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Caption>Photo</Caption>
                          </div>
                        )}
                        {formData.documents?.proofOfAge && (
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded border border-border bg-white flex items-center justify-center">
                              <FileText className="w-8 h-8 text-text-muted" />
                            </div>
                            <Caption>Proof of Age</Caption>
                          </div>
                        )}
                        {formData.documents?.proofOfResidence && (
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded border border-border bg-white flex items-center justify-center">
                              <FileText className="w-8 h-8 text-text-muted" />
                            </div>
                            <Caption>Residence</Caption>
                          </div>
                        )}
                        {formData.documents?.medicalCertificate && (
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded border border-border bg-white flex items-center justify-center">
                              <FileText className="w-8 h-8 text-text-muted" />
                            </div>
                            <Caption>Medical</Caption>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fee Summary */}
                  <div>
                    <Subheading className="mb-4">Fee Summary</Subheading>
                    <div className="bg-surface rounded-[6px] p-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">
                          Learner's Permit Application Fee
                        </span>
                        <span className="font-medium text-primary">BDS $30.00</span>
                      </div>
                      <div className="border-t border-border mt-4 pt-4 flex justify-between items-center">
                        <span className="font-medium text-primary">Total</span>
                        <span className="text-xl font-semibold text-primary">
                          BDS $30.00
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...reviewForm.register('agreedToTerms')}
                      className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-text-secondary">
                      I confirm that all information provided is accurate and
                      complete. I understand that providing false information may
                      result in rejection of my application and possible legal
                      action. I agree to the{' '}
                      <Link
                        href="/terms"
                        className="text-accent hover:text-primary transition-colors"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-accent hover:text-primary transition-colors"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {reviewForm.formState.errors.agreedToTerms && (
                    <p className="text-sm text-error">
                      {reviewForm.formState.errors.agreedToTerms.message}
                    </p>
                  )}
                </div>

                <div className="mt-10 flex justify-between">
                  <Button type="button" variant="ghost" onClick={goBack}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
}
