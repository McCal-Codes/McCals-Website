import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/OptimizedImage';
import { useManifest, imageUrl } from '../portfolio/useManifest';
import { trackImageView } from '@/utils/funnel';
import type { PortfolioGroup } from '../portfolio/types';
import { portfolioStyles } from '../portfolio';
import ProtectedPortfolioImage from '../portfolio/ProtectedPortfolioImage';
// Shared with scripts/generate-route-meta.js, which emits a preload for the lead
// frame. A preload built from different widths or sizes than the img uses makes
// the browser fetch a second image it never displays.
import {
  WIDE_SRCSET_WIDTHS,
  PAIR_SRCSET_WIDTHS,
  WIDE_SIZES,
  PAIR_SIZES,
  LEAD_OPTIMIZED_WIDTH,
  WIDE_MIN_SOURCE_WIDTH,
} from '@/config/selected-work-image';

const PortfolioLightbox = lazy(() => import('../portfolio/PortfolioLightbox'));

/**
 * /featured-work is a selected-work page: one hand-picked photograph per entry,
 * in the order scripts/manifest/featured-curation.json lists them. It used to
 * show twelve albums, which read as a catalogue of assignments rather than an
 * edit. The galleries are still the albums; this page is the singles.
 *
 * Every frame arrives from the manifest already resolved: one canonical path,
 * an authored caption, and intrinsic width and height. So there is no path
 * sniffing here and no date reformatting, both of which the previous version
 * did and both of which it got wrong.
 */

interface FeaturedFrame {
  path: string;
  title?: string;
  caption?: string;
  alt?: string;
  date: string;
  dateDisplay?: string;
  category?: string;
  album?: string;
  width: number;
  height: number;
}

interface FeaturedManifest {
  frames: FeaturedFrame[];
  total?: number;
}

/** A row is one full-width frame, or two side by side. */
type Row =
  { variant: 'wide'; frames: PreparedFrame[] } | { variant: 'pair'; frames: PreparedFrame[] };

interface PreparedFrame extends FeaturedFrame {
  id: string;
  url: string;
  group: PortfolioGroup;
}

function frameId(path: string): string {
  // The path is already unique per frame, and stable across rebuilds, so it is
  // a better id than a title slug: two frames can share a title, as the three
  // Cynthiana frames do.
  return path
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function frameUrl(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  const folder = lastSlash === -1 ? '' : path.slice(0, lastSlash);
  const filename = lastSlash === -1 ? path : path.slice(lastSlash + 1);
  return imageUrl.featured(folder, filename);
}

function albumLabel(album: string): string {
  if (album === '/journalism') return 'Photojournalism';
  if (album === '/concerts') return 'Concerts';
  if (album === '/events') return 'Events';
  if (album === '/portraits') return 'Portraits';
  if (album === '/nature') return 'Nature';
  return 'Portfolio';
}

function prepare(frames: FeaturedFrame[]): PreparedFrame[] {
  return frames.map((frame) => {
    const id = frameId(frame.path);
    const url = frameUrl(frame.path);
    const title = frame.title || 'Selected work';
    const image = {
      url,
      filename: frame.path.split('/').pop() ?? frame.path,
      caption: frame.caption || undefined,
      // The lightbox renders alt on its own img. An empty alt there would strand
      // a screen reader with no description at all, because the lightbox has no
      // figcaption beside the image the way this page does.
      alt: frame.alt || frame.caption || title,
    };

    return {
      ...frame,
      id,
      url,
      group: {
        id,
        title,
        dateDisplay: frame.dateDisplay,
        dateISO: frame.date,
        category: frame.category,
        images: [image],
        coverImage: image,
      },
    };
  });
}

/**
 * One wide frame, then two paired, repeating, in the curated order. An odd frame
 * left at the end becomes a wide row rather than a lonely half-width one.
 *
 * A frame is only given a wide row if it has the pixels for one. When the frame
 * due a wide row is narrower than WIDE_MIN_SOURCE_WIDTH it is paired with the next
 * frame instead, and the wide row passes to the frame after that. The sequence is
 * never reordered: which photograph follows which is the curator's decision, and
 * the layout adapts around it.
 */
function toRows(frames: PreparedFrame[]): Row[] {
  const rows: Row[] = [];
  let index = 0;
  let wide = true;

  while (index < frames.length) {
    const hasPartner = index + 1 < frames.length;
    if (wide && frames[index].width < WIDE_MIN_SOURCE_WIDTH && hasPartner) {
      rows.push({ variant: 'pair', frames: [frames[index], frames[index + 1]] });
      index += 2;
      // The pair took this turn, so the next row is wide.
      continue;
    }
    if (wide) {
      rows.push({ variant: 'wide', frames: [frames[index]] });
      index += 1;
    } else {
      const pair = frames.slice(index, index + 2);
      rows.push(
        pair.length === 1 ? { variant: 'wide', frames: pair } : { variant: 'pair', frames: pair },
      );
      index += pair.length;
    }
    wide = !wide;
  }

  return rows;
}

interface SelectedFigureProps {
  frame: PreparedFrame;
  variant: 'wide' | 'pair';
  priority: boolean;
  onOpen: (frame: PreparedFrame) => void;
}

function SelectedFigure({ frame, variant, priority, onOpen }: SelectedFigureProps) {
  const captionId = `${frame.id}-caption`;
  // Keeps a portrait frame from being crushed when it sits beside a landscape one.
  const portrait = frame.height > frame.width;

  return (
    <figure
      className={[
        portfolioStyles.pfSelectedFigure,
        variant === 'wide'
          ? portfolioStyles.pfSelectedFigureWide
          : portfolioStyles.pfSelectedFigurePair,
        portrait ? portfolioStyles.pfSelectedFigurePortrait : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-labelledby={captionId}
    >
      <button
        type="button"
        className={portfolioStyles.pfSelectedImageButton}
        // Never wider than the photograph itself, so a frame that ends up in a row
        // wider than its pixels is shown at its own size rather than enlarged.
        style={{ maxWidth: `${frame.width}px` }}
        aria-label={`Open ${frame.title || 'this photograph'} larger`}
        onClick={() => onOpen(frame)}
      >
        <ProtectedPortfolioImage className={portfolioStyles.pfSelectedProtectedImage}>
          <OptimizedImage
            src={frame.url}
            // Empty by default. The caption is right below the photograph, and the
            // W3C alt decision tree says to use an empty alt when the image would
            // only repeat text already beside it. A per-frame alt in the curation
            // file overrides this when the picture needs describing further.
            alt={frame.alt ?? ''}
            frameClassName={`${portfolioStyles.pfBlurImageFrame} ${portfolioStyles.pfSelectedImageFrame}`}
            imageClassName={`${portfolioStyles.pfBlurImage} ${portfolioStyles.pfSelectedImage}`}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding={priority ? 'sync' : 'async'}
            optimizedWidth={variant === 'wide' ? LEAD_OPTIMIZED_WIDTH : 960}
            srcSetWidths={[...(variant === 'wide' ? WIDE_SRCSET_WIDTHS : PAIR_SRCSET_WIDTHS)]}
            sizes={variant === 'wide' ? WIDE_SIZES : PAIR_SIZES}
            width={frame.width}
            height={frame.height}
            draggable={false}
          />
        </ProtectedPortfolioImage>
      </button>

      <figcaption className={portfolioStyles.pfSelectedCaption} id={captionId}>
        {frame.caption && <p className={portfolioStyles.pfSelectedCaptionText}>{frame.caption}</p>}
        <p className={portfolioStyles.pfSelectedCaptionMeta}>
          {frame.dateDisplay && <span>{frame.dateDisplay}</span>}
          {frame.album && (
            <Link className={portfolioStyles.pfSelectedCaptionLink} to={frame.album}>
              {albumLabel(frame.album)}
            </Link>
          )}
        </p>
      </figcaption>
    </figure>
  );
}

export default function FeaturedPortfolio() {
  const { data, status, error } = useManifest<FeaturedManifest>('featured');
  const [activeLightbox, setActiveLightbox] = useState<{
    group: PortfolioGroup;
    initialIndex: number;
  } | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // A manifest that loaded but has no frames[] is not an empty selection. It is a
  // document in another shape, such as the albums-shaped manifest this page used
  // to read, and saying "no photographs are selected" about it would be false.
  const unreadable = status === 'success' && !Array.isArray(data?.frames);
  const frames = useMemo(() => (Array.isArray(data?.frames) ? prepare(data.frames) : []), [data]);
  const rows = useMemo(() => toRows(frames), [frames]);
  const groups = useMemo(() => frames.map((frame) => frame.group), [frames]);

  const handleOpen = useCallback((frame: PreparedFrame) => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    trackImageView('featured-work', frame.id);
    setActiveLightbox({ group: frame.group, initialIndex: 0 });
  }, []);

  const handleClose = useCallback(() => {
    setActiveLightbox(null);
    window.setTimeout(() => openerRef.current?.focus(), 0);
  }, []);

  const handleLightboxGroupChange = useCallback((group: PortfolioGroup, initialIndex: number) => {
    setActiveLightbox({ group, initialIndex });
  }, []);

  return (
    <div className={`${portfolioStyles.pfRoot} ${portfolioStyles.pfSelectedRoot}`}>
      <header className={portfolioStyles.pfSelectedHeader}>
        <h1 className={portfolioStyles.pfHeading}>Selected Work</h1>
        <p className={portfolioStyles.pfSubheading}>
          Individual photographs, chosen one at a time. Each one links back to the gallery it came
          from.
        </p>
      </header>

      {status === 'loading' && (
        <div className={portfolioStyles.pfLoading}>
          <span className={portfolioStyles.pfSpinner} />
          Loading selected work…
        </div>
      )}

      {(status === 'error' || unreadable) && (
        <div className={portfolioStyles.pfSelectedError} role="alert">
          <p className={portfolioStyles.pfSelectedErrorTitle}>
            The selected work could not be loaded.
          </p>
          <p className={portfolioStyles.pfSelectedErrorBody}>
            {unreadable
              ? 'This page was updated since your browser last loaded it. Try again to load the current selection.'
              : (error ?? 'The manifest did not load.')}
          </p>
          <div className={portfolioStyles.pfSelectedErrorActions}>
            <button
              type="button"
              className={portfolioStyles.pfSelectedErrorButton}
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
            <Link className={portfolioStyles.pfSelectedCaptionLink} to="/journalism">
              Browse photojournalism
            </Link>
          </div>
        </div>
      )}

      {status === 'success' && frames.length > 0 && (
        <div className={portfolioStyles.pfSelectedSequence}>
          {rows.map((row, rowIndex) => (
            <div
              key={row.frames[0].id}
              className={
                row.variant === 'wide'
                  ? portfolioStyles.pfSelectedRowWide
                  : portfolioStyles.pfSelectedRowPair
              }
            >
              {row.frames.map((frame) => (
                <SelectedFigure
                  key={frame.id}
                  frame={frame}
                  variant={row.variant}
                  // Only the first photograph. Everything below the fold stays lazy,
                  // so the LCP image is the one the browser fetches first.
                  priority={rowIndex === 0}
                  onOpen={handleOpen}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {status === 'success' && !unreadable && frames.length === 0 && (
        <p className={portfolioStyles.pfSelectedEmpty}>
          No photographs are selected yet. Add frames to scripts/manifest/featured-curation.json.
        </p>
      )}

      {activeLightbox && (
        <Suspense fallback={null}>
          <PortfolioLightbox
            key={`${activeLightbox.group.id}-${activeLightbox.initialIndex}`}
            group={activeLightbox.group}
            collection={groups}
            initialIndex={activeLightbox.initialIndex}
            onChangeGroup={handleLightboxGroupChange}
            onClose={handleClose}
          />
        </Suspense>
      )}
    </div>
  );
}
