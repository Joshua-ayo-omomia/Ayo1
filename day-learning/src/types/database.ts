export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          country: string | null
          linkedin_url: string | null
          github_url: string | null
          avatar_url: string | null
          bio: string | null
          role: 'student' | 'admin' | 'reviewer'
          onboarding_completed: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          country?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'student' | 'admin' | 'reviewer'
          onboarding_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          country?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'student' | 'admin' | 'reviewer'
          onboarding_completed?: boolean
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          country: string | null
          linkedin_url: string | null
          resume_url: string | null
          brief: string | null
          years_experience: string | null
          tech_stack: string[] | null
          track_applied: string
          commitment_confirmed: boolean | null
          referral_source: string | null
          ai_decision: 'accept' | 'review' | 'reject' | null
          ai_confidence: number | null
          ai_reasoning: string | null
          ai_experience_level: string | null
          ai_strengths: string[] | null
          ai_concerns: string[] | null
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          country?: string | null
          linkedin_url?: string | null
          resume_url?: string | null
          brief?: string | null
          years_experience?: string | null
          tech_stack?: string[] | null
          track_applied?: string
          commitment_confirmed?: boolean | null
          referral_source?: string | null
          ai_decision?: 'accept' | 'review' | 'reject' | null
          ai_confidence?: number | null
          ai_reasoning?: string | null
          ai_experience_level?: string | null
          ai_strengths?: string[] | null
          ai_concerns?: string[] | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          country?: string | null
          linkedin_url?: string | null
          resume_url?: string | null
          brief?: string | null
          years_experience?: string | null
          tech_stack?: string[] | null
          track_applied?: string
          commitment_confirmed?: boolean | null
          referral_source?: string | null
          ai_decision?: 'accept' | 'review' | 'reject' | null
          ai_confidence?: number | null
          ai_reasoning?: string | null
          ai_experience_level?: string | null
          ai_strengths?: string[] | null
          ai_concerns?: string[] | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          status: 'draft' | 'active' | 'coming_soon' | 'archived'
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          status?: 'draft' | 'active' | 'coming_soon' | 'archived'
          order_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          status?: 'draft' | 'active' | 'coming_soon' | 'archived'
          order_index?: number | null
          created_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          track_id: string
          title: string
          description: string | null
          order_index: number | null
          status: 'draft' | 'published'
          created_at: string
        }
        Insert: {
          id?: string
          track_id: string
          title: string
          description?: string | null
          order_index?: number | null
          status?: 'draft' | 'published'
          created_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          title?: string
          description?: string | null
          order_index?: number | null
          status?: 'draft' | 'published'
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          video_url: string | null
          reading_content: string | null
          order_index: number | null
          status: 'draft' | 'published'
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          video_url?: string | null
          reading_content?: string | null
          order_index?: number | null
          status?: 'draft' | 'published'
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string | null
          video_url?: string | null
          reading_content?: string | null
          order_index?: number | null
          status?: 'draft' | 'published'
          created_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          module_id: string
          title: string
          instructions: string
          rubric: string | null
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          instructions: string
          rubric?: string | null
          order_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          instructions?: string
          rubric?: string | null
          order_index?: number | null
          created_at?: string
        }
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          assessment_id: string
          submission_url: string
          notes: string | null
          status: 'submitted' | 'under_review' | 'passed' | 'needs_revision'
          reviewer_id: string | null
          feedback: string | null
          reviewed_at: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_id: string
          submission_url: string
          notes?: string | null
          status?: 'submitted' | 'under_review' | 'passed' | 'needs_revision'
          reviewer_id?: string | null
          feedback?: string | null
          reviewed_at?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_id?: string
          submission_url?: string
          notes?: string | null
          status?: 'submitted' | 'under_review' | 'passed' | 'needs_revision'
          reviewer_id?: string | null
          feedback?: string | null
          reviewed_at?: string | null
          submitted_at?: string
        }
      }
      onboarding_progress: {
        Row: {
          id: string
          user_id: string
          item_key: string
          completed: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_key: string
          completed?: boolean
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          item_key?: string
          completed?: boolean
          completed_at?: string | null
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          link: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          link?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          link?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          track_id: string
          enrolled_at: string
          status: 'active' | 'completed' | 'paused' | 'dropped'
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          enrolled_at?: string
          status?: 'active' | 'completed' | 'paused' | 'dropped'
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          enrolled_at?: string
          status?: 'active' | 'completed' | 'paused' | 'dropped'
          completed_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
