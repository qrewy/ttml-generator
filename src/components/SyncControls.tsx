import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';

type SyncControlsProps = {
  currentLineIndex: number;
  totalLines: number;
  canStepBackward: boolean;
  canStepForward: boolean;
  onStepBackward: () => void;
  onStepForward: () => void;
  onRestart: () => void;
};

export function SyncControls({
  currentLineIndex,
  totalLines,
  canStepBackward,
  canStepForward,
  onStepBackward,
  onStepForward,
  onRestart,
}: SyncControlsProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Ручная синхронизация</h2>
        </div>
  
      </div>

      <div className="sync-meta">
        <div>
          <span className="meta-label">Текущая строка</span>
          <strong>
            {totalLines === 0 ? 0 : Math.min(currentLineIndex + 1, totalLines)} /{' '}
            {totalLines}
          </strong>
        </div>
        <button className="ghost-button" type="button" onClick={onRestart}>
          <RotateCcw size={16} />
          Начать заново
        </button>
      </div>

      <div className="sync-buttons">
        <button
          type="button"
          className="sync-button sync-button-light"
          onClick={onStepBackward}
          disabled={!canStepBackward}
        >
          <ArrowUp size={34} />
          <span>Вверх</span>
        </button>

        <button
          type="button"
          className="sync-button sync-button-dark"
          onClick={onStepForward}
          disabled={!canStepForward}
        >
          <ArrowDown size={34} />
          <span>Вниз</span>
        </button>
      </div>
    </section>
  );
}
