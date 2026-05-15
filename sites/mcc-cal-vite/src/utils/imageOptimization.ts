const SQUARESPACE_IMAGE_HOST = 'images.squarespace-cdn.com';
const JSDELIVR_IMAGE_HOST = 'cdn.jsdelivr.net';
const ABSOLUTE_URL_RE = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
const OPTIMIZABLE_REMOTE_HOSTS = new Set([SQUARESPACE_IMAGE_HOST, JSDELIVR_IMAGE_HOST]);
const OPTIMIZABLE_LOCAL_PATHS = [/^\/images\/.+/i, /^\/assets\/.+/i];
const VERCEL_IMAGE_PATH = '/_vercel/image';
const DEFAULT_QUALITY = 80;

const IS_VERCEL_IMAGE_RUNTIME = ['preview', 'production'].includes(
  import.meta.env.VITE_VERCEL_ENV ?? '',
);

type ImageOptimizationOptions = {
  width?: number;
  quality?: number;
};

function getUrlBase(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://mcc-cal.com';
}

function parseImageUrl(src: string): { url: URL; isRelative: boolean } | null {
  try {
    const isRelative = !ABSOLUTE_URL_RE.test(src);
    return {
      url: new URL(src, getUrlBase()),
      isRelative,
    };
  } catch {
    return null;
  }
}

function serializeImageUrl(url: URL, isRelative: boolean): string {
  if (!isRelative) return url.toString();

  return `${url.pathname}${url.search}${url.hash}`;
}

export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {},
): string {
  const parsed = parseImageUrl(src);
  if (!parsed) return src;

  const { url, isRelative } = parsed;

  if (!IS_VERCEL_IMAGE_RUNTIME) {
    if (url.hostname === SQUARESPACE_IMAGE_HOST) {
      url.searchParams.set('format', 'webp');

      if (options.width) {
        url.searchParams.set('width', String(options.width));
      }

      return serializeImageUrl(url, isRelative);
    }

    return src;
  }

  const isOptimizableRemote = OPTIMIZABLE_REMOTE_HOSTS.has(url.hostname);
  const isOptimizableLocal = isRelative && OPTIMIZABLE_LOCAL_PATHS.some((pattern) => pattern.test(url.pathname));

  if (!isOptimizableRemote && !isOptimizableLocal) {
    return src;
  }

  const sourceUrl = isOptimizableRemote ? url.toString() : serializeImageUrl(url, true);
  const params = new URLSearchParams({
    url: sourceUrl,
    q: String(options.quality ?? DEFAULT_QUALITY),
  });

  if (options.width) {
    params.set('w', String(options.width));
  }

  return `${VERCEL_IMAGE_PATH}?${params.toString()}`;
}

export function getResponsiveImageSrcSet(src: string, widths: number[] = []): string | undefined {
  if (widths.length === 0) return undefined;

  const parsed = parseImageUrl(src);
  if (!parsed) {
    return undefined;
  }

  const isOptimizableRemote = OPTIMIZABLE_REMOTE_HOSTS.has(parsed.url.hostname);
  const isOptimizableLocal =
    parsed.isRelative && OPTIMIZABLE_LOCAL_PATHS.some((pattern) => pattern.test(parsed.url.pathname));

  if (!isOptimizableRemote && !isOptimizableLocal) {
    return undefined;
  }

  if (!IS_VERCEL_IMAGE_RUNTIME && parsed.url.hostname !== SQUARESPACE_IMAGE_HOST) {
    return undefined;
  }

  return widths
    .map((width) => `${getOptimizedImageUrl(src, { width })} ${width}w`)
    .join(', ');
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getBlurPlaceholder(src: string): string {
  const palettes = [
    ['#0b0b0d', '#2a2522', '#b89a6a'],
    ['#111113', '#34302d', '#8f9b83'],
    ['#0d1012', '#2f3a40', '#c4a030'],
    ['#161312', '#4b3d34', '#9a8b7a'],
    ['#0e0f0d', '#30352b', '#d4af37'],
  ];
  const palette = palettes[hashString(src) % palettes.length];
  const [base, mid, accent] = palette;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30" preserveAspectRatio="none"><filter id="b"><feGaussianBlur stdDeviation="6"/></filter><rect width="40" height="30" fill="${base}"/><g filter="url(#b)" opacity=".85"><circle cx="8" cy="9" r="16" fill="${mid}"/><circle cx="32" cy="22" r="14" fill="${accent}"/><rect x="10" y="16" width="28" height="14" fill="${mid}" opacity=".55"/></g></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
