import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { withAuth } from 'next-auth/middleware';

console.log('MIDDLEWARE: File loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default withAuth(
  async function middleware(request) {
    console.log('MIDDLEWARE: Running for', request.nextUrl.pathname);
    const token = await getToken({ req: request });
    console.log('MIDDLEWARE: Token for', request.nextUrl.pathname, ':', token);
    
    // List of paths that don't require authentication
    const publicPaths = [
      '/',
      '/login',
      '/register',
      '/api/auth',
      '/api/reservations',
      '/reservations',
    ];

    // Check if the path is public
    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    if (isPublicPath) {
      return NextResponse.next();
    }

    // For protected routes that require authentication
    if (request.nextUrl.pathname.startsWith('/profile')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    try {
      if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
        console.log('MIDDLEWARE: Checking admin route:', request.nextUrl.pathname);
        if (!token) {
          console.log('MIDDLEWARE: No token found, redirecting to login.');
          return NextResponse.redirect(new URL('/login', request.url));
        }
        const isAdmin = token.isAdmin === true;
        console.log('MIDDLEWARE: isAdmin:', isAdmin);
        const sub = typeof token.sub === 'string' ? token.sub : '';
        const userId = typeof token.userId === 'string' ? token.userId : '';
        const xUserId = sub || userId || '';
        console.log('MIDDLEWARE: token.sub:', sub);
        console.log('MIDDLEWARE: token.userId:', userId);
        console.log('MIDDLEWARE: x-user-id to set:', xUserId);
        if (!isAdmin) {
          if (request.nextUrl.pathname.startsWith('/api/')) {
            console.log('MIDDLEWARE: Not admin, returning 403 for API.');
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
          console.log('MIDDLEWARE: Not admin, redirecting to home.');
          return NextResponse.redirect(new URL('/', request.url));
        }
        // Add admin headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-is-admin', 'true');
        requestHeaders.set('x-user-id', xUserId);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    } catch (err) {
      console.log('MIDDLEWARE: Caught error:', err);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public paths without a token
        const publicPaths = ['/', '/login', '/register', '/api/auth', '/api/reservations', '/reservations'];
        const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
        return isPublicPath || !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/admin',
    '/admin/:path*',
    '/profile',
    '/profile/:path*',
  ],
}; 