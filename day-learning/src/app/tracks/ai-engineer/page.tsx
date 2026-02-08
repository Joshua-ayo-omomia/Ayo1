import Link from 'next/link'
import type { Metadata } from 'next'
import { PublicNav } from '@/components/layout/public-nav'
import { PublicFooter } from '@/components/layout/public-footer'
import { AI_ENGINEER_CURRICULUM } from '@/lib/constants'
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Code2,
  Brain,
  Rocket,
  Clock,
  Layers,
  Target,
  GraduationCap,
  FileCode2,
  PlayCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Engineer Track',
  description:
    'Build with LLM APIs, create RAG systems, design AI agents, and deploy production AI. The AI Engineer track at Day Learning.',
}

const stats = [
  { label: 'Modules', value: '4', icon: Layers },
  { label: 'Lessons', value: '12+', icon: BookOpen },
  { label: 'Assessments', value: '4', icon: Target },
  { label: 'Final Project', value: '1', icon: Rocket },
]

const outcomes = [
  'Build with LLM APIs and SDKs (OpenAI, Anthropic, and more)',
  'Create RAG systems for knowledge-powered applications',
  'Design and build AI agents with tool use and function calling',
  'Architect multi-agent systems for complex workflows',
  'Deploy, scale, and monitor production AI systems',
  'Evaluate and test AI outputs systematically',
  'Optimize costs for AI-powered products',
  'Apply prompt engineering techniques at a professional level',
]

const projects = [
  {
    module: 1,
    title: 'Build a CLI tool using AI',
    description:
      'Create a command-line application that leverages AI for a practical developer workflow. Demonstrates prompt engineering and API integration fundamentals.',
  },
  {
    module: 2,
    title: 'Build a RAG application',
    description:
      'Design and implement a retrieval-augmented generation system that answers questions from a custom knowledge base. Real-world AI feature development.',
  },
  {
    module: 3,
    title: 'Build an AI agent',
    description:
      'Create an autonomous AI agent that can reason, use tools, and complete multi-step tasks. Demonstrates agent architecture and function calling.',
  },
  {
    module: 4,
    title: 'Deploy an AI product',
    description:
      'Ship a complete AI-powered product to production. Includes deployment, scaling, evaluation, and cost optimization. This is your capstone.',
  },
]

const graduateOutcomes = [
  {
    title: 'Build AI-powered products',
    description:
      'Confidently design, build, and ship applications that integrate LLMs, RAG, and AI agents into real user workflows.',
    icon: Code2,
  },
  {
    title: 'Work as an AI Engineer',
    description:
      'Step into AI engineering roles with a portfolio of projects and the skills employers are hiring for right now.',
    icon: Brain,
  },
  {
    title: 'Lead AI initiatives at your company',
    description:
      'Become the person who knows how to evaluate, architect, and deliver AI solutions \u2014 not just experiment with them.',
    icon: GraduationCap,
  },
]

function getLessonIcon(type: string) {
  if (type.includes('video') && type.includes('reading')) {
    return <PlayCircle className="h-4 w-4 text-teal-500" />
  }
  if (type.includes('video')) {
    return <PlayCircle className="h-4 w-4 text-teal-500" />
  }
  return <FileCode2 className="h-4 w-4 text-teal-500" />
}

export default function AIEngineerTrackPage() {
  const totalLessons = AI_ENGINEER_CURRICULUM.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0
  )

  return (
    <div className="min-h-screen">
      <PublicNav />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-700">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-amber-500/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 px-4 py-1.5 font-body text-sm font-semibold text-teal-400">
              <Code2 className="h-4 w-4" />
              Enrolling Now
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              AI Engineer Track
            </h1>

            <p className="mt-6 font-body text-lg leading-relaxed text-warm-300 sm:text-xl">
              Go from experienced developer to AI-native engineer. Build with LLM APIs, create
              RAG systems, design AI agents, and ship production-ready AI products &mdash; all
              through hands-on projects reviewed by experts.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-warm-300/15 bg-white/5 px-4 py-5 backdrop-blur-sm"
                  >
                    <Icon className="mx-auto h-5 w-5 text-teal-400" />
                    <p className="mt-2 font-display text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="font-body text-sm text-warm-400">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            <Link
              href="/apply"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-8 py-4 font-body text-base font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-400 hover:shadow-teal-400/30"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── What You'll Learn ──────────────────────────────────────── */}
      <section className="bg-warm-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              What You&apos;ll Learn
            </h2>
            <p className="mt-4 font-body text-lg text-navy-400">
              By the end of this track, you will be able to:
            </p>

            <ul className="mt-8 space-y-4">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500" />
                  <span className="font-body text-base text-navy-600">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Curriculum ─────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              Curriculum
            </h2>
            <p className="mt-4 font-body text-lg text-navy-400">
              {AI_ENGINEER_CURRICULUM.length} modules, {totalLessons} lessons, each
              building on the last. Every module ends with a hands-on assessment.
            </p>

            <div className="mt-12 space-y-6">
              {AI_ENGINEER_CURRICULUM.map((mod) => (
                <div
                  key={mod.module}
                  className="rounded-2xl border border-warm-200 bg-warm-50 p-6 sm:p-8"
                >
                  {/* Module header */}
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-500 font-display text-sm font-bold text-white">
                      {mod.module}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-navy-700">
                        {mod.title}
                      </h3>
                      <p className="mt-1 font-body text-sm text-navy-400">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="mt-6 space-y-3">
                    {mod.lessons.map((lesson, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-lg bg-white px-4 py-3"
                      >
                        {getLessonIcon(lesson.type)}
                        <span className="flex-1 font-body text-sm font-medium text-navy-600">
                          {lesson.title}
                        </span>
                        <span className="rounded-full bg-warm-100 px-2.5 py-0.5 font-body text-xs text-navy-400">
                          {lesson.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Assessment */}
                  <div className="mt-4 flex items-center gap-3 rounded-lg border-2 border-dashed border-amber-400/40 bg-amber-50/50 px-4 py-3">
                    <Target className="h-4 w-4 text-amber-600" />
                    <span className="font-body text-sm text-navy-600">
                      <span className="font-semibold text-amber-700">Assessment:</span>{' '}
                      {mod.assessment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Time Commitment ────────────────────────────────────────── */}
      <section className="bg-warm-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy-700">
              <Clock className="h-6 w-6 text-teal-400" />
            </div>
            <h2 className="font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              Time Commitment
            </h2>
            <p className="mt-4 font-body text-lg text-navy-400">
              10&ndash;15 hours per week, self-paced within cohort timelines.
            </p>
            <p className="mt-2 font-body text-sm text-navy-300">
              You set your own schedule. Learn when it works for you, as long as you keep pace
              with your cohort&apos;s milestones.
            </p>
          </div>
        </div>
      </section>

      {/* ── What You'll Build ──────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              What You&apos;ll Build
            </h2>
            <p className="mt-4 font-body text-lg text-navy-400">
              Real projects, not toy demos. Each assessment is a portfolio piece that proves
              your skills.
            </p>

            <div className="mt-12 space-y-6">
              {projects.map((project) => (
                <div
                  key={project.module}
                  className="flex gap-5 rounded-2xl border border-warm-200 bg-warm-50 p-6"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <FileCode2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="mb-1 font-body text-xs font-semibold uppercase tracking-wider text-amber-600">
                      Module {project.module} Assessment
                    </p>
                    <h3 className="font-display text-lg font-bold text-navy-700">
                      {project.title}
                    </h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-navy-400">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Outcomes ───────────────────────────────────────────────── */}
      <section className="bg-navy-700 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              After You Graduate
            </h2>
            <p className="mt-4 font-body text-lg text-warm-300">
              This track is designed to make you employable, not just educated.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {graduateOutcomes.map((outcome) => {
              const Icon = outcome.icon
              return (
                <div
                  key={outcome.title}
                  className="rounded-2xl border border-navy-600 bg-navy-600/50 p-8 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/15">
                    <Icon className="h-7 w-7 text-teal-400" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    {outcome.title}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-warm-300">
                    {outcome.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-500 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to start?
          </h2>
          <p className="mt-4 font-body text-lg text-teal-100">
            Applications for the AI Engineer track are open. Spots are limited per cohort.
          </p>
          <Link
            href="/apply"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-body text-base font-semibold text-teal-700 shadow-lg transition-all hover:bg-warm-50 hover:shadow-xl"
          >
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
