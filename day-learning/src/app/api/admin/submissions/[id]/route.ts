import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, feedback, reviewer_id } = body as {
      status: 'passed' | 'needs_revision'
      feedback: string
      reviewer_id: string
    }

    if (!status || !['passed', 'needs_revision'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "passed" or "needs_revision".' },
        { status: 400 }
      )
    }

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: 'Feedback is required.' },
        { status: 400 }
      )
    }

    if (!reviewer_id) {
      return NextResponse.json(
        { error: 'reviewer_id is required.' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('submissions')
      .update({
        status,
        feedback: feedback.trim(),
        reviewer_id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update submission:', error)
      return NextResponse.json(
        { error: 'Failed to update submission.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Submission PATCH error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
