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
import { Badge } from '@/components/ui/badge'
import { DocumentUpload } from '@/components/ui/document-upload'
import { X, Plus, Save, User } from 'lucide-react'
// Use server types instead of strict database types
interface ServerStudent {
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
  cv_analysis_score?: number
  cv_analysis_notes?: string
  academic_records_analysis_score?: number
  academic_records_analysis_notes?: string
  documents_uploaded_at?: string
  documents_analyzed_at?: string
  skills: string[]
  interests: string[]
  availability: string
  availability_options?: string[]
  location: string
  bio?: string
  status: string
  ai_validation_score?: number
  ai_validation_notes?: string
  last_activity: string
}

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
  availability_options?: string[]
  location?: string
  bio?: string
  status?: string
  ai_validation_score?: number
  ai_validation_notes?: string
}

interface StudentFormProps {
  student?: ServerStudent
  onSave: (
    data: ServerStudentInsert | ServerStudentUpdate,
    tempStudentId?: string
  ) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const UNIVERSITIES = [
  'University of Auckland',
  'Auckland University of Technology',
  'University of Waikato',
  'Massey University',
  'Victoria University of Wellington',
  'University of Canterbury',
  'Lincoln University',
  'University of Otago',
  'Other',
]

const DEGREES = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Cybersecurity',
  'Computer Engineering',
  'Information Systems',
  'Digital Media',
  'Other',
]

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

const INTERESTS_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'Backend Development',
  'Frontend Development',
  'Full Stack Development',
  'DevOps',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Cybersecurity',
  'Cloud Computing',
  'Game Development',
  'UI/UX Design',
  'Product Management',
  'Project Management',
  'Startups',
  'Open Source',
  'Blockchain',
  'IoT',
  'AR/VR',
]

export function StudentForm({
  student,
  onSave,
  onCancel,
  isLoading = false,
}: StudentFormProps) {
  // Generate a temporary UUID for new students to allow document uploads
  const [tempStudentId] = useState(() => {
    if (student?.id) return student.id
    // Generate a temporary UUID for new students
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
  })

  const [formData, setFormData] = useState<Partial<ServerStudentInsert>>({
    email: student?.email || '',
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    university: student?.university || '',
    degree: student?.degree || '',
    graduation_year: student?.graduation_year || new Date().getFullYear(),
    phone: student?.phone || '',
    linkedin_url: student?.linkedin_url || '',
    github_url: student?.github_url || '',
    portfolio_url: student?.portfolio_url || '',
    resume_url: student?.resume_url || '',
    profile_photo_url: student?.profile_photo_url || '',
    cv_url: student?.cv_url || '',
    academic_records_url: student?.academic_records_url || '',
    cv_analysis_score: student?.cv_analysis_score || undefined,
    cv_analysis_notes: student?.cv_analysis_notes || '',
    academic_records_analysis_score:
      student?.academic_records_analysis_score || undefined,
    academic_records_analysis_notes:
      student?.academic_records_analysis_notes || '',
    documents_uploaded_at: student?.documents_uploaded_at || '',
    documents_analyzed_at: student?.documents_analyzed_at || '',
    skills: student?.skills || [],
    interests: student?.interests || [],
    availability: student?.availability || 'full-time',
    availability_options: student?.availability_options || [],
    location: student?.location || '',
    bio: student?.bio || '',
    status: student?.status || 'pending',
  })

  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [newAvailability, setNewAvailability] = useState('')

  const handleInputChange = (
    field: keyof ServerStudentInsert,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill !== skillToRemove) || [],
    }))
  }

  const addInterest = () => {
    if (
      newInterest.trim() &&
      !formData.interests?.includes(newInterest.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest.trim()],
      }))
      setNewInterest('')
    }
  }

  const removeInterest = (interestToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      interests:
        prev.interests?.filter((interest) => interest !== interestToRemove) ||
        [],
    }))
  }

  const addAvailability = () => {
    if (
      newAvailability.trim() &&
      !formData.availability_options?.includes(newAvailability.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        availability_options: [
          ...(prev.availability_options || []),
          newAvailability.trim(),
        ],
      }))
      setNewAvailability('')
    }
  }

  const removeAvailability = (availabilityToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      availability_options:
        prev.availability_options?.filter(
          (availability) => availability !== availabilityToRemove
        ) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(
      formData as ServerStudentInsert | ServerStudentUpdate,
      tempStudentId
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {student ? 'Edit Student' : 'Add New Student'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange('first_name', e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          {/* Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University *</Label>
              <Select
                value={formData.university}
                onValueChange={(value) =>
                  handleInputChange('university', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {UNIVERSITIES.map((uni) => (
                    <SelectItem
                      key={uni}
                      value={uni}
                    >
                      {uni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Select
                value={formData.degree}
                onValueChange={(value) => handleInputChange('degree', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent>
                  {DEGREES.map((degree) => (
                    <SelectItem
                      key={degree}
                      value={degree}
                    >
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduation_year">Graduation Year *</Label>
            <Input
              id="graduation_year"
              type="number"
              min="2020"
              max="2030"
              value={formData.graduation_year}
              onChange={(e) =>
                handleInputChange('graduation_year', parseInt(e.target.value))
              }
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          {/* Availability Options */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Availability Options</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.availability_options?.map((availability) => (
                <Badge
                  key={availability}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {availability}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeAvailability(availability)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select
                value={newAvailability}
                onValueChange={setNewAvailability}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select availability options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addAvailability}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Select all availability types you&apos;re interested in
            </p>
          </div>

          {/* URLs */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Online Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) =>
                    handleInputChange('linkedin_url', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={(e) =>
                    handleInputChange('github_url', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) =>
                    handleInputChange('portfolio_url', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume_url">Resume URL</Label>
                <Input
                  id="resume_url"
                  type="url"
                  value={formData.resume_url}
                  onChange={(e) =>
                    handleInputChange('resume_url', e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Documents</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <DocumentUpload
                studentId={tempStudentId}
                documentType="cv"
                currentUrl={formData.cv_url}
                onUploadComplete={(url) => handleInputChange('cv_url', url)}
                onAnalysisComplete={() => {}} // No AI analysis in add form
              />
              <DocumentUpload
                studentId={tempStudentId}
                documentType="academic_records"
                currentUrl={formData.academic_records_url}
                onUploadComplete={(url) =>
                  handleInputChange('academic_records_url', url)
                }
                onAnalysisComplete={() => {}} // No AI analysis in add form
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills?.map((skill) => (
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

          {/* Interests */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Interests</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.interests?.map((interest) => (
                <Badge
                  key={interest}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {interest}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select
                value={newInterest}
                onValueChange={setNewInterest}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an interest" />
                </SelectTrigger>
                <SelectContent>
                  {INTERESTS_OPTIONS.map((interest) => (
                    <SelectItem
                      key={interest}
                      value={interest}
                    >
                      {interest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addInterest}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              placeholder="Tell us about yourself, your goals, and what you're looking for..."
            />
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
            : student
            ? 'Update Student'
            : 'Create Student'}
        </Button>
      </div>
    </form>
  )
}
