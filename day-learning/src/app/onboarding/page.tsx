'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar } from '@/components/ui/avatar'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { ONBOARDING_ITEMS } from '@/lib/constants'
import {
  Check,
  ChevronDown,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Shield,
  BookOpen,
  Users,
  Play,
} from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'] as const

const ITEM_ICONS: Record<string, React.ElementType> = {
  profile: User,
  code_of_conduct: Shield,
  how_it_works: BookOpen,
  community: Users,
  schedule: Calendar,
  welcome_video: Play,
}

const darkInput =
  'bg-navy-600 border-navy-500 text-warm-50 placeholder:text-warm-400'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Auth and user state
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  // Onboarding state
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // Profile form
  const [bio, setBio] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  // Schedule form
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [timeSlot, setTimeSlot] = useState('')

  // Code of conduct
  const [conductAgreed, setConductAgreed] = useState(false)

  // Derived
  const completedCount = completedItems.size
  const allComplete = completedCount === ONBOARDING_ITEMS.length
  const progressPercent = (completedCount / ONBOARDING_ITEMS.length) * 100

  // ── Load user data and onboarding progress on mount ──────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)
        setUserEmail(user.email || '')

        // Load profile
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserName(profile.full_name || '')
          setBio(profile.bio || '')
          setGithubUrl(profile.github_url || '')

          if (profile.onboarding_completed) {
            router.push('/learn')
            return
          }
        }

        // Load onboarding progress
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('item_key')
          .eq('user_id', user.id)
          .eq('completed', true)

        if (progress) {
          setCompletedItems(
            new Set(progress.map((p: { item_key: string }) => p.item_key))
          )
        }

        // Auto-expand first incomplete item
        const firstIncomplete = ONBOARDING_ITEMS.find(
          (item) =>
            !progress?.some(
              (p: { item_key: string }) => p.item_key === item.key
            )
        )
        if (firstIncomplete) {
          setExpandedItem(firstIncomplete.key)
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Mark an item as complete ─────────────────────────────────────────
  const markComplete = useCallback(
    async (key: string) => {
      if (!userId || completedItems.has(key)) return

      setSaving((prev) => ({ ...prev, [key]: true }))

      try {
        await (supabase as any).from('onboarding_progress').upsert(
          {
            user_id: userId,
            item_key: key,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,item_key' }
        )

        const newCompleted = new Set(completedItems)
        newCompleted.add(key)
        setCompletedItems(newCompleted)

        // If all items done, mark onboarding as complete on profile
        if (newCompleted.size === ONBOARDING_ITEMS.length) {
          await (supabase as any)
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', userId)
        }

        // Auto-expand next incomplete item
        const nextIncomplete = ONBOARDING_ITEMS.find(
          (item) => !newCompleted.has(item.key)
        )
        setExpandedItem(nextIncomplete?.key || null)
      } catch (error) {
        console.error('Error saving progress:', error)
      } finally {
        setSaving((prev) => ({ ...prev, [key]: false }))
      }
    },
    [userId, completedItems, supabase]
  )

  // ── Save profile and mark complete ───────────────────────────────────
  const handleSaveProfile = async () => {
    if (!userId) return
    setSaving((prev) => ({ ...prev, profile: true }))

    try {
      await (supabase as any)
        .from('profiles')
        .update({ bio, github_url: githubUrl })
        .eq('id', userId)

      await markComplete('profile')
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving((prev) => ({ ...prev, profile: false }))
    }
  }

  // ── Save schedule and mark complete ──────────────────────────────────
  const handleSaveSchedule = async () => {
    if (!userId || selectedDays.length === 0 || !timeSlot) return
    await markComplete('schedule')
  }

  // ── Toggle a day on/off ──────────────────────────────────────────────
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  // ── Toggle card expand/collapse ──────────────────────────────────────
  const toggleExpand = (key: string) => {
    setExpandedItem((prev) => (prev === key ? null : key))
  }

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout pageTitle="Onboarding">
        <div className="mx-auto max-w-3xl animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-lg bg-navy-700" />
          <div className="h-4 w-96 rounded bg-navy-700" />
          <div className="h-3 w-full rounded-full bg-navy-700" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-navy-700" />
          ))}
        </div>
      </DashboardLayout>
    )
  }

  // ── Render expanded content for each item ────────────────────────────
  const renderItemContent = (key: string) => {
    switch (key) {
      // ─── 1. Complete your profile ────────────────────────────────────
      case 'profile':
        return (
          <div className="space-y-5">
            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
              <Avatar
                name={userName || userEmail}
                size="lg"
                className="h-16 w-16 text-lg bg-teal-500/20 text-teal-400"
              />
              <div>
                <p className="font-medium text-warm-50">
                  {userName || 'New Student'}
                </p>
                <p className="text-sm text-warm-400">{userEmail}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="[&_label]:text-warm-200">
              <Textarea
                label="Bio"
                placeholder="Tell your cohort a bit about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={280}
                showCount
                className={darkInput}
              />
            </div>

            {/* GitHub URL */}
            <div className="[&_label]:text-warm-200">
              <Input
                label="GitHub URL"
                placeholder="https://github.com/yourusername"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className={darkInput}
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              loading={saving.profile}
              disabled={!bio.trim()}
            >
              Save Profile
            </Button>
          </div>
        )

      // ─── 2. Code of Conduct ──────────────────────────────────────────
      case 'code_of_conduct':
        return (
          <div className="space-y-4">
            <div className="space-y-3 rounded-xl bg-navy-800/50 p-4 text-sm leading-relaxed text-warm-200">
              <h4 className="font-display font-semibold text-warm-50">
                Our Community Standards
              </h4>
              <p>
                <strong className="text-teal-400">Respect.</strong> Treat every
                member with dignity. We come from different backgrounds and
                experience levels. Lift each other up, give constructive
                feedback, and assume good intent.
              </p>
              <p>
                <strong className="text-teal-400">Commitment.</strong> This
                program requires real effort. Show up consistently, meet
                deadlines, and communicate proactively if you need support. Your
                cohort is counting on you.
              </p>
              <p>
                <strong className="text-teal-400">Collaboration.</strong>{' '}
                Learning is a team sport. Share resources, ask questions openly,
                and help others when you can. The best engineers make everyone
                around them better.
              </p>
              <p>
                <strong className="text-teal-400">Integrity.</strong> Submit
                your own work. Use AI tools as learning aids, not shortcuts. When
                you reference others&rsquo; work, give credit. Your reputation
                starts here.
              </p>
            </div>

            <div className="[&_label]:text-warm-100">
              <Checkbox
                label="I have read and agree to the Code of Conduct"
                checked={conductAgreed}
                onChange={(e) => setConductAgreed(e.target.checked)}
              />
            </div>

            <Button
              onClick={() => markComplete('code_of_conduct')}
              loading={saving.code_of_conduct}
              disabled={!conductAgreed}
            >
              I Agree
            </Button>
          </div>
        )

      // ─── 3. How This Program Works ──────────────────────────────────
      case 'how_it_works':
        return (
          <div className="space-y-4">
            <div className="space-y-3 rounded-xl bg-navy-800/50 p-4 text-sm leading-relaxed text-warm-200">
              <h4 className="font-display font-semibold text-warm-50">
                How This Program Works
              </h4>
              <ul className="space-y-2.5">
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-teal-400">
                    &#x2022;
                  </span>
                  <span>
                    <strong className="text-warm-50">
                      Self-paced within cohort timelines.
                    </strong>{' '}
                    You move at your own speed, but modules have deadlines to
                    keep the cohort in sync.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-teal-400">
                    &#x2022;
                  </span>
                  <span>
                    <strong className="text-warm-50">
                      Plan for 10&ndash;15 hours per week.
                    </strong>{' '}
                    This includes video lessons, readings, and project work.
                    Consistency matters more than marathon sessions.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-teal-400">
                    &#x2022;
                  </span>
                  <span>
                    <strong className="text-warm-50">
                      Video lessons + readings.
                    </strong>{' '}
                    Each module combines instructor-led videos with curated
                    readings and documentation.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-teal-400">
                    &#x2022;
                  </span>
                  <span>
                    <strong className="text-warm-50">
                      Assessments are real projects.
                    </strong>{' '}
                    No multiple-choice quizzes. You&rsquo;ll build things,
                    submit them, and get feedback from reviewers.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-teal-400">
                    &#x2022;
                  </span>
                  <span>
                    <strong className="text-warm-50">
                      Final project to graduate.
                    </strong>{' '}
                    The capstone is a production-grade AI project that
                    demonstrates everything you&rsquo;ve learned. This goes in
                    your portfolio.
                  </span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => markComplete('how_it_works')}
              loading={saving.how_it_works}
            >
              I Understand
            </Button>
          </div>
        )

      // ─── 4. Join the community ──────────────────────────────────────
      case 'community':
        return (
          <div className="space-y-4">
            <p className="text-sm text-warm-200">
              Join our community to connect with your cohort, ask questions,
              share wins, and get support throughout the program.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                as="a"
                href={
                  ONBOARDING_ITEMS.find((i) => i.key === 'community')?.link ||
                  '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                className="border-navy-500 text-warm-50 hover:bg-navy-600"
              >
                Open Community <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => markComplete('community')}
                loading={saving.community}
              >
                I&rsquo;ve Joined
              </Button>
            </div>
          </div>
        )

      // ─── 5. Set your learning schedule ──────────────────────────────
      case 'schedule':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-200">
              Pick the days and time you plan to dedicate to learning. This
              helps you build a consistent routine.
            </p>

            {/* Day picker */}
            <div>
              <p className="mb-2.5 text-sm font-medium text-warm-200">
                <Calendar className="mr-1.5 -mt-0.5 inline h-4 w-4 text-teal-400" />
                Learning days
              </p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                      selectedDays.includes(day)
                        ? 'border-teal-500 bg-teal-500/20 text-teal-400'
                        : 'border-navy-500 bg-navy-600 text-warm-300 hover:border-navy-400 hover:text-warm-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slot picker */}
            <div>
              <p className="mb-2.5 text-sm font-medium text-warm-200">
                <Clock className="mr-1.5 -mt-0.5 inline h-4 w-4 text-teal-400" />
                Preferred time
              </p>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                      timeSlot === slot
                        ? 'border-teal-500 bg-teal-500/20 text-teal-400'
                        : 'border-navy-500 bg-navy-600 text-warm-300 hover:border-navy-400 hover:text-warm-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveSchedule}
              loading={saving.schedule}
              disabled={selectedDays.length === 0 || !timeSlot}
            >
              Save Schedule
            </Button>
          </div>
        )

      // ─── 6. Watch the welcome video ─────────────────────────────────
      case 'welcome_video':
        return (
          <div className="space-y-4">
            <div className="video-container rounded-xl">
              <iframe
                src={
                  ONBOARDING_ITEMS.find((i) => i.key === 'welcome_video')
                    ?.videoUrl
                }
                title="Welcome to Day Learning"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <Button
              onClick={() => markComplete('welcome_video')}
              loading={saving.welcome_video}
            >
              I&rsquo;ve Watched This
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  // ── Main render ──────────────────────────────────────────────────────
  return (
    <DashboardLayout pageTitle="Onboarding">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* ── Top section: headline, subtitle, progress ────────────── */}
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-warm-50">
              Welcome to Day Learning
            </h1>
            <p className="mt-2 text-warm-300">
              Complete these steps to unlock your learning dashboard
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-warm-200">
                {completedCount} of {ONBOARDING_ITEMS.length} steps completed
              </span>
              <span className="font-medium text-teal-400">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="[&_div[role=progressbar]]:bg-navy-600"
            />
          </div>
        </div>

        {/* ── Checklist cards ──────────────────────────────────────── */}
        <div className="space-y-3">
          {ONBOARDING_ITEMS.map((item) => {
            const isComplete = completedItems.has(item.key)
            const isExpanded = expandedItem === item.key && !isComplete
            const Icon = ITEM_ICONS[item.key] || Check

            return (
              <Card
                key={item.key}
                className={`border-transparent bg-navy-700 text-warm-50 shadow-none transition-all duration-300 ${
                  isComplete
                    ? 'border-l-4 border-l-teal-500'
                    : 'border-l-4 border-l-navy-600'
                }`}
              >
                {/* Collapsed header — always visible */}
                <button
                  onClick={() => toggleExpand(item.key)}
                  className={`flex w-full items-center gap-4 p-5 text-left transition-colors duration-150 ${
                    isComplete
                      ? 'cursor-default'
                      : 'cursor-pointer hover:bg-navy-600/50'
                  } rounded-2xl`}
                  aria-expanded={isExpanded}
                  disabled={isComplete}
                >
                  {/* Status icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      isComplete
                        ? 'bg-teal-500 text-white'
                        : 'bg-navy-600 text-warm-400'
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>

                  {/* Title and description */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-display text-sm font-semibold sm:text-base ${
                        isComplete
                          ? 'text-warm-400 line-through decoration-warm-400/40'
                          : 'text-warm-50'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-warm-400 sm:text-sm">
                      {item.description}
                    </p>
                  </div>

                  {/* Status badge or chevron */}
                  {isComplete ? (
                    <span className="shrink-0 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
                      Done
                    </span>
                  ) : (
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-warm-400 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Expandable content */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isExpanded ? '800px' : '0',
                    opacity: isExpanded ? 1 : 0,
                  }}
                >
                  <div className="border-t border-navy-600 px-5 pb-5 pt-4">
                    {renderItemContent(item.key)}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* ── Celebration: all steps complete ──────────────────────── */}
        {allComplete && (
          <div className="animate-fade-in rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-navy-700 to-navy-700 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20">
              <Sparkles className="h-8 w-8 text-teal-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-warm-50">
              You&rsquo;re all set!
            </h2>
            <p className="mx-auto mt-2 max-w-md text-warm-300">
              You&rsquo;ve completed all onboarding steps. Your learning
              dashboard is ready. Time to build something amazing.
            </p>
            <Button
              size="lg"
              className="mt-6"
              onClick={() => router.push('/learn')}
            >
              Start Learning <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
