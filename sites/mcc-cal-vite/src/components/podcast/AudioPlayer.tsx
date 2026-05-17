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

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current || !isFinite(duration) || duration === 0) return;
    audioRef.current.currentTime = Number(e.currentTarget.value);
  }

  const pct = active && isFinite(duration) && duration > 0
    ? Math.min(100, (currentTime / duration) * 100) : 0;
  const seekMax = active && isFinite(duration) && duration > 0 ? Math.floor(duration) : 0;
  const seekValue = active && isFinite(currentTime) ? Math.min(Math.floor(currentTime), seekMax) : 0;

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
        <input
          className="pod-progress"
          type="range"
          min="0"
          max={seekMax}
          step="1"
          value={seekValue}
          onChange={handleSeek}
          disabled={!active || seekMax === 0}
          aria-label={`Seek ${episode.title}`}
          aria-valuetext={timeLabel}
          style={{ '--pod-progress-pct': `${pct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
