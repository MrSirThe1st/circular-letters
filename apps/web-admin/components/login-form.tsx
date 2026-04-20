'use client';

import { useActionState } from 'react';
import type { JSX } from 'react';
import { loginAction, type LoginFormState } from '../lib/auth/auth-actions';
import { SubmitButton } from './submit-button';

const initialState: LoginFormState = {
  success: false,
  error: '',
};

export function LoginForm(): JSX.Element {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="form-grid">
      {state.error ? <div className="warning-banner">{state.error}</div> : null}

      <div className="field">
        <label htmlFor="email">Adresse email</label>
        <input autoComplete="email" id="email" name="email" required type="email" />
      </div>

      <div className="field">
        <label htmlFor="password">Mot de passe</label>
        <input autoComplete="current-password" id="password" name="password" required type="password" />
      </div>

      <div className="checkbox-field">
        <label className="checkbox-label" htmlFor="remember">
          <input defaultChecked id="remember" name="remember" type="checkbox" value="1" />
          <span>Rester connecte sur cet appareil</span>
        </label>
        <span className="field-hint">Decoche si tu es sur un appareil partage.</span>
      </div>

      <div className="field-inline">
        <span className="field-hint">La session reste verifiee cote serveur sur chaque page admin.</span>
        <SubmitButton pendingLabel="Connexion en cours...">Se connecter</SubmitButton>
      </div>
    </form>
  );
}