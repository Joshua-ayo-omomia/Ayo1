import Link from 'next/link'
import type { Metadata } from 'next'
import { PublicNav } from '@/components/layout/public-nav'
import { PublicFooter } from '@/components/layout/public-footer'
import {
  ArrowRight,
  Code2,
  Megaphone,
  Palette,
  BarChart3,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Learning Tracks',
  description:
    'Choose your path to becoming AI-native. Explore our specialized tracks in AI Engineering, Marketing, Design, and Advertising.',
}

const tracks = [
  {
    title: 'AI Engineer',
    slug: 'ai-engineer',
    description:
      'Build with LLM APIs, create RAG systems, design AI agents, and ship production-ready AI products. The foundational track for developers who want to become AI-native.',
    icon: Code2,
    active: true,
    badge: 'Enrolling Now',
    stats: '4 modules \u2022 12 lessons \u2022 1 final project',
    details: [
      'Prompt engineering for developers',
      'Building with LLM APIs & SDKs',
      'RAG & knowledge systems',
      'AI agents & multi-agent architectures',
      'Production deployment & scaling',
    ],
  },
  {
    title: 'AI Marketer',
    slug: 'ai-marketer',
    description:
      'Leverage AI for content strategy, audience insights, and campaign automation. Build marketing systems that scale with intelligence.',
    icon: Megaphone,
    active: false,
    badge: 'Coming Soon',
    stats: 'Curriculum in development',
    details: [
      'AI-powered content creation',
      'Audience segmentation with ML',
      'Automated campaign optimization',
      'AI analytics & attribution',
    ],
  },
  {
    title: 'AI Designer',
    slug: 'ai-designer',
    description:
      'Use generative AI to accelerate design workflows, create assets at scale, and prototype at the speed of thought.',
    icon: Palette,
    active: false,
    badge: 'Coming Soon',
    stats: 'Curriculum in development',
    details: [
      'Generative design workflows',
      'AI-assisted prototyping',
      'Asset generation at scale',
      'Design system automation',
    ],
  },
  {
    title: 'AI Ad Builder',
    slug: 'ai-ad-builder',
    description:
      'Create high-performing ad creatives and optimize campaigns with AI. From copy to visuals to targeting \u2014 build ads that convert.',
    icon: BarChart3,
    active: false,
    badge: 'Coming Soon',
    stats: 'Curriculum in development',
    details: [
      'AI-generated ad creatives',
      'Copy optimization with LLMs',
      'Performance prediction models',
      'Multi-channel campaign automation',
    ],
  },
]

export default function TracksPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <section className="bg-navy-700 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              Learning Tracks
            </h1>
            <p className="mt-4 font-body text-lg text-warm-300">
              Choose your path to becoming AI-native.
            </p>
          </div>
        </div>
      </section>

      {/* ── Track Cards ────────────────────────────────────────────── */}
      <section className="bg-warm-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {tracks.map((track) => {
              const Icon = track.icon
              const isActive = track.active

              const cardContent = (
                <div
                  className={`relative flex h-full flex-col rounded-2xl border-2 p-8 transition-all ${
                    isActive
                      ? 'border-teal-500 bg-white shadow-sm hover:shadow-lg hover:shadow-teal-500/10'
                      : 'border-warm-200 bg-white/60 opacity-75'
                  }`}
                >
                  {/* Badge */}
                  <span
                    className={`absolute -top-3 right-6 rounded-full px-4 py-1 font-body text-xs font-semibold ${
                      isActive
                        ? 'bg-teal-500 text-white'
                        : 'bg-warm-300 text-navy-500'
                    }`}
                  >
                    {track.badge}
                  </span>

                  {/* Icon */}
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-600'
                        : 'bg-warm-100 text-warm-400'
                    }`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Title */}
                  <h2
                    className={`mt-5 font-display text-2xl font-bold ${
                      isActive ? 'text-navy-700' : 'text-navy-400'
                    }`}
                  >
                    {track.title}
                  </h2>

                  {/* Description */}
                  <p
                    className={`mt-3 font-body text-sm leading-relaxed ${
                      isActive ? 'text-navy-400' : 'text-warm-400'
                    }`}
                  >
                    {track.description}
                  </p>

                  {/* Details */}
                  <ul className="mt-5 flex-1 space-y-2">
                    {track.details.map((detail) => (
                      <li
                        key={detail}
                        className={`flex items-start gap-2 font-body text-sm ${
                          isActive ? 'text-navy-500' : 'text-warm-400'
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                            isActive ? 'bg-teal-500' : 'bg-warm-300'
                          }`}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Stats */}
                  <div className="mt-6 border-t border-warm-200 pt-4">
                    <p
                      className={`font-body text-sm font-medium ${
                        isActive ? 'text-teal-600' : 'text-warm-400'
                      }`}
                    >
                      {track.stats}
                    </p>
                  </div>

                  {/* CTA for active */}
                  {isActive && (
                    <div className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-teal-600 transition-colors group-hover:text-teal-500">
                      View full curriculum <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              )

              if (isActive) {
                return (
                  <Link
                    key={track.slug}
                    href={`/tracks/${track.slug}`}
                    className="group"
                  >
                    {cardContent}
                  </Link>
                )
              }

              return (
                <div key={track.slug}>
                  {cardContent}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-500 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 font-body text-lg text-teal-100">
            The AI Engineer track is enrolling now. Apply today.
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
