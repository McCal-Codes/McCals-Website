/**
 * Decides whether the hero is allowed to run its WebGL transition layer.
 *
 * The layer is pure decoration over an <img> that already looks correct, so
 * every uncertain case resolves to "no". Anything that says the visitor wants
 * less motion, has little to spend on data, or is on hardware where a second
 * full-screen texture is a real cost turns it off and leaves the DOM carousel
 * exactly as it was.
 */

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type CapabilityNavigator = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);

/** Minimum device memory (GiB) before we are willing to hold hero textures. */
const MIN_DEVICE_MEMORY_GB = 4;

let cachedWebglSupport: boolean | null = null;

/**
 * Probes for a usable WebGL context once and caches the answer. The probe
 * context is explicitly released: browsers cap simultaneous contexts, and a
 * leaked probe would count against the renderer we actually want to create.
 */
export function hasWebglSupport(): boolean {
  if (cachedWebglSupport !== null) return cachedWebglSupport;
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    cachedWebglSupport = Boolean(gl);

    const lose = gl?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
  } catch {
    cachedWebglSupport = false;
  }

  return cachedWebglSupport;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * `deviceMemory` and `connection` are Chromium-only. Absent values are treated
 * as capable rather than incapable, so Safari and Firefox still get the effect.
 */
export function shouldEnableHeroShader(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion()) return false;
  if (!hasWebglSupport()) return false;

  const nav = navigator as CapabilityNavigator;

  if (nav.connection?.saveData) return false;
  if (nav.connection?.effectiveType && SLOW_CONNECTIONS.has(nav.connection.effectiveType)) {
    return false;
  }
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < MIN_DEVICE_MEMORY_GB) {
    return false;
  }

  return true;
}
