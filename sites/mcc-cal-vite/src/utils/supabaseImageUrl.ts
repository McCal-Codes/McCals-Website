const SUPABASE_STORAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1`;
const BUCKET = 'portfolio-images';

interface SupabaseImageOpts {
  width?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
}

export function getSupabaseImageUrl(storagePath: string, opts: SupabaseImageOpts = {}): string {
  const { width, quality = 80, format = 'webp' } = opts;
  const params = new URLSearchParams({ quality: String(quality), format });
  if (width) params.set('width', String(width));
  return `${SUPABASE_STORAGE_BASE}/render/image/public/${BUCKET}/${storagePath}?${params}`;
}

export function getSupabaseImageSrcSet(
  storagePath: string,
  widths = [640, 960, 1280, 1920, 3840],
): string {
  return widths.map(w => `${getSupabaseImageUrl(storagePath, { width: w })} ${w}w`).join(', ');
}
