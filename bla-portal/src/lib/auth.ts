'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  phone?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  const supabase = await createServerClient();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      },
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: 'Failed to create user' };
  }

  // Create user profile in users table
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email: data.email,
    full_name: data.fullName,
    national_id: data.nationalId,
    date_of_birth: data.dateOfBirth,
    phone: data.phone || null,
  });

  if (profileError) {
    // If profile creation fails, we should handle this gracefully
    // The user can complete their profile later
    console.error('Profile creation error:', profileError);
  }

  return { success: true };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update password (after reset)
 */
export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
