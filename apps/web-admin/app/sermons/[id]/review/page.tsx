import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';
import { SermonContent } from '../../../../components/sermon-content';
import { SermonTtsPreview } from '../../../../components/sermon-tts-preview';
import { signOutAction } from '../../../../lib/auth/auth-actions';
import { getAdminUser } from '../../../../lib/auth/auth';
import { getSermonById } from '../../../../lib/sermons/sermon-repository';
import { formatDateLabel } from '../../../../lib/sermons/sermon-utils';
import { setSermonStatusAction } from '../../../../lib/sermons/sermon-actions';

type ReviewSermonPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReviewSermonPage({ params }: ReviewSermonPageProps): Promise<JSX.Element> {
  const [{ id }, user] = await Promise.all([params, getAdminUser()]);
  const sermon = await getSermonById(id);

  if (!sermon) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="app-frame">
        <header className="app-header">
          <div>
            <span className="status-pill">Revue avant publication</span>
            <h1 className="app-title">{sermon.title}</h1>
            <p className="app-subtitle">
              Verifie ici le rendu texte + audio. Garde la page modifier uniquement pour l&apos;edition.
            </p>
            <div className="sermon-meta">
              <span className={sermon.status === 'draft' ? 'badge badge-draft' : 'badge'}>
                {sermon.status === 'draft' ? 'Brouillon' : 'Publie'}
              </span>
              <span>{formatDateLabel(sermon.date)}</span>
            </div>
          </div>
          <div className="action-row action-row-compact">
            <span className="status-pill">{user?.email ?? 'Admin'}</span>
            <Link className="button-secondary" href="/sermons">
              Retour a la liste
            </Link>
            <Link className="button-secondary" href={`/sermons/${sermon.id}`}>
              Modifier
            </Link>
            {sermon.status === 'draft' ? (
              <form action={setSermonStatusAction}>
                <input name="id" type="hidden" value={sermon.id} />
                <input name="status" type="hidden" value="published" />
                <button className="button" type="submit">
                  Publier
                </button>
              </form>
            ) : null}
            <form action={signOutAction}>
              <button className="button-secondary" type="submit">
                Se deconnecter
              </button>
            </form>
          </div>
        </header>

        <section className="panel">
          <h2>Audio manuel sauvegarde</h2>
          <p>Audio importe via upload admin.</p>
          {sermon.audioUrl ? (
            <audio className="audio-preview" controls preload="none" src={sermon.audioUrl} />
          ) : (
            <p>Pas d&apos;audio manuel pour ce sermon.</p>
          )}
        </section>

        <section className="panel">
          <h2>Audio TTS + alignment</h2>
          <p>
            Cette zone recharge le dernier rendu TTS sauvegarde et te permet de regenerer si necessaire.
          </p>
          <SermonTtsPreview initialTts={sermon.tts} sermonId={sermon.id} />
        </section>

        <section className="panel">
          <h2>Rendu texte sauvegarde</h2>
          <p>Lecture seule du contenu avant publication.</p>
          <SermonContent content={sermon.content} />
        </section>
      </div>
    </main>
  );
}
