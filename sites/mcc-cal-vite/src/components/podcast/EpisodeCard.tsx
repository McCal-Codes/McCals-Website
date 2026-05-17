import type { Episode, PlayerState } from './types';
import { PODCAST_IMAGE, SPOTIFY_SHOW, APPLE_SHOW } from './constants';
import { extractGuest, isNew, stripHtml } from './utils';
import { formatDateRelative } from '@/utils/formatters';
import { AudioPlayer } from './AudioPlayer';
import { ShareButton } from './ShareButton';

interface EpisodeCardProps {
  episode: Episode;
  currentlyPlayingGuid: string | null;
  onPlay: (guid: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playerState: PlayerState;
  onToast: (msg: string) => void;
}

function formatEpisodeDuration(value?: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  let totalSeconds = Number(trimmed);
  if (!Number.isFinite(totalSeconds)) {
    const parts = trimmed.split(':').map(part => Number(part));
    if (parts.some(part => !Number.isFinite(part))) return trimmed;
    totalSeconds = parts.reduce((total, part) => (total * 60) + part, 0);
  }

  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
  if (hours > 0) return `${hours} hr`;
  return `${totalMinutes} min`;
}

export function EpisodeCard({ episode, currentlyPlayingGuid, onPlay, audioRef, playerState, onToast }: EpisodeCardProps) {
  const isActive = currentlyPlayingGuid === episode.guid;
  const guest = extractGuest(episode.title);
  const newEp = isNew(episode.pubDate);
  const desc = stripHtml(episode.description).slice(0, 220);
  const transcript = episode.transcripts?.[0];
  const duration = formatEpisodeDuration(episode.duration);
  const episodeMeta = [
    episode.episodeNumber ? `Episode ${episode.episodeNumber}` : null,
    episode.episodeType ? episode.episodeType.replace(/^\w/, c => c.toUpperCase()) : null,
    duration,
  ].filter(Boolean);

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
              {formatDateRelative(episode.pubDate)}
              {newEp && <span className="pod-card-badge">New</span>}
            </p>
          </div>
        </div>
        <h3 className="pod-card-title">{episode.title}</h3>
        {guest && <p className="pod-card-guest">Guest: {guest}</p>}
        {(episodeMeta.length > 0 || episode.explicit) && (
          <p className="pod-card-detail">
            {episodeMeta.join(' · ')}
            {episode.explicit && (
              <span className="pod-card-badge pod-card-badge-explicit">Explicit</span>
            )}
          </p>
        )}
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
        <a href={episode.platformUrl || episode.link} target="_blank" rel="noopener noreferrer" className="pod-link-btn">
          Listen
        </a>
        {transcript && (
          <a href={transcript.url} target="_blank" rel="noopener noreferrer" className="pod-link-btn">
            Transcript
          </a>
        )}
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
