'use client'

import { EmployerForm } from '@/components/forms/employer-form'
import { useRouter } from 'next/navigation'
import { clientDataService, type Employer } from '@/lib/data-services'
import { useEffect, useState } from 'react'

// Import form types
interface ServerEmployerInsert {
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

interface ServerEmployerUpdate {
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

interface EditEmployerPageProps {
  params: {
    id: string
  }
}

export default function EditEmployerPage({ params }: EditEmployerPageProps) {
  const router = useRouter()
  const [employer, setEmployer] = useState<Employer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployer = async () => {
      try {
        const employers = await clientDataService.getEmployers()
        const foundEmployer = employers.find((e) => e.id === params.id)
        if (!foundEmployer) {
          router.push('/employers')
          return
        }
        setEmployer(foundEmployer)
      } catch (error) {
        console.error('Error fetching employer:', error)
        router.push('/employers')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployer()
  }, [params.id, router])

  const handleFormSave = async (
    data: ServerEmployerInsert | ServerEmployerUpdate
  ) => {
    try {
      // Convert form data to the format expected by dataService
      const employerData = {
        company_name: data.company_name,
        contact_email: data.contact_email,
        contact_name: data.contact_name,
        contact_title: data.contact_title,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        company_size: data.company_size as
          | 'small'
          | 'medium'
          | 'large'
          | 'enterprise',
        location: data.location,
        description: data.description,
        logo_url: data.logo_url,
        status: data.status as 'pending' | 'approved' | 'rejected' | 'draft',
      }

      await clientDataService.updateEmployer(params.id, employerData)
      router.push('/employers')
    } catch (error) {
      console.error('Error updating employer:', error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/employers')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Employer</h1>
          <p className="text-muted-foreground mt-2">Loading employer data...</p>
        </div>
      </div>
    )
  }

  if (!employer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Employer Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The requested employer could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Employer</h1>
        <p className="text-muted-foreground mt-2">
          Update employer information and company details
        </p>
      </div>

      <EmployerForm
        employer={employer}
        onSave={handleFormSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
