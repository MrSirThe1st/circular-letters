import Link from 'next/link';
import type { JSX } from 'react';
import { SermonForm } from '../../../components/sermon-form';
import { signOutAction } from '../../../lib/auth/auth-actions';
import { getAdminUser } from '../../../lib/auth/auth';

export default async function NewSermonPage(): Promise<JSX.Element> {
  const user = await getAdminUser();

  return (
    <main className="page-shell">
      <div className="app-frame">
        <header className="app-header">
          <div>
            <span className="status-pill">Creation de brouillon</span>
            <h1 className="app-title">Nouveau sermon</h1>
            <p className="app-subtitle">
              Importe un PDF ou saisis directement le texte, puis structure le sermon avec des sections et
              blocs Ecriture avant sauvegarde.
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

        <div className="warning-banner">
          L&apos;import PDF reste un flux de brouillon: extraction serveur, injection dans Lexical, puis revue humaine obligatoire.
        </div>

        <section className="panel">
          <h2>Formulaire</h2>
          <p>
            Validation Zod cote serveur, structure ApiResult, et rendu lecture base sur le meme JSON Lexical enregistre.
          </p>
          <SermonForm />
        </section>
      </div>
    </main>
  );
}