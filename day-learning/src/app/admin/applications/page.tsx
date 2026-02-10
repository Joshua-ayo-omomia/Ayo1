'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Brain,
  ExternalLink,
  Inbox,
} from 'lucide-react'
import type { Database } from '@/types/database'

type Application = Database['public']['Tables']['applications']['Row']

const aiDecisionConfig = {
  accept: { label: 'Accept', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  review: { label: 'Review', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  reject: { label: 'Reject', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  approved: { label: 'Approved', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [aiFilter, setAiFilter] = useState('all')
  const [search, setSearch] = useState('')

  const supabase = createClient()

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setApplications(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleAction = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    setActionLoading(id)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewed_by: user?.id ?? 'unknown',
        }),
      })

      if (res.ok) {
        const { data: updated } = await res.json()
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, ...updated } : app))
        )
        setExpandedId(null)
      }
    } catch (err) {
      console.error('Failed to update application:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Apply filters
  const filtered = applications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false
    if (aiFilter !== 'all' && app.ai_decision !== aiFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !app.full_name.toLowerCase().includes(q) &&
        !app.email.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-warm-50' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-400' },
          { label: 'Approved', value: counts.approved, color: 'text-emerald-400' },
          { label: 'Rejected', value: counts.rejected, color: 'text-red-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-navy-700 p-4 border border-navy-600"
          >
            <p className="text-sm text-warm-50/60">{stat.label}</p>
            <p className={cn('text-2xl font-bold font-display', stat.color)}>
              {loading ? '-' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-50/40" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={aiFilter}
          onChange={(e) => setAiFilter(e.target.value)}
          className="h-10 rounded-xl border border-navy-600 bg-navy-700 px-3 text-sm text-warm-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All AI Decisions</option>
          <option value="accept">AI: Accept</option>
          <option value="review">AI: Review</option>
          <option value="reject">AI: Reject</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl border border-navy-600 bg-navy-700">
        {/* Table Header */}
        <div className="hidden sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-navy-600 bg-navy-800 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-warm-50/60">
          <span>Name</span>
          <span>Email</span>
          <span>Date Applied</span>
          <span>AI Decision</span>
          <span>Confidence</span>
          <span>Status</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="divide-y divide-navy-600">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] sm:gap-4"
              >
                <Skeleton className="h-5 w-32 bg-navy-600" />
                <Skeleton className="h-5 w-40 bg-navy-600" />
                <Skeleton className="h-5 w-20 bg-navy-600" />
                <Skeleton className="h-5 w-16 bg-navy-600" />
                <Skeleton className="h-5 w-12 bg-navy-600" />
                <Skeleton className="h-5 w-16 bg-navy-600" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-warm-50/40">
            <Inbox className="mb-3 h-12 w-12" />
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm">
              {search || statusFilter !== 'all' || aiFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Applications will appear here once submitted.'}
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-navy-600">
            {filtered.map((app) => {
              const isExpanded = expandedId === app.id
              return (
                <div key={app.id}>
                  {/* Row */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : app.id)
                    }
                    className="w-full text-left grid grid-cols-1 gap-2 px-4 py-4 transition-colors hover:bg-navy-600/50 sm:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] sm:items-center sm:gap-4"
                  >
                    <span className="font-medium text-warm-50">
                      {app.full_name}
                    </span>
                    <span className="text-sm text-warm-50/70 truncate">
                      {app.email}
                    </span>
                    <span className="text-sm text-warm-50/60">
                      {formatDate(app.created_at)}
                    </span>
                    <span>
                      {app.ai_decision ? (
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            aiDecisionConfig[app.ai_decision].className
                          )}
                        >
                          {aiDecisionConfig[app.ai_decision].label}
                        </span>
                      ) : (
                        <span className="text-sm text-warm-50/40">--</span>
                      )}
                    </span>
                    <span className="text-sm text-warm-50/70">
                      {app.ai_confidence != null
                        ? `${Math.round(app.ai_confidence * 100)}%`
                        : '--'}
                    </span>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          statusConfig[app.status].className
                        )}
                      >
                        {statusConfig[app.status].label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-warm-50/40 sm:ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-warm-50/40 sm:ml-2" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-navy-600 bg-navy-800 px-4 py-6 sm:px-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left: Application Info */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-50/60">
                            Application Details
                          </h4>
                          <div className="grid gap-3 text-sm">
                            <DetailRow label="Full Name" value={app.full_name} />
                            <DetailRow label="Email" value={app.email} />
                            <DetailRow label="Phone" value={app.phone} />
                            <DetailRow label="Country" value={app.country} />
                            <DetailRow
                              label="Track Applied"
                              value={app.track_applied}
                            />
                            <DetailRow
                              label="Experience"
                              value={app.years_experience}
                            />
                            <DetailRow
                              label="Tech Stack"
                              value={app.tech_stack?.join(', ')}
                            />
                            <DetailRow
                              label="Commitment"
                              value={
                                app.commitment_confirmed ? 'Confirmed' : 'Not confirmed'
                              }
                            />
                            <DetailRow
                              label="Referral"
                              value={app.referral_source}
                            />
                            {app.linkedin_url && (
                              <DetailRow
                                label="LinkedIn"
                                value={
                                  <a
                                    href={app.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300"
                                  >
                                    View Profile
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                }
                              />
                            )}
                            {app.resume_url && (
                              <DetailRow
                                label="Resume"
                                value={
                                  <a
                                    href={app.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300"
                                  >
                                    View Resume
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                }
                              />
                            )}
                          </div>
                          {app.brief && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-warm-50/60 mb-1">
                                Personal Brief
                              </p>
                              <p className="text-sm text-warm-50/80 whitespace-pre-wrap rounded-lg bg-navy-700 p-3">
                                {app.brief}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right: AI Analysis */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-warm-50/60">
                            <Brain className="h-4 w-4" />
                            AI Analysis
                          </h4>

                          {app.ai_decision ? (
                            <>
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium',
                                    aiDecisionConfig[app.ai_decision].className
                                  )}
                                >
                                  {aiDecisionConfig[app.ai_decision].label}
                                </span>
                                <span className="text-sm text-warm-50/60">
                                  Confidence:{' '}
                                  <span className="font-medium text-warm-50">
                                    {app.ai_confidence != null
                                      ? `${Math.round(app.ai_confidence * 100)}%`
                                      : 'N/A'}
                                  </span>
                                </span>
                                {app.ai_experience_level && (
                                  <span className="text-sm text-warm-50/60">
                                    Level:{' '}
                                    <span className="font-medium text-warm-50 capitalize">
                                      {app.ai_experience_level}
                                    </span>
                                  </span>
                                )}
                              </div>

                              {app.ai_reasoning && (
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-warm-50/60 mb-1">
                                    Reasoning
                                  </p>
                                  <p className="text-sm text-warm-50/80 whitespace-pre-wrap rounded-lg bg-navy-700 p-3">
                                    {app.ai_reasoning}
                                  </p>
                                </div>
                              )}

                              {app.ai_strengths &&
                                app.ai_strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-warm-50/60 mb-2">
                                      Strengths
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {app.ai_strengths.map((s, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400"
                                        >
                                          <CheckCircle2 className="mr-1 h-3 w-3" />
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {app.ai_concerns &&
                                app.ai_concerns.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-warm-50/60 mb-2">
                                      Concerns
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {app.ai_concerns.map((c, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400"
                                        >
                                          <AlertTriangle className="mr-1 h-3 w-3" />
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </>
                          ) : (
                            <p className="text-sm text-warm-50/40">
                              No AI analysis available for this application.
                            </p>
                          )}

                          {/* Action Buttons */}
                          {app.status === 'pending' && (
                            <div className="flex gap-3 pt-4 border-t border-navy-600">
                              <Button
                                onClick={() => handleAction(app.id, 'approved')}
                                loading={actionLoading === app.id}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                onClick={() =>
                                  handleAction(app.id, 'rejected')
                                }
                                loading={actionLoading === app.id}
                                className="bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {app.status !== 'pending' && (
                            <div className="pt-4 border-t border-navy-600 text-sm text-warm-50/60">
                              <p>
                                Reviewed{' '}
                                {app.reviewed_at
                                  ? formatDate(app.reviewed_at)
                                  : ''}
                              </p>
                            </div>
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
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <span className="w-28 shrink-0 text-warm-50/50">{label}</span>
      <span className="text-warm-50/90">{value}</span>
    </div>
  )
}
