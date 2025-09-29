'use client'

import { JobForm } from '@/components/forms/job-form'
import { useRouter } from 'next/navigation'
import {
  clientDataService,
  type JobPosting,
  type Employer,
} from '@/lib/data-services'
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
  status?: string
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
  status?: string
  ai_enhancement_score?: number
  ai_enhancement_notes?: string
  original_description?: string
  enhanced_description?: string
}

interface EditJobPageProps {
  params: {
    id: string
  }
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [employers, setEmployers] = useState<Employer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobs, employersData] = await Promise.all([
          clientDataService.getJobPostings(),
          clientDataService.getEmployers(),
        ])

        const foundJob = jobs.find((j) => j.id === params.id)
        if (!foundJob) {
          router.push('/jobs')
          return
        }

        setJob(foundJob)
        setEmployers(employersData)
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const handleFormSave = async (
    data: ServerJobPostingInsert | ServerJobPostingUpdate
  ) => {
    try {
      // Convert form data to the format expected by dataService
      const jobData = {
        employer_id: data.employer_id,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        skills_required: data.skills_required,
        location: data.location,
        employment_type: data.employment_type as
          | 'full-time'
          | 'part-time'
          | 'contract'
          | 'internship',
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        application_deadline: data.application_deadline,
        status: data.status as
          | 'draft'
          | 'pending_review'
          | 'published'
          | 'closed',
        ai_enhancement_score: data.ai_enhancement_score,
        ai_enhancement_notes: data.ai_enhancement_notes,
        original_description: data.original_description,
        enhanced_description: data.enhanced_description,
      }

      await clientDataService.updateJobPosting(params.id, jobData)
      router.push('/jobs')
    } catch (error) {
      console.error('Error updating job posting:', error)
      throw error
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

  if (!job) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The requested job posting could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Job Posting</h1>
        <p className="text-muted-foreground mt-2">
          Update job posting details and requirements
        </p>
      </div>

      <JobForm
        job={job}
        employers={employers}
        onSave={handleFormSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
