import { createBrowserClient } from '@supabase/ssr'

// Client component Supabase client (for use in client components only)
export const createClientClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase environment variables not configured, creating dummy client'
    )
    // Return a dummy client that won't make actual API calls
    return createBrowserClient('http://localhost:54321', 'dummy-key')
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
