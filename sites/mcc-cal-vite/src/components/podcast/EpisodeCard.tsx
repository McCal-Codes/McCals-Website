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

export function EpisodeCard({ episode, currentlyPlayingGuid, onPlay, audioRef, playerState, onToast }: EpisodeCardProps) {
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
              {formatDateRelative(episode.pubDate)}
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
