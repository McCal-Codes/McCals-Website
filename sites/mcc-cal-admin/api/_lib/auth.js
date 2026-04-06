import crypto from 'node:crypto';

const AUTHORIZATION_ENDPOINT = 'https://vercel.com/oauth/authorize';
const TOKEN_ENDPOINT = 'https://api.vercel.com/login/oauth/token';
const USERINFO_ENDPOINT = 'https://api.vercel.com/login/oauth/userinfo';

const SESSION_COOKIE = 'mcc_admin_session';
const STATE_COOKIE = 'mcc_admin_oauth_state';
const VERIFIER_COOKIE = 'mcc_admin_oauth_verifier';
const RETURN_TO_COOKIE = 'mcc_admin_return_to';

const FLOW_TTL_SECONDS = 10 * 60;
const DEFAULT_SESSION_TTL_SECONDS = 12 * 60 * 60;
const DEFAULT_SCOPES = 'openid email profile';
const AUTH_MODEL = 'Sign in with Vercel (allowlisted app session)';

function normalizeCsv(value) {
  return String(value ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function readNumber(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseCookies(req) {
  const raw = req.headers.cookie ?? '';
  const cookies = {};

  for (const chunk of raw.split(';')) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const name = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    cookies[name] = decodeURIComponent(value);
  }

  return cookies;
}

function appendCookie(res, value) {
  const current = res.getHeader('Set-Cookie');

  if (!current) {
    res.setHeader('Set-Cookie', value);
    return;
  }

  if (Array.isArray(current)) {
    res.setHeader('Set-Cookie', [...current, value]);
    return;
  }

  res.setHeader('Set-Cookie', [current, value]);
}

function isSecureRequest(req) {
  const forwarded = String(req.headers['x-forwarded-proto'] ?? '');
  if (forwarded.toLowerCase().includes('https')) {
    return true;
  }

  return process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? '/'}`);

  if (options.httpOnly ?? true) {
    parts.push('HttpOnly');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function setCookie(req, res, name, value, options = {}) {
  appendCookie(
    res,
    serializeCookie(name, value, {
      httpOnly: options.httpOnly ?? true,
      sameSite: options.sameSite ?? 'Lax',
      secure: options.secure ?? isSecureRequest(req),
      path: options.path ?? '/',
      maxAge: options.maxAge,
      expires: options.expires,
    }),
  );
}

function clearCookie(req, res, name) {
  setCookie(req, res, name, '', {
    maxAge: 0,
    expires: new Date(0),
  });
}

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function decodeBase64urlJson(value) {
  const json = Buffer.from(value, 'base64url').toString('utf8');
  return JSON.parse(json);
}

function signValue(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function createSessionToken(session, secret) {
  const body = base64urlJson(session);
  const signature = signValue(body, secret);
  return `${body}.${signature}`;
}

function readSessionToken(token, secret) {
  if (!token || !secret || !token.includes('.')) {
    return null;
  }

  const [body, signature] = token.split('.');
  const expected = signValue(body, secret);

  if (!timingSafeEqual(signature, expected)) {
    return null;
  }

  const session = decodeBase64urlJson(body);
  const now = Math.floor(Date.now() / 1000);

  if (!session || typeof session !== 'object' || Number(session.exp) <= now) {
    return null;
  }

  return session;
}

function getRequestHost(req) {
  return String(req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3000');
}

function getRequestProtocol(req) {
  const forwarded = String(req.headers['x-forwarded-proto'] ?? '');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return process.env.VERCEL_ENV ? 'https' : 'http';
}

function getRequestOrigin(req) {
  return `${getRequestProtocol(req)}://${getRequestHost(req)}`;
}

function getCallbackUrl(req) {
  return `${getRequestOrigin(req)}/api/auth/callback`;
}

function getPublicTargets() {
  return {
    publicSiteUrl: process.env.PUBLIC_SITE_URL ?? process.env.VITE_PUBLIC_SITE_URL ?? '',
    publicApiUrl: process.env.PUBLIC_API_URL ?? process.env.VITE_PUBLIC_API_URL ?? '',
  };
}

function sanitizeReturnTo(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return '/';
  }

  if (value.startsWith('//')) {
    return '/';
  }

  return value;
}

function getRequiredKeys() {
  return [
    'VERCEL_CLIENT_ID',
    'VERCEL_CLIENT_SECRET',
    'ADMIN_SESSION_SECRET',
    'ADMIN_ALLOWED_EMAILS or ADMIN_ALLOWED_USERNAMES',
    'PUBLIC_SITE_URL or VITE_PUBLIC_SITE_URL',
    'PUBLIC_API_URL or VITE_PUBLIC_API_URL',
  ];
}

function getAuthConfig(req) {
  const clientId = String(process.env.VERCEL_CLIENT_ID ?? '').trim();
  const clientSecret = String(process.env.VERCEL_CLIENT_SECRET ?? '').trim();
  const sessionSecret = String(process.env.ADMIN_SESSION_SECRET ?? '').trim();
  const allowedEmails = normalizeCsv(process.env.ADMIN_ALLOWED_EMAILS);
  const allowedUsernames = normalizeCsv(process.env.ADMIN_ALLOWED_USERNAMES);
  const scopes = String(process.env.VERCEL_OAUTH_SCOPES ?? DEFAULT_SCOPES).trim();

  return {
    configured: Boolean(
      clientId &&
        clientSecret &&
        sessionSecret &&
        (allowedEmails.length > 0 || allowedUsernames.length > 0),
    ),
    clientId,
    clientSecret,
    sessionSecret,
    allowedEmails,
    allowedUsernames,
    scopes,
    callbackUrl: getCallbackUrl(req),
    sessionTtlSeconds: readNumber(process.env.ADMIN_SESSION_TTL_SECONDS, DEFAULT_SESSION_TTL_SECONDS),
  };
}

function sendJson(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(status).json(payload);
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Location', location);
  res.end();
}

function buildErrorLocation(code) {
  const params = new URLSearchParams();
  params.set('error', code);
  return `/login?${params.toString()}`;
}

function createPkceVerifier() {
  return crypto.randomBytes(48).toString('base64url');
}

function createCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

async function exchangeCode(config, code, codeVerifier) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: config.callbackUrl,
    }),
  });

  const payload = await response.json().catch(async () => {
    const text = await response.text();
    throw new Error(text || 'Token exchange failed');
  });

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || 'Token exchange failed');
  }

  return payload;
}

async function readUserProfile(accessToken) {
  const response = await fetch(USERINFO_ENDPOINT, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(async () => {
    const text = await response.text();
    throw new Error(text || 'Failed to read Vercel user profile');
  });

  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || 'Failed to read Vercel user profile');
  }

  return payload;
}

function isAllowedUser(profile, config) {
  const email = String(profile.email ?? '').trim().toLowerCase();
  const username = String(profile.preferred_username ?? '').trim().toLowerCase();

  if (config.allowedEmails.length > 0 && email && config.allowedEmails.includes(email)) {
    return true;
  }

  if (config.allowedUsernames.length > 0 && username && config.allowedUsernames.includes(username)) {
    return true;
  }

  return false;
}

function buildSession(profile, config) {
  const now = Math.floor(Date.now() / 1000);

  return {
    sub: String(profile.sub ?? ''),
    email: String(profile.email ?? ''),
    preferredUsername: String(profile.preferred_username ?? ''),
    name: String(profile.name ?? profile.preferred_username ?? profile.email ?? 'Admin user'),
    iat: now,
    exp: now + config.sessionTtlSeconds,
  };
}

export function getSetupChecklist(req) {
  return [
    'Create a Sign in with Vercel app in the Integrations Console.',
    `Add ${getCallbackUrl(req)} as an allowed callback URL.`,
    'Set VERCEL_CLIENT_ID, VERCEL_CLIENT_SECRET, and ADMIN_SESSION_SECRET on the admin project.',
    'Set ADMIN_ALLOWED_EMAILS or ADMIN_ALLOWED_USERNAMES to the exact operators allowed into the admin.',
    'Keep PUBLIC_SITE_URL and PUBLIC_API_URL configured for server-side probes.',
  ];
}

export function getAuthState(req) {
  const config = getAuthConfig(req);
  const session = config.configured
    ? readSessionToken(parseCookies(req)[SESSION_COOKIE], config.sessionSecret)
    : null;
  const { publicSiteUrl, publicApiUrl } = getPublicTargets();

  return {
    configured: config.configured,
    authenticated: Boolean(session),
    authModel: AUTH_MODEL,
    loginPath: '/api/auth/login',
    logoutPath: '/api/auth/logout',
    callbackUrl: config.callbackUrl,
    publicSiteUrl,
    publicApiUrl,
    setupChecklist: getSetupChecklist(req),
    user: session
      ? {
          email: session.email,
          preferredUsername: session.preferredUsername,
          name: session.name,
        }
      : null,
  };
}

export function requireAdminSession(req, res) {
  const authState = getAuthState(req);

  if (!authState.configured) {
    sendJson(res, 503, {
      ok: false,
      error: 'auth_not_configured',
      requiredKeys: getRequiredKeys(),
      callbackUrl: authState.callbackUrl,
    });
    return null;
  }

  if (!authState.authenticated || !authState.user) {
    sendJson(res, 401, {
      ok: false,
      error: 'authentication_required',
      loginPath: authState.loginPath,
    });
    return null;
  }

  return authState.user;
}

export function handleSession(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    ...getAuthState(req),
  });
}

export function handleLogin(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const config = getAuthConfig(req);

  if (!config.configured) {
    redirect(res, buildErrorLocation('auth_not_configured'));
    return;
  }

  const url = new URL(req.url ?? '/api/auth/login', getRequestOrigin(req));
  const state = crypto.randomBytes(24).toString('base64url');
  const verifier = createPkceVerifier();
  const challenge = createCodeChallenge(verifier);
  const returnTo = sanitizeReturnTo(url.searchParams.get('returnTo') ?? '/');

  setCookie(req, res, STATE_COOKIE, state, { maxAge: FLOW_TTL_SECONDS });
  setCookie(req, res, VERIFIER_COOKIE, verifier, { maxAge: FLOW_TTL_SECONDS });
  setCookie(req, res, RETURN_TO_COOKIE, returnTo, { maxAge: FLOW_TTL_SECONDS });

  const authorizationUrl = new URL(AUTHORIZATION_ENDPOINT);
  authorizationUrl.searchParams.set('client_id', config.clientId);
  authorizationUrl.searchParams.set('redirect_uri', config.callbackUrl);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', config.scopes);
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('code_challenge', challenge);
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');

  redirect(res, authorizationUrl.toString());
}

export async function handleCallback(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const config = getAuthConfig(req);

  if (!config.configured) {
    redirect(res, buildErrorLocation('auth_not_configured'));
    return;
  }

  const url = new URL(req.url ?? '/api/auth/callback', getRequestOrigin(req));
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const upstreamError = url.searchParams.get('error');
  const cookies = parseCookies(req);

  if (upstreamError) {
    clearCookie(req, res, STATE_COOKIE);
    clearCookie(req, res, VERIFIER_COOKIE);
    clearCookie(req, res, RETURN_TO_COOKIE);
    redirect(res, buildErrorLocation(upstreamError));
    return;
  }

  if (!code || !state || state !== cookies[STATE_COOKIE] || !cookies[VERIFIER_COOKIE]) {
    clearCookie(req, res, STATE_COOKIE);
    clearCookie(req, res, VERIFIER_COOKIE);
    clearCookie(req, res, RETURN_TO_COOKIE);
    redirect(res, buildErrorLocation('state_mismatch'));
    return;
  }

  try {
    const tokenData = await exchangeCode(config, code, cookies[VERIFIER_COOKIE]);
    const profile = await readUserProfile(tokenData.access_token);

    if (!isAllowedUser(profile, config)) {
      clearCookie(req, res, STATE_COOKIE);
      clearCookie(req, res, VERIFIER_COOKIE);
      clearCookie(req, res, RETURN_TO_COOKIE);
      clearCookie(req, res, SESSION_COOKIE);
      redirect(res, buildErrorLocation('user_not_allowed'));
      return;
    }

    const session = buildSession(profile, config);
    setCookie(req, res, SESSION_COOKIE, createSessionToken(session, config.sessionSecret), {
      maxAge: config.sessionTtlSeconds,
    });

    const returnTo = sanitizeReturnTo(cookies[RETURN_TO_COOKIE] ?? '/');

    clearCookie(req, res, STATE_COOKIE);
    clearCookie(req, res, VERIFIER_COOKIE);
    clearCookie(req, res, RETURN_TO_COOKIE);
    redirect(res, returnTo);
  } catch {
    clearCookie(req, res, STATE_COOKIE);
    clearCookie(req, res, VERIFIER_COOKIE);
    clearCookie(req, res, RETURN_TO_COOKIE);
    clearCookie(req, res, SESSION_COOKIE);
    redirect(res, buildErrorLocation('token_exchange_failed'));
  }
}

export function handleLogout(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  clearCookie(req, res, SESSION_COOKIE);
  redirect(res, '/login');
}

export function getHealthRuntime(req) {
  const authState = getAuthState(req);
  const { publicSiteUrl, publicApiUrl } = getPublicTargets();

  return {
    authModel: authState.authModel,
    publicSiteUrl,
    publicApiUrl,
  };
}
