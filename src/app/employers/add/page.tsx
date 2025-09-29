'use client'

import { EmployerForm } from '@/components/forms/employer-form'
import { useRouter } from 'next/navigation'
import { clientDataService } from '@/lib/data-services'
import { useState } from 'react'

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

export default function AddEmployerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSave = async (
    data: ServerEmployerInsert | ServerEmployerUpdate
  ) => {
    if (isSubmitting) return // Prevent multiple submissions

    setIsSubmitting(true)
    try {
      // Convert form data to the format expected by dataService
      const employerData = {
        company_name: data.company_name || '',
        contact_email: data.contact_email || '',
        contact_name: data.contact_name || '',
        contact_title: data.contact_title || '',
        phone: data.phone || undefined,
        website: data.website || undefined,
        industry: data.industry || '',
        company_size:
          (data.company_size as 'small' | 'medium' | 'large' | 'enterprise') ||
          'small',
        location: data.location || '',
        description: data.description || undefined,
        logo_url: data.logo_url || undefined,
        status:
          (data.status as 'pending' | 'approved' | 'rejected' | 'draft') ||
          'pending',
      }

      await clientDataService.createEmployer(employerData)
      router.push('/employers')
    } catch (error) {
      console.error('Error creating employer:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/employers')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add New Employer</h1>
        <p className="text-muted-foreground mt-2">
          Create a new employer profile with company information
        </p>
      </div>

      <EmployerForm
        onSave={handleFormSave}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}
