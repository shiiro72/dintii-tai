import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './supabase/middleware';

const locales = ['en', 'de', 'ro'];
const defaultLocale = 'ro';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return updateSession(request);

  if (pathname.startsWith('/studio')) {
    return NextResponse.next();
  }

  // Redirect if there is no locale
  const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return updateSession(request, NextResponse.redirect(request.nextUrl));
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
