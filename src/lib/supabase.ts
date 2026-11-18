import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PUBLIC_CONFIG = {
  url:
    import.meta.env.VITE_SUPABASE_URL ||
    'https://uvqptlflvdtxbrqiztzi.supabase.co',
  anonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cXB0bGZsdmR0eGJycWl6dHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5Mjk4NjksImV4cCI6MjExMDUwNTg2OX0.4NdWe8fXBv6qE_sVvUZhofFW5CVQJAY_X1IvkwB69ZE',
};

export const supabase = createClient(
  SUPABASE_PUBLIC_CONFIG.url,
  SUPABASE_PUBLIC_CONFIG.anonKey,
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export function isEmbeddedIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
