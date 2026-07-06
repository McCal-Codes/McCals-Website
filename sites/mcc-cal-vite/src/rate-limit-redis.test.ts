import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisMocks = vi.hoisted(() => ({
  checkRedisRateLimit: vi.fn(),
}));

vi.mock('../api/_lib/redis.js', () => ({
  checkRedisRateLimit: redisMocks.checkRedisRateLimit,
}));

function createMockRes() {
  const headers = new Map<string, string>();
  return {
    setHeader(key: string, value: string) {
      headers.set(key.toLowerCase(), value);
    },
    getHeader(key: string) {
      return headers.get(key.toLowerCase());
    },
  };
}

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.env = {
    ...originalEnv,
    NODE_ENV: 'production',
    VERCEL: '1',
  };
});

describe('rate-limit-redis', () => {
  it('falls back to memory limiting when Redis is unavailable', async () => {
    redisMocks.checkRedisRateLimit.mockResolvedValue({ useFallback: true });
    const { applyRateLimit } = await import('../api/_lib/rate-limit-redis.js');
    const req = {
      headers: { 'x-forwarded-for': '198.51.100.10' },
      socket: {},
      connection: {},
    };
    const firstRes = createMockRes();
    const secondRes = createMockRes();
    const options = { route: 'fallback-test', limit: 1, windowMs: 60_000 };

    await expect(applyRateLimit(req, firstRes, options)).resolves.toEqual({ allowed: true });
    await expect(applyRateLimit(req, secondRes, options)).resolves.toEqual(
      expect.objectContaining({ allowed: false }),
    );

    expect(redisMocks.checkRedisRateLimit).toHaveBeenCalledTimes(2);
    expect(firstRes.getHeader('x-ratelimit-remaining')).toBe('0');
    expect(secondRes.getHeader('retry-after')).toBeDefined();
  });
});
