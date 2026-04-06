import { getHealthRuntime, requireAdminSession } from './_lib/auth.js';

async function probe(label, url) {
  if (!url) {
    return {
      label,
      tone: 'pending',
      detail: `Set ${label === 'Public site' ? 'PUBLIC_SITE_URL' : 'PUBLIC_API_URL'} or the matching VITE_ variable to enable probing.`,
    };
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    return {
      label,
      tone: response.ok ? 'healthy' : 'warning',
      detail: `${url} responded ${response.status}`,
    };
  } catch (error) {
    return {
      label,
      tone: 'offline',
      detail: error instanceof Error ? error.message : `Failed to reach ${url}`,
    };
  }
}

export default async function handler(_req, res) {
  const session = requireAdminSession(_req, res);
  if (!session) {
    return;
  }

  const runtime = getHealthRuntime(_req);
  const publicSiteUrl = runtime.publicSiteUrl;
  const publicApiBase = runtime.publicApiUrl;
  const publicApiHealth = publicApiBase ? `${publicApiBase.replace(/\/$/, '')}/api/v1/health` : '';

  const probes = await Promise.all([
    probe('Public site', publicSiteUrl),
    probe('Public API', publicApiHealth),
  ]);

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).json({
    ok: true,
    service: 'mcc-cal-admin',
    authModel: runtime.authModel,
    mode: 'read-only-first',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV ?? 'development',
    operator: session.email || session.preferredUsername || session.name,
    capabilities: [
      'dashboard-shell',
      'status-probes',
      'ops-planning',
      'bookings-roadmap',
      'bookings-read',
      'content-governance',
    ],
    probes,
  });
}
