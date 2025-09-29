import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// TypeScript interfaces for database entities
interface Student {
  id: string
  created_at: string
  updated_at: string
  email: string
  first_name: string
  last_name: string
  university: string
  degree: string
  graduation_year: number
  phone?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_url?: string
  profile_photo_url?: string
  cv_url?: string
  academic_records_url?: string
  skills: string[]
  interests: string[]
  availability: string
  location: string
  bio?: string
  status: string
  ai_validation_score?: number
  ai_validation_notes?: string
  cv_analysis_score?: number
  cv_analysis_notes?: string
  academic_records_analysis_score?: number
  academic_records_analysis_notes?: string
  documents_uploaded_at?: string
  documents_analyzed_at?: string
  last_activity: string
}

interface StudentInsert {
  email: string
  first_name: string
  last_name: string
  university: string
  degree: string
  graduation_year: number
  phone?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_url?: string
  profile_photo_url?: string
  skills?: string[]
  interests?: string[]
  availability: string
  location: string
  bio?: string
  status?: string
  ai_validation_score?: number
  ai_validation_notes?: string
}

interface StudentUpdate {
  email?: string
  first_name?: string
  last_name?: string
  university?: string
  degree?: string
  graduation_year?: number
  phone?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_url?: string
  profile_photo_url?: string
  skills?: string[]
  interests?: string[]
  availability?: string
  location?: string
  bio?: string
  status?: string
  ai_validation_score?: number
  ai_validation_notes?: string
}

interface Employer {
  id: string
  created_at: string
  updated_at: string
  company_name: string
  contact_email: string
  contact_name: string
  contact_title: string
  phone?: string
  website?: string
  industry: string
  company_size: string
  location: string
  description?: string
  logo_url?: string
  status: string
  last_activity: string
}

interface EmployerInsert {
  company_name: string
  contact_email: string
  contact_name: string
  contact_title: string
  phone?: string
  website?: string
  industry: string
  company_size: string
  location: string
  description?: string
  logo_url?: string
  status?: string
}

interface EmployerUpdate {
  company_name?: string
  contact_email?: string
  contact_name?: string
  contact_title?: string
  phone?: string
  website?: string
  industry?: string
  company_size?: string
  location?: string
  description?: string
  logo_url?: string
  status?: string
}

interface JobPosting {
  id: string
  created_at: string
  updated_at: string
  employer_id: string
  title: string
  description: string
  requirements: string[]
  skills_required: string[]
  location: string
  employment_type: string
  salary_min?: number
  salary_max?: number
  application_deadline?: string
  status: string
  ai_enhancement_score?: number
  ai_enhancement_notes?: string
  original_description?: string
  enhanced_description?: string
  last_activity: string
}

interface JobPostingInsert {
  employer_id: string
  title: string
  description: string
  requirements?: string[]
  skills_required?: string[]
  location: string
  employment_type: string
  salary_min?: number
  salary_max?: number
  application_deadline?: string
  status?: string
  ai_enhancement_score?: number
  ai_enhancement_notes?: string
  original_description?: string
  enhanced_description?: string
}

interface JobPostingUpdate {
  employer_id?: string
  title?: string
  description?: string
  requirements?: string[]
  skills_required?: string[]
  location?: string
  employment_type?: string
  salary_min?: number
  salary_max?: number
  application_deadline?: string
  status?: string
  ai_enhancement_score?: number
  ai_enhancement_notes?: string
  original_description?: string
  enhanced_description?: string
}

// Server component Supabase client (for use in server components only)
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Server-side data fetching functions
export class ServerDataService {
  private async getSupabase() {
    return await createServerSupabaseClient()
  }

  // Dashboard metrics
  async getDashboardMetrics() {
    try {
      const supabase = await this.getSupabase()
      const [
        studentsResult,
        employersResult,
        jobsResult,
        matchesResult,
        recentActivityResult,
      ] = await Promise.all([
        supabase.from('students').select('status'),
        supabase.from('employers').select('status'),
        supabase.from('job_postings').select('status'),
        supabase.from('matches').select('id'),
        supabase
          .from('students')
          .select('first_name, last_name, created_at, status')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const students = (studentsResult.data || []) as { status: string }[]
      const employers = (employersResult.data || []) as { status: string }[]
      const jobs = (jobsResult.data || []) as { status: string }[]
      const matches = matchesResult.data || []
      const recentActivity = recentActivityResult.data || []

      return {
        activeStudents: students.filter((s) => s.status === 'approved').length,
        approvedEmployers: employers.filter((e) => e.status === 'approved')
          .length,
        liveJobPostings: jobs.filter((j) => j.status === 'published').length,
        pendingStudents: students.filter((s) => s.status === 'pending').length,
        pendingEmployers: employers.filter((e) => e.status === 'pending')
          .length,
        pendingJobs: jobs.filter((j) => j.status === 'pending_review').length,
        totalMatches: matches.length,
        recentActivity,
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      return {
        activeStudents: 0,
        approvedEmployers: 0,
        liveJobPostings: 0,
        pendingStudents: 0,
        pendingEmployers: 0,
        pendingJobs: 0,
        totalMatches: 0,
        recentActivity: [],
      }
    }
  }

  // Students
  async getStudents(limit = 50): Promise<Student[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching students:', error)
      return []
    }
  }

  async getStudentsByStatus(
    status: 'pending' | 'approved' | 'rejected' | 'draft'
  ): Promise<Student[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching students by status:', error)
      return []
    }
  }

  // Employers
  async getEmployers(limit = 50): Promise<Employer[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching employers:', error)
      return []
    }
  }

  async getEmployersByStatus(
    status: 'pending' | 'approved' | 'rejected' | 'draft'
  ): Promise<Student[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching employers by status:', error)
      return []
    }
  }

  // Job Postings
  async getJobPostings(limit = 50): Promise<JobPosting[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('job_postings')
        .select(
          `
          *,
          employers (
            company_name,
            contact_name
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching job postings:', error)
      return []
    }
  }

  async getJobPostingsByStatus(
    status:
      | 'draft'
      | 'pending_review'
      | 'approved'
      | 'rejected'
      | 'published'
      | 'closed'
  ): Promise<Student[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('job_postings')
        .select(
          `
          *,
          employers (
            company_name,
            contact_name
          )
        `
        )
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching job postings by status:', error)
      return []
    }
  }

  // CRUD Operations for Students
  async createStudent(data: StudentInsert): Promise<Student> {
    try {
      const supabase = await this.getSupabase()
      const { data: result, error } = await supabase
        .from('students')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  }

  async updateStudent(id: string, data: StudentUpdate): Promise<Student> {
    try {
      const supabase = await this.getSupabase()
      const { data: result, error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase.from('students').delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  }

  // CRUD Operations for Employers
  async createEmployer(data: EmployerInsert): Promise<Employer> {
    try {
      const supabase = await this.getSupabase()
      const { data: result, error } = await supabase
        .from('employers')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating employer:', error)
      throw error
    }
  }

  async updateEmployer(id: string, data: EmployerUpdate): Promise<Employer> {
    try {
      const supabase = await this.getSupabase()
      const { data: result, error } = await supabase
        .from('employers')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating employer:', error)
      throw error
    }
  }

  async deleteEmployer(id: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase.from('employers').delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting employer:', error)
      throw error
    }
  }

  // CRUD Operations for Job Postings
  async createJobPosting(data: JobPostingInsert): Promise<JobPosting> {
    try {
      const supabase = await this.getSupabase()
      const { data: result, error } = await supabase
        .from('job_postings')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating job posting:', error)
      throw error
    }
  }

  async updateJobPosting(
    id: string,
    data: JobPostingUpdate
  ): Promise<JobPosting> {
    try {
      const supabase = await this.getSupabase()
      const { data: result, error } = await supabase
        .from('job_postings')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating job posting:', error)
      throw error
    }
  }

  async deleteJobPosting(id: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting job posting:', error)
      throw error
    }
  }
}

// Export singleton instance
export const serverDataService = new ServerDataService()
