import { Pause, Play } from 'lucide-react';
import { RefObject } from 'react';
import { formatClockTime } from '../utils/formatTime';

type AudioPlayerProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
};

export function AudioPlayer({
  audioRef,
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
}: AudioPlayerProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Плеер</h2>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl ?? undefined} preload="metadata" />

      <div className="player-shell">
        <div className="player-actions">
          <button
            type="button"
            className="player-toggle"
            onClick={onPlay}
            disabled={!audioUrl || isPlaying}
          >
            <Play size={24} />
            <span>Воспроизвести</span>
          </button>

          <button
            type="button"
            className="ghost-button player-secondary"
            onClick={onPause}
            disabled={!audioUrl || !isPlaying}
          >
            <Pause size={20} />
            <span>Пауза</span>
          </button>
        </div>

        <div className="time-block">
          <span>{formatClockTime(currentTime)}</span>
          <span>{formatClockTime(duration)}</span>
        </div>

        <div className="progress-panel">
          <div className="progress-track">
            <div className="progress-value" style={{ width: `${progress}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => onSeek(Number(event.target.value))}
            disabled={!audioUrl}
          />
        </div>
      </div>
    </section>
  );
}
