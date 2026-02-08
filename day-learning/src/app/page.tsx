import Link from 'next/link'
import { PublicNav } from '@/components/layout/public-nav'
import { PublicFooter } from '@/components/layout/public-footer'
import {
  ArrowRight,
  Brain,
  Code2,
  Megaphone,
  Palette,
  BarChart3,
  ClipboardCheck,
  Cpu,
  UserCheck,
  BookOpen,
  Rocket,
  Quote,
} from 'lucide-react'

const tracks = [
  {
    title: 'AI Engineer',
    description:
      'Build with LLM APIs, create RAG systems, design AI agents, and deploy production AI.',
    icon: Code2,
    href: '/tracks/ai-engineer',
    active: true,
    stats: '4 modules \u2022 12 lessons \u2022 1 final project',
  },
  {
    title: 'AI Marketer',
    description:
      'Leverage AI for content strategy, audience targeting, and campaign automation.',
    icon: Megaphone,
    href: '#',
    active: false,
    stats: 'Coming Soon',
  },
  {
    title: 'AI Designer',
    description:
      'Use AI to accelerate design workflows, generate assets, and prototype faster.',
    icon: Palette,
    href: '#',
    active: false,
    stats: 'Coming Soon',
  },
  {
    title: 'AI Ad Builder',
    description:
      'Create high-performing ad creatives and optimize campaigns with AI tools.',
    icon: BarChart3,
    href: '#',
    active: false,
    stats: 'Coming Soon',
  },
]

const steps = [
  {
    number: 1,
    title: 'Apply',
    description: 'Submit your background and tell us what you want to build.',
    icon: ClipboardCheck,
  },
  {
    number: 2,
    title: 'AI Screens You',
    description: 'Our AI reviews your application for fit and readiness.',
    icon: Cpu,
  },
  {
    number: 3,
    title: 'Get Accepted',
    description: 'Receive your offer and join the next available cohort.',
    icon: UserCheck,
  },
  {
    number: 4,
    title: 'Learn by Doing',
    description: 'Work through video modules, documentation, and hands-on projects.',
    icon: BookOpen,
  },
  {
    number: 5,
    title: 'Build & Graduate',
    description: 'Build something real, get reviewed by experts, and earn your credential.',
    icon: Rocket,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-700">
        {/* Subtle decorative gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-44">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-body text-sm font-semibold uppercase tracking-widest text-teal-400">
              Day Learning by THCO
            </p>
            <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              Become{' '}
              <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                AI-native.
              </span>
            </h1>
            <p className="mt-6 font-body text-xl leading-relaxed text-warm-300 sm:text-2xl">
              Learn AI. Build things. Get hired.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-8 py-4 font-body text-base font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-400 hover:shadow-teal-400/30"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tracks"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-warm-300/30 px-8 py-4 font-body text-base font-semibold text-warm-200 transition-all hover:border-warm-300/60 hover:text-white"
              >
                View Tracks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── What You'll Learn ──────────────────────────────────────── */}
      <section className="bg-warm-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              What You&apos;ll Learn
            </h2>
            <p className="mt-4 font-body text-lg text-navy-400">
              Specialized tracks for the skills the market actually demands.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tracks.map((track) => {
              const Icon = track.icon
              if (track.active) {
                return (
                  <Link
                    key={track.title}
                    href={track.href}
                    className="group relative flex flex-col rounded-2xl border-2 border-teal-500 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-teal-500/10"
                  >
                    <span className="absolute -top-3 right-4 rounded-full bg-teal-500 px-3 py-1 font-body text-xs font-semibold text-white">
                      Enrolling Now
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold text-navy-700">
                      {track.title}
                    </h3>
                    <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-navy-400">
                      {track.description}
                    </p>
                    <p className="mt-4 font-body text-xs font-medium text-teal-600">
                      {track.stats}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 font-body text-sm font-semibold text-teal-600 transition-colors group-hover:text-teal-500">
                      Explore track <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                )
              }

              return (
                <div
                  key={track.title}
                  className="relative flex flex-col rounded-2xl border border-warm-200 bg-white/60 p-6 opacity-70"
                >
                  <span className="absolute -top-3 right-4 rounded-full bg-warm-300 px-3 py-1 font-body text-xs font-semibold text-navy-500">
                    Coming Soon
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warm-100 text-warm-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-navy-400">
                    {track.title}
                  </h3>
                  <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-warm-400">
                    {track.description}
                  </p>
                  <p className="mt-4 font-body text-xs font-medium text-warm-400">
                    {track.stats}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 font-body text-lg text-navy-400">
              Five steps from application to graduation.
            </p>
          </div>

          <div className="mt-16 grid gap-0 md:grid-cols-5">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  {/* Connector line (between circles, hidden on first) */}
                  {idx > 0 && (
                    <div className="absolute left-0 top-7 hidden h-0.5 w-1/2 bg-gradient-to-r from-teal-300 to-teal-500 md:block" />
                  )}
                  {idx < steps.length - 1 && (
                    <div className="absolute right-0 top-7 hidden h-0.5 w-1/2 bg-gradient-to-r from-teal-500 to-teal-300 md:block" />
                  )}

                  {/* Circle */}
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-white shadow-md shadow-teal-500/25">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Number badge */}
                  <span className="mt-3 flex h-6 w-6 items-center justify-center rounded-full bg-navy-700 font-display text-xs font-bold text-white">
                    {step.number}
                  </span>

                  <h3 className="mt-3 font-display text-base font-bold text-navy-700">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-[200px] font-body text-sm leading-relaxed text-navy-400">
                    {step.description}
                  </p>

                  {/* Vertical connector for mobile */}
                  {idx < steps.length - 1 && (
                    <div className="my-4 h-8 w-0.5 bg-teal-300 md:hidden" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Who This Is For ────────────────────────────────────────── */}
      <section className="bg-warm-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-navy-700 sm:text-4xl">
              Who This Is For
            </h2>
            <p className="mt-6 font-body text-xl leading-relaxed text-navy-500">
              You already know how to build.
              <br />
              <span className="font-semibold text-teal-600">
                We teach you to build with AI.
              </span>
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'You\u2019ve shipped code before',
                description:
                  'This isn\u2019t a bootcamp for beginners. You have real development experience and want to add AI to your skill set.',
              },
              {
                title: 'You want to work with AI, not just talk about it',
                description:
                  'You\u2019re tired of hype. You want to actually build AI-powered products and ship them to users.',
              },
              {
                title: 'You\u2019re ready to commit 10\u201315 hours a week',
                description:
                  'Real skills take real effort. You\u2019ll learn through structured modules and build projects that prove your ability.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-white p-8"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy-700">
                  {item.title}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-navy-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Day Learning ─────────────────────────────────────── */}
      <section className="bg-navy-700 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Quote className="mx-auto h-10 w-10 text-teal-500/40" />
            <blockquote className="mt-8">
              <p className="font-display text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-4xl">
                Named after Thomas Day &mdash; a Black furniture maker during the slave trade era
                whose craftsmanship was so exceptional he became the biggest employer of labor
                in North Carolina.
              </p>
            </blockquote>
            <div className="mt-8 h-px w-16 mx-auto bg-teal-500/40" />
            <p className="mt-8 font-body text-lg leading-relaxed text-warm-300">
              Day Learning carries his name because we believe in the same principle: mastery
              of craft opens doors that nothing else can. We&apos;re building the place where
              experienced builders become AI-native &mdash; not through hype, but through
              hands-on work that proves what you can do.
            </p>
            <p className="mt-4 font-body text-sm font-medium text-teal-400">
              A THCO (Talentco Holding Company) product.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-500 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to become AI-native?
          </h2>
          <p className="mt-4 font-body text-lg text-teal-100">
            Applications are open. Spots are limited.
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
