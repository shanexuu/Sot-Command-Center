import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { serverDataService } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  Users,
} from 'lucide-react'
import Link from 'next/link'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, employers] = await Promise.all([
    serverDataService
      .getJobPostings()
      .then((jobs) => jobs.find((j) => j.id === params.id)),
    serverDataService.getEmployers(),
  ])

  if (!job) {
    notFound()
  }

  const employer = employers.find((e) => e.id === job.employer_id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'closed':
        return 'bg-muted text-muted-foreground'
      case 'draft':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4" />
      case 'pending_review':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Briefcase className="h-4 w-4" />
    }
  }

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Salary not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
    return 'Salary not specified'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Briefcase className="h-8 w-8 mr-3 text-purple-600" />
            {job.title}
          </h1>
          <p className="text-muted-foreground mt-2">Job Posting Details</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`/jobs/${job.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Job Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Job Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <Badge className={`mt-2 ${getStatusColor(job.status)}`}>
                  {getStatusIcon(job.status)}
                  <span className="ml-1">{job.status.replace('_', ' ')}</span>
                </Badge>
              </div>

              {job.ai_enhancement_score && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    AI Enhancement Score
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {job.ai_enhancement_score}/10
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{employer?.company_name}</p>
                <p className="text-sm text-muted-foreground">
                  Contact: {employer?.contact_name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{job.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {job.employment_type.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
              </div>
              {job.application_deadline && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(job.application_deadline).toLocaleDateString(
                      'en-NZ'
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2"
                    >
                      <span className="text-muted-foreground mt-1">•</span>
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Required Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Enhancement */}
          {(job.original_description ||
            job.enhanced_description ||
            job.ai_enhancement_notes) && (
            <Card>
              <CardHeader>
                <CardTitle>AI Enhancement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.original_description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Original Description
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {job.original_description}
                      </p>
                    </div>
                  </div>
                )}
                {job.enhanced_description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Enhanced Description
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">
                        {job.enhanced_description}
                      </p>
                    </div>
                  </div>
                )}
                {job.ai_enhancement_notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">AI Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.ai_enhancement_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-muted-foreground">Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString('en-NZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(job.updated_at).toLocaleDateString('en-NZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Activity</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(job.last_activity).toLocaleDateString('en-NZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
