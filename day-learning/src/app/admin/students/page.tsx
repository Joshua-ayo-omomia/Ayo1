'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  BookOpen,
  Calendar,
  FileCheck,
  Users,
} from 'lucide-react'

interface StudentData {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
  enrollment: {
    track_id: string
    track_title: string
    enrolled_at: string
    status: string
  } | null
  totalLessons: number
  completedLessons: number
  currentModule: string | null
  submissions: {
    id: string
    assessment_title: string
    status: string
    submitted_at: string
  }[]
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  const fetchStudents = useCallback(async () => {
    setLoading(true)

    // Fetch student profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (profilesError || !profiles) {
      setLoading(false)
      return
    }

    // Fetch enrollments with track info
    const { data: enrollmentsRaw } = await supabase
      .from('enrollments')
      .select('user_id, track_id, enrolled_at, status')
    const enrollments = enrollmentsRaw as any[] | null

    // Fetch tracks for titles
    const { data: tracks } = await supabase.from('tracks').select('id, title')
    const trackMap = new Map<string, string>(tracks?.map((t: any) => [t.id, t.title]) ?? [])

    // Fetch all lesson progress
    const { data: lessonProgressRaw } = await supabase
      .from('lesson_progress')
      .select('user_id, lesson_id, completed')
    const lessonProgress = lessonProgressRaw as any[] | null

    // Fetch lessons with module info for progress calculation
    const { data: lessonsRaw } = await supabase
      .from('lessons')
      .select('id, module_id')
    const lessons = lessonsRaw as any[] | null
    const { data: modulesRaw } = await supabase
      .from('modules')
      .select('id, title, track_id, order_index')
      .order('order_index', { ascending: true })
    const modules = modulesRaw as any[] | null

    // Fetch submissions with assessment info
    const { data: submissionsRaw } = await supabase
      .from('submissions')
      .select('id, user_id, assessment_id, status, submitted_at')
    const submissions = submissionsRaw as any[] | null
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, title')
    const assessmentMap = new Map<string, string>(
      assessments?.map((a: any) => [a.id, a.title]) ?? []
    )

    // Build student data
    const studentData: StudentData[] = profiles.map((profile: any) => {
      // Get enrollment
      const enrollment = enrollments?.find((e: any) => e.user_id === profile.id)
      const trackTitle = enrollment
        ? trackMap.get(enrollment.track_id) ?? 'Unknown Track'
        : null

      // Calculate progress - get lessons for the enrolled track
      const trackModules = modules?.filter(
        (m: any) => m.track_id === enrollment?.track_id
      ) ?? []
      const trackModuleIds = new Set(trackModules.map((m: any) => m.id))
      const trackLessons = lessons?.filter((l: any) =>
        trackModuleIds.has(l.module_id)
      ) ?? []
      const trackLessonIds = new Set(trackLessons.map((l: any) => l.id))

      const userProgress = lessonProgress?.filter(
        (lp: any) => lp.user_id === profile.id && trackLessonIds.has(lp.lesson_id)
      ) ?? []
      const completedLessons = userProgress.filter((lp: any) => lp.completed).length
      const totalLessons = trackLessons.length

      // Determine current module (first module with incomplete lessons)
      let currentModule: string | null = null
      for (const mod of trackModules) {
        const modLessons = trackLessons.filter((l: any) => l.module_id === mod.id)
        const modCompleted = modLessons.filter((l: any) =>
          userProgress.some((lp: any) => lp.lesson_id === l.id && lp.completed)
        )
        if (modCompleted.length < modLessons.length) {
          currentModule = mod.title
          break
        }
      }

      // Get user submissions
      const userSubmissions = (submissions ?? [])
        .filter((s: any) => s.user_id === profile.id)
        .map((s: any) => ({
          id: s.id,
          assessment_title: assessmentMap.get(s.assessment_id) ?? 'Unknown',
          status: s.status,
          submitted_at: s.submitted_at,
        }))

      return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        enrollment: enrollment
          ? {
              track_id: enrollment.track_id,
              track_title: trackTitle!,
              enrolled_at: enrollment.enrolled_at,
              status: enrollment.status,
            }
          : null,
        totalLessons,
        completedLessons,
        currentModule,
        submissions: userSubmissions,
      }
    })

    setStudents(studentData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const filtered = students.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    )
  })

  const submissionStatusConfig: Record<
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

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-warm-50/60">
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">
            {loading ? '...' : `${students.length} enrolled students`}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-50/40" />
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-navy-600 bg-navy-700 pl-10 pr-3 text-sm text-warm-50 placeholder:text-warm-50/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-navy-600 bg-navy-700 p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-navy-600" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-28 bg-navy-600" />
                  <Skeleton className="h-3 w-36 bg-navy-600" />
                </div>
              </div>
              <Skeleton className="h-3 w-full bg-navy-600" />
              <Skeleton className="h-2.5 w-full rounded-full bg-navy-600" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-warm-50/40">
          <GraduationCap className="mb-3 h-12 w-12" />
          <p className="text-lg font-medium">No students found</p>
          <p className="text-sm">
            {search
              ? 'Try adjusting your search.'
              : 'Students will appear here once enrolled.'}
          </p>
        </div>
      )}

      {/* Student Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((student) => {
            const isExpanded = expandedId === student.id
            const progressPercent =
              student.totalLessons > 0
                ? Math.round(
                    (student.completedLessons / student.totalLessons) * 100
                  )
                : 0

            return (
              <div
                key={student.id}
                className={cn(
                  'rounded-xl border border-navy-600 bg-navy-700 transition-all duration-200',
                  isExpanded && 'sm:col-span-2 lg:col-span-3'
                )}
              >
                {/* Card Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : student.id)
                  }
                  className="w-full text-left p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={student.full_name ?? ''}
                        src={student.avatar_url}
                        size="md"
                        className="bg-teal-500/20 text-teal-400"
                      />
                      <div>
                        <p className="font-medium text-warm-50">
                          {student.full_name ?? 'Unnamed'}
                        </p>
                        <p className="text-sm text-warm-50/60">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-warm-50/40" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-warm-50/40" />
                    )}
                  </div>

                  {student.enrollment && (
                    <div className="flex items-center gap-2 text-sm text-warm-50/60">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>{student.enrollment.track_title}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-warm-50/60">Progress</span>
                      <span className="font-medium text-warm-50">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-navy-600">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {student.currentModule && (
                    <div className="flex items-center gap-2 text-xs text-warm-50/50">
                      <BookOpen className="h-3 w-3" />
                      <span>Current: {student.currentModule}</span>
                    </div>
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-navy-600 bg-navy-800 p-5 sm:p-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Profile & Enrollment Info */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-50/60">
                          Profile Information
                        </h4>
                        <div className="grid gap-2 text-sm">
                          <div className="flex gap-3">
                            <span className="w-28 shrink-0 text-warm-50/50">
                              Name
                            </span>
                            <span className="text-warm-50/90">
                              {student.full_name}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="w-28 shrink-0 text-warm-50/50">
                              Email
                            </span>
                            <span className="text-warm-50/90">
                              {student.email}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="w-28 shrink-0 text-warm-50/50">
                              Joined
                            </span>
                            <span className="text-warm-50/90">
                              {formatDate(student.created_at)}
                            </span>
                          </div>
                          {student.enrollment && (
                            <>
                              <div className="flex gap-3">
                                <span className="w-28 shrink-0 text-warm-50/50">
                                  Track
                                </span>
                                <span className="text-warm-50/90">
                                  {student.enrollment.track_title}
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <span className="w-28 shrink-0 text-warm-50/50">
                                  Enrolled
                                </span>
                                <span className="text-warm-50/90">
                                  {formatDate(student.enrollment.enrolled_at)}
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <span className="w-28 shrink-0 text-warm-50/50">
                                  Status
                                </span>
                                <span className="text-warm-50/90 capitalize">
                                  {student.enrollment.status}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex gap-3">
                            <span className="w-28 shrink-0 text-warm-50/50">
                              Lessons
                            </span>
                            <span className="text-warm-50/90">
                              {student.completedLessons} / {student.totalLessons}{' '}
                              completed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Submissions */}
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-warm-50/60">
                          <FileCheck className="h-4 w-4" />
                          Assessment Submissions
                        </h4>
                        {student.submissions.length > 0 ? (
                          <div className="space-y-2">
                            {student.submissions.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between rounded-lg bg-navy-700 p-3"
                              >
                                <div>
                                  <p className="text-sm font-medium text-warm-50">
                                    {sub.assessment_title}
                                  </p>
                                  <p className="text-xs text-warm-50/50">
                                    {formatDate(sub.submitted_at)}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                    submissionStatusConfig[sub.status]
                                      ?.className ??
                                      'bg-navy-600 text-warm-50/60 border-navy-500'
                                  )}
                                >
                                  {submissionStatusConfig[sub.status]
                                    ?.label ?? sub.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-warm-50/40">
                            No submissions yet.
                          </p>
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
