import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApplicationPayload {
  full_name: string
  email: string
  phone: string | null
  country: string
  linkedin_url: string | null
  resume_url: string | null
  brief: string | null
  experience: string
  years_experience: string
  tech_stack: string[]
  track_applied: string
  commitment_confirmed: boolean
  referral_source: string
}

interface AIScreeningResult {
  decision: 'accept' | 'review' | 'reject'
  confidence: number
  reasoning: string
  experience_level: 'junior' | 'mid' | 'senior'
  strengths: string[]
  concerns: string[]
}

// ---------------------------------------------------------------------------
// AI Screening
// ---------------------------------------------------------------------------

const SCREENING_PROMPT = `You are screening applications for Day Learning, an AI engineering training program.

The ideal candidate:
- Has existing software engineering or programming experience
- Has built real projects or worked as a developer professionally
- Shows willingness to commit to structured learning
- Has at least 1-2 years of hands-on coding experience

Review this application and return a JSON response:
{
  "decision": "accept" | "review" | "reject",
  "confidence": 0-100,
  "reasoning": "Brief explanation",
  "experience_level": "junior" | "mid" | "senior",
  "strengths": ["..."],
  "concerns": ["..."]
}

Be generous but filter out people with zero programming experience.
Applications marked "review" will be manually checked by the team.`

async function screenApplication(
  application: ApplicationPayload
): Promise<AIScreeningResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[AI Screening] ANTHROPIC_API_KEY not set — skipping AI screening.')
    return null
  }

  const applicationSummary = [
    `Name: ${application.full_name}`,
    `Years of experience: ${application.years_experience}`,
    `Tech stack: ${application.tech_stack.join(', ')}`,
    `Track applied: ${application.track_applied}`,
    `Commitment confirmed: ${application.commitment_confirmed ? 'Yes' : 'No'}`,
    application.brief ? `\nBrief:\n${application.brief}` : '',
    application.experience ? `\nExperience:\n${application.experience}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${SCREENING_PROMPT}\n\n--- APPLICATION ---\n${applicationSummary}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      console.error('[AI Screening] API error:', response.status, errorBody)
      return null
    }

    const data = await response.json()

    // Extract text content from Claude's response
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === 'text'
    )
    if (!textBlock?.text) {
      console.error('[AI Screening] No text content in response.')
      return null
    }

    // Parse the JSON from Claude's response — it may be wrapped in markdown code fences
    let jsonString = textBlock.text.trim()
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim()
    }

    const result: AIScreeningResult = JSON.parse(jsonString)

    // Basic validation of the parsed result
    if (
      !['accept', 'review', 'reject'].includes(result.decision) ||
      typeof result.confidence !== 'number'
    ) {
      console.error('[AI Screening] Invalid response structure:', result)
      return null
    }

    return result
  } catch (error) {
    console.error('[AI Screening] Failed:', error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Determine application status from AI result
// ---------------------------------------------------------------------------

function determineStatus(
  aiResult: AIScreeningResult | null
): 'pending' | 'approved' | 'rejected' {
  if (!aiResult) return 'pending'

  if (aiResult.decision === 'accept' && aiResult.confidence > 75) {
    return 'approved'
  }
  if (aiResult.decision === 'reject' && aiResult.confidence > 80) {
    return 'rejected'
  }

  // Everything else goes to manual review
  return 'pending'
}

// ---------------------------------------------------------------------------
// Server-side validation
// ---------------------------------------------------------------------------

function validatePayload(
  body: Record<string, unknown>
): { valid: true; data: ApplicationPayload } | { valid: false; error: string } {
  const requiredFields: { key: string; label: string }[] = [
    { key: 'full_name', label: 'Full name' },
    { key: 'email', label: 'Email' },
    { key: 'country', label: 'Country' },
    { key: 'years_experience', label: 'Years of experience' },
    { key: 'track_applied', label: 'Track' },
    { key: 'referral_source', label: 'Referral source' },
  ]

  for (const field of requiredFields) {
    if (!body[field.key] || (typeof body[field.key] === 'string' && !(body[field.key] as string).trim())) {
      return { valid: false, error: `${field.label} is required.` }
    }
  }

  // Validate email format
  const email = body.email as string
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Please provide a valid email address.' }
  }

  // Validate tech_stack is a non-empty array
  if (!Array.isArray(body.tech_stack) || body.tech_stack.length === 0) {
    return { valid: false, error: 'At least one technology must be selected.' }
  }

  // Validate commitment_confirmed is a boolean
  if (typeof body.commitment_confirmed !== 'boolean') {
    return { valid: false, error: 'Please confirm your weekly commitment.' }
  }

  return {
    valid: true,
    data: {
      full_name: (body.full_name as string).trim(),
      email: email.trim().toLowerCase(),
      phone: (body.phone as string | null) || null,
      country: (body.country as string).trim(),
      linkedin_url: (body.linkedin_url as string | null) || null,
      resume_url: (body.resume_url as string | null) || null,
      brief: (body.brief as string | null) || null,
      experience: ((body.experience as string) || '').trim(),
      years_experience: (body.years_experience as string).trim(),
      tech_stack: body.tech_stack as string[],
      track_applied: (body.track_applied as string).trim(),
      commitment_confirmed: body.commitment_confirmed as boolean,
      referral_source: (body.referral_source as string).trim(),
    },
  }
}

// ---------------------------------------------------------------------------
// POST /api/applications
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ---- Validate ----
    const validation = validatePayload(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const data = validation.data

    // ---- Insert into Supabase ----
    const supabase = createServiceRoleClient()

    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        linkedin_url: data.linkedin_url,
        resume_url: data.resume_url,
        brief: data.brief,
        years_experience: data.years_experience,
        tech_stack: data.tech_stack,
        track_applied: data.track_applied,
        commitment_confirmed: data.commitment_confirmed,
        referral_source: data.referral_source,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[Applications] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save application. Please try again.' },
        { status: 500 }
      )
    }

    const applicationId = application.id

    // ---- AI Screening ----
    // Run AI screening asynchronously-ish (we await it, but if it fails we
    // still return success — the application is already saved).
    const aiResult = await screenApplication(data)

    if (aiResult) {
      const status = determineStatus(aiResult)

      const { error: updateError } = await supabase
        .from('applications')
        .update({
          ai_decision: aiResult.decision,
          ai_confidence: aiResult.confidence,
          ai_reasoning: aiResult.reasoning,
          ai_experience_level: aiResult.experience_level,
          ai_strengths: aiResult.strengths,
          ai_concerns: aiResult.concerns,
          status,
        })
        .eq('id', applicationId)

      if (updateError) {
        // Non-fatal: application is saved, AI data just didn't persist.
        console.error('[Applications] AI screening update error:', updateError)
      }
    }

    // ---- Success ----
    return NextResponse.json(
      {
        success: true,
        application_id: applicationId,
        message: 'Application submitted successfully.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Applications] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
