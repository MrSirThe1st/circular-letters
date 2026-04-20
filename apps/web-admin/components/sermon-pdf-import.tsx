'use client';

import { useRef, useState } from 'react';
import type { JSX } from 'react';
import type { ApiResult } from '@sermon-app/shared';
import type { LexicalRootNode } from '../lib/sermons/sermon-types';

type ImportPdfResponse = {
  blockCount: number;
  content: LexicalRootNode;
};

type SermonPdfImportProps = {
  onImport(content: LexicalRootNode): void;
};

export function SermonPdfImport({ onImport }: SermonPdfImportProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function handleImport(): Promise<void> {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setSuccessMessage('');
      setError('Choisis un PDF avant de lancer l\'import.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.set('file', file);

      const response = await fetch('/api/sermons/import-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as ApiResult<ImportPdfResponse>;

      if (!response.ok || !result.success) {
        setError(result.success ? 'Import PDF impossible pour le moment.' : result.error);
        return;
      }

      onImport(result.data.content);
      setSuccessMessage(`${result.data.blockCount} blocs importes dans l'editeur. Relis puis corrige avant d'enregistrer.`);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      setError('Import PDF impossible pour le moment. Reessaie avec un autre fichier.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="import-panel">
      <div className="import-grid">
        <div className="field">
          <label htmlFor="pdf-upload">Importer un PDF</label>
          <input accept="application/pdf" id="pdf-upload" ref={fileInputRef} type="file" />
          <span className="field-hint">Le texte est extrait cote serveur puis injecte dans Lexical pour revue humaine.</span>
        </div>
        <div className="import-actions">
          <button className="button-secondary" disabled={isLoading} onClick={() => void handleImport()} type="button">
            {isLoading ? 'Extraction en cours...' : 'Extraire dans l\'editeur'}
          </button>
          <span className="field-hint">L&apos;import remplace le contenu courant de l&apos;editeur.</span>
        </div>
      </div>
      {error ? <div className="warning-banner">{error}</div> : null}
      {successMessage ? <div className="success-banner">{successMessage}</div> : null}
    </div>
  );
}