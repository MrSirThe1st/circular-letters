import Link from 'next/link';
import type { JSX } from 'react';

export default function HomePage(): JSX.Element {
  return (
    <main className="landing-shell">
      <header className="landing-header">
        <Link className="landing-brand" href="/">
          Circular Letter
        </Link>

        <nav className="landing-nav">
          <Link className="button-secondary" href="/sermons">
            Tableau de bord
          </Link>
          <Link className="button" href="/login">
            Connexion
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h1 className="app-title">Gestion des sermons</h1>
        <p className="app-subtitle">
          Gerez et publiez les sermons de l&apos;eglise avec texte et audio
        </p>
        <div className="action-row">
          <Link className="button" href="/login">
            Connexion
          </Link>
          <Link className="button-secondary" href="/sermons">
            Acceder au tableau de bord
          </Link>
        </div>
      </section>
    </main>
  );
}
