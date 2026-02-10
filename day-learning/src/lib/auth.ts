import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * Get the current authenticated user along with their profile from the
 * profiles table. Returns `null` for both if no session exists.
 */
export async function getCurrentUser(supabase: SupabaseClient<Database>) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return { user: session.user, profile }
}

/**
 * Check whether a profile has the admin role.
 */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin'
}

/**
 * Returns `true` when a valid session exists on the provided Supabase client.
 */
export async function isAuthenticated(
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return !!session
}

/**
 * Sign the current user out and redirect to the home page.
 */
export async function signOut(supabase: SupabaseClient<Database>) {
  await supabase.auth.signOut()

  // Client-side redirect after sign out
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}
