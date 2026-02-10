-- ============================================
-- Day Learning Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  country text,
  linkedin_url text,
  github_url text,
  avatar_url text,
  bio text,
  role text default 'student' check (role in ('student', 'admin', 'reviewer')),
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- APPLICATIONS
-- ============================================
create table applications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  phone text,
  country text,
  linkedin_url text,
  resume_url text,
  brief text,
  years_experience text,
  tech_stack text[],
  track_applied text default 'ai-engineer',
  commitment_confirmed boolean,
  referral_source text,
  -- AI screening results
  ai_decision text check (ai_decision in ('accept', 'review', 'reject')),
  ai_confidence integer,
  ai_reasoning text,
  ai_experience_level text,
  ai_strengths text[],
  ai_concerns text[],
  -- Final decision
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- TRACKS
-- ============================================
create table tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  status text default 'draft' check (status in ('draft', 'active', 'coming_soon', 'archived')),
  order_index integer,
  created_at timestamptz default now()
);

-- ============================================
-- MODULES
-- ============================================
create table modules (
  id uuid primary key default gen_random_uuid(),
  track_id uuid references tracks(id) on delete cascade,
  title text not null,
  description text,
  order_index integer,
  status text default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz default now()
);

-- ============================================
-- LESSONS
-- ============================================
create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  reading_content text,
  order_index integer,
  status text default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz default now()
);

-- ============================================
-- ASSESSMENTS
-- ============================================
create table assessments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  instructions text not null,
  rubric text,
  order_index integer,
  created_at timestamptz default now()
);

-- ============================================
-- LESSON PROGRESS
-- ============================================
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- ============================================
-- ASSESSMENT SUBMISSIONS
-- ============================================
create table submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  assessment_id uuid references assessments(id) on delete cascade,
  submission_url text not null,
  notes text,
  status text default 'submitted' check (status in ('submitted', 'under_review', 'passed', 'needs_revision')),
  reviewer_id uuid references profiles(id),
  feedback text,
  reviewed_at timestamptz,
  submitted_at timestamptz default now()
);

-- ============================================
-- ONBOARDING PROGRESS
-- ============================================
create table onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  item_key text not null,
  completed boolean default false,
  completed_at timestamptz,
  unique(user_id, item_key)
);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  link text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- ENROLLMENTS
-- ============================================
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  track_id uuid references tracks(id) on delete cascade,
  enrolled_at timestamptz default now(),
  status text default 'active' check (status in ('active', 'completed', 'paused', 'dropped')),
  completed_at timestamptz,
  unique(user_id, track_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table applications enable row level security;
alter table tracks enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table assessments enable row level security;
alter table lesson_progress enable row level security;
alter table submissions enable row level security;
alter table onboarding_progress enable row level security;
alter table announcements enable row level security;
alter table enrollments enable row level security;

-- PROFILES: users can read/update their own profile, admins can read all
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- APPLICATIONS: anyone can insert, admins can read/update all
create policy "Anyone can submit application"
  on applications for insert
  with check (true);

create policy "Admins can view all applications"
  on applications for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('admin', 'reviewer')
    )
  );

create policy "Admins can update applications"
  on applications for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('admin', 'reviewer')
    )
  );

-- TRACKS: everyone can read active/coming_soon tracks
create policy "Anyone can view active tracks"
  on tracks for select
  using (status in ('active', 'coming_soon'));

create policy "Admins can manage tracks"
  on tracks for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- MODULES: enrolled users can read published modules
create policy "Anyone can view published modules"
  on modules for select
  using (status = 'published');

create policy "Admins can manage modules"
  on modules for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- LESSONS: enrolled users can read published lessons
create policy "Anyone can view published lessons"
  on lessons for select
  using (status = 'published');

create policy "Admins can manage lessons"
  on lessons for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- ASSESSMENTS: enrolled users can read
create policy "Authenticated users can view assessments"
  on assessments for select
  using (auth.uid() is not null);

create policy "Admins can manage assessments"
  on assessments for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- LESSON PROGRESS: users manage their own
create policy "Users can view own progress"
  on lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on lesson_progress for update
  using (auth.uid() = user_id);

create policy "Admins can view all progress"
  on lesson_progress for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- SUBMISSIONS: users manage their own, admins can read/update all
create policy "Users can view own submissions"
  on submissions for select
  using (auth.uid() = user_id);

create policy "Users can insert own submissions"
  on submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own submissions"
  on submissions for update
  using (auth.uid() = user_id);

create policy "Admins can view all submissions"
  on submissions for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('admin', 'reviewer')
    )
  );

create policy "Admins can update submissions"
  on submissions for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('admin', 'reviewer')
    )
  );

-- ONBOARDING PROGRESS: users manage their own
create policy "Users can view own onboarding"
  on onboarding_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own onboarding"
  on onboarding_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own onboarding"
  on onboarding_progress for update
  using (auth.uid() = user_id);

-- ANNOUNCEMENTS: everyone can read, admins can manage
create policy "Authenticated users can view announcements"
  on announcements for select
  using (auth.uid() is not null);

create policy "Admins can manage announcements"
  on announcements for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- ENROLLMENTS: users can see their own, admins can see all
create policy "Users can view own enrollments"
  on enrollments for select
  using (auth.uid() = user_id);

create policy "Admins can manage enrollments"
  on enrollments for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- SEED DATA: AI Engineer Track
-- ============================================
insert into tracks (title, slug, description, status, order_index) values
  ('AI Engineer', 'ai-engineer', 'Master the skills to build AI-powered products. From prompt engineering to production deployment.', 'active', 1),
  ('AI Marketer', 'ai-marketer', 'Learn to leverage AI for marketing strategy, content creation, and campaign optimization.', 'coming_soon', 2),
  ('AI Designer', 'ai-designer', 'Design with AI. From generative design to AI-enhanced UX workflows.', 'coming_soon', 3),
  ('AI Ad Builder', 'ai-ad-builder', 'Build high-converting ad campaigns powered by AI tools and automation.', 'coming_soon', 4);

-- Seed modules for AI Engineer track
-- (Uses a CTE to reference the track ID)
with ai_track as (
  select id from tracks where slug = 'ai-engineer'
)
insert into modules (track_id, title, description, order_index, status) values
  ((select id from ai_track), 'Foundations of AI-Assisted Development', 'Build the mindset and toolkit for AI-native engineering.', 1, 'published'),
  ((select id from ai_track), 'Building with LLMs', 'Go from API calls to production AI features.', 2, 'published'),
  ((select id from ai_track), 'AI Agents & Automation', 'Design and build autonomous AI systems.', 3, 'published'),
  ((select id from ai_track), 'Production AI Systems', 'Ship, scale, and maintain AI in the real world.', 4, 'published');

-- Seed lessons for Module 1
with m1 as (
  select id from modules where title = 'Foundations of AI-Assisted Development'
)
insert into lessons (module_id, title, description, video_url, reading_content, order_index, status) values
  ((select id from m1), 'The AI Engineering Mindset', 'Understand what it means to be an AI-native engineer and how AI changes the way we build software.', null, '# The AI Engineering Mindset

AI engineering is not about replacing developers — it''s about amplifying what they can do. In this lesson, we explore the shift from traditional software engineering to AI-native development.

## Key Concepts

- **AI as a collaborator**: Think of AI as a pair programmer, not a replacement
- **Prompt-driven development**: How natural language becomes a programming interface
- **The build cycle**: Prototype faster, iterate smarter, ship with confidence

## The New Developer Workflow

1. Define the problem clearly
2. Use AI to generate initial implementations
3. Review, refine, and test
4. Integrate into production systems

The best AI engineers are great engineers first. AI amplifies skill — it doesn''t replace it.', 1, 'published'),
  ((select id from m1), 'Setting Up Your AI Toolkit', 'Configure your development environment with the essential AI tools and APIs.', null, '# Setting Up Your AI Toolkit

Before you can build with AI, you need the right tools. This lesson walks through setting up everything you need.

## Essential Tools

- **Claude / ChatGPT**: Your AI pair programmer
- **Cursor or GitHub Copilot**: AI-powered code editor
- **API Keys**: Anthropic, OpenAI, or other LLM providers
- **Python / Node.js**: Runtime environments for AI development

## Environment Setup

1. Install your preferred code editor with AI extensions
2. Set up API keys and environment variables
3. Create a test project to verify everything works
4. Familiarize yourself with API documentation', 2, 'published'),
  ((select id from m1), 'Prompt Engineering for Developers', 'Master the art of communicating with AI models to get reliable, high-quality outputs.', null, '# Prompt Engineering for Developers

Prompt engineering is the skill of crafting inputs that get reliable, useful outputs from AI models. For developers, this is a core competency.

## Core Techniques

- **System prompts**: Set context and behavior
- **Few-shot examples**: Show the AI what you want
- **Chain of thought**: Get the AI to reason step by step
- **Structured output**: Request JSON, code, or specific formats

## Best Practices

1. Be specific about what you want
2. Provide context and constraints
3. Use examples when the format matters
4. Iterate on your prompts like you iterate on code

## Common Patterns

- Code generation with specifications
- Code review and refactoring
- Documentation generation
- Test case creation', 3, 'published');

-- Seed lessons for Module 2
with m2 as (
  select id from modules where title = 'Building with LLMs'
)
insert into lessons (module_id, title, description, video_url, reading_content, order_index, status) values
  ((select id from m2), 'APIs & SDKs', 'Learn to work with LLM APIs and SDKs to integrate AI into your applications.', null, '# Working with LLM APIs & SDKs

This lesson covers the practical side of integrating LLMs into your applications using APIs and SDKs.

## Topics Covered

- REST API calls to LLM providers
- Using official SDKs (Anthropic, OpenAI)
- Authentication and rate limiting
- Streaming responses
- Error handling and retries', 1, 'published'),
  ((select id from m2), 'Building AI Features into Apps', 'Integrate AI-powered features into real web and mobile applications.', null, '# Building AI Features into Apps

Learn how to go beyond simple API calls and build meaningful AI features into production applications.

## Feature Patterns

- AI-powered search and recommendations
- Content generation and summarization
- Intelligent form filling and validation
- Conversational interfaces
- Document analysis and extraction', 2, 'published'),
  ((select id from m2), 'RAG & Knowledge Systems', 'Build retrieval-augmented generation systems that ground AI responses in your data.', null, '# RAG & Knowledge Systems

Retrieval-Augmented Generation (RAG) is one of the most powerful patterns in AI engineering. It lets you ground AI responses in your own data.

## What You Will Learn

- Vector databases and embeddings
- Document chunking strategies
- Retrieval pipelines
- Combining retrieval with generation
- Evaluating RAG quality', 3, 'published');

-- Seed lessons for Module 3
with m3 as (
  select id from modules where title = 'AI Agents & Automation'
)
insert into lessons (module_id, title, description, video_url, reading_content, order_index, status) values
  ((select id from m3), 'Agent Architecture', 'Understand the core architecture patterns for building AI agents.', null, '# Agent Architecture

AI agents go beyond simple request-response patterns. They can plan, use tools, and complete complex tasks autonomously.

## Core Concepts

- Agent loops and decision making
- Planning and task decomposition
- Memory and context management
- Error recovery and self-correction', 1, 'published'),
  ((select id from m3), 'Tool Use & Function Calling', 'Enable AI models to use external tools and APIs through function calling.', null, '# Tool Use & Function Calling

Function calling lets AI models interact with external systems — databases, APIs, file systems, and more.

## Topics

- Function calling APIs
- Tool definitions and schemas
- Handling tool results
- Security considerations
- Building reliable tool chains', 2, 'published'),
  ((select id from m3), 'Multi-Agent Systems', 'Design systems where multiple AI agents collaborate to solve complex problems.', null, '# Multi-Agent Systems

When one agent isn''t enough, multiple agents can collaborate, each specializing in different aspects of a complex task.

## Patterns

- Orchestrator-worker patterns
- Agent communication protocols
- Shared context and memory
- Consensus and conflict resolution
- Scaling agent systems', 3, 'published');

-- Seed lessons for Module 4
with m4 as (
  select id from modules where title = 'Production AI Systems'
)
insert into lessons (module_id, title, description, video_url, reading_content, order_index, status) values
  ((select id from m4), 'Deployment & Scaling', 'Deploy AI-powered applications to production and handle scale.', null, '# Deployment & Scaling

Taking AI from prototype to production requires careful attention to deployment, scaling, and reliability.

## Topics

- Containerizing AI applications
- Serverless vs dedicated infrastructure
- Caching strategies for AI responses
- Load balancing and auto-scaling
- Monitoring and alerting', 1, 'published'),
  ((select id from m4), 'Evaluation & Testing', 'Build evaluation frameworks to ensure your AI features work reliably.', null, '# Evaluation & Testing

AI systems need different testing approaches than traditional software. Learn to evaluate quality, reliability, and safety.

## Topics

- Evaluation metrics for LLM outputs
- Automated testing pipelines
- Human evaluation workflows
- Regression testing for AI
- Safety and content filtering', 2, 'published'),
  ((select id from m4), 'Cost Optimization', 'Optimize the cost of running AI in production without sacrificing quality.', null, '# Cost Optimization

AI API costs can add up quickly. Learn strategies to optimize spending while maintaining quality.

## Strategies

- Model selection (when to use smaller models)
- Prompt optimization (shorter prompts, same quality)
- Caching and deduplication
- Batching requests
- Monitoring and budgeting', 3, 'published');

-- Seed assessments
with m1 as (select id from modules where title = 'Foundations of AI-Assisted Development'),
     m2 as (select id from modules where title = 'Building with LLMs'),
     m3 as (select id from modules where title = 'AI Agents & Automation'),
     m4 as (select id from modules where title = 'Production AI Systems')
insert into assessments (module_id, title, instructions, rubric, order_index) values
  (
    (select id from m1),
    'Build a CLI Tool Using AI',
    'Build a command-line tool that leverages AI to solve a real problem. Examples: a CLI that summarizes documents, generates commit messages, translates code between languages, or analyzes logs.

## Requirements
- Must use an LLM API (Claude, GPT, etc.)
- Must accept input via command line arguments or stdin
- Must produce useful, formatted output
- Include a README with setup instructions
- Push to a public GitHub repository

## Submission
Submit the link to your GitHub repository.',
    'Criteria: Functionality (does it work?), Code quality, AI integration quality, Documentation, Creativity',
    1
  ),
  (
    (select id from m2),
    'Build a RAG Application',
    'Build a web application that uses Retrieval-Augmented Generation to answer questions based on a specific knowledge base.

## Requirements
- Ingest at least one document source (PDF, web pages, or text files)
- Implement vector search for retrieval
- Use an LLM to generate answers grounded in retrieved context
- Build a simple web interface for querying
- Handle cases where the answer is not in the knowledge base

## Submission
Submit links to your GitHub repository and deployed application (if applicable).',
    'Criteria: RAG implementation quality, Retrieval accuracy, UI/UX, Code quality, Documentation',
    2
  ),
  (
    (select id from m3),
    'Build an AI Agent',
    'Build an AI agent that can autonomously complete a multi-step task using tools and external APIs.

## Requirements
- Agent must have access to at least 2 external tools/APIs
- Must handle multi-step reasoning
- Must include error handling and recovery
- Document the agent architecture
- Include example interactions

## Submission
Submit the link to your GitHub repository with documentation.',
    'Criteria: Agent architecture, Tool integration, Reliability, Error handling, Documentation',
    3
  ),
  (
    (select id from m4),
    'Deploy an AI Product',
    'Take one of your previous projects (or build something new) and deploy it as a production-ready application.

## Requirements
- Deployed and accessible via a public URL
- Proper error handling and loading states
- Cost monitoring or rate limiting implemented
- Basic evaluation/testing in place
- Documentation for maintenance

## Submission
Submit links to: deployed application, GitHub repository, and a brief write-up of your deployment decisions.',
    'Criteria: Production readiness, Deployment quality, Monitoring, Documentation, Overall polish',
    4
  );

-- ============================================
-- INDEXES
-- ============================================
create index idx_applications_status on applications(status);
create index idx_applications_email on applications(email);
create index idx_modules_track_id on modules(track_id);
create index idx_lessons_module_id on lessons(module_id);
create index idx_assessments_module_id on assessments(module_id);
create index idx_lesson_progress_user_id on lesson_progress(user_id);
create index idx_submissions_user_id on submissions(user_id);
create index idx_submissions_status on submissions(status);
create index idx_enrollments_user_id on enrollments(user_id);
create index idx_onboarding_progress_user_id on onboarding_progress(user_id);
