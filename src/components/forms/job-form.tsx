'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save, Briefcase, Loader2 } from 'lucide-react'
// Use server types instead of strict database types
interface ServerJobPosting {
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
interface ServerEmployer {
  id: string
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
}

interface JobFormProps {
  job?: ServerJobPosting
  employers: ServerEmployer[]
  onSave: (
    data: ServerJobPostingInsert | ServerJobPostingUpdate
  ) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const SKILLS_OPTIONS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'C++',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'HTML',
  'CSS',
  'SASS',
  'Tailwind CSS',
  'Bootstrap',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'GitHub',
  'GitLab',
  'CI/CD',
  'Jenkins',
  'Machine Learning',
  'AI',
  'Data Analysis',
  'Statistics',
  'Mobile Development',
  'iOS',
  'Android',
  'React Native',
  'Flutter',
  'Web Development',
  'Backend Development',
  'Frontend Development',
  'DevOps',
  'System Administration',
  'Cloud Computing',
]

const REQUIREMENTS_OPTIONS = [
  "Bachelor's degree in Computer Science or related field",
  '2+ years of professional experience',
  'Strong problem-solving skills',
  'Excellent communication skills',
  'Ability to work in a team',
  'Self-motivated and proactive',
  'Attention to detail',
  'Time management skills',
  'Portfolio of previous work',
  'Open source contributions',
  'Industry certifications',
  'Previous internship experience',
  'Leadership experience',
  'Mentoring experience',
  'Agile/Scrum experience',
]

export function JobForm({
  job,
  employers,
  onSave,
  onCancel,
  isLoading = false,
}: JobFormProps) {
  const [formData, setFormData] = useState<Partial<ServerJobPostingInsert>>({
    employer_id: job?.employer_id || '',
    title: job?.title || '',
    description: job?.description || '',
    requirements: job?.requirements || [],
    skills_required: job?.skills_required || [],
    location: job?.location || '',
    employment_type: job?.employment_type || 'full-time',
    salary_min: job?.salary_min || undefined,
    salary_max: job?.salary_max || undefined,
    application_deadline: job?.application_deadline || undefined,
    status: job?.status || 'pending_review',
  })

  const [newSkill, setNewSkill] = useState('')
  const [newRequirement, setNewRequirement] = useState('')

  const handleInputChange = (
    field: keyof ServerJobPostingInsert,
    value: string | number | string[] | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !formData.skills_required?.includes(newSkill.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        skills_required: [...(prev.skills_required || []), newSkill.trim()],
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills_required:
        prev.skills_required?.filter((skill) => skill !== skillToRemove) || [],
    }))
  }

  const addRequirement = () => {
    if (
      newRequirement.trim() &&
      !formData.requirements?.includes(newRequirement.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...(prev.requirements || []), newRequirement.trim()],
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (requirementToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements:
        prev.requirements?.filter((req) => req !== requirementToRemove) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return // Prevent multiple submissions
    await onSave(formData as ServerJobPostingInsert | ServerJobPostingUpdate)
  }

  // Set default employer if only one exists
  useEffect(() => {
    if (employers.length === 1 && !formData.employer_id) {
      setFormData((prev) => ({ ...prev, employer_id: employers[0].id }))
    }
  }, [employers, formData.employer_id])

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            {job ? 'Edit Job Posting' : 'Create New Job Posting'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Job Details</h3>

            <div className="space-y-2">
              <Label htmlFor="employer_id">Employer *</Label>
              <Select
                value={formData.employer_id}
                onValueChange={(value) =>
                  handleInputChange('employer_id', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employer" />
                </SelectTrigger>
                <SelectContent>
                  {employers.map((employer) => (
                    <SelectItem
                      key={employer.id}
                      value={employer.id}
                    >
                      {employer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="e.g., Frontend Developer, Software Engineer Intern"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                required
                rows={6}
                placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  required
                  placeholder="e.g., Auckland, Remote, Wellington"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type *</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value) =>
                    handleInputChange('employment_type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_deadline">Application Deadline</Label>
              <Input
                id="application_deadline"
                type="datetime-local"
                value={
                  formData.application_deadline
                    ? new Date(formData.application_deadline)
                        .toISOString()
                        .slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  handleInputChange(
                    'application_deadline',
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null
                  )
                }
              />
            </div>
          </div>

          {/* Salary Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Salary Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary (NZD)</Label>
                <Input
                  id="salary_min"
                  type="number"
                  min="0"
                  value={formData.salary_min || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'salary_min',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary (NZD)</Label>
                <Input
                  id="salary_max"
                  type="number"
                  min="0"
                  value={formData.salary_max || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'salary_max',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="e.g., 80000"
                />
              </div>
            </div>
          </div>

          {/* Skills Required */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Required Skills</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills_required?.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select
                value={newSkill}
                onValueChange={setNewSkill}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {SKILLS_OPTIONS.map((skill) => (
                    <SelectItem
                      key={skill}
                      value={skill}
                    >
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addSkill}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Requirements</h3>
            <div className="space-y-2 mb-2">
              {formData.requirements?.map((requirement) => (
                <div
                  key={requirement}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  <span className="flex-1 text-sm">{requirement}</span>
                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => removeRequirement(requirement)}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Select
                value={newRequirement}
                onValueChange={setNewRequirement}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a requirement" />
                </SelectTrigger>
                <SelectContent>
                  {REQUIREMENTS_OPTIONS.map((requirement) => (
                    <SelectItem
                      key={requirement}
                      value={requirement}
                    >
                      {requirement}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addRequirement}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  )
}
