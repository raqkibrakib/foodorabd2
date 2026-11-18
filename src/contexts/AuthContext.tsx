import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isEmbeddedIframe, supabase } from '../lib/supabase';
import { apiFetch, getAuthToken, setAuthToken } from '../lib/api';
import type { AppUser } from '../types/marketplace';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  googleRedirectUrl: string | null;
  clearError: () => void;
  clearGoogleRedirectUrl: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<AppUser>;
  registerWithEmail: (fullName: string, email: string, password: string) => Promise<AppUser>;
  unlockAdminWithPin: (pin: string) => Promise<AppUser>;
  signInSandboxPersona: (role: 'customer' | 'restaurant_owner' | 'rider') => Promise<AppUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const SIGNED_OUT_FLAG = 'foodora_bd_signed_out_v1';

const AuthContext = createContext<AuthContextValue | null>(null);

function formatSupabaseAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err || '');
  const lower = msg.toLowerCase();
  if (lower.includes('provider is not enabled') || lower.includes('unsupported provider')) {
    return 'Google provider is not enabled yet in Supabase Authentication -> Providers -> Google.';
  }
  if (lower.includes('redirect') || lower.includes('url')) {
    return `${msg} Add ${typeof window !== 'undefined' ? window.location.origin : 'your domain'} to Supabase Authentication -> URL Configuration -> Redirect URLs.`;
  }
  return msg || 'Sign-in failed. Please try Email & Password below.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleRedirectUrl, setGoogleRedirectUrl] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearGoogleRedirectUrl = useCallback(() => setGoogleRedirectUrl(null), []);

  const syncTokenWithBackend = useCallback(async (accessToken: string): Promise<AppUser> => {
    setAuthToken(accessToken);
    try {
      sessionStorage.removeItem(SIGNED_OUT_FLAG);
    } catch {
      // ignore
    }
    const res = await apiFetch<{ user: AppUser }>('/api/auth/sync', { method: 'POST' });
    setUser(res.user);
    return res.user;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      try {
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const oauthErrDesc =
            searchParams.get('error_description') ||
            hashParams.get('error_description') ||
            searchParams.get('error') ||
            hashParams.get('error');
          if (oauthErrDesc) {
            setError(formatSupabaseAuthError(oauthErrDesc));
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        // 1. Check active Supabase OAuth / session first
        const { data: sessionData } = await supabase.auth.getSession();
        const supaToken = sessionData.session?.access_token;
        if (supaToken) {
          await syncTokenWithBackend(supaToken);
          // Clean PKCE ?code= query parameter from address bar once exchanged
          if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          if (mounted) setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase session check failed:', err);
      }

      // 2. Respect explicit sign-out
      let explicitlySignedOut = false;
      try {
        explicitlySignedOut = sessionStorage.getItem(SIGNED_OUT_FLAG) === '1';
      } catch {
        explicitlySignedOut = false;
      }
      if (explicitlySignedOut) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // 3. Restore saved local email/password or sandbox token if valid
      const savedToken = getAuthToken();
      if (savedToken) {
        try {
          const res = await apiFetch<{ user: AppUser }>('/api/auth/sync', { method: 'POST' });
          if (mounted) {
            setUser(res.user);
            setLoading(false);
          }
          return;
        } catch {
          setAuthToken(null);
        }
      }

      // 4. Auto-initialize default Customer sandbox session on first visit
      try {
        const res = await apiFetch<{ token: string; user: AppUser }>('/api/auth/sandbox-session', {
          method: 'POST',
          body: JSON.stringify({ role: 'customer' }),
        });
        setAuthToken(res.token);
        if (mounted) setUser(res.user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrapSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        try {
          await syncTokenWithBackend(session.access_token);
          setGoogleRedirectUrl(null);
        } catch (err) {
          console.error('Supabase user sync failed:', err);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncTokenWithBackend]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setError(null);
    setGoogleRedirectUrl(null);
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const embedded = isEmbeddedIframe();

      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          skipBrowserRedirect: embedded,
        },
      });

      if (oauthErr) {
        setError(formatSupabaseAuthError(oauthErr));
        return false;
      }

      if (embedded && data?.url) {
        // Inside an iframe, Google blocks X-Frame-Options: DENY; show direct top-level link
        setGoogleRedirectUrl(data.url);
        return false;
      }

      // On Vercel / top-level browser tab, Supabase navigates to Google OAuth cleanly
      return true;
    } catch (err: unknown) {
      setError(formatSupabaseAuthError(err));
      return false;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AppUser> => {
    setError(null);
    try {
      const res = await apiFetch<{ token: string; user: AppUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      try {
        sessionStorage.removeItem(SIGNED_OUT_FLAG);
      } catch {
        // ignore
      }
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    }
  }, []);

  const registerWithEmail = useCallback(
    async (fullName: string, email: string, password: string): Promise<AppUser> => {
      setError(null);
      try {
        const res = await apiFetch<{ token: string; user: AppUser }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ fullName, email, password }),
        });
        try {
          sessionStorage.removeItem(SIGNED_OUT_FLAG);
        } catch {
          // ignore
        }
        setAuthToken(res.token);
        setUser(res.user);
        return res.user;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const unlockAdminWithPin = useCallback(async (pin: string): Promise<AppUser> => {
    setError(null);
    try {
      const res = await apiFetch<{ token: string; user: AppUser }>('/api/auth/admin-pin', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      });
      try {
        sessionStorage.removeItem(SIGNED_OUT_FLAG);
      } catch {
        // ignore
      }
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Admin PIN verification failed';
      setError(msg);
      throw err;
    }
  }, []);

  const signInSandboxPersona = useCallback(
    async (role: 'customer' | 'restaurant_owner' | 'rider') => {
      setError(null);
      try {
        sessionStorage.removeItem(SIGNED_OUT_FLAG);
      } catch {
        // ignore
      }
      const res = await apiFetch<{ token: string; user: AppUser }>('/api/auth/sandbox-session', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const signOut = useCallback(async () => {
    setError(null);
    setGoogleRedirectUrl(null);
    try {
      sessionStorage.setItem(SIGNED_OUT_FLAG, '1');
    } catch {
      // ignore
    }
    setAuthToken(null);
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await apiFetch<{ user: AppUser }>('/api/auth/sync', { method: 'POST' });
    setUser(res.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        googleRedirectUrl,
        clearError,
        clearGoogleRedirectUrl,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        unlockAdminWithPin,
        signInSandboxPersona,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
