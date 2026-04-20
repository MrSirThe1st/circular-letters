import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';
import { SermonForm } from '../../../components/sermon-form';
import { signOutAction } from '../../../lib/auth/auth-actions';
import { getAdminUser } from '../../../lib/auth/auth';
import { getSermonById } from '../../../lib/sermons/sermon-repository';

type EditSermonPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSermonPage({ params }: EditSermonPageProps): Promise<JSX.Element> {
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
            <span className="status-pill">Edition du sermon</span>
            <h1 className="app-title">{sermon.title}</h1>
            <p className="app-subtitle">
              Modifie le contenu, ajuste le statut, puis republie depuis la meme fiche si necessaire.
            </p>
          </div>
          <div className="action-row action-row-compact">
            <span className="status-pill">{user?.email ?? 'Admin'}</span>
            <Link className="button-secondary" href="/sermons">
              Retour a la liste
            </Link>
            <form action={signOutAction}>
              <button className="button-secondary" type="submit">
                Se deconnecter
              </button>
            </form>
          </div>
        </header>

        <section className="panel">
          <h2>Modifier le sermon</h2>
          <p>
            Le formulaire garde le meme contrat que la creation, avec import PDF et blocs de mise en forme
            explicites pour la revue editoriale.
          </p>
          <SermonForm mode="edit" sermon={sermon} />

          <div className="action-row">
            <Link className="button-secondary" href={`/sermons/${sermon.id}/review`}>
              Ouvrir la page de revue
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}