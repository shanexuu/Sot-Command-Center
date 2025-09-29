import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/auth', '/api/analyze-document']
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check organizer role for protected routes
  if (user && !isPublicRoute) {
    try {
      const { data: organizer, error } = await supabase
        .from('organizers')
        .select('role, is_active')
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .single()

      // If user is not an organizer, redirect to login
      if (!organizer || error) {
        console.warn(
          'User not found in organizers table:',
          user.id,
          error?.message
        )
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Check role-based access for specific routes
      const adminRoutes = ['/analytics', '/ai', '/settings', '/users']

      if (
        adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
      ) {
        if (organizer.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    } catch (error) {
      console.error('Error checking organizer role:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
