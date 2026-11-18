import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://uvqptlflvdtxbrqiztzi.supabase.co';

const SUPABASE_AUTH_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cXB0bGZsdmR0eGJycWl6dHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5Mjk4NjksImV4cCI6MjExMDUwNTg2OX0.4NdWe8fXBv6qE_sVvUZhofFW5CVQJAY_X1IvkwB69ZE';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_AUTH_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface VerifiedSupabaseUser {
  uid: string;
  email: string;
  fullName: string;
}

export async function verifySupabaseAccessToken(
  token: string
): Promise<VerifiedSupabaseUser | null> {
  if (!token || token.startsWith('sbx.')) return null;
  try {
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }
    const supaUser = data.user;
    const email = supaUser.email || `${supaUser.id}@foodora.bd`;
    const meta = (supaUser.user_metadata || {}) as Record<string, unknown>;
    const fullName =
      (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
      (typeof meta.name === 'string' && meta.name.trim()) ||
      email.split('@')[0] ||
      'Foodora User';
    return {
      uid: supaUser.id,
      email,
      fullName,
    };
  } catch (err) {
    console.warn('Supabase token verification failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
