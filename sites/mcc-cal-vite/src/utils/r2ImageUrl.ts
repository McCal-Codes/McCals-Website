import { getOptimizedImageUrl } from './imageOptimization';

const R2_PUBLIC_BASE = (import.meta.env.VITE_R2_PUBLIC_URL ?? '').replace(/\/$/, '');

export function getR2ImageUrl(storagePath: string): string {
  return `${R2_PUBLIC_BASE}/${storagePath}`;
}

export function getR2ImageSrcSet(
  storagePath: string,
  widths = [640, 960, 1280, 1920, 3840],
): string | undefined {
  if (!R2_PUBLIC_BASE) return undefined;
  const r2Url = getR2ImageUrl(storagePath);
  return widths.map(w => `${getOptimizedImageUrl(r2Url, { width: w })} ${w}w`).join(', ');
}
