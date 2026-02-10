'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PublicNav } from '@/components/layout/public-nav'
import { PublicFooter } from '@/components/layout/public-footer'
import {
  TECH_STACK_OPTIONS,
  YEARS_EXPERIENCE_OPTIONS,
  REFERRAL_SOURCES,
} from '@/lib/constants'
import { CheckCircle2, ChevronLeft, ChevronRight, Pencil, Upload, FileText } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormData {
  // Step 1 — Basic Info
  fullName: string
  email: string
  phone: string
  country: string
  linkedinUrl: string

  // Step 2 — Experience
  resumeOrBrief: 'resume' | 'brief'
  resumeFile: File | null
  brief: string
  experience: string
  yearsExperience: string
  techStack: string[]

  // Step 3 — Commitment
  trackApplied: string
  commitmentConfirmed: boolean | null
  referralSource: string
}

interface StepErrors {
  [key: string]: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { label: 'Basic Info', number: 1 },
  { label: 'Experience', number: 2 },
  { label: 'Commitment', number: 3 },
  { label: 'Review & Submit', number: 4 },
] as const

const INITIAL_FORM_DATA: FormData = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  linkedinUrl: '',
  resumeOrBrief: 'brief',
  resumeFile: null,
  brief: '',
  experience: '',
  yearsExperience: '',
  techStack: [],
  trackApplied: 'AI Engineer',
  commitmentConfirmed: null,
  referralSource: '',
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<StepErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-level error when user edits
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function toggleTechStack(tech: string) {
    setFormData((prev) => {
      const exists = prev.techStack.includes(tech)
      return {
        ...prev,
        techStack: exists
          ? prev.techStack.filter((t) => t !== tech)
          : [...prev.techStack, tech],
      }
    })
    if (errors.techStack) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.techStack
        return next
      })
    }
  }

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  function validateStep(step: number): boolean {
    const newErrors: StepErrors = {}

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.'
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address.'
      }
      if (!formData.country.trim()) newErrors.country = 'Country is required.'
    }

    if (step === 2) {
      if (formData.resumeOrBrief === 'brief') {
        const wordCount = formData.brief.trim().split(/\s+/).filter(Boolean).length
        if (wordCount < 200) {
          newErrors.brief = `Brief must be at least 200 words. Currently ${wordCount} words.`
        }
      }
      if (!formData.experience.trim()) {
        newErrors.experience = 'Please describe your development experience.'
      }
      if (!formData.yearsExperience) {
        newErrors.yearsExperience = 'Please select your years of experience.'
      }
      if (formData.techStack.length === 0) {
        newErrors.techStack = 'Please select at least one technology.'
      }
    }

    if (step === 3) {
      if (!formData.trackApplied) newErrors.trackApplied = 'Please select a track.'
      if (formData.commitmentConfirmed === null) {
        newErrors.commitmentConfirmed = 'Please confirm your weekly availability.'
      }
      if (!formData.referralSource) {
        newErrors.referralSource = 'Please tell us how you heard about us.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToStep(step: number) {
    setCurrentStep(step)
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        country: formData.country,
        linkedin_url: formData.linkedinUrl || null,
        resume_url: formData.resumeFile ? formData.resumeFile.name : null,
        brief: formData.resumeOrBrief === 'brief' ? formData.brief : null,
        experience: formData.experience,
        years_experience: formData.yearsExperience,
        tech_stack: formData.techStack,
        track_applied: formData.trackApplied,
        commitment_confirmed: formData.commitmentConfirmed,
        referral_source: formData.referralSource,
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Submission failed. Please try again.')
      }

      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Progress indicator
  // -------------------------------------------------------------------------

  const progressValue = (currentStep / STEPS.length) * 100

  function StepIndicator() {
    return (
      <div className="mb-8 space-y-4">
        <Progress value={progressValue} />
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  currentStep >= step.number
                    ? 'bg-teal-500 text-white'
                    : 'bg-warm-200 text-navy-300'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  currentStep >= step.number ? 'text-navy-700' : 'text-navy-300'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Step 1 — Basic Info
  // -------------------------------------------------------------------------

  function StepBasicInfo() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-700">
            Basic Information
          </h2>
          <p className="mt-1 font-body text-sm text-navy-300">
            Tell us who you are. This helps us personalize your experience.
          </p>
        </div>

        <Input
          label="Full Name *"
          placeholder="e.g. Ada Lovelace"
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          error={errors.fullName}
        />

        <Input
          label="Email *"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
        />

        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />

        <Input
          label="Country *"
          placeholder="e.g. United States"
          value={formData.country}
          onChange={(e) => updateField('country', e.target.value)}
          error={errors.country}
        />

        <Input
          label="LinkedIn URL (optional)"
          type="url"
          placeholder="https://linkedin.com/in/yourprofile"
          value={formData.linkedinUrl}
          onChange={(e) => updateField('linkedinUrl', e.target.value)}
        />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Step 2 — Experience
  // -------------------------------------------------------------------------

  function StepExperience() {
    const wordCount = formData.brief.trim().split(/\s+/).filter(Boolean).length

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-700">
            Your Experience
          </h2>
          <p className="mt-1 font-body text-sm text-navy-300">
            Help us understand your background so we can place you in the right
            cohort.
          </p>
        </div>

        {/* Resume / Brief toggle */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-navy-700">
            Share your background
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateField('resumeOrBrief', 'resume')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                formData.resumeOrBrief === 'resume'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-warm-200 text-navy-500 hover:border-warm-300'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload Resume (PDF)
            </button>
            <button
              type="button"
              onClick={() => updateField('resumeOrBrief', 'brief')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                formData.resumeOrBrief === 'brief'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-warm-200 text-navy-500 hover:border-warm-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              Write a Brief
            </button>
          </div>

          {formData.resumeOrBrief === 'resume' ? (
            <div className="space-y-2">
              {/*
                TODO: Implement actual file upload to Supabase Storage.
                For now we capture the file in state but do not upload it.
                The upload logic will use supabase.storage.from('resumes').upload(...)
                and then store the returned public URL in the application record.
              */}
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-warm-300 bg-warm-50 p-4">
                <Upload className="h-5 w-5 text-navy-300" />
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      updateField('resumeFile', file)
                    }}
                    className="w-full text-sm text-navy-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-teal-600"
                  />
                </div>
              </div>
              {formData.resumeFile && (
                <p className="text-sm text-teal-600">
                  Selected: {formData.resumeFile.name}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <Textarea
                label="Write a brief about yourself (200-500 words)"
                placeholder="Tell us about your background, what you've built, and why you want to join Day Learning..."
                value={formData.brief}
                onChange={(e) => updateField('brief', e.target.value)}
                rows={8}
                error={errors.brief}
              />
              <div className="flex justify-end">
                <span
                  className={`text-xs ${
                    wordCount >= 200 && wordCount <= 500
                      ? 'text-teal-600'
                      : wordCount > 500
                      ? 'text-red-500 font-medium'
                      : 'text-navy-300'
                  }`}
                >
                  {wordCount} / 200-500 words
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Experience textarea */}
        <Textarea
          label="Tell us about your development/engineering experience *"
          placeholder="What have you built? What technologies have you worked with professionally or on personal projects?"
          value={formData.experience}
          onChange={(e) => updateField('experience', e.target.value)}
          rows={5}
          error={errors.experience}
        />

        {/* Years of experience */}
        <Select
          label="Years of experience *"
          value={formData.yearsExperience}
          onChange={(e) => updateField('yearsExperience', e.target.value)}
          placeholder="Select your experience level"
          error={errors.yearsExperience}
        >
          {YEARS_EXPERIENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        {/* Tech stack */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-navy-700">
            Primary tech stack * (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TECH_STACK_OPTIONS.map((tech) => (
              <Checkbox
                key={tech}
                label={tech}
                checked={formData.techStack.includes(tech)}
                onChange={() => toggleTechStack(tech)}
              />
            ))}
          </div>
          {errors.techStack && (
            <p className="text-sm text-red-500">{errors.techStack}</p>
          )}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Step 3 — Commitment
  // -------------------------------------------------------------------------

  function StepCommitment() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-700">
            Your Commitment
          </h2>
          <p className="mt-1 font-body text-sm text-navy-300">
            We want to make sure this program is the right fit for your schedule.
          </p>
        </div>

        {/* Track selection */}
        <Select
          label="Which track are you applying for? *"
          value={formData.trackApplied}
          onChange={(e) => updateField('trackApplied', e.target.value)}
          error={errors.trackApplied}
        >
          <option value="AI Engineer">AI Engineer</option>
        </Select>

        {/* Commitment question */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-navy-700">
            Can you commit 10-15 hours per week to this program? *
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateField('commitmentConfirmed', true)}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                formData.commitmentConfirmed === true
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-warm-200 text-navy-500 hover:border-warm-300'
              }`}
            >
              Yes, I can commit
            </button>
            <button
              type="button"
              onClick={() => updateField('commitmentConfirmed', false)}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                formData.commitmentConfirmed === false
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-warm-200 text-navy-500 hover:border-warm-300'
              }`}
            >
              Not at this time
            </button>
          </div>
          {errors.commitmentConfirmed && (
            <p className="text-sm text-red-500">{errors.commitmentConfirmed}</p>
          )}
        </div>

        {/* Referral source */}
        <Select
          label="How did you hear about Day Learning? *"
          value={formData.referralSource}
          onChange={(e) => updateField('referralSource', e.target.value)}
          placeholder="Select an option"
          error={errors.referralSource}
        >
          {REFERRAL_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </Select>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Step 4 — Review & Submit
  // -------------------------------------------------------------------------

  function ReviewRow({
    label,
    value,
    step,
  }: {
    label: string
    value: React.ReactNode
    step: number
  }) {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-warm-100 py-3 last:border-0">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-navy-300">
            {label}
          </p>
          <p className="mt-0.5 font-body text-sm text-navy-700">{value || '---'}</p>
        </div>
        <button
          type="button"
          onClick={() => goToStep(step)}
          className="shrink-0 rounded-lg p-1.5 text-navy-300 transition-colors hover:bg-warm-100 hover:text-teal-600"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  function StepReview() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-700">
            Review Your Application
          </h2>
          <p className="mt-1 font-body text-sm text-navy-300">
            Double-check everything looks good before submitting.
          </p>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Basic Info</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep(1)}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewRow label="Full Name" value={formData.fullName} step={1} />
            <ReviewRow label="Email" value={formData.email} step={1} />
            <ReviewRow label="Phone" value={formData.phone} step={1} />
            <ReviewRow label="Country" value={formData.country} step={1} />
            <ReviewRow label="LinkedIn" value={formData.linkedinUrl} step={1} />
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Experience</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep(2)}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.resumeOrBrief === 'resume' ? (
              <ReviewRow
                label="Resume"
                value={formData.resumeFile?.name || 'No file selected'}
                step={2}
              />
            ) : (
              <ReviewRow
                label="Brief"
                value={
                  formData.brief.length > 200
                    ? formData.brief.slice(0, 200) + '...'
                    : formData.brief
                }
                step={2}
              />
            )}
            <ReviewRow
              label="Development Experience"
              value={
                formData.experience.length > 200
                  ? formData.experience.slice(0, 200) + '...'
                  : formData.experience
              }
              step={2}
            />
            <ReviewRow
              label="Years of Experience"
              value={
                YEARS_EXPERIENCE_OPTIONS.find(
                  (o) => o.value === formData.yearsExperience
                )?.label
              }
              step={2}
            />
            <ReviewRow
              label="Tech Stack"
              value={formData.techStack.join(', ')}
              step={2}
            />
          </CardContent>
        </Card>

        {/* Commitment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Commitment</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep(3)}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewRow label="Track" value={formData.trackApplied} step={3} />
            <ReviewRow
              label="Can commit 10-15 hrs/week"
              value={
                formData.commitmentConfirmed === true
                  ? 'Yes'
                  : formData.commitmentConfirmed === false
                  ? 'No'
                  : '---'
              }
              step={3}
            />
            <ReviewRow
              label="How you heard about us"
              value={formData.referralSource}
              step={3}
            />
          </CardContent>
        </Card>

        {/* Submit error */}
        {errors.submit && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.submit}
          </div>
        )}
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Confirmation Screen
  // -------------------------------------------------------------------------

  function ConfirmationScreen() {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
          <CheckCircle2 className="h-10 w-10 text-teal-600" />
        </div>
        <h2 className="font-display text-3xl font-bold text-navy-700">
          Application Received!
        </h2>
        <p className="mt-3 max-w-md font-body text-navy-400">
          We&apos;ll review it within 48 hours. Check your email for updates on
          your application status.
        </p>
        <Button
          as="a"
          href="/"
          variant="primary"
          size="lg"
          className="mt-8"
        >
          Back to Home
        </Button>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo />
      case 2:
        return <StepExperience />
      case 3:
        return <StepCommitment />
      case 4:
        return <StepReview />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-warm-50">
      <PublicNav />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          {isSubmitted ? (
            <ConfirmationScreen />
          ) : (
            <>
              {/* Page title */}
              <div className="mb-8 text-center">
                <h1 className="font-display text-3xl font-bold text-navy-700 sm:text-4xl">
                  Apply to Day Learning
                </h1>
                <p className="mt-2 font-body text-navy-400">
                  Join the AI Engineer track and level up your career.
                </p>
              </div>

              {/* Progress */}
              <StepIndicator />

              {/* Form card */}
              <Card>
                <CardContent className="p-6 sm:p-8">
                  {renderStep()}

                  {/* Navigation buttons */}
                  <div className="mt-8 flex items-center justify-between border-t border-warm-100 pt-6">
                    {currentStep > 1 ? (
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        type="button"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 4 ? (
                      <Button
                        variant="primary"
                        onClick={handleNext}
                        type="button"
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        type="button"
                      >
                        Submit Application
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
