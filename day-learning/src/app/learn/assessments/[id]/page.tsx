'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ClipboardCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  RefreshCw,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDate } from '@/lib/utils'

type Assessment = {
  id: string
  module_id: string
  title: string
  instructions: string
  rubric: string | null
  order_index: number | null
}

type Submission = {
  id: string
  user_id: string
  assessment_id: string
  submission_url: string
  notes: string | null
  status: 'submitted' | 'under_review' | 'passed' | 'needs_revision'
  reviewer_id: string | null
  feedback: string | null
  reviewed_at: string | null
  submitted_at: string
}

type ModuleData = {
  id: string
  title: string
  order_index: number | null
}

const statusConfig: Record<
  string,
  { label: string; variant: string; icon: React.ElementType; color: string }
> = {
  submitted: {
    label: 'Submitted',
    variant: 'warning',
    icon: Clock,
    color: 'text-amber-400',
  },
  under_review: {
    label: 'Under Review',
    variant: 'warning',
    icon: Clock,
    color: 'text-amber-400',
  },
  passed: {
    label: 'Passed',
    variant: 'success',
    icon: CheckCircle2,
    color: 'text-emerald-400',
  },
  needs_revision: {
    label: 'Needs Revision',
    variant: 'destructive',
    icon: AlertTriangle,
    color: 'text-red-400',
  },
}

export default function AssessmentPage() {
  const params = useParams()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [moduleData, setModuleData] = useState<ModuleData | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [urlError, setUrlError] = useState('')

  // Resubmission mode
  const [resubmitting, setResubmitting] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Fetch assessment
      const { data: assessmentRaw, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      const assessmentData = assessmentRaw as any

      if (assessmentError || !assessmentData) {
        setLoading(false)
        return
      }

      setAssessment(assessmentData)

      // Fetch module info
      const { data: modData } = await supabase
        .from('modules')
        .select('id, title, order_index')
        .eq('id', assessmentData.module_id)
        .single()

      if (modData) setModuleData(modData)

      // Fetch existing submission (most recent)
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('assessment_id', assessmentId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()

      if (subData) setSubmission(subData as Submission)
    } catch (err) {
      console.error('Error fetching assessment:', err)
    } finally {
      setLoading(false)
    }
  }, [assessmentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setUrlError('Please enter a URL')
      return false
    }
    try {
      new URL(value)
      setUrlError('')
      return true
    } catch {
      setUrlError('Please enter a valid URL')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !assessmentId) return
    if (!validateUrl(url)) return

    setSubmitting(true)
    try {
      const { data, error } = await (supabase as any)
        .from('submissions')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          submission_url: url.trim(),
          notes: notes.trim() || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Submission error:', error)
      } else if (data) {
        setSubmission(data as Submission)
        setResubmitting(false)
      }
    } catch (err) {
      console.error('Error submitting:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResubmit = () => {
    setResubmitting(true)
    setUrl(submission?.submission_url ?? '')
    setNotes(submission?.notes ?? '')
  }

  // Render formatted text (instructions / rubric)
  const renderFormattedText = (content: string) => {
    const blocks = content.split(/\n\n+/)
    return blocks.map((block, i) => {
      const trimmed = block.trim()
      if (!trimmed) return null

      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={i}
            className="mt-6 mb-2 font-display text-lg font-semibold text-warm-50"
          >
            {trimmed.replace(/^### /, '')}
          </h3>
        )
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={i}
            className="mt-8 mb-3 font-display text-xl font-semibold text-warm-50"
          >
            {trimmed.replace(/^## /, '')}
          </h2>
        )
      }

      // Numbered list
      if (
        trimmed
          .split('\n')
          .every(
            (line: string) =>
              /^\d+\.\s/.test(line.trim()) || line.trim() === ''
          )
      ) {
        const items = trimmed
          .split('\n')
          .filter((line: string) => /^\d+\.\s/.test(line.trim()))
          .map((line: string) => line.trim().replace(/^\d+\.\s/, ''))
        return (
          <ol
            key={i}
            className="my-4 list-decimal space-y-1.5 pl-6 text-warm-300"
          >
            {items.map((item: string, j: number) => (
              <li key={j}>{item}</li>
            ))}
          </ol>
        )
      }

      // Bullet list
      if (
        trimmed
          .split('\n')
          .every(
            (line: string) =>
              line.trim().startsWith('- ') || line.trim() === ''
          )
      ) {
        const items = trimmed
          .split('\n')
          .filter((line: string) => line.trim().startsWith('- '))
          .map((line: string) => line.trim().replace(/^- /, ''))
        return (
          <ul
            key={i}
            className="my-4 list-disc space-y-1.5 pl-6 text-warm-300"
          >
            {items.map((item: string, j: number) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        )
      }

      // Code block
      if (
        trimmed.startsWith('```') &&
        trimmed.endsWith('```') &&
        trimmed.length > 6
      ) {
        const code = trimmed.slice(3, -3).replace(/^\w+\n/, '')
        return (
          <pre
            key={i}
            className="my-4 overflow-x-auto rounded-xl bg-navy-900 p-4 text-sm text-warm-200"
          >
            <code>{code.trim()}</code>
          </pre>
        )
      }

      return (
        <p key={i} className="my-3 leading-relaxed text-warm-300">
          {trimmed}
        </p>
      )
    })
  }

  const showSubmissionForm =
    (!submission && !resubmitting) || resubmitting
  const canResubmit = submission?.status === 'needs_revision'

  return (
    <DashboardLayout pageTitle={assessment?.title ?? 'Assessment'}>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Breadcrumb */}
        <div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 text-sm font-medium text-warm-400 hover:text-teal-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Learn
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4 bg-navy-700" />
            <Skeleton className="h-64 w-full rounded-2xl bg-navy-700" />
            <Skeleton className="h-48 w-full rounded-2xl bg-navy-700" />
          </div>
        ) : !assessment ? (
          <Card className="border-navy-600 bg-navy-700 text-warm-50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardCheck className="h-12 w-12 text-navy-500" />
              <h2 className="mt-4 font-display text-xl font-semibold text-warm-100">
                Assessment not found
              </h2>
              <p className="mt-2 text-sm text-warm-400">
                This assessment hasn&apos;t been published yet, or the link is
                invalid.
              </p>
              <Button
                as="a"
                href="/learn"
                variant="secondary"
                className="mt-6 bg-navy-600 text-warm-100 hover:bg-navy-500"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Learn
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Assessment header */}
            <div>
              {moduleData && (
                <p className="mb-1 text-sm font-medium text-warm-400">
                  Module {moduleData.order_index ?? ''}: {moduleData.title}
                </p>
              )}
              <h1 className="font-display text-2xl font-bold text-warm-50 sm:text-3xl">
                {assessment.title}
              </h1>
            </div>

            {/* Instructions */}
            <Card className="border-navy-600 bg-navy-700 text-warm-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warm-50">
                  <FileText className="h-5 w-5 text-teal-500" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>{renderFormattedText(assessment.instructions)}</div>
              </CardContent>
            </Card>

            {/* Rubric / Criteria */}
            {assessment.rubric && (
              <Card className="border-navy-600 bg-navy-700 text-warm-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warm-50">
                    <ClipboardCheck className="h-5 w-5 text-amber-500" />
                    Rubric &amp; Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>{renderFormattedText(assessment.rubric)}</div>
                </CardContent>
              </Card>
            )}

            {/* Existing submission status */}
            {submission && !resubmitting && (
              <Card className="border-navy-600 bg-navy-700 text-warm-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warm-50">
                    <Send className="h-5 w-5 text-teal-500" />
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-warm-400">Status:</span>
                    {(() => {
                      const config = statusConfig[submission.status]
                      const StatusIcon = config.icon
                      return (
                        <Badge
                          variant={
                            config.variant as
                              | 'default'
                              | 'secondary'
                              | 'success'
                              | 'warning'
                              | 'destructive'
                          }
                          className={cn(
                            'text-sm px-3 py-1',
                            submission.status === 'passed' &&
                              'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                            submission.status === 'needs_revision' &&
                              'bg-red-500/20 text-red-400 border-red-500/30',
                            (submission.status === 'submitted' ||
                              submission.status === 'under_review') &&
                              'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          )}
                        >
                          <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                          {config.label}
                        </Badge>
                      )
                    })()}
                  </div>

                  {/* Submitted URL */}
                  <div>
                    <span className="text-sm font-medium text-warm-300">
                      Submitted Link:
                    </span>
                    <a
                      href={submission.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 break-all"
                    >
                      {submission.submission_url}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>

                  {/* Notes */}
                  {submission.notes && (
                    <div>
                      <span className="text-sm font-medium text-warm-300">
                        Your Notes:
                      </span>
                      <p className="mt-1 text-sm text-warm-400">
                        {submission.notes}
                      </p>
                    </div>
                  )}

                  {/* Submitted at */}
                  <p className="text-xs text-warm-400">
                    Submitted on {formatDate(submission.submitted_at)}
                  </p>

                  {/* Reviewer feedback */}
                  {submission.feedback && (
                    <div className="mt-4 rounded-xl border border-navy-500 bg-navy-800 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-warm-100">
                          Reviewer Feedback
                        </span>
                        {submission.reviewed_at && (
                          <span className="text-xs text-warm-400">
                            -- {formatDate(submission.reviewed_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-warm-300">
                        {submission.feedback}
                      </p>
                    </div>
                  )}

                  {/* Resubmit button */}
                  {canResubmit && !resubmitting && (
                    <div className="pt-2">
                      <Button
                        onClick={handleResubmit}
                        variant="secondary"
                        className="bg-navy-600 text-warm-100 hover:bg-navy-500"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Resubmit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submission form */}
            {showSubmissionForm && (
              <Card className="border-navy-600 bg-navy-700 text-warm-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warm-50">
                    <Send className="h-5 w-5 text-teal-500" />
                    {resubmitting ? 'Resubmit Your Work' : 'Submit Your Work'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* URL Input */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="submission-url"
                        className="block text-sm font-medium text-warm-200"
                      >
                        Paste the link to what you built
                        <span className="text-warm-400">
                          {' '}
                          (GitHub repo, deployed app, etc.)
                        </span>
                      </label>
                      <input
                        id="submission-url"
                        type="url"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value)
                          if (urlError) validateUrl(e.target.value)
                        }}
                        placeholder="https://github.com/you/your-project"
                        className={cn(
                          'flex h-11 w-full rounded-xl border bg-navy-800 px-4 py-2 text-sm text-warm-100 placeholder:text-navy-400 transition-colors',
                          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
                          urlError
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-navy-500'
                        )}
                      />
                      {urlError && (
                        <p className="text-sm text-red-400">{urlError}</p>
                      )}
                    </div>

                    {/* Notes Textarea */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="submission-notes"
                        className="block text-sm font-medium text-warm-200"
                      >
                        Brief write-up of what you built and key decisions
                        <span className="text-warm-400"> (optional)</span>
                      </label>
                      <textarea
                        id="submission-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Describe your approach, architecture choices, what you learned..."
                        className="flex min-h-[100px] w-full resize-y rounded-xl border border-navy-500 bg-navy-800 px-4 py-3 text-sm text-warm-100 placeholder:text-navy-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    {/* Submit button */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        loading={submitting}
                        size="lg"
                        className="bg-teal-500 text-white hover:bg-teal-600"
                      >
                        <Send className="h-4 w-4" />
                        {resubmitting
                          ? 'Resubmit Assessment'
                          : 'Submit Assessment'}
                      </Button>
                      {resubmitting && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setResubmitting(false)}
                          className="text-warm-400 hover:text-warm-100 hover:bg-navy-600"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
