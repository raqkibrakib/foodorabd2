import crypto from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { verifySupabaseAccessToken } from '../lib/supabase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';

export type UserRole = 'customer' | 'restaurant_owner' | 'rider' | 'admin' | 'super_admin';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  isSandbox: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

const SANDBOX_SECRET =
  process.env.SANDBOX_SESSION_SECRET ||
  `foodora-bd-sandbox-${process.env.SQL_DB_NAME || 'dev'}-${process.env.APPLET_ID || 'local'}`;

export function signSandboxToken(payload: {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  isSandbox?: boolean;
}): string {
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      isSandbox: payload.isSandbox ?? true,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SANDBOX_SECRET).update(data).digest('base64url');
  return `sbx.${data}.${sig}`;
}

export function verifySandboxToken(token: string): AuthenticatedUser | null {
  if (!token.startsWith('sbx.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, data, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SANDBOX_SECRET).update(data).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return {
      uid: parsed.uid,
      email: parsed.email,
      fullName: parsed.fullName,
      role: parsed.role,
      isSandbox: Boolean(parsed.isSandbox ?? true),
    };
  } catch {
    return null;
  }
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  fullName?: string,
  defaultRole: UserRole = 'customer'
) {
  const emailLower = email.trim().toLowerCase();
  const isPrimaryAdmin = emailLower === 'rakibraqkib@gmail.com';
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      if (isPrimaryAdmin && existing[0].role !== 'super_admin') {
        const promoted = await db
          .update(users)
          .set({ role: 'super_admin', updatedAt: new Date() })
          .where(eq(users.id, existing[0].id))
          .returning();
        return promoted[0];
      }
      return existing[0];
    }

    // Check if this email already has an existing Foodora BD user record (e.g., from Email/Password or legacy login)
    const existingByEmail = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${emailLower}`)
      .limit(1);
    if (existingByEmail.length > 0) {
      const current = existingByEmail[0];
      const nextRole = isPrimaryAdmin ? 'super_admin' : current.role;
      const nextName =
        fullName && fullName.trim() && current.fullName.startsWith('Foodora')
          ? fullName.trim()
          : current.fullName;
      if (nextRole !== current.role || nextName !== current.fullName) {
        const updated = await db
          .update(users)
          .set({ role: nextRole, fullName: nextName, updatedAt: new Date() })
          .where(eq(users.id, current.id))
          .returning();
        return updated[0];
      }
      return current;
    }

    const assignedRole: UserRole = isPrimaryAdmin ? 'super_admin' : defaultRole;
    const inserted = await db
      .insert(users)
      .values({
        uid,
        email: emailLower,
        fullName: fullName || emailLower.split('@')[0] || 'Foodora User',
        role: assignedRole,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: emailLower,
          updatedAt: new Date(),
        },
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

async function resolveUserFromHeader(authHeader?: string): Promise<AuthenticatedUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  // 1. Check server-signed session/sandbox token
  const sandboxUser = verifySandboxToken(token);
  if (sandboxUser) {
    const dbUser = await getOrCreateUser(
      sandboxUser.uid,
      sandboxUser.email,
      sandboxUser.fullName,
      sandboxUser.role
    );
    return {
      uid: dbUser.uid,
      email: dbUser.email,
      fullName: dbUser.fullName,
      role: dbUser.role as UserRole,
      isSandbox: sandboxUser.isSandbox,
    };
  }

  // 2. Verify genuine Supabase Auth access token
  const supaUser = await verifySupabaseAccessToken(token);
  if (!supaUser) return null;
  const dbUser = await getOrCreateUser(
    supaUser.uid,
    supaUser.email,
    supaUser.fullName,
    'customer'
  );
  return {
    uid: dbUser.uid,
    email: dbUser.email,
    fullName: dbUser.fullName,
    role: dbUser.role as UserRole,
    isSandbox: false,
  };
}

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const user = await resolveUserFromHeader(req.headers.authorization);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    console.warn('Optional auth token ignored:', err instanceof Error ? err.message : err);
  }
  next();
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUserFromHeader(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};
