import type { PlayerState, Episode } from './types';
import { formatTime } from '@/utils/formatters';

interface AudioPlayerProps {
  episode: Episode;
  isCurrentlyPlaying: boolean;
  onPlay: (guid: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playerState: PlayerState;
}

export function AudioPlayer({ episode, isCurrentlyPlaying, onPlay, audioRef, playerState }: AudioPlayerProps) {
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
