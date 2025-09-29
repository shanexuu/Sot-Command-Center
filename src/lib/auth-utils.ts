import { createClientClient } from './supabase-client'

export interface OrganizerData {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'organizer'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export async function createOrganizer(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'admin' | 'organizer' = 'organizer'
) {
  const supabase = createClientClient()

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create auth user' }
    }

    // Create organizer record
    const { data: organizerData, error: organizerError } = await supabase
      .from('organizers')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        auth_user_id: authData.user.id,
      })
      .select()
      .single()

    if (organizerError) {
      return { success: false, error: organizerError.message }
    }

    return { success: true, data: organizerData }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateOrganizerRole(
  organizerId: string,
  newRole: 'admin' | 'organizer'
) {
  const supabase = createClientClient()

  try {
    const { data, error } = await supabase
      .from('organizers')
      .update({ role: newRole })
      .eq('id', organizerId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deactivateOrganizer(organizerId: string) {
  const supabase = createClientClient()

  try {
    const { data, error } = await supabase
      .from('organizers')
      .update({ is_active: false })
      .eq('id', organizerId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getOrganizers() {
  const supabase = createClientClient()

  try {
    const { data, error } = await supabase
      .from('organizers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateLastLogin(organizerId: string) {
  const supabase = createClientClient()

  try {
    const { error } = await supabase
      .from('organizers')
      .update({ last_login: new Date().toISOString() })
      .eq('id', organizerId)

    if (error) {
      console.error('Error updating last login:', error)
    }
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}
