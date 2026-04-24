import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  EpisodeCard,
  usePodcastFeed,
  PODCAST_IMAGE,
  SPOTIFY_SHOW,
  APPLE_SHOW,
  FEATURED,
  PAGE_SIZE,
  type PlayerState,
  extractGuest,
} from '@/components/podcast';
import { formatTime, formatDateRelative, slugify } from '@/utils/formatters';
import './podcast.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

export default function PodcastPage() {
  usePageMeta({
    title: 'Caffeinated Connections Podcast | Caleb McCartney',
    description:
      'Caffeinated Connections is where Caleb McCartney sits down with creators and industry pros over coffee to explore how ideas turn into impact. Listen to the latest episodes.',
    canonical: `${SITE_URL}/podcast`,
    og: {
      type: 'website',
      title: 'Caffeinated Connections Podcast',
      description:
        'Caleb McCartney sits down with creators and industry pros over coffee to explore how ideas turn into impact.',
      image: PODCAST_IMAGE,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Caffeinated Connections Podcast',
      description:
        'Caleb McCartney sits down with creators and industry pros over coffee to explore how ideas turn into impact.',
      image: PODCAST_IMAGE,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'PodcastSeries',
      name: 'Caffeinated Connections',
      description:
        'Where Caleb sits down with creators and industry pros over coffee to explore how ideas turn into impact.',
      url: 'https://mcc-cal.com/podcast',
      image: PODCAST_IMAGE,
      author: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: 'https://mcc-cal.com/about',
      },
      webFeed: 'https://media.rss.com/cafeconnectpod/feed.xml',
      inLanguage: 'en',
      availableOnDevice: [
        { '@type': 'ListItem', name: 'Spotify', url: SPOTIFY_SHOW },
        { '@type': 'ListItem', name: 'Apple Podcasts', url: APPLE_SHOW },
      ],
    },
  });

  const { data: episodes = [], isLoading, error } = usePodcastFeed();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [toast, setToast] = useState<string | null>(null);
  const [currentGuid, setCurrentGuid] = useState<string | null>(null);
  const isDev = import.meta.env.DEV;
  const [playerState, setPlayerState] = useState<PlayerState>({
    playing: false, loading: false, currentTime: 0, duration: 0,
  });
  const [npHidden, setNpHidden] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    .filter((x): x is { ep: typeof episodes[number]; meta: typeof FEATURED[string] } => x !== null);

  const npPct = isFinite(playerState.duration) && playerState.duration > 0
    ? Math.min(100, (playerState.currentTime / playerState.duration) * 100) : 0;

  return (
    <Layout>
      <div className="pod-page" {...(isDev && error ? { 'data-dev': '', 'data-feed-status': 'error' } : {})}>

        {/* Header */}
        <header className="pod-header">
          <span className="pod-kicker">Caffeinated Connections</span>
          <h1 className="pod-title">Latest Episodes</h1>
          <p className="pod-desc">
            Where Caleb sits down with creators and industry pros over coffee to explore how ideas turn into impact.
          </p>
          <div className="pod-cta-row">
            <Link className="pod-book-btn" to="/book-a-podcast">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v13A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 6H4.5a.5.5 0 0 0-.5.5V10h17V8.5a.5.5 0 0 0-.5-.5Zm.5 4H4v7.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5V12Zm-11 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z" />
              </svg>
              Book a Podcast Episode
            </Link>
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
                    {formatDateRelative(ep.pubDate)}{extractGuest(ep.title) ? ` · ${extractGuest(ep.title)}` : ''}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Episodes */}
        {isLoading ? (
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
