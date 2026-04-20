'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import type { Sermon } from '@sermon-app/shared';
import type { JSX } from 'react';
import { SermonAudioUpload } from './sermon-audio-upload';
import { SermonPdfImport } from './sermon-pdf-import';
import { SermonEditor } from './sermon-editor';
import { SubmitButton } from './submit-button';
import { createSermonAction, updateSermonAction, type SermonFormState } from '../lib/sermons/sermon-actions';
import { coerceLexicalContent } from '../lib/sermons/sermon-utils';

type SermonFormProps = {
  mode?: 'create' | 'edit';
  sermon?: Sermon;
};

const initialState: SermonFormState = {
  success: false,
  error: '',
  fieldErrors: {},
};

export function SermonForm({ mode = 'create', sermon }: SermonFormProps): JSX.Element {
  const action = mode === 'edit' ? updateSermonAction : createSermonAction;
  const [state, formAction] = useActionState(action, initialState);
  const [editorContent, setEditorContent] = useState(() => coerceLexicalContent(sermon?.content));
  const dateValue = sermon ? sermon.date.slice(0, 10) : '';
  const submitLabel = mode === 'edit' ? 'Enregistrer les modifications' : 'Creer le brouillon';
  const pendingLabel = mode === 'edit' ? 'Mise a jour en cours...' : 'Creation en cours...';

  return (
    <form action={formAction} className="form-grid">
      {mode === 'edit' && sermon ? <input name="id" type="hidden" value={sermon.id} /> : null}
      {state.error ? <div className="warning-banner">{state.error}</div> : null}

      <div className="field">
        <label htmlFor="title">Titre</label>
        <input defaultValue={sermon?.title ?? ''} id="title" name="title" placeholder="La foi qui persevere" required />
        {state.fieldErrors.title ? <div className="error-text">{state.fieldErrors.title}</div> : null}
      </div>

      <div className="field">
        <label htmlFor="date">Date</label>
        <input defaultValue={dateValue} id="date" name="date" type="date" required />
        {state.fieldErrors.date ? <div className="error-text">{state.fieldErrors.date}</div> : null}
      </div>

      <div className="field">
        <label htmlFor="status">Statut</label>
        <select defaultValue={sermon?.status ?? 'draft'} id="status" name="status">
          <option value="draft">Brouillon</option>
          <option value="published">Publie</option>
        </select>
        <div className="field-hint">Pour le MVP, tout part en brouillon puis passe par revue humaine.</div>
      </div>

      <div className="field">
        <SermonAudioUpload initialAudioUrl={sermon?.audioUrl} inputName="audioUrl" />
      </div>

      <div className="field">
        <label htmlFor="content">Contenu initial</label>
        <SermonPdfImport onImport={setEditorContent} />
        <SermonEditor content={editorContent} inputName="content" />
        <div className="field-hint">Lexical enregistre le JSON de revue. Les sections et blocs Ecriture ressortent aussi dans l&apos;aperçu lecture.</div>
        {state.fieldErrors.content ? <div className="error-text">{state.fieldErrors.content}</div> : null}
      </div>

      <div className="form-actions">
        <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
        <Link className="button-secondary" href="/sermons">
          Annuler
        </Link>
      </div>
    </form>
  );
}