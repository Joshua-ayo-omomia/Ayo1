'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  ClipboardCheck,
  Megaphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { AI_ENGINEER_CURRICULUM } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'

type LessonProgressRow = {
  id: string
  lesson_id: string
  completed: boolean
}

type SubmissionRow = {
  id: string
  assessment_id: string
  status: 'submitted' | 'under_review' | 'passed' | 'needs_revision'
}

type AnnouncementRow = {
  id: string
  title: string
  body: string
  link: string | null
  created_at: string
}

type DbLesson = {
  id: string
  module_id: string
  title: string
  order_index: number | null
}

type DbModule = {
  id: string
  title: string
  order_index: number | null
}

type DbAssessment = {
  id: string
  module_id: string
  title: string
}

export default function LearnPage() {
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null)
  const [lessonProgress, setLessonProgress] = useState<LessonProgressRow[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([])
  const [dbModules, setDbModules] = useState<DbModule[]>([])
  const [dbLessons, setDbLessons] = useState<DbLesson[]>([])
  const [dbAssessments, setDbAssessments] = useState<DbAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<number[]>([])

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const sb = supabase as any

      const profileRes = await sb.from('profiles').select('full_name').eq('id', user.id).single()
      const progressRes = await sb.from('lesson_progress').select('id, lesson_id, completed').eq('user_id', user.id).eq('completed', true)
      const submissionsRes = await sb.from('submissions').select('id, assessment_id, status').eq('user_id', user.id)
      const announcementsRes = await sb.from('announcements').select('*').order('created_at', { ascending: false }).limit(5)
      const modulesRes = await sb.from('modules').select('id, title, order_index').order('order_index')
      const lessonsRes = await sb.from('lessons').select('id, module_id, title, order_index').order('order_index')
      const assessmentsRes = await sb.from('assessments').select('id, module_id, title')

      if (profileRes.data) setProfile(profileRes.data)
      if (progressRes.data) setLessonProgress(progressRes.data)
      if (submissionsRes.data) setSubmissions(submissionsRes.data as SubmissionRow[])
      if (announcementsRes.data) setAnnouncements(announcementsRes.data)
      if (modulesRes.data) setDbModules(modulesRes.data)
      if (lessonsRes.data) setDbLessons(lessonsRes.data)
      if (assessmentsRes.data) setDbAssessments(assessmentsRes.data)
    } catch (err) {
      console.error('Error fetching learn data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Map DB lessons to modules for progress tracking
  const getModuleLessons = (moduleIndex: number) => {
    const dbMod = dbModules[moduleIndex]
    if (dbMod) {
      return dbLessons.filter((l) => l.module_id === dbMod.id)
    }
    return []
  }

  const getModuleAssessment = (moduleIndex: number) => {
    const dbMod = dbModules[moduleIndex]
    if (dbMod) {
      return dbAssessments.find((a) => a.module_id === dbMod.id)
    }
    return null
  }

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some((lp) => lp.lesson_id === lessonId && lp.completed)
  }

  const getModuleCompletedCount = (moduleIndex: number): number => {
    const lessons = getModuleLessons(moduleIndex)
    return lessons.filter((l) => isLessonCompleted(l.id)).length
  }

  const getModuleTotalLessons = (moduleIndex: number): number => {
    const dbLessonsList = getModuleLessons(moduleIndex)
    if (dbLessonsList.length > 0) return dbLessonsList.length
    return AI_ENGINEER_CURRICULUM[moduleIndex]?.lessons.length ?? 0
  }

  const totalLessons = AI_ENGINEER_CURRICULUM.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedLessons = lessonProgress.length
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const getAssessmentStatus = (moduleIndex: number): string => {
    const assessment = getModuleAssessment(moduleIndex)
    if (!assessment) return 'Not started'
    const sub = submissions.find((s) => s.assessment_id === assessment.id)
    if (!sub) return 'Not started'
    const statusMap: Record<string, string> = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      passed: 'Passed',
      needs_revision: 'Needs Revision',
    }
    return statusMap[sub.status] || 'Not started'
  }

  const getAssessmentBadgeVariant = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'success'
      case 'Under Review':
      case 'Submitted':
        return 'warning'
      case 'Needs Revision':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getModuleStatus = (moduleIndex: number) => {
    const completed = getModuleCompletedCount(moduleIndex)
    const total = getModuleTotalLessons(moduleIndex)
    if (completed === 0) return 'Start'
    if (completed >= total) return 'Completed'
    return 'Continue'
  }

  const getModuleStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success'
      case 'Continue':
        return 'default'
      default:
        return 'secondary'
    }
  }

  // Find the next incomplete lesson for "Continue Learning"
  const findNextLesson = (): string | null => {
    for (let mi = 0; mi < dbModules.length; mi++) {
      const lessons = getModuleLessons(mi)
      for (const lesson of lessons) {
        if (!isLessonCompleted(lesson.id)) {
          return lesson.id
        }
      }
    }
    // Fallback: first lesson from DB
    if (dbLessons.length > 0) return dbLessons[0].id
    return null
  }

  const toggleModule = (index: number) => {
    setExpandedModules((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Learner'
  const nextLessonId = findNextLesson()

  return (
    <DashboardLayout pageTitle="Learn">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Welcome + Current Track */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-72 bg-navy-700" />
            <Skeleton className="h-44 w-full rounded-2xl bg-navy-700" />
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-display text-3xl font-bold text-warm-50">
                Welcome back, {firstName}
              </h1>
              <p className="mt-1 text-warm-400">
                Pick up where you left off. Consistency beats intensity.
              </p>
            </div>

            {/* Current Track Card */}
            <Card className="border-navy-600 bg-navy-700 text-warm-50">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium uppercase tracking-wider text-amber-500">
                      Current Track
                    </span>
                  </div>
                  <CardTitle className="font-display text-2xl text-warm-50">
                    AI Engineer
                  </CardTitle>
                  <p className="text-sm text-warm-400">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
                {nextLessonId ? (
                  <Button as="a" href={`/learn/lessons/${nextLessonId}`} size="lg">
                    <PlayCircle className="h-5 w-5" />
                    Continue Learning
                  </Button>
                ) : completedLessons > 0 ? (
                  <Badge
                    variant="success"
                    className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-1.5 text-sm"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    All Lessons Complete
                  </Badge>
                ) : (
                  <Button as="a" href="#modules" variant="secondary" size="lg">
                    Get Started
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Progress
                  value={overallProgress}
                  showValue
                  className="[&_span]:text-warm-400 [&_[role=progressbar]]:bg-navy-600"
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Module Overview */}
        <section id="modules" className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-warm-50">
            Modules
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl bg-navy-700" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {AI_ENGINEER_CURRICULUM.map((mod, mi) => {
                const status = getModuleStatus(mi)
                const completed = getModuleCompletedCount(mi)
                const total = getModuleTotalLessons(mi)
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                const expanded = expandedModules.includes(mi)
                const moduleLessonsDb = getModuleLessons(mi)
                const assessmentStatus = getAssessmentStatus(mi)
                const assessment = getModuleAssessment(mi)

                return (
                  <Card
                    key={mi}
                    className="overflow-hidden border-navy-600 bg-navy-700 text-warm-50"
                  >
                    {/* Module header -- clickable */}
                    <button
                      onClick={() => toggleModule(mi)}
                      className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-navy-600/50"
                    >
                      {/* Module number circle */}
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold',
                          status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : status === 'Continue'
                              ? 'bg-teal-500/20 text-teal-400'
                              : 'bg-navy-600 text-warm-400'
                        )}
                      >
                        {status === 'Completed' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          mod.module
                        )}
                      </div>

                      {/* Title + meta */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-base font-semibold text-warm-50 truncate">
                            {mod.title}
                          </h3>
                          <Badge
                            variant={getModuleStatusVariant(status) as 'default' | 'secondary' | 'success' | 'warning' | 'destructive'}
                            className={cn(
                              'shrink-0 text-xs',
                              status === 'Completed' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                              status === 'Continue' && 'bg-teal-500/20 text-teal-400 border-teal-500/30',
                              status === 'Start' && 'bg-navy-600 text-warm-400 border-navy-500'
                            )}
                          >
                            {status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-warm-400">{mod.description}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex-1 max-w-xs">
                            <Progress
                              value={progress}
                              className="[&_[role=progressbar]]:bg-navy-600 [&_[role=progressbar]]:h-1.5 h-1.5"
                            />
                          </div>
                          <span className="text-xs text-warm-400">
                            {completed}/{total} lessons
                          </span>
                        </div>
                      </div>

                      {/* Expand chevron */}
                      <div className="shrink-0 text-warm-400">
                        {expanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </button>

                    {/* Expanded lesson list */}
                    {expanded && (
                      <div className="border-t border-navy-600 bg-navy-800/50 px-5 py-3">
                        <ul className="space-y-1">
                          {moduleLessonsDb.length > 0
                            ? moduleLessonsDb.map((lesson) => {
                                const done = isLessonCompleted(lesson.id)
                                return (
                                  <li key={lesson.id}>
                                    <Link
                                      href={`/learn/lessons/${lesson.id}`}
                                      className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-navy-700',
                                        done ? 'text-warm-400' : 'text-warm-100'
                                      )}
                                    >
                                      {done ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                                      ) : (
                                        <Circle className="h-4 w-4 shrink-0 text-warm-400" />
                                      )}
                                      <span className={cn(done && 'line-through opacity-70')}>
                                        {lesson.title}
                                      </span>
                                    </Link>
                                  </li>
                                )
                              })
                            : mod.lessons.map((lesson, li) => (
                                <li key={li}>
                                  <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-warm-300">
                                    <Circle className="h-4 w-4 shrink-0 text-warm-400" />
                                    <span>{lesson.title}</span>
                                    <Badge
                                      variant="secondary"
                                      className="ml-auto bg-navy-600 text-warm-400 border-navy-500 text-[10px]"
                                    >
                                      {lesson.type === 'video' ? (
                                        <PlayCircle className="mr-1 h-3 w-3" />
                                      ) : lesson.type === 'video + reading' ? (
                                        <BookOpen className="mr-1 h-3 w-3" />
                                      ) : (
                                        <FileText className="mr-1 h-3 w-3" />
                                      )}
                                      {lesson.type}
                                    </Badge>
                                  </div>
                                </li>
                              ))}
                        </ul>

                        {/* Assessment status row */}
                        <div className="mt-3 flex items-center justify-between rounded-lg bg-navy-700/50 px-3 py-2.5">
                          <div className="flex items-center gap-2 text-sm">
                            <ClipboardCheck className="h-4 w-4 text-amber-500" />
                            <span className="text-warm-300">Assessment:</span>
                            <span className="font-medium text-warm-100">{mod.assessment}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getAssessmentBadgeVariant(assessmentStatus) as 'default' | 'secondary' | 'success' | 'warning' | 'destructive'}
                              className={cn(
                                'text-xs',
                                assessmentStatus === 'Not started' && 'bg-navy-600 text-warm-400 border-navy-500',
                                assessmentStatus === 'Passed' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              )}
                            >
                              {assessmentStatus}
                            </Badge>
                            {assessment && (
                              <Link href={`/learn/assessments/${assessment.id}`}>
                                <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 hover:bg-navy-600">
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* Announcements */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-warm-50 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-500" />
            Announcements
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl bg-navy-700" />
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((a) => (
                <Card
                  key={a.id}
                  className="border-navy-600 bg-navy-700 text-warm-50"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-sm font-semibold text-warm-50">
                          {a.title}
                        </h3>
                        <p className="mt-1 text-sm text-warm-400">{a.body}</p>
                        {a.link && (
                          <a
                            href={a.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-teal-400 hover:text-teal-300"
                          >
                            Learn more
                            <ArrowRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-warm-400">
                        {formatDate(a.created_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-navy-600 bg-navy-700 text-warm-50">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Megaphone className="h-8 w-8 text-navy-500" />
                <p className="mt-3 text-sm text-warm-400">
                  No announcements yet. Check back soon.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
