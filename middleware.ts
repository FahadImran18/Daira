import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserService } from '@/lib/services/user-service';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const userService = new UserService();

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/properties',
    '/auth/login',
    '/auth/register',
    '/auth/verification',
    '/about',
    '/contact',
    '/cities',
    '/guides',
    '/market-trends',
    '/ai-insights'
  ];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If the user is not authenticated and trying to access a protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is authenticated, check role-based access
  if (session) {
    const userId = session.user.id;
    let userRole = 'customer';

    try {
      userRole = await userService.getUserRole(userId);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }

    // Role-specific routes
    const realtorRoutes = ['/realtor'];
    const advisorRoutes = ['/advisor'];
    const customerRoutes = ['/dashboard'];

    // Check if the user is trying to access a route they don't have permission for
    const isRealtorRoute = realtorRoutes.some(route => pathname.startsWith(route));
    const isAdvisorRoute = advisorRoutes.some(route => pathname.startsWith(route));
    const isCustomerRoute = customerRoutes.some(route => pathname.startsWith(route));

    if (isRealtorRoute && userRole !== 'realtor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isAdvisorRoute && userRole !== 'advisor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isCustomerRoute && userRole !== 'customer') {
      if (userRole === 'realtor') {
        return NextResponse.redirect(new URL('/realtor/dashboard', request.url));
      } else if (userRole === 'advisor') {
        return NextResponse.redirect(new URL('/advisor/dashboard', request.url));
      }
    }
  }

  return res;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 