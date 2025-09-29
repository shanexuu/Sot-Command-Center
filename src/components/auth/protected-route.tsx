'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginForm } from './login-form'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'organizer' | 'admin'
}

export function ProtectedRoute({
  children,
  requiredRole = 'organizer',
}: ProtectedRouteProps) {
  const { user, organizer, loading, profileTimeout, isOrganizer, isAdmin } =
    useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // If user is authenticated but no organizer profile (timeout or new user)
  // Allow access if user is admin (verified by middleware) or if organizer profile exists
  // If profile timed out, allow access since middleware already verified the user's role
  if (!organizer && !profileTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Profile Setup Required
          </h1>
          <p className="text-muted-foreground">
            Your organizer profile is being loaded or needs to be created.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact an administrator to set up your organizer profile.
          </p>
        </div>
      </div>
    )
  }

  // Check role permissions
  const hasPermission = (() => {
    switch (requiredRole) {
      case 'admin':
        return isAdmin
      case 'organizer':
        // If profile timed out, allow access since middleware already verified the user's role
        // If organizer profile exists, check if user is organizer or admin
        return isOrganizer || profileTimeout
      default:
        return true
    }
  })()

  // Special case: if we're on an admin route and profile timed out, allow access
  // since middleware already verified the user has admin access
  const isOnAdminRoute =
    typeof window !== 'undefined' &&
    ['/analytics', '/ai', '/settings', '/users'].some((route) =>
      window.location.pathname.startsWith(route)
    )

  if (profileTimeout && isOnAdminRoute && !hasPermission) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Allowing access due to admin route + profile timeout')
    }
    return <>{children}</>
  }

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🛡️ ProtectedRoute Debug:', {
      requiredRole,
      isAdmin,
      isOrganizer,
      hasPermission,
      organizerRole: organizer?.role,
      profileTimeout,
      isOnAdminRoute,
      currentPath:
        typeof window !== 'undefined' ? window.location.pathname : 'server',
      userId: user?.id,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
    })
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Required role: {requiredRole}</p>
            <p>Your role: {organizer?.role || 'unknown'}</p>
            <p>Profile timeout: {profileTimeout ? 'Yes' : 'No'}</p>
            <p>Is admin: {isAdmin ? 'Yes' : 'No'}</p>
            <p>Is organizer: {isOrganizer ? 'Yes' : 'No'}</p>
            <p>On admin route: {isOnAdminRoute ? 'Yes' : 'No'}</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-muted-foreground mt-2">
                Check browser console for detailed debug info
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
