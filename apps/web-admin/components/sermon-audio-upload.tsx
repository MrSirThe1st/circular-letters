'use client';

import { useRef, useState } from 'react';
import type { JSX } from 'react';
import type { ApiResult } from '@sermon-app/shared';

type UploadAudioResponse = {
  audioUrl: string;
  bucket: string;
  path: string;
};

type SermonAudioUploadProps = {
  initialAudioUrl?: string | null;
  inputName: string;
};

export function SermonAudioUpload({ initialAudioUrl = null, inputName }: SermonAudioUploadProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl ?? '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function handleUpload(): Promise<void> {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setSuccessMessage('');
      setError('Choisis un fichier audio avant de lancer l\'upload.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.set('file', file);

      const response = await fetch('/api/sermons/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as ApiResult<UploadAudioResponse>;

      if (!response.ok || !result.success) {
        setError(result.success ? 'Upload audio impossible pour le moment.' : result.error);
        return;
      }

      setAudioUrl(result.data.audioUrl);
      setSuccessMessage('Audio envoye. Enregistre ensuite le sermon pour lier ce fichier au contenu.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      setError('Upload audio impossible pour le moment. Reessaie avec un autre fichier.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear(): void {
    setAudioUrl('');
    setError('');
    setSuccessMessage('Audio retire du formulaire. Enregistre pour confirmer la suppression sur le sermon.');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="upload-panel">
      <div className="upload-grid">
        <div className="field">
          <label htmlFor="audio-upload">Audio</label>
          <input accept="audio/mpeg,audio/mp3,audio/wav" id="audio-upload" ref={fileInputRef} type="file" />
          <span className="field-hint">Formats acceptes: MP3, MPEG et WAV. L&apos;audio est stocke dans Supabase Storage.</span>
        </div>
        <div className="import-actions">
          <button className="button-secondary" disabled={isLoading} onClick={() => void handleUpload()} type="button">
            {isLoading ? 'Upload en cours...' : 'Envoyer l\'audio'}
          </button>
          {audioUrl ? (
            <button className="button-secondary" onClick={handleClear} type="button">
              Retirer l&apos;audio
            </button>
          ) : null}
        </div>
      </div>

      {audioUrl ? (
        <div className="audio-preview-card">
          <audio className="audio-preview" controls preload="none" src={audioUrl} />
          <a className="button-secondary audio-link" href={audioUrl} rel="noreferrer" target="_blank">
            Ouvrir le fichier audio
          </a>
        </div>
      ) : null}

      <input name={inputName} type="hidden" value={audioUrl} />
      {error ? <div className="warning-banner">{error}</div> : null}
      {successMessage ? <div className="success-banner">{successMessage}</div> : null}
    </div>
  );
}