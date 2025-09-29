export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
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
          skills: string[]
          interests: string[]
          availability: 'full-time' | 'part-time' | 'internship' | 'contract'
          location: string
          bio?: string
          status: 'pending' | 'approved' | 'rejected' | 'draft'
          ai_validation_score?: number
          ai_validation_notes?: string
          last_activity: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
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
          availability: 'full-time' | 'part-time' | 'internship' | 'contract'
          location: string
          bio?: string
          status?: 'pending' | 'approved' | 'rejected' | 'draft'
          ai_validation_score?: number
          ai_validation_notes?: string
          last_activity?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
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
          availability?: 'full-time' | 'part-time' | 'internship' | 'contract'
          location?: string
          bio?: string
          status?: 'pending' | 'approved' | 'rejected' | 'draft'
          ai_validation_score?: number
          ai_validation_notes?: string
          last_activity?: string
        }
      }
      employers: {
        Row: {
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
          company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
          location: string
          description?: string
          logo_url?: string
          status: 'pending' | 'approved' | 'rejected' | 'draft'
          last_activity: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          company_name: string
          contact_email: string
          contact_name: string
          contact_title: string
          phone?: string
          website?: string
          industry: string
          company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
          location: string
          description?: string
          logo_url?: string
          status?: 'pending' | 'approved' | 'rejected' | 'draft'
          last_activity?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_title?: string
          phone?: string
          website?: string
          industry?: string
          company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
          location?: string
          description?: string
          logo_url?: string
          status?: 'pending' | 'approved' | 'rejected' | 'draft'
          last_activity?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          employer_id: string
          title: string
          description: string
          requirements: string[]
          skills_required: string[]
          location: string
          employment_type: 'full-time' | 'part-time' | 'internship' | 'contract'
          salary_min?: number
          salary_max?: number
          application_deadline?: string
          status:
            | 'draft'
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'published'
            | 'closed'
          ai_enhancement_score?: number
          ai_enhancement_notes?: string
          original_description?: string
          enhanced_description?: string
          last_activity: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          employer_id: string
          title: string
          description: string
          requirements?: string[]
          skills_required?: string[]
          location: string
          employment_type: 'full-time' | 'part-time' | 'internship' | 'contract'
          salary_min?: number
          salary_max?: number
          application_deadline?: string
          status?:
            | 'draft'
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'published'
            | 'closed'
          ai_enhancement_score?: number
          ai_enhancement_notes?: string
          original_description?: string
          enhanced_description?: string
          last_activity?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          employer_id?: string
          title?: string
          description?: string
          requirements?: string[]
          skills_required?: string[]
          location?: string
          employment_type?:
            | 'full-time'
            | 'part-time'
            | 'internship'
            | 'contract'
          salary_min?: number
          salary_max?: number
          application_deadline?: string
          status?:
            | 'draft'
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'published'
            | 'closed'
          ai_enhancement_score?: number
          ai_enhancement_notes?: string
          original_description?: string
          enhanced_description?: string
          last_activity?: string
        }
      }
      matches: {
        Row: {
          id: string
          created_at: string
          student_id: string
          employer_id: string
          job_posting_id?: string
          match_score: number
          status:
            | 'suggested'
            | 'viewed'
            | 'interested'
            | 'not_interested'
            | 'matched'
          ai_notes?: string
          last_activity: string
        }
        Insert: {
          id?: string
          created_at?: string
          student_id: string
          employer_id: string
          job_posting_id?: string
          match_score: number
          status?:
            | 'suggested'
            | 'viewed'
            | 'interested'
            | 'not_interested'
            | 'matched'
          ai_notes?: string
          last_activity?: string
        }
        Update: {
          id?: string
          created_at?: string
          student_id?: string
          employer_id?: string
          job_posting_id?: string
          match_score?: number
          status?:
            | 'suggested'
            | 'viewed'
            | 'interested'
            | 'not_interested'
            | 'matched'
          ai_notes?: string
          last_activity?: string
        }
      }
      analytics: {
        Row: {
          id: string
          created_at: string
          metric_name: string
          metric_value: number
          metric_type: 'count' | 'percentage' | 'score' | 'rate'
          category: 'students' | 'employers' | 'jobs' | 'matches'
          period: 'daily' | 'weekly' | 'monthly' | 'yearly'
          period_date: string
          metadata?: Record<string, unknown>
        }
        Insert: {
          id?: string
          created_at?: string
          metric_name: string
          metric_value: number
          metric_type: 'count' | 'percentage' | 'score' | 'rate'
          category: 'students' | 'employers' | 'jobs' | 'matches'
          period: 'daily' | 'weekly' | 'monthly' | 'yearly'
          period_date: string
          metadata?: Record<string, unknown>
        }
        Update: {
          id?: string
          created_at?: string
          metric_name?: string
          metric_value?: number
          metric_type?: 'count' | 'percentage' | 'score' | 'rate'
          category?: 'students' | 'employers' | 'jobs' | 'matches'
          period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          period_date?: string
          metadata?: Record<string, unknown>
        }
      }
      organizers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'organizer'
          is_active: boolean
          last_login?: string
          auth_user_id?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          first_name: string
          last_name: string
          role?: 'admin' | 'organizer'
          is_active?: boolean
          last_login?: string
          auth_user_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'organizer'
          is_active?: boolean
          last_login?: string
          auth_user_id?: string
        }
      }
      applications: {
        Row: {
          id: string
          created_at: string
          student_id: string
          job_posting_id: string
          status:
            | 'applied'
            | 'reviewed'
            | 'interviewed'
            | 'accepted'
            | 'rejected'
          cover_letter?: string
          notes?: string
          applied_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          student_id: string
          job_posting_id: string
          status?:
            | 'applied'
            | 'reviewed'
            | 'interviewed'
            | 'accepted'
            | 'rejected'
          cover_letter?: string
          notes?: string
          applied_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          student_id?: string
          job_posting_id?: string
          status?:
            | 'applied'
            | 'reviewed'
            | 'interviewed'
            | 'accepted'
            | 'rejected'
          cover_letter?: string
          notes?: string
          applied_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          recipient_type: 'student' | 'employer' | 'organizer'
          recipient_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          read_at?: string
          metadata?: Record<string, unknown>
        }
        Insert: {
          id?: string
          created_at?: string
          recipient_type: 'student' | 'employer' | 'organizer'
          recipient_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          read_at?: string
          metadata?: Record<string, unknown>
        }
        Update: {
          id?: string
          created_at?: string
          recipient_type?: 'student' | 'employer' | 'organizer'
          recipient_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          read_at?: string
          metadata?: Record<string, unknown>
        }
      }
      ai_interactions: {
        Row: {
          id: string
          created_at: string
          tool_type: 'student_validator' | 'job_enhancer' | 'matchmaking'
          user_id: string
          user_type: 'student' | 'employer' | 'organizer'
          input_data: Record<string, unknown>
          output_data?: Record<string, unknown>
          processing_time_ms?: number
          success: boolean
          error_message?: string
        }
        Insert: {
          id?: string
          created_at?: string
          tool_type: 'student_validator' | 'job_enhancer' | 'matchmaking'
          user_id: string
          user_type: 'student' | 'employer' | 'organizer'
          input_data: Record<string, unknown>
          output_data?: Record<string, unknown>
          processing_time_ms?: number
          success?: boolean
          error_message?: string
        }
        Update: {
          id?: string
          created_at?: string
          tool_type?: 'student_validator' | 'job_enhancer' | 'matchmaking'
          user_id?: string
          user_type?: 'student' | 'employer' | 'organizer'
          input_data?: Record<string, unknown>
          output_data?: Record<string, unknown>
          processing_time_ms?: number
          success?: boolean
          error_message?: string
        }
      }
    }
    Views: {
      student_dashboard: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          university: string
          status: 'pending' | 'approved' | 'rejected' | 'draft'
          ai_validation_score?: number
          application_count: number
          match_count: number
          last_activity: string
        }
      }
      employer_dashboard: {
        Row: {
          id: string
          company_name: string
          contact_name: string
          status: 'pending' | 'approved' | 'rejected' | 'draft'
          job_count: number
          application_count: number
          match_count: number
          last_activity: string
        }
      }
      analytics_summary: {
        Row: {
          category: 'students' | 'employers' | 'jobs' | 'matches'
          period: 'daily' | 'weekly' | 'monthly' | 'yearly'
          period_date: string
          metric_count: number
          avg_value: number
          max_value: number
          min_value: number
        }
      }
      organizer_management: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'organizer'
          is_active: boolean
          last_login?: string
          created_at: string
          updated_at: string
          activity_status: 'Never' | 'Active' | 'Recent' | 'Inactive'
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
