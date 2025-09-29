'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Building2 } from 'lucide-react'
// Use server types instead of strict database types
interface ServerEmployer {
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

interface EmployerFormProps {
  employer?: ServerEmployer
  onSave: (data: ServerEmployerInsert | ServerEmployerUpdate) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const COMPANY_SIZES = ['startup', 'small', 'medium', 'large', 'enterprise']

const COMPANY_SIZE_LABELS = {
  startup: 'Startup (1-10 employees)',
  small: 'Small (11-50 employees)',
  medium: 'Medium (51-200 employees)',
  large: 'Large (201-1000 employees)',
  enterprise: 'Enterprise (1000+ employees)',
}

export function EmployerForm({
  employer,
  onSave,
  onCancel,
  isLoading = false,
}: EmployerFormProps) {
  const [formData, setFormData] = useState<Partial<ServerEmployerInsert>>({
    company_name: employer?.company_name || '',
    contact_email: employer?.contact_email || '',
    contact_name: employer?.contact_name || '',
    contact_title: employer?.contact_title || '',
    phone: employer?.phone || '',
    website: employer?.website || '',
    industry: employer?.industry || '',
    company_size: employer?.company_size || 'small',
    location: employer?.location || '',
    description: employer?.description || '',
    logo_url: employer?.logo_url || '',
    status: employer?.status || 'pending',
  })

  const handleInputChange = (
    field: keyof ServerEmployerInsert,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData as ServerEmployerInsert | ServerEmployerUpdate)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            {employer ? 'Edit Employer' : 'Add New Employer'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Company Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Company Information</h3>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  handleInputChange('company_name', e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) =>
                    handleInputChange('industry', e.target.value)
                  }
                  required
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size *</Label>
                <Select
                  value={formData.company_size}
                  onValueChange={(value) =>
                    handleInputChange('company_size', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem
                        key={size}
                        value={size}
                      >
                        {
                          COMPANY_SIZE_LABELS[
                            size as keyof typeof COMPANY_SIZE_LABELS
                          ]
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                rows={4}
                placeholder="Tell us about your company, culture, and what makes you unique..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Contact Information</h3>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name *</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) =>
                  handleInputChange('contact_name', e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_title">Contact Title *</Label>
              <Input
                id="contact_title"
                value={formData.contact_title}
                onChange={(e) =>
                  handleInputChange('contact_title', e.target.value)
                }
                required
                placeholder="e.g., HR Manager, Talent Acquisition Specialist"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email *</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) =>
                  handleInputChange('contact_email', e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+64 9 123 4567"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
              disabled={true}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading
            ? 'Saving...'
            : employer
            ? 'Update Employer'
            : 'Create Employer'}
        </Button>
      </div>
    </form>
  )
}
