import { createContext, useContext } from 'react';

export interface AuthUser {
  email: string;
  preferredUsername: string;
  name: string;
}

export interface AuthSessionState {
  ok: boolean;
  configured: boolean;
  authenticated: boolean;
  authModel: string;
  loginPath: string;
  logoutPath: string;
  callbackUrl: string;
  publicSiteUrl: string;
  publicApiUrl: string;
  setupChecklist: string[];
  user: AuthUser | null;
}

export const AuthSessionContext = createContext<AuthSessionState | null>(null);

export function useAuthSession() {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error('Auth session context is not available.');
  }

  return value;
}

export async function loadAuthSession(): Promise<AuthSessionState> {
  const response = await fetch('/api/auth/session', {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`/api/auth/session returned ${response.status}`);
  }

  return response.json() as Promise<AuthSessionState>;
}

const ERROR_MESSAGES = {
  access_denied: 'The Vercel authorization request was denied.',
  auth_not_configured: 'Admin authentication is not configured yet for this deployment.',
  state_mismatch: 'The login flow expired or became invalid. Start the sign-in flow again.',
  token_exchange_failed: 'The Vercel callback completed, but the token exchange failed.',
  user_not_allowed: 'That Vercel account is not on the admin allowlist.',
} as const;

export function getAuthErrorMessage(code: string | null) {
  if (!code) {
    return null;
  }

  return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] ?? 'Authentication failed.';
}
