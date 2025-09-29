import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { serverDataService } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Briefcase,
} from 'lucide-react'
import Link from 'next/link'

interface EmployerDetailPageProps {
  params: {
    id: string
  }
}

export default async function EmployerDetailPage({
  params,
}: EmployerDetailPageProps) {
  const employer = await serverDataService
    .getEmployers()
    .then((employers) => employers.find((e) => e.id === params.id))

  if (!employer) {
    notFound()
  }

  // Get job postings for this employer
  const jobPostings = await serverDataService
    .getJobPostings()
    .then((jobs) => jobs.filter((job) => job.employer_id === params.id))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const getCompanySizeLabel = (size: string) => {
    const labels = {
      startup: 'Startup (1-10 employees)',
      small: 'Small (11-50 employees)',
      medium: 'Medium (51-200 employees)',
      large: 'Large (201-1000 employees)',
      enterprise: 'Enterprise (1000+ employees)',
    }
    return labels[size as keyof typeof labels] || size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Building2 className="h-8 w-8 mr-3 text-green-600" />
            {employer.company_name}
          </h1>
          <p className="text-muted-foreground mt-2">Employer Profile Details</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`/employers/${employer.id}/edit`}>
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
        {/* Left Column - Company Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Company Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={employer.logo_url || ''} />
                  <AvatarFallback className="text-lg">
                    {employer.company_name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {employer.company_name}
                </h3>
                <p className="text-muted-foreground">{employer.industry}</p>
                <Badge className={`mt-2 ${getStatusColor(employer.status)}`}>
                  {getStatusIcon(employer.status)}
                  <span className="ml-1 capitalize">{employer.status}</span>
                </Badge>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Company Size</p>
                <p className="text-sm font-medium">
                  {getCompanySizeLabel(employer.company_size)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">{employer.contact_name}</p>
                <p className="text-sm text-muted-foreground">
                  {employer.contact_title}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employer.contact_email}</span>
              </div>
              {employer.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employer.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employer.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Industry</p>
                <p className="text-sm text-muted-foreground">
                  {employer.industry}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Company Size</p>
                <p className="text-sm text-muted-foreground">
                  {getCompanySizeLabel(employer.company_size)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {employer.location}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Description */}
          {employer.description && (
            <Card>
              <CardHeader>
                <CardTitle>About {employer.company_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {employer.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Website */}
          {employer.website && (
            <Card>
              <CardHeader>
                <CardTitle>Website</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {employer.website}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Postings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Job Postings ({jobPostings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobPostings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No job postings yet
                </p>
              ) : (
                <div className="space-y-3">
                  {jobPostings.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.location} •{' '}
                          {job.employment_type.replace('-', ' ')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          job.status === 'published'
                            ? 'default'
                            : job.status === 'pending_review'
                            ? 'secondary'
                            : job.status === 'rejected'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  {jobPostings.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      And {jobPostings.length - 5} more job postings...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

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
                  <p className="text-2xl font-bold text-green-600">
                    {jobPostings.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Job Postings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      jobPostings.filter((job) => job.status === 'published')
                        .length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Published Jobs
                  </p>
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
                  {new Date(employer.created_at).toLocaleDateString('en-NZ', {
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
                  {new Date(employer.updated_at).toLocaleDateString('en-NZ', {
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
                  {new Date(employer.last_activity).toLocaleDateString(
                    'en-NZ',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
