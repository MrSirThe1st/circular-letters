import Link from 'next/link';
import type { JSX } from 'react';
import { SermonList } from '../../components/sermon-list';
import { signOutAction } from '../../lib/auth/auth-actions';
import { getAdminUser } from '../../lib/auth/auth';
import { getSermonMetrics, listSermons } from '../../lib/sermons/sermon-repository';

type SermonsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SermonsPage({ searchParams }: SermonsPageProps): Promise<JSX.Element> {
  const params = (await searchParams) ?? {};
  const created = params.created === '1';
  const updated = params.updated === '1';
  const user = await getAdminUser();
  const sermons = await listSermons();
  const drafts = sermons.filter((item) => item.status === 'draft');
  const published = sermons.filter((item) => item.status === 'published');
  const metrics = await getSermonMetrics();

  return (
    <main className="page-shell">
      <div className="app-frame">
        <header className="app-header">
          <div>
            <span className="status-pill">Flux admin actif</span>
            <h1 className="app-title">Sermons</h1>
            <p className="app-subtitle">
              Premier slice web: creer un brouillon, verifier la liste, puis brancher la persistance
              Supabase et l&apos;auth admin.
            </p>
          </div>
          <div className="panel panel-compact">
            <h2>Priorite immediate</h2>
            <p>
              Stabiliser le CRUD de base avant PDF, audio et publication. Toute la suite repose sur ce
              backbone.
            </p>
            <p className="muted-copy">{user?.email ?? 'Session admin active'}</p>
            <div className="action-row">
              <Link className="button" href="/sermons/new">
                Nouveau sermon
              </Link>
              <form action={signOutAction}>
                <button className="button-secondary" type="submit">
                  Se deconnecter
                </button>
              </form>
            </div>
          </div>
        </header>

        {created ? (
          <div className="success-banner">Brouillon cree et enregistre dans Supabase.</div>
        ) : null}

        {updated ? <div className="success-banner">Sermon mis a jour avec succes.</div> : null}

        <section className="hero-grid">
          <div className="panel">
            <h2>Vue d&apos;ensemble</h2>
            <p>
              L&apos;objectif est de rendre le flux de creation tangible tout de suite: saisir les metadonnees,
              un contenu initial, et revenir sur une liste exploitable.
            </p>
            <div className="metric-row">
              <div className="metric-card">
                <div className="metric-label">Total</div>
                <div className="metric-value">{metrics.total}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Brouillons</div>
                <div className="metric-value">{metrics.draft}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Publies</div>
                <div className="metric-value">{metrics.published}</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <h2>Etapes suivantes</h2>
            <p>Une fois ce flux stable, on branche en sequence:</p>
            <div className="action-row">
              <span className="button-secondary">1. Auth admin</span>
              <span className="button-secondary">2. Table sermons</span>
              <span className="button-secondary">3. Lexical</span>
              <span className="button-secondary">4. PDF import</span>
            </div>
          </div>
        </section>

        <section>
          <div className="section-header">
            <div>
              <h2 className="section-title">Brouillons a revoir</h2>
              <p className="section-copy">
                Ouvre Revoir pour valider texte + audio avant publication. Modifier reste reserve a l&apos;edition.
              </p>
            </div>
            <Link className="button-secondary" href="/sermons/new">
              Ajouter un brouillon
            </Link>
          </div>
          <SermonList
            emptyMessage="Aucun brouillon en attente. Cree un sermon puis passe par la revue avant publication."
            sermons={drafts}
          />
        </section>

        <section>
          <div className="section-header">
            <div>
              <h2 className="section-title">Sermons publies</h2>
              <p className="section-copy">Historique des sermons deja publies.</p>
            </div>
          </div>
          <SermonList emptyMessage="Aucun sermon publie pour le moment." sermons={published} />
        </section>
      </div>
    </main>
  );
}