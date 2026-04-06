export type ProbeTone = 'healthy' | 'warning' | 'pending' | 'offline';

export interface ProbeCard {
  label: string;
  tone: ProbeTone;
  detail: string;
}

export interface AdminHealthResponse {
  ok: boolean;
  service: string;
  authModel: string;
  mode: string;
  version: string;
  timestamp: string;
  environment: string;
  capabilities: string[];
  probes: ProbeCard[];
}

export interface DashboardSnapshot {
  adminHealth: AdminHealthResponse | null;
  probes: ProbeCard[];
  errors: string[];
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Admin session expired or missing.');
    }

    if (response.status === 503) {
      throw new Error('Admin authentication is not configured on this deployment.');
    }

    throw new Error(`${url} returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function loadDashboardSnapshot(): Promise<DashboardSnapshot> {
  try {
    const adminHealth = await readJson<AdminHealthResponse>('/api/health');

    return {
      adminHealth,
      probes: [
        {
          label: 'Admin app',
          tone: adminHealth.ok ? 'healthy' : 'warning',
          detail: `${adminHealth.service} ${adminHealth.version} in ${adminHealth.environment}`,
        },
        ...adminHealth.probes,
      ],
      errors: [],
    };
  } catch (error) {
    return {
      adminHealth: null,
      probes: [
        {
          label: 'Admin app',
          tone: 'offline',
          detail: 'Local admin health endpoint did not respond.',
        },
      ],
      errors: [error instanceof Error ? error.message : 'Admin health failed'],
    };
  }
}

export const PHASE_ONE_MODULES = [
  {
    title: 'Scheduling operations',
    detail: 'Read KV-backed bookings, inspect conflicts, and stage cancel or reschedule actions behind admin-only APIs.',
  },
  {
    title: 'Manifest and cache controls',
    detail: 'Expose explicit refresh, warm, and verify flows without bundling them into the public site.',
  },
  {
    title: 'Incident response',
    detail: 'Surface runbooks, deployment links, and health checks in one internal interface.',
  },
  {
    title: 'Publishing governance',
    detail: 'Document why repo writes do not belong in Vercel Functions and prepare for Git-backed or CMS-backed editing later.',
  },
];

export const CONTENT_DECISIONS = [
  'Do not write directly into repository files from Vercel runtime.',
  'Treat the old Express admin as a legacy local prototype only.',
  'If editor workflows become necessary, prefer Git-backed commits or a real headless CMS.',
];
