import 'server-only';

import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../supabase/server';
import { hasAdminRole } from './auth-role';

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuthenticatedUser(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }

  return user;
}

export async function getAdminUser(): Promise<User | null> {
  const user = await getAuthenticatedUser();

  if (!hasAdminRole(user)) {
    return null;
  }

  return user;
}

export async function requireAdminUser(): Promise<User> {
  const user = await requireAuthenticatedUser();

  if (!hasAdminRole(user)) {
    throw new Error('ADMIN_REQUIRED');
  }

  return user;
}