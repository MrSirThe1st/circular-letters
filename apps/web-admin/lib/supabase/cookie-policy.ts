const REMEMBER_SESSION_COOKIE_NAME = 'cl-admin-remember';
const PERSISTENT_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

type CookiePolicy = {
  path: string;
  sameSite: 'lax';
  secure: boolean;
  maxAge?: number;
};

type PreferenceCookiePolicy = CookiePolicy & {
  httpOnly: true;
};

function getBaseCookiePolicy(): CookiePolicy {
  return {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}

export function shouldRememberSession(cookieValue: string | undefined): boolean {
  return cookieValue !== '0';
}

export function getSupabaseCookieOptions(rememberSession: boolean): CookiePolicy {
  if (!rememberSession) {
    return getBaseCookiePolicy();
  }

  return {
    ...getBaseCookiePolicy(),
    maxAge: PERSISTENT_SESSION_MAX_AGE_SECONDS,
  };
}

export function getRememberSessionCookieName(): string {
  return REMEMBER_SESSION_COOKIE_NAME;
}

export function getRememberSessionCookieOptions(rememberSession: boolean): PreferenceCookiePolicy {
  if (!rememberSession) {
    return {
      ...getBaseCookiePolicy(),
      httpOnly: true,
    };
  }

  return {
    ...getBaseCookiePolicy(),
    httpOnly: true,
    maxAge: PERSISTENT_SESSION_MAX_AGE_SECONDS,
  };
}

export function getClearedRememberSessionCookieOptions(): PreferenceCookiePolicy {
  return {
    ...getBaseCookiePolicy(),
    httpOnly: true,
    maxAge: 0,
  };
}