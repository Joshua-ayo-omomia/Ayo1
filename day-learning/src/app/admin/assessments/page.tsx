'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  ClipboardCheck,
  MessageSquare,
  Inbox,
} from 'lucide-react'

interface SubmissionData {
  id: string
  user_id: string
  assessment_id: string
  submission_url: string
  notes: string | null
  status: 'submitted' | 'under_review' | 'passed' | 'needs_revision'
  feedback: string | null
  reviewer_id: string | null
  reviewed_at: string | null
  submitted_at: string
  student_name: string | null
  student_email: string | null
  student_avatar: string | null
  assessment_title: string
  assessment_instructions: string
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  submitted: {
    label: 'Submitted',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  passed: {
    label: 'Passed',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  needs_revision: {
    label: 'Needs Revision',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
}

export default function AssessmentsPage() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [feedbackErrors, setFeedbackErrors] = useState<Record<string, boolean>>(
    {}
  )

  const supabase = createClient()

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)

    const { data: subs } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false })

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')

    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, title, instructions')

    const profileMap = new Map<string, any>(profiles?.map((p: any) => [p.id, p]) ?? [])
    const assessmentMap = new Map<string, any>(assessments?.map((a: any) => [a.id, a]) ?? [])

    const submissionData: SubmissionData[] = (subs ?? []).map((s: any) => {
      const profile = profileMap.get(s.user_id)
      const assessment = assessmentMap.get(s.assessment_id)

      return {
        ...s,
        student_name: profile?.full_name ?? null,
        student_email: profile?.email ?? null,
        student_avatar: profile?.avatar_url ?? null,
        assessment_title: assessment?.title ?? 'Unknown Assessment',
        assessment_instructions: assessment?.instructions ?? '',
      }
    })

    setSubmissions(submissionData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const handleReview = async (
    id: string,
    status: 'passed' | 'needs_revision'
  ) => {
    const feedbackText = feedback[id]?.trim()
    if (!feedbackText) {
      setFeedbackErrors((prev) => ({ ...prev, [id]: true }))
      return
    }

    setFeedbackErrors((prev) => ({ ...prev, [id]: false }))
    setActionLoading(id)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          feedback: feedbackText,
          reviewer_id: user?.id ?? 'unknown',
        }),
      })

      if (res.ok) {
        const { data: updated } = await res.json()
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
        )
        setFeedback((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        setExpandedId(null)
      }
    } catch (err) {
      console.error('Failed to submit review:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !(s.student_name?.toLowerCase().includes(q) ?? false) &&
        !s.assessment_title.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const counts = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === 'submitted').length,
    under_review: submissions.filter((s) => s.status === 'under_review').length,
    passed: submissions.filter((s) => s.status === 'passed').length,
    needs_revision: submissions.filter((s) => s.status === 'needs_revision')
      .length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Total', value: counts.total, color: 'text-warm-50' },
          { label: 'Submitted', value: counts.submitted, color: 'text-blue-400' },
          {
            label: 'Under Review',
            value: counts.under_review,
            color: 'text-amber-400',
          },
          { label: 'Passed', value: counts.passed, color: 'text-emerald-400' },
          {
            label: 'Needs Revision',
            value: counts.needs_revision,
            color: 'text-red-400',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-navy-700 p-4 border border-navy-600"
          >
            <p className="text-xs text-warm-50/60">{stat.label}</p>
            <p className={cn('text-2xl font-bold font-display', stat.color)}>
              {loading ? '-' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-50/40" />
            <input
              type="text"
              placeholder="Search by student or assessment name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-navy-600 bg-navy-700 pl-10 pr-3 text-sm text-warm-50 placeholder:text-warm-50/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-navy-600 bg-navy-700 px-3 text-sm text-warm-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="passed">Passed</option>
          <option value="needs_revision">Needs Revision</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-navy-600 bg-navy-700 p-5"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full bg-navy-600" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 bg-navy-600" />
                  <Skeleton className="h-3 w-32 bg-navy-600" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full bg-navy-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-warm-50/40">
          <Inbox className="mb-3 h-12 w-12" />
          <p className="text-lg font-medium">No submissions found</p>
          <p className="text-sm">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Submissions will appear here once students submit assessments.'}
          </p>
        </div>
      )}

      {/* Submission Cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const isExpanded = expandedId === sub.id
            const isReviewable =
              sub.status === 'submitted' || sub.status === 'under_review'

            return (
              <div
                key={sub.id}
                className="rounded-xl border border-navy-600 bg-navy-700 overflow-hidden"
              >
                {/* Submission Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : sub.id)
                  }
                  className="w-full text-left flex items-center gap-4 p-5 transition-colors hover:bg-navy-600/50"
                >
                  <Avatar
                    name={sub.student_name ?? ''}
                    src={sub.student_avatar}
                    size="md"
                    className="bg-teal-500/20 text-teal-400 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-warm-50 truncate">
                      {sub.student_name ?? 'Unknown Student'}
                    </p>
                    <p className="text-sm text-warm-50/60 truncate">
                      {sub.assessment_title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-warm-50/50 hidden sm:inline">
                      {formatDate(sub.submitted_at)}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        statusConfig[sub.status]?.className
                      )}
                    >
                      {statusConfig[sub.status]?.label}
                    </span>
                    <a
                      href={sub.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-lg bg-navy-600 px-2.5 py-1.5 text-xs font-medium text-teal-400 hover:bg-navy-500 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </a>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-warm-50/40" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-warm-50/40" />
                    )}
                  </div>
                </button>

                {/* Expanded Review Panel */}
                {isExpanded && (
                  <div className="border-t border-navy-600 bg-navy-800 p-5 sm:p-6 space-y-5">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Left: Submission Details */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-50/60">
                          Submission Details
                        </h4>
                        <div className="grid gap-2 text-sm">
                          <div className="flex gap-3">
                            <span className="w-28 shrink-0 text-warm-50/50">
                              Student
                            </span>
                            <span className="text-warm-50/90">
                              {sub.student_name} ({sub.student_email})
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="w-28 shrink-0 text-warm-50/50">
                              Assessment
                            </span>
                            <span className="text-warm-50/90">
                              {sub.assessment_title}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="w-28 shrink-0 text-warm-50/50">
                              Submitted
                            </span>
                            <span className="text-warm-50/90">
                              {formatDate(sub.submitted_at)}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="w-28 shrink-0 text-warm-50/50">
                              Link
                            </span>
                            <a
                              href={sub.submission_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 break-all"
                            >
                              {sub.submission_url}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        </div>

                        {sub.notes && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-warm-50/60 mb-1">
                              Student Notes
                            </p>
                            <div className="whitespace-pre-wrap rounded-lg bg-navy-700 p-3 text-sm text-warm-50/80">
                              {sub.notes}
                            </div>
                          </div>
                        )}

                        {sub.assessment_instructions && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-warm-50/60 mb-1">
                              Assessment Instructions
                            </p>
                            <div className="whitespace-pre-wrap rounded-lg bg-navy-700 p-3 text-sm text-warm-50/60">
                              {sub.assessment_instructions}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Review Form or Previous Feedback */}
                      <div className="space-y-4">
                        {isReviewable ? (
                          <>
                            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-warm-50/60">
                              <ClipboardCheck className="h-4 w-4" />
                              Review
                            </h4>

                            {/* Feedback Textarea */}
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-warm-50/70">
                                Feedback <span className="text-red-400">*</span>
                              </label>
                              <textarea
                                value={feedback[sub.id] ?? ''}
                                onChange={(e) =>
                                  setFeedback((prev) => ({
                                    ...prev,
                                    [sub.id]: e.target.value,
                                  }))
                                }
                                placeholder="Provide detailed feedback for the student..."
                                rows={5}
                                className={cn(
                                  'w-full rounded-xl border bg-navy-700 px-3 py-2 text-sm text-warm-50 placeholder:text-warm-50/40 resize-y focus:outline-none focus:ring-2 focus:ring-teal-500',
                                  feedbackErrors[sub.id]
                                    ? 'border-red-500'
                                    : 'border-navy-600'
                                )}
                              />
                              {feedbackErrors[sub.id] && (
                                <p className="text-xs text-red-400">
                                  Feedback is required before submitting a review.
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                              <Button
                                onClick={() => handleReview(sub.id, 'passed')}
                                loading={actionLoading === sub.id}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Pass
                              </Button>
                              <Button
                                onClick={() =>
                                  handleReview(sub.id, 'needs_revision')
                                }
                                loading={actionLoading === sub.id}
                                className="bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Needs Revision
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-warm-50/60">
                              <MessageSquare className="h-4 w-4" />
                              Review Result
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                    statusConfig[sub.status]?.className
                                  )}
                                >
                                  {statusConfig[sub.status]?.label}
                                </span>
                                {sub.reviewed_at && (
                                  <span className="text-xs text-warm-50/50">
                                    on {formatDate(sub.reviewed_at)}
                                  </span>
                                )}
                              </div>
                              {sub.feedback && (
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-warm-50/60 mb-1">
                                    Feedback
                                  </p>
                                  <div className="whitespace-pre-wrap rounded-lg bg-navy-700 p-3 text-sm text-warm-50/80">
                                    {sub.feedback}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
