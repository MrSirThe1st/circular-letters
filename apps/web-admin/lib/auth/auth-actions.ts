'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../supabase/server';
import {
  getClearedRememberSessionCookieOptions,
  getRememberSessionCookieName,
  getRememberSessionCookieOptions,
} from '../supabase/cookie-policy';
import { hasAdminRole } from './auth-role';
import { requireAuthenticatedUser } from './auth';

export type LoginFormState = {
  success: boolean;
  error: string;
};

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getRememberSessionValue(formData: FormData): boolean {
  return formData.get('remember') === '1';
}

export async function loginAction(_previousState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const email = getFormValue(formData, 'email');
  const password = getFormValue(formData, 'password');
  const rememberSession = getRememberSessionValue(formData);

  if (!email || !password) {
    return {
      success: false,
      error: 'Email et mot de passe sont requis.',
    };
  }

  const supabase = await createSupabaseServerClient({
    persistSession: rememberSession,
  });
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: 'Connexion impossible. Verifie tes identifiants.',
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasAdminRole(user)) {
    await supabase.auth.signOut();

    const cookieStore = await cookies();
    cookieStore.set(
      getRememberSessionCookieName(),
      '',
      getClearedRememberSessionCookieOptions(),
    );

    return {
      success: false,
      error: 'Acces refuse. Ce compte ne possede pas le role admin.',
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    getRememberSessionCookieName(),
    rememberSession ? '1' : '0',
    getRememberSessionCookieOptions(rememberSession),
  );

  redirect('/sermons');
}

export async function signOutAction(): Promise<void> {
  await requireAuthenticatedUser();

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.set(
    getRememberSessionCookieName(),
    '',
    getClearedRememberSessionCookieOptions(),
  );

  redirect('/');
}