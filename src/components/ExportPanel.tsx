type ExportPanelProps = {
  syncedCount: number;
  canExport: boolean;
  onExport: () => void;
};

export function ExportPanel({
  syncedCount,
  canExport,
  onExport,
}: ExportPanelProps) {
  return (
    <section className="panel export-panel">
      <div className="panel-heading">
        <div>
          <h2>Экспорт TTML</h2>
        </div>
    
      </div>

      <div className="export-row">
        <div>
          <span className="meta-label">Готово строк</span>
          <strong>{syncedCount}</strong>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={onExport}
          disabled={!canExport}
        >
          Скачать TTML
        </button>
      </div>
    </section>
  );
}
