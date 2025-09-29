'use client'

import { JobForm } from '@/components/forms/job-form'
import { useRouter } from 'next/navigation'
import { clientDataService, type Employer } from '@/lib/data-services'
import { useEffect, useState } from 'react'
import { ProfileHeaderSkeleton } from '@/components/ui/skeleton-components'

// Import form types
interface ServerJobPostingInsert {
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
}

interface ServerJobPostingUpdate {
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
}

export default function AddJobPage() {
  const router = useRouter()
  const [employers, setEmployers] = useState<Employer[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const data = await clientDataService.getEmployers()
        setEmployers(data)
      } catch (error) {
        console.error('Error fetching employers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployers()
  }, [])

  const handleFormSave = async (
    data: ServerJobPostingInsert | ServerJobPostingUpdate
  ) => {
    if (isSubmitting) return // Prevent multiple submissions

    setIsSubmitting(true)
    try {
      // Convert form data to the format expected by dataService
      const jobData = {
        employer_id: data.employer_id || '',
        title: data.title || '',
        description: data.description || '',
        requirements: data.requirements || [],
        skills_required: data.skills_required || [],
        location: data.location || '',
        employment_type:
          (data.employment_type as
            | 'full-time'
            | 'part-time'
            | 'contract'
            | 'internship') || 'full-time',
        salary_min: data.salary_min || undefined,
        salary_max: data.salary_max || undefined,
        application_deadline: data.application_deadline || undefined,
        status:
          (data.status as
            | 'draft'
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'published'
            | 'closed') || 'pending_review',
        ai_enhancement_score: data.ai_enhancement_score || undefined,
        ai_enhancement_notes: data.ai_enhancement_notes || undefined,
        original_description: data.original_description || undefined,
        enhanced_description: data.enhanced_description || undefined,
      }

      await clientDataService.createJobPosting(jobData)
      router.push('/jobs')
    } catch (error) {
      console.error('Error creating job posting:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/jobs')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <ProfileHeaderSkeleton />
        <div className="space-y-4">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Create New Job Posting
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new job posting with detailed requirements and information
        </p>
      </div>

      <JobForm
        employers={employers}
        onSave={handleFormSave}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}
