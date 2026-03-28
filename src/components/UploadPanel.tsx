import { FileAudio, FileText, Upload } from 'lucide-react';
import { ChangeEvent } from 'react';

type UploadPanelProps = {
  lyricsText: string;
  onLyricsTextChange: (value: string) => void;
  onAudioUpload: (file: File | null) => void;
  audioFileName: string | null;
  canContinue: boolean;
  onContinue: () => void;
};

export function UploadPanel({
  lyricsText,
  onLyricsTextChange,
  onAudioUpload,
  audioFileName,
  canContinue,
  onContinue,
}: UploadPanelProps) {
  const handleAudioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onAudioUpload(file);
  };

  return (
    <div className="setup-stack">
      <section className="panel setup-panel">
        <div className="setup-section-title">
          <FileAudio size={20} />
          <h2>Audio & Lyrics</h2>
        </div>

        <div className="tab-strip">
          <button type="button" className="tab-pill tab-pill-active">
            Upload File
          </button>
          <button type="button" className="tab-pill" disabled>
            Ready for Sync
          </button>
        </div>

        <label className="dropzone dropzone-large">
          <span className="dropzone-icon">
            <Upload size={28} />
          </span>
          <span className="dropzone-title">Drag a file or click to select</span>
          <span className="dropzone-subtitle">
            {audioFileName ?? 'Upload audio file (MP3)'}
          </span>
          <input
            type="file"
            accept="audio/mpeg,audio/mp3"
            onChange={handleAudioChange}
          />
        </label>
      </section>

      <section className="panel setup-panel">
        <div className="setup-section-title">
          <FileText size={20} />
          <h2>Lyrics Text</h2>
        </div>

        <div className="tab-strip">
          <button type="button" className="tab-pill tab-pill-active">
            Paste Text
          </button>
          <button type="button" className="tab-pill" disabled>
            One line per row
          </button>
        </div>

        <div className="lyrics-editor">
          <textarea
            value={lyricsText}
            onChange={(event) => onLyricsTextChange(event.target.value)}
            placeholder="Paste song lyrics here..."
            rows={12}
          />
        </div>

        <div className="panel-footer">
          <button
            className="primary-button"
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
          >
            Open Synchronization
          </button>
        </div>
      </section>
    </div>
  );
}
