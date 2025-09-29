'use client'

import { StudentForm } from '@/components/forms/student-form'
import { useRouter } from 'next/navigation'
import { clientDataService, type Student } from '@/lib/data-services'
import { useEffect, useState } from 'react'

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
  availability?: string
  location?: string
  bio?: string
  status?: string
  ai_validation_score?: number
  ai_validation_notes?: string
}

interface EditStudentPageProps {
  params: {
    id: string
  }
}

export default function EditStudentPage({ params }: EditStudentPageProps) {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const students = await clientDataService.getStudents()
        const foundStudent = students.find((s) => s.id === params.id)
        if (!foundStudent) {
          router.push('/students')
          return
        }
        setStudent(foundStudent)
      } catch (error) {
        console.error('Error fetching student:', error)
        router.push('/students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [params.id, router])

  const handleFormSave = async (
    data: ServerStudentInsert | ServerStudentUpdate
  ) => {
    try {
      // Convert form data to the format expected by dataService
      const studentData = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        university: data.university,
        degree: data.degree,
        graduation_year: data.graduation_year,
        phone: data.phone,
        linkedin_url: data.linkedin_url,
        github_url: data.github_url,
        portfolio_url: data.portfolio_url,
        resume_url: data.resume_url,
        profile_photo_url: data.profile_photo_url,
        skills: data.skills,
        interests: data.interests,
        availability: data.availability as
          | 'full-time'
          | 'part-time'
          | 'internship'
          | 'contract',
        location: data.location,
        bio: data.bio,
        status: data.status as 'pending' | 'approved' | 'rejected' | 'draft',
        ai_validation_score: data.ai_validation_score,
        ai_validation_notes: data.ai_validation_notes,
      }

      await clientDataService.updateStudent(params.id, studentData)
      router.push('/students')
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/students')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Student</h1>
          <p className="text-muted-foreground mt-2">Loading student data...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Student Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The requested student could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Student</h1>
        <p className="text-muted-foreground mt-2">
          Update student information and profile details
        </p>
      </div>

      <StudentForm
        student={student}
        onSave={handleFormSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
