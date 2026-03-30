import { useEffect, useRef, useState, useCallback } from 'react';
import Layout from '@/components/Layout/Layout';
import '@/styles/podcast.css';

// ── Types ────────────────────────────────────────────────────────────────────

interface Episode {
  guid: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
  audioUrl: string;
  image?: string;
}

interface FeaturedMeta {
  reason: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PODCAST_IMAGE =
  'https://media.rss.com/cafeconnectpod/20250404_090408_d8a1a6cce833630a24064aedcd52e348.png';
const FEED_URL = 'https://media.rss.com/cafeconnectpod/feed.xml';
const SPOTIFY_SHOW = 'https://open.spotify.com/show/1GcE0Tt669WrdAOXz73w0S';
const APPLE_SHOW = 'https://podcasts.apple.com/us/podcast/caffeinated-connections/id1806715605';
const CALENDLY = 'https://calendly.com/cjmccar-mcc-cal/caffeinated_connections';
const CACHE_KEY = 'podcast-feed-v2.4';
const CACHE_TTL = 1000 * 60 * 30;
const PAGE_SIZE = 6;

const FEATURED: Record<string, FeaturedMeta> = {
  'ep9-austin-carns': { reason: 'Relatable founder chaos + tight storytelling; great first impression.' },
  'ep7-mark-palumbo': { reason: 'Actionable branding talk and pacing; easy on-ramp for new listeners.' },
  'ep6-kyle-archer':  { reason: "High energy and humor; shows the show's vibe quickly." },
};

const FALLBACK: Episode[] = [
  {
    guid: 'ep9-austin-carns',
    title: 'Ep 9: Rundown BMW, but Sold as a Lambo with Austin Carns',
    description: 'A photojournalist and a commentator walk into a podcast and end up unpacking fear, ego, and why we are all just trying to make it through in one piece.',
    pubDate: '2025-10-24T14:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/2289545',
    audioUrl: 'https://content.rss.com/episodes/323976/2289545/cafeconnectpod/2025_10_24_21_22_49_e18fed56-f3ef-4fa6-bb5a-4b17e2ee174e.mp3',
  },
  {
    guid: 'ep8-liam-sullivan',
    title: "Ep 8: Don't Read the Shampoo Bottle with Liam Sullivan",
    description: 'From political rallies to chicken thermometers, Caleb and Liam discover how far curiosity can really go and why it matters for creative work.',
    pubDate: '2025-09-12T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/2205662',
    audioUrl: 'https://content.rss.com/episodes/323976/2205662/cafeconnectpod/2025_09_08_17_11_04_24f12b7f-1449-4895-ad9a-945e184d82b2.mp3',
  },
  {
    guid: 'ep7-mark-palumbo',
    title: 'Ep 7: Lessons in Leadership, Branding, and Balance with Mark Palumbo',
    description: 'Caleb sits down with Mark Palumbo to unpack post-grad chaos, creative hustle, and what it takes to build a personal brand without burning out.',
    pubDate: '2025-05-30T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/2031736',
    audioUrl: 'https://content.rss.com/episodes/323976/2031736/cafeconnectpod/2025_05_30_13_38_51_d2969ad9-f774-4b5f-9f77-53ccb65872ed.mp3',
  },
  {
    guid: 'ep6-kyle-archer',
    title: 'Ep 6: Riding the Chaos Wave with Kyle Archer',
    description: 'Rubber ducks, euphoric poems, and authentic artistry. Caleb and Kyle talk boundaries, storytelling, and balancing chaos with clarity.',
    pubDate: '2025-05-16T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/2030795',
    audioUrl: 'https://content.rss.com/episodes/323976/2030795/cafeconnectpod/2025_05_16_14_44_51_7ea1e6bd-7b33-4f03-9925-0c0b4a265631.mp3',
  },
  {
    guid: 'ep5-dream-the-heavy',
    title: 'Ep 5: Mic Drops and Monk Juice with Dream the Heavy',
    description: 'TK and Paul of Dream the Heavy dive into Pittsburgh art scenes, vulnerability, and the creative rituals that keep good chaos flowing.',
    pubDate: '2025-04-25T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/1990167',
    audioUrl: '',
  },
  {
    guid: 'ep4-collin-strachan',
    title: 'Ep 4: Grit, Gear & Going All In with Collin Strachan',
    description: 'Caleb and Collin explore filmmaking in wild places, client honesty, and the balance between technical skill and storytelling heart.',
    pubDate: '2025-04-18T12:00:00Z',
    link: 'https://rss.com/podcasts/cafeconnectpod/1990129',
    audioUrl: '',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'ep';
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recent';
    const diff = Date.now() - d.getTime();
    const day = 86400000;
    if (diff < day) return 'Today';
    if (diff < day * 2) return 'Yesterday';
    if (diff < day * 7) return `${Math.floor(diff / day)} days ago`;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '--:--';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function extractGuest(title: string): string {
  const m = title.match(/with\s+([^|–—:-]+)$/i) || title.match(/[–—-]\s*with\s+([^|:-]+)$/i);
  return m ? m[1].replace(/[\s–—-]+$/, '').trim() : '';
}

function isNew(pubDate: string): boolean {
  return (Date.now() - new Date(pubDate).getTime()) < 7 * 86400000;
}

// Strips HTML tags using a regex — no DOM manipulation, no XSS risk.
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getCached(): Episode[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { episodes, ts } = JSON.parse(raw) as { episodes: Episode[]; ts: number };
    if (!Array.isArray(episodes)) return null;
    if (Date.now() - ts > CACHE_TTL) return episodes; // stale but usable
    return episodes;
  } catch {
    return null;
  }
}

function setCache(episodes: Episode[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ episodes, ts: Date.now() })); } catch {}
}

async function fetchFeed(): Promise<Episode[]> {
  let xml = '';

  // In dev, use the Vite proxy to avoid CORS issues
  const devProxyUrl = '/dev-rss-proxy/cafeconnectpod/feed.xml';
  const isDev = import.meta.env.DEV;

  if (isDev) {
    try {
      const r = await fetch(devProxyUrl, { signal: AbortSignal.timeout(8000) });
      if (r.ok) { xml = await r.text(); }
      else throw new Error();
    } catch {
      // fall through to public proxies
    }
  }

  if (!xml) {
    try {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) xml = ((await r.json()) as { contents: string }).contents || '';
      else throw new Error();
    } catch {
      const r2 = await fetch(`https://proxy.cors.sh/${FEED_URL}`, {
        headers: { 'x-cors-gratis': 'true' },
        signal: AbortSignal.timeout(8000),
      });
      if (r2.ok) xml = await r2.text();
      else throw new Error('All proxies failed');
    }
  }

  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item'));
  if (!items.length) throw new Error('No items');

  return items.map((item, i) => ({
    guid: item.querySelector('guid')?.textContent?.trim() || `ep-${i}`,
    title: item.querySelector('title')?.textContent?.trim() || 'Episode',
    description: item.querySelector('description')?.textContent || '',
    pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
    link: item.querySelector('link')?.textContent?.trim() || '',
    audioUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
    image: item.querySelector('itunes\\:image')?.getAttribute('href') || PODCAST_IMAGE,
  }));
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface PlayerState {
  playing: boolean;
  loading: boolean;
  currentTime: number;
  duration: number;
}

interface AudioPlayerProps {
  episode: Episode;
  isCurrentlyPlaying: boolean;
  onPlay: (guid: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playerState: PlayerState;
}

function AudioPlayer({ episode, isCurrentlyPlaying, onPlay, audioRef, playerState }: AudioPlayerProps) {
  const { playing, loading, currentTime, duration } = playerState;
  const active = isCurrentlyPlaying;

  function handlePlayPause() {
    if (!episode.audioUrl) return;
    if (!active) { onPlay(episode.guid); return; }
    if (playing) audioRef.current?.pause();
    else audioRef.current?.play();
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !isFinite(duration) || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  }

  const pct = active && isFinite(duration) && duration > 0
    ? Math.min(100, (currentTime / duration) * 100) : 0;

  const timeLabel = active
    ? `${formatTime(currentTime)} / ${formatTime(duration)}`
    : episode.audioUrl ? 'Ready to play' : 'No audio available';

  return (
    <div className="pod-player">
      <div className="pod-player-inner">
        <div className="pod-controls">
          <button
            className={`pod-play-btn${active && playing ? ' playing' : ''}${loading ? ' loading' : ''}`}
            onClick={handlePlayPause}
            aria-label={active && playing ? 'Pause episode' : 'Play episode'}
            disabled={!episode.audioUrl}
          >
            {active && playing ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div className="pod-time-info">
            <p className="pod-time-label">{timeLabel}</p>
          </div>
        </div>
        <div
          className="pod-progress"
          onClick={handleSeek}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="pod-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

interface ShareButtonProps {
  episode: Episode;
  onToast: (msg: string) => void;
}

function ShareButton({ episode, onToast }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function copyLink() {
    const url = episode.link || window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => { onToast('Link copied!'); setOpen(false); })
      .catch(() => { onToast('Could not copy'); setOpen(false); });
  }

  function shareX() {
    const text = encodeURIComponent(`"${episode.title}" — Caffeinated Connections Podcast`);
    const url = encodeURIComponent(episode.link || window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
    setOpen(false);
  }

  return (
    <div className="pod-share-wrap" ref={wrapRef}>
      <button
        className="pod-link-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        aria-label="Share episode"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
        </svg>
        Share
      </button>
      {open && (
        <div className="pod-share-popover" role="menu">
          <button className="pod-share-option" onClick={copyLink} role="menuitem">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            Copy link
          </button>
          <button className="pod-share-option" onClick={shareX} role="menuitem">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>
        </div>
      )}
    </div>
  );
}

interface EpisodeCardProps {
  episode: Episode;
  currentlyPlayingGuid: string | null;
  onPlay: (guid: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playerState: PlayerState;
  onToast: (msg: string) => void;
}

function EpisodeCard({ episode, currentlyPlayingGuid, onPlay, audioRef, playerState, onToast }: EpisodeCardProps) {
  const isActive = currentlyPlayingGuid === episode.guid;
  const guest = extractGuest(episode.title);
  const newEp = isNew(episode.pubDate);
  const desc = stripHtml(episode.description).slice(0, 220);

  return (
    <article className="pod-card">
      <div className="pod-card-body">
        <div className="pod-card-top">
          <img
            className="pod-card-art"
            src={episode.image || PODCAST_IMAGE}
            alt="Caffeinated Connections"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="pod-card-meta">
            <p className="pod-card-show">Caffeinated Connections</p>
            <p className="pod-card-date">
              {formatDate(episode.pubDate)}
              {newEp && <span className="pod-card-badge">New</span>}
            </p>
          </div>
        </div>
        <h3 className="pod-card-title">{episode.title}</h3>
        {guest && <p className="pod-card-guest">Guest: {guest}</p>}
        <p className="pod-card-desc">{desc}{desc.length >= 220 ? '…' : ''}</p>
      </div>

      <AudioPlayer
        episode={episode}
        isCurrentlyPlaying={isActive}
        onPlay={onPlay}
        audioRef={audioRef}
        playerState={isActive ? playerState : { playing: false, loading: false, currentTime: 0, duration: 0 }}
      />

      <div className="pod-card-footer">
        <a href={episode.link} target="_blank" rel="noopener noreferrer" className="pod-link-btn">
          Listen
        </a>
        <a href={SPOTIFY_SHOW} target="_blank" rel="noopener noreferrer" className="pod-link-btn spotify">
          Spotify
        </a>
        <a href={APPLE_SHOW} target="_blank" rel="noopener noreferrer" className="pod-link-btn apple">
          Apple
        </a>
        <ShareButton episode={episode} onToast={onToast} />
      </div>
    </article>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [toast, setToast] = useState<string | null>(null);
  const [currentGuid, setCurrentGuid] = useState<string | null>(null);
  const [feedStatus, setFeedStatus] = useState('loading…');
  const isDev = import.meta.env.DEV;
  const [playerState, setPlayerState] = useState<PlayerState>({
    playing: false, loading: false, currentTime: 0, duration: 0,
  });
  const [npHidden, setNpHidden] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cached = getCached();
    if (cached?.length) { setEpisodes(cached); setFeedStatus('cache'); }
    else { setEpisodes(FALLBACK); setFeedStatus('fallback'); }

    fetchFeed()
      .then((eps) => { setEpisodes(eps); setCache(eps); setFeedStatus('live RSS'); })
      .catch(() => { if (!cached?.length) setEpisodes(FALLBACK); setFeedStatus('fallback'); });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const handlePlay = useCallback((guid: string) => {
    const ep = episodes.find(e => e.guid === guid || slugify(e.guid) === guid);
    if (!ep?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(ep.audioUrl);
    audio.crossOrigin = 'anonymous';
    audio.volume = 0.8;
    audioRef.current = audio;
    setCurrentGuid(guid);
    setPlayerState({ playing: false, loading: true, currentTime: 0, duration: 0 });
    setNpHidden(false);

    audio.addEventListener('loadedmetadata', () => {
      setPlayerState(s => ({ ...s, duration: audio.duration }));
    });
    audio.addEventListener('timeupdate', () => {
      setPlayerState(s => ({ ...s, currentTime: audio.currentTime, duration: audio.duration }));
    });
    audio.addEventListener('ended', () => {
      setPlayerState(s => ({ ...s, playing: false }));
    });

    audio.play()
      .then(() => setPlayerState(s => ({ ...s, playing: true, loading: false })))
      .catch(() => setPlayerState(s => ({ ...s, loading: false })));
  }, [episodes]);

  function toggleNpPlay() {
    if (!audioRef.current || !currentGuid) return;
    if (playerState.playing) {
      audioRef.current.pause();
      setPlayerState(s => ({ ...s, playing: false }));
    } else {
      audioRef.current.play()
        .then(() => setPlayerState(s => ({ ...s, playing: true })))
        .catch(() => {});
    }
  }

  function npSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !isFinite(playerState.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * playerState.duration;
  }

  const currentEp = episodes.find(e => e.guid === currentGuid);
  const shownEpisodes = episodes.slice(0, visible);

  const featuredPicks = Object.entries(FEATURED)
    .map(([key, meta]) => {
      const ep = episodes.find(e => e.guid === key || slugify(e.guid) === key);
      return ep ? { ep, meta } : null;
    })
    .filter((x): x is { ep: Episode; meta: FeaturedMeta } => x !== null);

  const npPct = isFinite(playerState.duration) && playerState.duration > 0
    ? Math.min(100, (playerState.currentTime / playerState.duration) * 100) : 0;

  return (
    <Layout>
      <div className="pod-page" {...(isDev ? { 'data-dev': '', 'data-feed-status': feedStatus } : {})}>

        {/* Header */}
        <header className="pod-header">
          <span className="pod-kicker">Caffeinated Connections</span>
          <h1 className="pod-title">Latest Episodes</h1>
          <p className="pod-desc">
            Where Caleb sits down with creators and industry pros over coffee to explore how ideas turn into impact.
          </p>
          <div className="pod-cta-row">
            <a className="pod-book-btn" href={CALENDLY} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 6H4.5a.5.5 0 0 0-.5.5V10h17V8.5a.5.5 0 0 0-.5-.5Zm.5 4H4v7.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5V12Zm-11 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z" />
              </svg>
              Book a Podcast Episode
            </a>
            <p className="pod-proof">12+ episodes booked since Oct 2025</p>
          </div>
        </header>

        {/* Start Here */}
        {featuredPicks.length > 0 && (
          <section className="pod-start" aria-label="Start here">
            <p className="pod-start-title">Start Here</p>
            <div className="pod-start-grid">
              {featuredPicks.map(({ ep, meta }) => (
                <a
                  key={ep.guid}
                  className="pod-start-card"
                  href={ep.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="pod-start-card-title">{ep.title}</p>
                  <p className="pod-start-card-reason">{meta.reason}</p>
                  <p className="pod-start-card-meta">
                    {formatDate(ep.pubDate)}{extractGuest(ep.title) ? ` · ${extractGuest(ep.title)}` : ''}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Episodes */}
        {episodes.length === 0 ? (
          <p className="pod-loading">Loading episodes…</p>
        ) : (
          <>
            <div className="pod-grid">
              {shownEpisodes.map(ep => (
                <EpisodeCard
                  key={ep.guid}
                  episode={ep}
                  currentlyPlayingGuid={currentGuid}
                  onPlay={handlePlay}
                  audioRef={audioRef}
                  playerState={playerState}
                  onToast={showToast}
                />
              ))}
            </div>

            {visible < episodes.length && (
              <div className="pod-load-more-row">
                <button className="pod-load-more-btn" onClick={() => setVisible(v => v + PAGE_SIZE)}>
                  Load More Episodes
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Now Playing Bar */}
      <div className={`pod-now-playing${npHidden ? ' hidden' : ''}`} role="status" aria-live="polite">
        <div className="pod-np-row">
          <div className="pod-np-left">
            <button
              className="pod-np-play"
              onClick={toggleNpPlay}
              aria-label={playerState.playing ? 'Pause' : 'Play'}
            >
              {playerState.playing ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div>
              <p className="pod-np-title">{currentEp?.title ?? 'Now playing'}</p>
              <p className="pod-np-meta">
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </p>
            </div>
          </div>
          <div className="pod-np-actions">
            <button
              className="pod-np-close"
              onClick={() => { audioRef.current?.pause(); setNpHidden(true); }}
              aria-label="Close now playing"
            >
              ×
            </button>
          </div>
        </div>
        <div className="pod-np-progress" onClick={npSeek}>
          <div className="pod-np-fill" style={{ width: `${npPct}%` }} />
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="pod-toast" role="alert">{toast}</div>}
    </Layout>
  );
}
