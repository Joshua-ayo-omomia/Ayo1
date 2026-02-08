export const SITE_NAME = 'Day Learning'
export const SITE_TAGLINE = 'Become AI-native.'
export const SITE_DESCRIPTION =
  'Learn AI. Build things. Get hired. Day Learning is THCO\'s AI upskilling platform for people who already know how to build.'
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://daylearning.io'

export const BRAND_PARENT = 'THCO'
export const BRAND_PARENT_FULL = 'Talentco Holding Company'

export const ONBOARDING_ITEMS = [
  {
    key: 'profile',
    title: 'Complete your profile',
    description: 'Add your photo, bio, and GitHub link so your cohort knows who you are.',
  },
  {
    key: 'code_of_conduct',
    title: 'Read the Code of Conduct',
    description:
      'We hold a high standard. Read and acknowledge our community guidelines.',
  },
  {
    key: 'how_it_works',
    title: 'Read "How This Program Works"',
    description:
      'Understand the structure, expectations, and what it takes to graduate.',
  },
  {
    key: 'community',
    title: 'Join the Day Learning community',
    description: 'Connect with your cohort. Learning is better together.',
    link: '#', // Configure with actual community link
  },
  {
    key: 'schedule',
    title: 'Set your learning schedule',
    description: 'Pick your preferred days and times. Consistency beats intensity.',
  },
  {
    key: 'welcome_video',
    title: 'Watch the welcome video',
    description: 'A quick intro from the team on what to expect.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual welcome video
  },
] as const

export const TECH_STACK_OPTIONS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Go',
  'Rust',
  'Java',
  'C#',
  'Other',
] as const

export const YEARS_EXPERIENCE_OPTIONS = [
  { value: '1-2', label: '1-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
] as const

export const REFERRAL_SOURCES = [
  'Twitter/X',
  'LinkedIn',
  'Friend or colleague',
  'THCO website',
  'Google search',
  'YouTube',
  'Other',
] as const

export const AI_ENGINEER_CURRICULUM = [
  {
    module: 1,
    title: 'Foundations of AI-Assisted Development',
    description: 'Build the mindset and toolkit for AI-native engineering.',
    lessons: [
      { title: 'The AI Engineering Mindset', type: 'video + reading' as const },
      { title: 'Setting Up Your AI Toolkit', type: 'video + reading' as const },
      { title: 'Prompt Engineering for Developers', type: 'video + reading' as const },
    ],
    assessment: 'Build a CLI tool using AI',
  },
  {
    module: 2,
    title: 'Building with LLMs',
    description: 'Go from API calls to production AI features.',
    lessons: [
      { title: 'APIs & SDKs', type: 'video + reading' as const },
      { title: 'Building AI Features into Apps', type: 'video' as const },
      { title: 'RAG & Knowledge Systems', type: 'video + reading' as const },
    ],
    assessment: 'Build a RAG application',
  },
  {
    module: 3,
    title: 'AI Agents & Automation',
    description: 'Design and build autonomous AI systems.',
    lessons: [
      { title: 'Agent Architecture', type: 'video + reading' as const },
      { title: 'Tool Use & Function Calling', type: 'video' as const },
      { title: 'Multi-Agent Systems', type: 'video + reading' as const },
    ],
    assessment: 'Build an AI agent',
  },
  {
    module: 4,
    title: 'Production AI Systems',
    description: 'Ship, scale, and maintain AI in the real world.',
    lessons: [
      { title: 'Deployment & Scaling', type: 'video' as const },
      { title: 'Evaluation & Testing', type: 'video + reading' as const },
      { title: 'Cost Optimization', type: 'video' as const },
    ],
    assessment: 'Deploy an AI product',
  },
] as const
