import type { JSX } from 'react';
import { LoginForm } from '../../components/login-form';

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps): Promise<JSX.Element> {
  const params = (await searchParams) ?? {};
  const showAdminError = params.error === 'admin_required';

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="app-title">Connexion admin</h1>
        <p className="app-subtitle">Connectez-vous pour acceder au tableau de bord et garder la session sur votre appareil si besoin</p>
        {showAdminError ? (
          <div className="warning-banner">Ce compte existe mais n&apos;a pas le role admin</div>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
