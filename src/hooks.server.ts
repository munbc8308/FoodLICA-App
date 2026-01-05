import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup'];

export const handle: Handle = async ({ event, resolve }) => {
	// Get session token from cookie
	const sessionToken = event.cookies.get('session');

	// Validate session
	const user = await validateSession(sessionToken);

	// Set user in locals for use in pages
	event.locals.user = user;

	// Check if route requires authentication
	const isPublicRoute = PUBLIC_ROUTES.some((route) => event.url.pathname.startsWith(route));
	const isApiRoute = event.url.pathname.startsWith('/api/');

	// If not logged in and trying to access protected route
	if (!user && !isPublicRoute) {
		// For API routes, return 401 instead of redirecting
		if (isApiRoute) {
			return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
				status: 401,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
		// For page routes, redirect to login
		return Response.redirect(new URL('/login', event.url.origin), 303);
	}

	// If logged in and trying to access login/signup, redirect to main
	if (user && (event.url.pathname === '/login' || event.url.pathname === '/signup')) {
		return Response.redirect(new URL('/main', event.url.origin), 303);
	}

	return resolve(event);
};
