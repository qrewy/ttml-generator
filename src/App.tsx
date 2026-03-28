import { useEffect, useRef, useState } from 'react';
import { AudioPlayer } from './components/AudioPlayer';
import { ExportPanel } from './components/ExportPanel';
import { LyricsList } from './components/LyricsList';
import { SyncControls } from './components/SyncControls';
import { UploadPanel } from './components/UploadPanel';
import { LyricLine } from './types';
import { parseEditableTime } from './utils/formatTime';
import { generateTTML } from './utils/generateTTML';
import { parseLyrics } from './utils/parseLyrics';

type AppStep = 'setup' | 'sync';

function createLinesFromText(text: string) {
  return parseLyrics(text);
}

function clampActiveIndex(index: number, lines: LyricLine[]) {
  if (lines.length === 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), lines.length - 1);
}

function inferActiveIndex(lines: LyricLine[]) {
  const firstUnstartedIndex = lines.findIndex(
    (line) => line.begin === null && line.end === null,
  );

  if (firstUnstartedIndex !== -1) {
    return firstUnstartedIndex;
  }

  const lastStartedIndex = [...lines]
    .reverse()
    .findIndex((line) => line.begin !== null || line.end !== null);

  if (lastStartedIndex !== -1) {
    return lines.length - 1 - lastStartedIndex;
  }

  return 0;
}

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [step, setStep] = useState<AppStep>('setup');
  const [lyricsText, setLyricsText] = useState('');
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const element = audioRef.current;

    if (!element || step !== 'sync') {
      return;
    }

    const syncFromElement = () => {
      setCurrentTime(element.currentTime);
      setDuration(element.duration || 0);
      setIsPlaying(!element.paused && !element.ended);
    };

    const handleTimeUpdate = () => setCurrentTime(element.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(element.duration || 0);
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    syncFromElement();

    element.addEventListener('timeupdate', handleTimeUpdate);
    element.addEventListener('loadedmetadata', handleLoadedMetadata);
    element.addEventListener('ended', handleEnded);
    element.addEventListener('play', handlePlay);
    element.addEventListener('pause', handlePause);

    return () => {
      element.removeEventListener('timeupdate', handleTimeUpdate);
      element.removeEventListener('loadedmetadata', handleLoadedMetadata);
      element.removeEventListener('ended', handleEnded);
      element.removeEventListener('play', handlePlay);
      element.removeEventListener('pause', handlePause);
    };
  }, [step, audioUrl]);

  const rebuildLines = (text: string) => {
    const nextLines = createLinesFromText(text);
    setLines(nextLines);
    setActiveIndex(0);
  };

  const handleLyricsTextChange = (value: string) => {
    setLyricsText(value);
    rebuildLines(value);
  };

  const handleAudioUpload = (file: File | null) => {
    audioRef.current?.pause();

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    if (!file) {
      setAudioUrl(null);
      setAudioFileName(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setAudioUrl(nextUrl);
    setAudioFileName(file.name);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const handlePlay = async () => {
    const element = audioRef.current;

    if (!element || !audioUrl) {
      return;
    }

    if (element.paused) {
      await element.play();
    }
  };

  const handlePause = () => {
    const element = audioRef.current;

    if (!element) {
      return;
    }

    element.pause();
  };

  const handleSeek = (time: number) => {
    const element = audioRef.current;

    if (!element) {
      return;
    }

    element.currentTime = time;
    setCurrentTime(time);
  };

  const handleStepForward = () => {
    if (lines.length === 0 || activeIndex >= lines.length) {
      return;
    }

    const time = audioRef.current?.currentTime ?? currentTime;
    const isFirstPress = activeIndex === 0 && lines[0]?.begin === null;

    setLines((previous) => {
      const next = previous.map((line) => ({ ...line }));

      if (isFirstPress) {
        next[0].begin = time;
        return next;
      }

      if (activeIndex < next.length - 1) {
        next[activeIndex].end = time;
        next[activeIndex + 1].begin = time;
      } else {
        if (next[activeIndex].begin === null) {
          next[activeIndex].begin = time;
        }
        next[activeIndex].end = time;
      }

      return next;
    });

    if (!isFirstPress) {
      setActiveIndex((previous) =>
        Math.min(previous + 1, Math.max(lines.length - 1, 0)),
      );
    }
  };

  const handleStepBackward = () => {
    if (lines.length === 0 || activeIndex <= 0) {
      return;
    }

    const previousIndex = Math.max(activeIndex - 1, 0);
    const rewindTime = lines[previousIndex]?.begin ?? 0;

    setLines((previous) => {
      const next = previous.map((line) => ({ ...line }));
      const previousIndex = clampActiveIndex(activeIndex - 1, next);
      const currentIndex = clampActiveIndex(activeIndex, next);

      next[previousIndex].end = null;
      next[currentIndex].begin = null;

      return next;
    });

    setActiveIndex((previous) => Math.max(previous - 1, 0));
    handleSeek(rewindTime);
  };

  const handleRestart = () => {
    const confirmed = window.confirm(
      'Сбросить синхронизацию всех строк и начать разметку заново?',
    );

    if (!confirmed) {
      return;
    }

    setLines((previous) =>
      previous.map((line) => ({
        ...line,
        begin: null,
        end: null,
      })),
    );
    setActiveIndex(0);
    audioRef.current?.pause();
    handleSeek(0);
  };

  const handleResetLine = (lineId: string) => {
    setLines((previous) => {
      const next = previous.map((line) =>
        line.id === lineId ? { ...line, begin: null, end: null } : { ...line },
      );
      setActiveIndex(inferActiveIndex(next));
      return next;
    });
  };

  const handleTimeCommit = (
    lineId: string,
    field: 'begin' | 'end',
    value: string,
  ) => {
    const parsed = parseEditableTime(value);

    setLines((previous) => {
      const next = previous.map((line) => ({ ...line }));
      const index = next.findIndex((line) => line.id === lineId);

      if (index === -1) {
        return previous;
      }

      next[index][field] = parsed;
      setActiveIndex(inferActiveIndex(next));
      return next;
    });
  };

  const handleExport = () => {
    const syncedLines = lines.filter(
      (line) => line.begin !== null && line.end !== null && line.end > line.begin,
    );

    if (syncedLines.length === 0) {
      return;
    }

    const ttml = generateTTML(lines);
    const blob = new Blob([ttml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lyrics.ttml';
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isEditable) {
        return;
      }

      if (event.code === 'ArrowDown' || event.code === 'Space') {
        event.preventDefault();
        handleStepForward();
      }

      if (event.code === 'ArrowUp') {
        event.preventDefault();
        handleStepBackward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, lines, activeIndex]);

  const syncedCount = lines.filter(
    (line) => line.begin !== null && line.end !== null && line.end > line.begin,
  ).length;

  const canExport = syncedCount > 0;
  const canContinueToSync = Boolean(audioUrl) && lines.length > 0;

  const handleContinueToSync = () => {
    if (!canContinueToSync) {
      return;
    }

    setStep('sync');
  };

  const handleBackToSetup = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setStep('setup');
  };

  return (
    <div className="app-shell">


      <main className="layout">
        {step === 'setup' ? (
          <section className="setup-layout">
            <UploadPanel
              lyricsText={lyricsText}
              onLyricsTextChange={handleLyricsTextChange}
              onAudioUpload={handleAudioUpload}
              audioFileName={audioFileName}
              canContinue={canContinueToSync}
              onContinue={handleContinueToSync}
            />

     
          </section>
        ) : (
          <>
            <section className="page-intro page-intro-row">
            

              <button
                className="ghost-button"
                type="button"
                onClick={handleBackToSetup}
              >
                Вернуться к материалам
              </button>
            </section>

            <div className="workspace-grid">
              <div className="workspace-column">
                <AudioPlayer
                  audioRef={audioRef}
                  audioUrl={audioUrl}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onSeek={handleSeek}
                />

                <SyncControls
                  currentLineIndex={activeIndex}
                  totalLines={lines.length}
                  canStepBackward={activeIndex > 0}
                  canStepForward={lines.length > 0 && Boolean(audioUrl)}
                  onStepBackward={handleStepBackward}
                  onStepForward={handleStepForward}
                  onRestart={handleRestart}
                />

                <ExportPanel
                  syncedCount={syncedCount}
                  canExport={canExport}
                  onExport={handleExport}
                />
              </div>

              <LyricsList
                lines={lines}
                activeIndex={activeIndex}
                onTimeCommit={handleTimeCommit}
                onResetLine={handleResetLine}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
