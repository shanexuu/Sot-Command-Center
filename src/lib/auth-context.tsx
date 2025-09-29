'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { createClientClient } from './supabase-client'
import type { User, AuthError } from '@supabase/supabase-js'

interface Organizer {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'organizer'
  is_active: boolean
  last_login: string | null
}

interface AuthContextType {
  user: User | null
  organizer: Organizer | null
  loading: boolean
  profileTimeout: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isOrganizer: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileTimeout, setProfileTimeout] = useState(false)
  const supabase = createClientClient()

  const fetchOrganizerProfile = useCallback(
    async (userId: string, retryCount = 0) => {
      try {
        // Check if Supabase is configured
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          setOrganizer(null)
          return
        }

        // Add timeout to prevent hanging queries - increased to 10 seconds
        const queryPromise = supabase
          .from('organizers')
          .select('*')
          .eq('auth_user_id', userId)
          .eq('is_active', true)
          .single()

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 10000)
        )

        const result = (await Promise.race([queryPromise, timeoutPromise])) as {
          data: Organizer | null
          error: AuthError | null
        }

        if (result.error) {
          // Handle timeout gracefully - don't log as error, just set organizer to null
          if (result.error.message === 'Query timeout') {
            console.warn(
              'Organizer profile query timed out, continuing without profile'
            )
            setOrganizer(null)
            setProfileTimeout(true)

            // Retry once after a delay if this is the first attempt
            if (retryCount === 0) {
              setTimeout(() => {
                fetchOrganizerProfile(userId, 1)
              }, 3000)
            }
            return
          }
          console.error('Error fetching organizer profile:', result.error)
          setOrganizer(null)
          return
        }

        setOrganizer(result.data)
        setProfileTimeout(false) // Reset timeout flag on successful fetch
      } catch (error) {
        // Handle timeout gracefully
        if (error instanceof Error && error.message === 'Query timeout') {
          console.warn(
            'Organizer profile query timed out, continuing without profile'
          )
          setOrganizer(null)
          setProfileTimeout(true)

          // Retry once after a delay if this is the first attempt
          if (retryCount === 0) {
            setTimeout(() => {
              fetchOrganizerProfile(userId, 1)
            }, 3000)
          }
          return
        }
        console.error('Error fetching organizer profile:', error)
        setOrganizer(null)
      }
    },
    [supabase]
  )

  useEffect(() => {
    // Check if environment variables are set
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error('Missing Supabase environment variables')
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchOrganizerProfile(session.user.id)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchOrganizerProfile(session.user.id)
      } else {
        setOrganizer(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchOrganizerProfile, supabase.auth])

  const signIn = async (email: string, password: string) => {
    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.log('Supabase not configured, skipping sign in')
      return { error: new Error('Supabase not configured') }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.log('Supabase not configured, skipping sign out')
      return
    }

    await supabase.auth.signOut()
  }

  // Check if user is admin - either from organizer profile or fallback to user metadata
  // Also check if we're on an admin route (verified by middleware)
  const isOnAdminRoute =
    typeof window !== 'undefined' &&
    ['/analytics', '/ai', '/settings', '/users'].some((route) =>
      window.location.pathname.startsWith(route)
    )

  const isAdmin =
    organizer?.role === 'admin' ||
    user?.user_metadata?.role === 'admin' ||
    (profileTimeout && isOnAdminRoute) // If profile timed out but we're on admin route, user is admin
  const isOrganizer = organizer?.role === 'organizer' || isAdmin

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Auth Context Debug:', {
      userId: user?.id,
      userEmail: user?.email,
      organizerRole: organizer?.role,
      organizerExists: !!organizer,
      organizerId: organizer?.id,
      profileTimeout,
      isOnAdminRoute,
      isAdmin,
      isOrganizer,
      userMetadata: user?.user_metadata,
      currentPath:
        typeof window !== 'undefined' ? window.location.pathname : 'server',
      timestamp: new Date().toISOString(),
    })
  }

  const value = {
    user,
    organizer,
    loading,
    profileTimeout,
    signIn,
    signOut,
    isAdmin,
    isOrganizer,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
