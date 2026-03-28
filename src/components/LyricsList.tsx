import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { LyricLine } from '../types';
import { formatClockTime } from '../utils/formatTime';

type LyricsListProps = {
  lines: LyricLine[];
  activeIndex: number;
  onTimeCommit: (
    lineId: string,
    field: 'begin' | 'end',
    value: string,
  ) => void;
  onResetLine: (lineId: string) => void;
};

function getLineState(line: LyricLine, index: number, activeIndex: number) {
  if (index === activeIndex) {
    return 'active';
  }

  if (line.begin !== null || line.end !== null) {
    return 'synced';
  }

  if (index < activeIndex) {
    return 'passed';
  }

  return 'idle';
}

export function LyricsList({
  lines,
  activeIndex,
  onTimeCommit,
  onResetLine,
}: LyricsListProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const listRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    setDrafts((previous) => {
      const next: Record<string, string> = {};

      for (const line of lines) {
        for (const field of ['begin', 'end'] as const) {
          const key = `${line.id}:${field}`;
          if (key in previous) {
            next[key] = previous[key];
          }
        }
      }

      return next;
    });
  }, [lines]);

  useEffect(() => {
    const activeLine = lines[activeIndex];
    const listElement = listRef.current;

    if (!activeLine || !listElement) {
      return;
    }

    const activeElement = lineRefs.current[activeLine.id];

    if (!activeElement) {
      return;
    }

    const targetTop =
      activeElement.offsetTop -
      Math.max(listElement.clientHeight - activeElement.offsetHeight * 2.35, 0);

    listElement.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    });
  }, [activeIndex, lines]);

  const handleDraftChange = (
    lineId: string,
    field: 'begin' | 'end',
    value: string,
  ) => {
    const key = `${lineId}:${field}`;
    setDrafts((previous) => ({ ...previous, [key]: value }));
  };

  const handleCommit = (
    lineId: string,
    field: 'begin' | 'end',
    fallbackValue: number | null,
  ) => {
    const key = `${lineId}:${field}`;
    const draftValue = drafts[key];
    const nextValue =
      draftValue === undefined
        ? fallbackValue === null
          ? ''
          : formatClockTime(fallbackValue)
        : draftValue;

    onTimeCommit(lineId, field, nextValue);

    setDrafts((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    lineId: string,
    field: 'begin' | 'end',
    fallbackValue: number | null,
  ) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      const key = `${lineId}:${field}`;
      setDrafts((previous) => {
        const next = { ...previous };
        delete next[key];
        return next;
      });
      onTimeCommit(
        lineId,
        field,
        fallbackValue === null ? '' : formatClockTime(fallbackValue),
      );
      event.currentTarget.blur();
    }
  };

  return (
    <section className="panel panel-tall">
      <div className="panel-heading">
        <div> 
          <h2>Строки песни</h2>
        </div>
  
      </div>

      <div ref={listRef} className="lyrics-list">
        {lines.length === 0 ? (
          <div className="empty-state">
            Добавьте текст песни, и строки появятся здесь для разметки.
          </div>
        ) : (
          lines.map((line, index) => {
            const state = getLineState(line, index, activeIndex);
            const stateLabel =
              state === 'active'
                ? 'Текущая'
                : state === 'synced'
                  ? 'Синхронизирована'
                  : state === 'passed'
                    ? 'Выше'
                    : 'Ожидает';

            return (
              <article
                key={line.id}
                ref={(node) => {
                  lineRefs.current[line.id] = node;
                }}
                className={`line-card line-card-${state}`}
              >
                <div className="line-card-top">
                  <div>
                    <span className="line-index">{String(index + 1).padStart(2, '0')}</span>
                    <p className="line-text">{line.text}</p>
                  </div>
                  <span className="status-pill">{stateLabel}</span>
                </div>

                <div className="time-fields">
                  <label>
                    <span>Begin</span>
                    <input
                      type="text"
                      value={
                        drafts[`${line.id}:begin`] ??
                        (line.begin === null ? '' : formatClockTime(line.begin))
                      }
                      onChange={(event) =>
                        handleDraftChange(line.id, 'begin', event.target.value)
                      }
                      onBlur={() => handleCommit(line.id, 'begin', line.begin)}
                      onKeyDown={(event) =>
                        handleKeyDown(event, line.id, 'begin', line.begin)
                      }
                      placeholder="00:00.000"
                    />
                  </label>

                  <label>
                    <span>End</span>
                    <input
                      type="text"
                      value={
                        drafts[`${line.id}:end`] ??
                        (line.end === null ? '' : formatClockTime(line.end))
                      }
                      onChange={(event) =>
                        handleDraftChange(line.id, 'end', event.target.value)
                      }
                      onBlur={() => handleCommit(line.id, 'end', line.end)}
                      onKeyDown={(event) =>
                        handleKeyDown(event, line.id, 'end', line.end)
                      }
                      placeholder="00:00.000"
                    />
                  </label>

                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => onResetLine(line.id)}
                  >
                    <RotateCcw size={16} />
                    Сбросить
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
