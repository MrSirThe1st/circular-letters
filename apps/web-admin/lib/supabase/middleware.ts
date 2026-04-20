import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { hasAdminRole } from '../auth/auth-role';
import { getRememberSessionCookieName, getSupabaseCookieOptions, shouldRememberSession } from './cookie-policy';
import { getSupabaseEnv } from './env';

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith('/sermons');
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request,
  });

  const { url, publishableKey } = getSupabaseEnv();
  const rememberSession = shouldRememberSession(
    request.cookies.get(getRememberSessionCookieName())?.value,
  );
  const supabase = createServerClient(url, publishableKey, {
    cookieOptions: getSupabaseCookieOptions(rememberSession),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = hasAdminRole(user);

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  if (user && !isAdmin && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('error', 'admin_required');
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAdmin && request.nextUrl.pathname === '/login') {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = '/sermons';
    return NextResponse.redirect(appUrl);
  }

  return response;
}