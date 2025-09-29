import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { serverDataService } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

interface StudentDetailPageProps {
  params: {
    id: string
  }
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const student = await serverDataService
    .getStudents()
    .then((students) => students.find((s) => s.id === params.id))

  if (!student) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
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
        return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <User className="h-8 w-8 mr-3 text-blue-600 dark:text-blue-400" />
            {student.first_name} {student.last_name}
          </h1>
          <p className="text-muted-foreground mt-2">Student Profile Details</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`/students/${student.id}/edit`}>
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
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={student.profile_photo_url || ''} />
                  <AvatarFallback className="text-lg">
                    {student.first_name[0]}
                    {student.last_name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-muted-foreground">{student.email}</p>
                <Badge className={`mt-2 ${getStatusColor(student.status)}`}>
                  {getStatusIcon(student.status)}
                  <span className="ml-1 capitalize">{student.status}</span>
                </Badge>
              </div>

              {student.ai_validation_score && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    AI Validation Score
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(student.ai_validation_score * 10) / 10}/10
                  </p>
                </div>
              )}
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
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{student.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{student.university}</p>
                <p className="text-sm text-muted-foreground">
                  {student.degree}
                </p>
                <p className="text-sm text-muted-foreground">
                  Graduation: {student.graduation_year}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {student.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{student.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {student.skills && student.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill) => (
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

          {/* Interests */}
          {student.interests && student.interests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {student.interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="outline"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Online Presence */}
          <Card>
            <CardHeader>
              <CardTitle>Online Presence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.linkedin_url && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {student.github_url && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={student.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    GitHub Profile
                  </a>
                </div>
              )}
              {student.portfolio_url && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={student.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Portfolio Website
                  </a>
                </div>
              )}
              {student.resume_url && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={student.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Resume/CV
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Availability & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Availability</p>
                <Badge
                  variant="outline"
                  className="mt-1"
                >
                  {student.availability.replace('-', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {student.location}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Validation Notes */}
          {student.ai_validation_notes && (
            <Card>
              <CardHeader>
                <CardTitle>AI Validation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {student.ai_validation_notes}
                </p>
              </CardContent>
            </Card>
          )}

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
                  {new Date(student.created_at).toLocaleDateString('en-NZ', {
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
                  {new Date(student.updated_at).toLocaleDateString('en-NZ', {
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
                  {new Date(student.last_activity).toLocaleDateString('en-NZ', {
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
