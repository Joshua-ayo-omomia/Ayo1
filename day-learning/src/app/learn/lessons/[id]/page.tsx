'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Lesson = {
  id: string
  module_id: string
  title: string
  description: string | null
  video_url: string | null
  reading_content: string | null
  order_index: number | null
  status: 'draft' | 'published'
}

type ModuleData = {
  id: string
  title: string
  order_index: number | null
}

type SiblingLesson = {
  id: string
  title: string
  order_index: number | null
  completed: boolean
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [moduleData, setModuleData] = useState<ModuleData | null>(null)
  const [siblingLessons, setSiblingLessons] = useState<SiblingLesson[]>([])
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchLesson = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Fetch lesson data
      const { data: lessonRaw, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()
      const lessonData = lessonRaw as any

      if (lessonError || !lessonData) {
        setLoading(false)
        return
      }

      setLesson(lessonData)

      // Fetch parent module
      const { data: modData } = await supabase
        .from('modules')
        .select('id, title, order_index')
        .eq('id', lessonData.module_id)
        .single()

      if (modData) setModuleData(modData)

      // Fetch all lessons in this module for sidebar nav
      const { data: moduleLessons } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('module_id', lessonData.module_id)
        .order('order_index')

      // Fetch progress for all lessons in this module
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .eq('completed', true)

      const completedIds = new Set<string>(
        (progressData || []).map((p: { lesson_id: string }) => p.lesson_id)
      )
      setCompletedLessonIds(completedIds)
      setIsCompleted(completedIds.has(lessonId))

      if (moduleLessons) {
        setSiblingLessons(
          moduleLessons.map((l: any) => ({
            ...l,
            completed: completedIds.has(l.id),
          }))
        )
      }
    } catch (err) {
      console.error('Error fetching lesson:', err)
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    setLoading(true)
    fetchLesson()
  }, [fetchLesson])

  const handleMarkComplete = async () => {
    if (!userId || !lessonId || isCompleted) return
    setMarking(true)
    try {
      const { error } = await (supabase as any).from('lesson_progress').upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      if (!error) {
        setIsCompleted(true)
        setCompletedLessonIds((prev) => {
          const next = new Set<string>(Array.from(prev))
          next.add(lessonId)
          return next
        })
        setSiblingLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, completed: true } : l))
        )
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err)
    } finally {
      setMarking(false)
    }
  }

  // Find prev/next lessons
  const currentIndex = siblingLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex >= 0 && currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null

  // Parse YouTube embed URL
  const getEmbedUrl = (url: string): string => {
    // Handle youtube.com/watch?v=ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/)
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
    // Handle youtu.be/ID
    const shortMatch = url.match(/(?:youtu\.be\/)([\w-]+)/)
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
    // Handle already-embed URLs
    if (url.includes('/embed/')) return url
    return url
  }

  // Render reading content with basic formatting
  const renderReadingContent = (content: string) => {
    // Split by double newlines for paragraphs
    const blocks = content.split(/\n\n+/)
    return blocks.map((block, i) => {
      const trimmed = block.trim()
      if (!trimmed) return null

      // Heading detection: lines starting with # ## ###
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={i} className="mt-8 mb-3 font-display text-lg font-semibold text-warm-50">
            {trimmed.replace(/^### /, '')}
          </h3>
        )
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={i} className="mt-10 mb-4 font-display text-xl font-semibold text-warm-50">
            {trimmed.replace(/^## /, '')}
          </h2>
        )
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={i} className="mt-10 mb-4 font-display text-2xl font-bold text-warm-50">
            {trimmed.replace(/^# /, '')}
          </h1>
        )
      }

      // Code block: lines wrapped in ```
      if (trimmed.startsWith('```') && trimmed.endsWith('```') && trimmed.length > 6) {
        const code = trimmed.slice(3, -3).replace(/^\w+\n/, '') // strip language hint
        return (
          <pre
            key={i}
            className="my-4 overflow-x-auto rounded-xl bg-navy-900 p-4 text-sm text-warm-200"
          >
            <code>{code.trim()}</code>
          </pre>
        )
      }

      // Bullet list: lines starting with -
      if (trimmed.split('\n').every((line: string) => line.trim().startsWith('- ') || line.trim() === '')) {
        const items = trimmed
          .split('\n')
          .filter((line: string) => line.trim().startsWith('- '))
          .map((line: string) => line.trim().replace(/^- /, ''))
        return (
          <ul key={i} className="my-4 list-disc space-y-1.5 pl-6 text-warm-300">
            {items.map((item: string, j: number) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        )
      }

      // Regular paragraph
      return (
        <p key={i} className="my-3 leading-relaxed text-warm-300">
          {trimmed}
        </p>
      )
    })
  }

  return (
    <DashboardLayout pageTitle={lesson?.title ?? 'Lesson'}>
      <div className="mx-auto flex max-w-6xl gap-6">
        {/* Left sidebar: lesson navigation */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-0 space-y-1">
            {/* Module title */}
            {loading ? (
              <Skeleton className="mb-4 h-6 w-48 bg-navy-700" />
            ) : (
              <div className="mb-4">
                <Link
                  href="/learn"
                  className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-warm-400 hover:text-teal-400 transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back to Learn
                </Link>
                {moduleData && (
                  <h3 className="font-display text-sm font-semibold text-warm-200">
                    Module {moduleData.order_index ?? ''}: {moduleData.title}
                  </h3>
                )}
              </div>
            )}

            {/* Lesson list */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg bg-navy-700" />
                ))}
              </div>
            ) : (
              <nav className="space-y-0.5">
                {siblingLessons.map((sl) => {
                  const isCurrent = sl.id === lessonId
                  return (
                    <Link
                      key={sl.id}
                      href={`/learn/lessons/${sl.id}`}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors',
                        isCurrent
                          ? 'bg-teal-500/15 text-teal-400 font-medium border-l-2 border-teal-500'
                          : 'text-warm-400 hover:bg-navy-700 hover:text-warm-100'
                      )}
                    >
                      {sl.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">{sl.title}</span>
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-8">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4 bg-navy-700" />
              <Skeleton className="aspect-video w-full rounded-2xl bg-navy-700" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-navy-700" />
                <Skeleton className="h-4 w-5/6 bg-navy-700" />
                <Skeleton className="h-4 w-4/6 bg-navy-700" />
              </div>
            </div>
          ) : !lesson ? (
            <Card className="border-navy-600 bg-navy-700 text-warm-50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-12 w-12 text-navy-500" />
                <h2 className="mt-4 font-display text-xl font-semibold text-warm-100">
                  Lesson not found
                </h2>
                <p className="mt-2 text-sm text-warm-400">
                  This lesson hasn&apos;t been published yet, or the link is invalid.
                  Check back soon as content is being added.
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
              {/* Lesson title */}
              <div>
                {/* Mobile breadcrumb */}
                <div className="mb-3 lg:hidden">
                  <Link
                    href="/learn"
                    className="inline-flex items-center gap-1 text-xs font-medium text-warm-400 hover:text-teal-400 transition-colors"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back to Learn
                  </Link>
                </div>
                <h1 className="font-display text-2xl font-bold text-warm-50 sm:text-3xl">
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="mt-2 text-warm-400">{lesson.description}</p>
                )}
              </div>

              {/* Video embed */}
              {lesson.video_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-navy-900">
                  <iframe
                    src={getEmbedUrl(lesson.video_url)}
                    title={lesson.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Reading content */}
              {lesson.reading_content && (
                <div className="prose-dark">
                  {renderReadingContent(lesson.reading_content)}
                </div>
              )}

              {/* Mark as Complete */}
              <div className="pt-4">
                <Button
                  onClick={handleMarkComplete}
                  disabled={isCompleted || marking}
                  loading={marking}
                  size="lg"
                  className={cn(
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-default'
                      : 'bg-teal-500 text-white hover:bg-teal-600'
                  )}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Completed
                    </>
                  ) : (
                    'Mark as Complete'
                  )}
                </Button>
              </div>

              {/* Prev / Next navigation */}
              <div className="flex items-center justify-between border-t border-navy-700 pt-6">
                {prevLesson ? (
                  <Link href={`/learn/lessons/${prevLesson.id}`}>
                    <Button
                      variant="ghost"
                      className="text-warm-400 hover:text-warm-100 hover:bg-navy-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {prevLesson.title}
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                {nextLesson ? (
                  <Link href={`/learn/lessons/${nextLesson.id}`}>
                    <Button
                      variant="ghost"
                      className="text-warm-400 hover:text-warm-100 hover:bg-navy-700"
                    >
                      {nextLesson.title}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
