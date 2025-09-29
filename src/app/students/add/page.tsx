'use client'

import { StudentForm } from '@/components/forms/student-form'
import { useRouter } from 'next/navigation'
import { clientDataService } from '@/lib/data-services'
import { useState } from 'react'

// Import form types
interface ServerStudentInsert {
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
  cv_analysis_score?: number
  cv_analysis_notes?: string
  academic_records_analysis_score?: number
  academic_records_analysis_notes?: string
  documents_uploaded_at?: string
  documents_analyzed_at?: string
  skills?: string[]
  interests?: string[]
  availability: string
  availability_options?: string[]
  location: string
  bio?: string
  status?: string
  ai_validation_score?: number
  ai_validation_notes?: string
}

interface ServerStudentUpdate {
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

export default function AddStudentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSave = async (
    data: ServerStudentInsert | ServerStudentUpdate,
    tempStudentId?: string
  ) => {
    if (isSubmitting) return // Prevent multiple submissions

    setIsSubmitting(true)
    try {
      // Convert form data to the format expected by dataService
      const studentData = {
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        university: data.university || '',
        degree: data.degree || '',
        graduation_year: data.graduation_year || 2024,
        phone: data.phone || undefined,
        linkedin_url: data.linkedin_url || undefined,
        github_url: data.github_url || undefined,
        portfolio_url: data.portfolio_url || undefined,
        resume_url: data.resume_url || undefined,
        profile_photo_url: data.profile_photo_url || undefined,
        cv_url: (data as ServerStudentInsert).cv_url || undefined,
        academic_records_url:
          (data as ServerStudentInsert).academic_records_url || undefined,
        cv_analysis_score:
          (data as ServerStudentInsert).cv_analysis_score || undefined,
        cv_analysis_notes:
          (data as ServerStudentInsert).cv_analysis_notes || undefined,
        academic_records_analysis_score:
          (data as ServerStudentInsert).academic_records_analysis_score ||
          undefined,
        academic_records_analysis_notes:
          (data as ServerStudentInsert).academic_records_analysis_notes ||
          undefined,
        documents_uploaded_at:
          (data as ServerStudentInsert).documents_uploaded_at || undefined,
        documents_analyzed_at:
          (data as ServerStudentInsert).documents_analyzed_at || undefined,
        skills: data.skills || [],
        interests: data.interests || [],
        availability:
          (data.availability as
            | 'full-time'
            | 'part-time'
            | 'internship'
            | 'contract') || 'full-time',
        availability_options: ((data as ServerStudentInsert)
          .availability_options || []) as (
          | 'full-time'
          | 'part-time'
          | 'internship'
          | 'contract'
        )[],
        location: data.location || '',
        bio: data.bio || undefined,
        status:
          (data.status as 'pending' | 'approved' | 'rejected' | 'draft') ||
          'pending',
        ai_validation_score: data.ai_validation_score || undefined,
        ai_validation_notes: data.ai_validation_notes || undefined,
      }

      const newStudent = await clientDataService.createStudent(studentData)

      // Move documents from temp folder to proper student folder if tempStudentId exists
      if (tempStudentId && newStudent) {
        try {
          await clientDataService.moveDocumentsFromTemp(
            tempStudentId,
            newStudent.id
          )
        } catch (error) {
          console.error('Error moving documents:', error)
          // Don't fail the entire operation if document moving fails
        }
      }

      router.push('/students')
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/students')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add New Student</h1>
        <p className="text-muted-foreground mt-2">
          Create a new student profile with all required information
        </p>
      </div>

      <StudentForm
        onSave={handleFormSave}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}
