import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getRememberSessionCookieName, getSupabaseCookieOptions, shouldRememberSession } from './cookie-policy';
import { getSupabaseEnv } from './env';

type CreateSupabaseServerClientOptions = {
  persistSession?: boolean;
};

export async function createSupabaseServerClient(
  options?: CreateSupabaseServerClientOptions,
) {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();
  const rememberSession =
    options?.persistSession ??
    shouldRememberSession(cookieStore.get(getRememberSessionCookieName())?.value);

  return createServerClient(url, publishableKey, {
    cookieOptions: getSupabaseCookieOptions(rememberSession),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          return;
        }
      },
    },
  });
}