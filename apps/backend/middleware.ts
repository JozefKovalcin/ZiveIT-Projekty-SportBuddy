import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths - anyone can access
  const publicPaths = ['/', '/auth/signin', '/auth/signup', '/api/auth'];
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Protected paths - require authentication
  const protectedPaths = ['/dashboard', '/profile', '/activities/create'];
  if (protectedPaths.some((p) => path.startsWith(p))) {
    // Get session from cookies
    const sessionToken = request.cookies.get('better-auth.session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
