import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * hasWebglSupport caches its probe at module scope, so every case re-imports
 * the module to get a clean answer.
 */
async function loadSupport() {
  vi.resetModules();
  return import('./heroShaderSupport');
}

function stubWebgl(available: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    ((contextId: string) => {
      if (contextId !== 'webgl2' && contextId !== 'webgl') return null;
      return available ? ({ getExtension: () => null } as unknown as RenderingContext) : null;
    }) as HTMLCanvasElement['getContext'],
  );
}

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reduce : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

/** jsdom's navigator is read-only, so patch just the keys under test. */
function stubNavigator(overrides: Record<string, unknown>) {
  for (const [key, value] of Object.entries(overrides)) {
    Object.defineProperty(navigator, key, { value, configurable: true, writable: true });
  }
}

beforeEach(() => {
  stubWebgl(true);
  stubReducedMotion(false);
  stubNavigator({ connection: undefined, deviceMemory: undefined });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('shouldEnableHeroShader', () => {
  it('enables the layer on a capable, motion-tolerant browser', async () => {
    const { shouldEnableHeroShader } = await loadSupport();
    expect(shouldEnableHeroShader()).toBe(true);
  });

  it('refuses when the visitor asked for reduced motion', async () => {
    stubReducedMotion(true);
    const { shouldEnableHeroShader } = await loadSupport();
    expect(shouldEnableHeroShader()).toBe(false);
  });

  it('refuses when WebGL is unavailable', async () => {
    stubWebgl(false);
    const { shouldEnableHeroShader } = await loadSupport();
    expect(shouldEnableHeroShader()).toBe(false);
  });

  it('refuses under Save-Data', async () => {
    stubNavigator({ connection: { saveData: true } });
    const { shouldEnableHeroShader } = await loadSupport();
    expect(shouldEnableHeroShader()).toBe(false);
  });

  it('refuses on slow connections', async () => {
    stubNavigator({ connection: { effectiveType: '2g' } });
    const { shouldEnableHeroShader } = await loadSupport();
    expect(shouldEnableHeroShader()).toBe(false);
  });

  it('refuses on low-memory devices', async () => {
    stubNavigator({ deviceMemory: 2 });
    const { shouldEnableHeroShader } = await loadSupport();
    expect(shouldEnableHeroShader()).toBe(false);
  });

  it('treats absent Chromium-only hints as capable rather than incapable', async () => {
    // Safari and Firefox report neither connection nor deviceMemory; they
    // should still get the effect.
    stubNavigator({ connection: undefined, deviceMemory: undefined });
    stubNavigator({ connection: { effectiveType: '4g' } });
    const { shouldEnableHeroShader } = await loadSupport();
    expect(shouldEnableHeroShader()).toBe(true);
  });
});
