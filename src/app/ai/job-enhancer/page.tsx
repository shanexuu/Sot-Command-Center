'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  FileText,
  Star,
  Clock,
  Filter,
  Search,
  Loader2,
  Eye,
  Bot,
  DollarSign,
  MapPin,
  Calendar,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toaster'
import { ProgressModal } from '@/components/ui/progress-modal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { clientDataService, JobPosting } from '@/lib/data-services'
import {
  JobListSkeleton,
  MetricsCardsSkeleton,
  ProfileHeaderSkeleton,
  SearchFilterSkeleton,
} from '@/components/ui/skeleton-components'

interface JobProfile extends JobPosting {
  company_name: string
  contact_name: string
  aiScore: number
  aiNotes: string[]
  lastUpdated: string
  completeness: number
  industry?: string
  company_size?: string
}

// Helper function to transform JobPosting to JobProfile
function transformJobToProfile(job: JobPosting): JobProfile {
  const aiScore = job.ai_enhancement_score || 0
  const aiNotes = job.ai_enhancement_notes
    ? job.ai_enhancement_notes.split('; ')
    : []

  // Calculate completeness with debug info
  let completeness = 0
  const completenessBreakdown = {
    description: 0,
    skills: 0,
    requirements: 0,
    salary: 0,
    deadline: 0,
    location: 0,
    employmentType: 0,
  }

  if (job.description && job.description.length > 200) {
    completeness += 20
    completenessBreakdown.description = 20
  }

  if (job.skills_required && job.skills_required.length >= 3) {
    completeness += 20
    completenessBreakdown.skills = 20
  }

  if (job.requirements && job.requirements.length >= 2) {
    completeness += 15
    completenessBreakdown.requirements = 15
  }

  if (job.salary_min && job.salary_max) {
    completeness += 15
    completenessBreakdown.salary = 15
  }

  if (job.application_deadline) {
    completeness += 10
    completenessBreakdown.deadline = 10
  }

  if (job.location) {
    completeness += 10
    completenessBreakdown.location = 10
  }

  if (job.employment_type) {
    completeness += 10
    completenessBreakdown.employmentType = 10
  }

  // Debug logging
  console.log('Job Completeness Debug:', {
    jobId: job.id,
    title: job.title,
    completeness,
    breakdown: completenessBreakdown,
    details: {
      descriptionLength: job.description?.length || 0,
      skillsCount: job.skills_required?.length || 0,
      requirementsCount: job.requirements?.length || 0,
      hasSalaryMin: !!job.salary_min,
      hasSalaryMax: !!job.salary_max,
      hasDeadline: !!job.application_deadline,
      hasLocation: !!job.location,
      hasEmploymentType: !!job.employment_type,
    },
  })

  const lastUpdated = new Date(job.last_activity).toLocaleDateString()

  return {
    ...job,
    company_name: job.employers?.company_name || 'Unknown Company',
    contact_name: job.employers?.contact_name || 'Unknown Contact',
    aiScore,
    aiNotes,
    lastUpdated,
    completeness,
  }
}

function EnhancementScore({ score }: { score: number }) {
  // Convert score from 0-10 scale to display format
  const displayScore = Math.round(score * 10) / 10 // Round to 1 decimal place

  const getScoreColor = (score: number) => {
    if (score > 6) return 'text-emerald-600 dark:text-emerald-400' // Green for scores over 6
    if (score === 6) return 'text-amber-600 dark:text-amber-400' // Yellow for score exactly 6
    return 'text-red-600 dark:text-red-400' // Red for scores below 6
  }

  const getScoreIcon = (score: number) => {
    if (score > 6) return CheckCircle // Green checkmark for scores over 6
    if (score === 6) return AlertTriangle // Yellow warning for score exactly 6
    return XCircle // Red X for scores below 6
  }

  const Icon = getScoreIcon(score)

  return (
    <div className="flex items-center space-x-2">
      <Icon className={`h-5 w-5 ${getScoreColor(score)}`} />
      <span className={`font-semibold ${getScoreColor(score)}`}>
        {displayScore}/10
      </span>
    </div>
  )
}

function JobCard({
  job,
  onEnhance,
  onApprove,
  onReject,
  onViewDetails,
  isEnhancing,
}: {
  job: JobProfile
  onEnhance: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onViewDetails: (id: string) => void
  isEnhancing: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEnhanced, setShowEnhanced] = useState(false)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {job.company_name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {job.company_name} • {job.location}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.employment_type} • {job.contact_name}
                </p>
                {job.salary_min && job.salary_max && (
                  <p className="text-xs text-green-600 font-medium">
                    ${job.salary_min.toLocaleString()} - $
                    {job.salary_max.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <EnhancementScore score={job.aiScore} />
                <Badge
                  variant={job.status === 'published' ? 'default' : 'secondary'}
                >
                  {job.status}
                </Badge>
                {/* Bulk Approval Eligibility Indicator */}
                {job.status === 'pending_review' && (
                  <Badge
                    variant={
                      job.aiScore > 6 && job.completeness >= 70
                        ? 'default'
                        : 'outline'
                    }
                    className={
                      job.aiScore > 6 && job.completeness >= 70
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }
                  >
                    {job.aiScore > 6 && job.completeness >= 70
                      ? '✓ Bulk Eligible'
                      : '⚠ Needs Work'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Job Quality Score</span>
                <span className="font-medium">
                  {Math.round(job.aiScore * 10) / 10}/10
                </span>
              </div>
              <Progress
                value={job.aiScore * 10}
                className="mt-1 h-2"
              />
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Job Completeness</span>
                <span className="font-medium">{job.completeness}%</span>
              </div>
              <Progress
                value={job.completeness}
                className="mt-1 h-2"
              />
              {job.completeness < 100 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Missing:{' '}
                  {[
                    !job.description || job.description.length <= 200
                      ? 'Description (20)'
                      : null,
                    !job.skills_required || job.skills_required.length < 3
                      ? 'Skills (20)'
                      : null,
                    !job.requirements || job.requirements.length < 2
                      ? 'Requirements (15)'
                      : null,
                    !job.salary_min || !job.salary_max
                      ? 'Salary Range (15)'
                      : null,
                    !job.application_deadline ? 'Deadline (10)' : null,
                    !job.location ? 'Location (10)' : null,
                    !job.employment_type ? 'Employment Type (10)' : null,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills_required.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  +{job.skills_required.length - 4} more
                </Badge>
              )}
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    AI Enhancement Analysis
                  </h4>
                  <ul className="space-y-1">
                    {job.aiNotes.map((note, index) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground flex items-start"
                      >
                        <span className="mr-2 text-primary">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">
                      Job Description
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowEnhanced(!showEnhanced)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {showEnhanced ? 'Show Original' : 'Show Enhanced'}
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {showEnhanced && job.enhanced_description
                        ? job.enhanced_description
                        : job.description}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {job.ai_enhancement_score === undefined && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEnhance(job.id)}
                      disabled={isEnhancing}
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Bot className="h-4 w-4 mr-1" />
                      )}
                      Enhance
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onApprove(job.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(job.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewDetails(job.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Updated {job.lastUpdated}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function JobEnhancer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [jobs, setJobs] = useState<JobProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [enhancing, setEnhancing] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobProfile | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressData, setProgressData] = useState({
    title: '',
    description: '',
    totalItems: 0,
    completedItems: 0,
    results: [] as Array<{
      id: string
      name: string
      score: number
      success: boolean
      analysisType: string
      error?: string
    }>,
    isComplete: false,
    successCount: 0,
    failedCount: 0,
  })

  const { addToast } = useToast()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await clientDataService.getJobPostings()
        const profiles = data.map(transformJobToProfile)
        setJobs(profiles)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleEnhanceJob = async (jobId: string) => {
    setEnhancing(jobId)

    // Show progress modal for individual enhancement
    setProgressData({
      title: 'AI Job Enhancement',
      description: 'Enhancing job posting using advanced AI',
      totalItems: 1,
      completedItems: 0,
      results: [],
      isComplete: false,
      successCount: 0,
      failedCount: 0,
    })
    setShowProgressModal(true)

    try {
      // Simulate progress updates
      setProgressData((prev) => ({ ...prev, completedItems: 0.3 }))
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgressData((prev) => ({ ...prev, completedItems: 0.6 }))
      await clientDataService.enhanceJobPosting(jobId)

      setProgressData((prev) => ({ ...prev, completedItems: 0.9 }))
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Refresh the job data
      const data = await clientDataService.getJobPostings()
      const profiles = data.map(transformJobToProfile)
      setJobs(profiles)

      // Complete progress
      setProgressData((prev) => ({
        ...prev,
        completedItems: 1,
        isComplete: true,
        successCount: 1,
        results: [
          {
            id: jobId,
            name: profiles.find((j) => j.id === jobId)?.title || 'Job',
            score: profiles.find((j) => j.id === jobId)?.aiScore || 0,
            success: true,
            analysisType: 'Individual Enhancement',
          },
        ],
      }))

      addToast({
        title: 'Enhancement Complete!',
        description: 'Job posting successfully enhanced with AI',
        variant: 'success',
        icon: <CheckCircle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Error enhancing job:', error)
      setProgressData((prev) => ({
        ...prev,
        completedItems: 1,
        isComplete: true,
        failedCount: 1,
        results: [
          {
            id: jobId,
            name: 'Job',
            score: 0,
            success: false,
            analysisType: 'Individual Enhancement',
          },
        ],
      }))

      addToast({
        title: 'Enhancement Failed',
        description: 'Failed to enhance job posting. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setEnhancing(null)
    }
  }

  const handleBulkEnhance = async () => {
    setEnhancing('bulk')

    const pendingJobs = jobs.filter((j) => j.status === 'pending_review')

    console.log(
      `Found ${pendingJobs.length} pending jobs to enhance:`,
      pendingJobs.map((j) => j.title)
    )

    if (pendingJobs.length === 0) {
      addToast({
        title: 'No Pending Jobs',
        description:
          'All jobs are already enhanced or published. No enhancement needed.',
        variant: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
      })
      return
    }

    // Initialize progress modal
    setProgressData({
      title: 'AI Job Enhancement',
      description: `Enhancing ${pendingJobs.length} job postings using advanced AI`,
      totalItems: pendingJobs.length,
      completedItems: 0,
      results: [],
      isComplete: false,
      successCount: 0,
      failedCount: 0,
    })
    setShowProgressModal(true)

    let progressInterval: NodeJS.Timeout | undefined

    try {
      // Simulate incremental progress for bulk enhancement
      let completedCount = 0
      progressInterval = setInterval(() => {
        completedCount += 0.1
        // Round to avoid floating point precision issues
        completedCount = Math.round(completedCount * 10) / 10
        if (completedCount < 0.9) {
          setProgressData((prev) => ({
            ...prev,
            completedItems: Math.min(
              Math.round(completedCount * pendingJobs.length),
              Math.round(pendingJobs.length * 0.9)
            ),
          }))
        }
      }, 200)

      // Use the bulk enhancement API
      const jobIds = pendingJobs.map((job) => job.id)
      const results = await clientDataService.bulkEnhanceJobs(jobIds)

      if (progressInterval) {
        clearInterval(progressInterval)
      }

      console.log('Bulk enhancement results:', results)

      // Update progress with final results
      const finalResults = results.results.map((result) => {
        const job = pendingJobs.find((j) => j.id === result.id)
        return {
          id: result.id,
          name: job?.title || 'Unknown Job',
          score: result.score,
          success: result.success,
          analysisType: 'Job Enhancement',
        }
      })

      setProgressData((prev) => ({
        ...prev,
        completedItems: pendingJobs.length,
        results: finalResults,
        successCount: results.success,
        failedCount: results.failed,
        isComplete: true,
      }))

      // Refresh the jobs data
      const data = await clientDataService.getJobPostings()
      const profiles = data.map(transformJobToProfile)
      setJobs(profiles)

      // Show success toast
      if (results.success > 0) {
        addToast({
          title: 'Enhancement Complete!',
          description: `Successfully enhanced ${results.success} job postings with AI`,
          variant: 'success',
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 5000,
        })
      } else {
        addToast({
          title: 'Enhancement Failed',
          description:
            'No jobs were successfully enhanced. Check the progress modal for details.',
          variant: 'destructive',
          icon: <XCircle className="h-4 w-4" />,
        })
      }
    } catch (error) {
      console.error('Error in bulk enhancement:', error)

      // Clear interval if it exists
      if (progressInterval) {
        clearInterval(progressInterval)
      }

      setProgressData((prev) => ({
        ...prev,
        isComplete: true,
        failedCount: pendingJobs.length,
      }))

      addToast({
        title: 'Enhancement Error',
        description: `Error during enhancement: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setEnhancing(null)
    }
  }

  const handleBulkApprove = async () => {
    // Find jobs eligible for bulk approval
    const eligibleJobs = jobs.filter((job) => {
      // Must be pending status
      if (job.status !== 'pending_review') return false

      // Must have AI enhancement score
      if (!job.aiScore || job.aiScore === 0) return false

      // Must have high enough score (over 6 out of 10)
      if (job.aiScore <= 6) return false

      // Must have good completeness (70% or higher)
      if (job.completeness < 70) return false

      return true
    })

    if (eligibleJobs.length === 0) {
      addToast({
        title: 'No Eligible Jobs',
        description: 'No jobs found with AI scores over 6 for bulk approval.',
        variant: 'destructive',
        icon: <AlertTriangle className="h-4 w-4" />,
      })
      return
    }

    try {
      setEnhancing('bulk-approve')

      // Show progress modal with email notification step
      setProgressData({
        title: 'Bulk Approval',
        description: `Approving ${eligibleJobs.length} jobs`,
        totalItems: eligibleJobs.length,
        completedItems: 0,
        results: [],
        isComplete: false,
        successCount: 0,
        failedCount: 0,
      })
      setShowProgressModal(true)

      let successCount = 0
      let failedCount = 0
      const results: Array<{
        id: string
        name: string
        score: number
        success: boolean
        analysisType: string
        error?: string
      }> = []

      // Approve each job
      for (let i = 0; i < eligibleJobs.length; i++) {
        const job = eligibleJobs[i]

        try {
          setProgressData((prev) => ({
            ...prev,
            completedItems: i + 0.5,
            description: `Approving ${job.title}...`,
          }))

          await clientDataService.updateJobPostingStatus(job.id, 'published')

          setProgressData((prev) => ({
            ...prev,
            completedItems: i + 1,
            description: `Approved ${job.title}`,
          }))

          results.push({
            id: job.id,
            name: job.title,
            score: job.aiScore,
            success: true,
            analysisType: 'Job Approval',
          })

          successCount++
        } catch (error) {
          console.error(`Error approving ${job.title}:`, error)
          results.push({
            id: job.id,
            name: job.title,
            score: job.aiScore,
            success: false,
            analysisType: 'Job Approval',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          failedCount++
        }
      }

      // Update local state
      setJobs((prev) =>
        prev.map((j) => {
          const eligibleJob = eligibleJobs.find((ej) => ej.id === j.id)
          return eligibleJob ? { ...j, status: 'published' as const } : j
        })
      )

      // Complete progress
      setProgressData((prev) => ({
        ...prev,
        completedItems: eligibleJobs.length,
        results,
        successCount: results.filter((r) => r.success).length,
        failedCount: results.filter((r) => !r.success).length,
        isComplete: true,
        description: `Completed: ${
          results.filter((r) => r.success).length
        } successful operations`,
      }))

      // Show final success toast
      if (successCount > 0) {
        addToast({
          title: 'Bulk Approval Complete!',
          description: `Successfully approved ${successCount} jobs`,
          variant: 'success',
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 5000,
        })
      }

      if (failedCount > 0) {
        addToast({
          title: 'Some Operations Failed',
          description: `${failedCount} operations failed. Check the progress modal for details.`,
          variant: 'destructive',
          icon: <XCircle className="h-4 w-4" />,
        })
      }
    } catch (error) {
      console.error('Error during bulk approval:', error)
      addToast({
        title: 'Bulk Approval Failed',
        description:
          'An error occurred during bulk approval. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setEnhancing(null)
    }
  }

  const handleApproveJob = async (jobId: string) => {
    try {
      await clientDataService.updateJobPostingStatus(jobId, 'published')
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'published' } : j))
      )
    } catch (error) {
      console.error('Error approving job:', error)
    }
  }

  const handleRejectJob = async (jobId: string) => {
    try {
      await clientDataService.updateJobPostingStatus(jobId, 'rejected')
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'rejected' } : j))
      )
    } catch (error) {
      console.error('Error rejecting job:', error)
    }
  }

  const handleViewDetails = (jobId: string) => {
    // Find the job
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return

    setSelectedJob(job)
    setShowDetailsModal(true)
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills_required.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesFilter = filterStatus === 'all' || job.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const pendingCount = jobs.filter((j) => j.status === 'pending_review').length
  const publishedCount = jobs.filter((j) => j.status === 'published').length

  // Count jobs eligible for bulk approval
  const bulkApproveEligibleCount = jobs.filter((job) => {
    // Must be pending status
    if (job.status !== 'pending_review') return false

    // Must have AI enhancement score
    if (!job.aiScore || job.aiScore === 0) return false

    // Must have high enough score (over 6 out of 10)
    if (job.aiScore <= 6) return false

    // Must have good completeness (70% or higher)
    if (job.completeness < 70) return false

    return true
  }).length
  const averageScore =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + j.aiScore, 0) / jobs.length)
      : 0
  const averageCompleteness =
    jobs.length > 0
      ? Math.round(
          jobs.reduce((sum, j) => sum + j.completeness, 0) / jobs.length
        )
      : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <ProfileHeaderSkeleton />
        <MetricsCardsSkeleton />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              </div>
              <SearchFilterSkeleton />
              <JobListSkeleton count={6} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-8 border border-blue-100/50 dark:border-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10" />
        <div className="relative flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Job Enhancer
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Automatically enhance job postings for clarity, inclusivity,
                  and attractiveness using advanced AI
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
              onClick={handleBulkEnhance}
              disabled={pendingCount === 0 || enhancing === 'bulk'}
            >
              {enhancing === 'bulk' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              {enhancing === 'bulk'
                ? 'Running AI Enhancement...'
                : 'Run AI Enhancement'}
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
              onClick={handleBulkApprove}
              disabled={
                bulkApproveEligibleCount === 0 || enhancing === 'bulk-approve'
              }
            >
              {enhancing === 'bulk-approve' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {enhancing === 'bulk-approve'
                ? 'Approving Jobs...'
                : `Bulk Approve (${bulkApproveEligibleCount})`}
            </Button>
          </div>
        </div>

        {/* Bulk Approval Requirements Info */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Bulk Approval Requirements
              </h4>
              <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                <p>
                  Jobs must meet ALL of these criteria to be eligible for bulk
                  approval:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Status:</strong> Must be &quot;Pending Review&quot;
                  </li>
                  <li>
                    <strong>AI Score:</strong> Must be over 6.0/10 (currently:{' '}
                    {
                      jobs
                        .filter((j) => j.status === 'pending_review')
                        .map((j) => j.aiScore)
                        .filter((score) => score > 6).length
                    }{' '}
                    jobs qualify)
                  </li>
                  <li>
                    <strong>Completeness:</strong> Must be 70% or higher
                    (currently:{' '}
                    {
                      jobs
                        .filter((j) => j.status === 'pending_review')
                        .map((j) => j.completeness)
                        .filter((comp) => comp >= 70).length
                    }{' '}
                    jobs qualify)
                  </li>
                </ul>
                <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                  💡 <strong>Tip:</strong> Use the &quot;Run AI
                  Enhancement&quot; button to improve AI scores, or edit
                  individual jobs to increase completeness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {pendingCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Awaiting enhancement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {publishedCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Live job postings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Quality Score
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {averageScore}%
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  AI enhancement rating
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Completeness
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {averageCompleteness}%
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Job detail completeness
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search jobs by title, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4" />
                <span>Filter:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-48 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 px-4 py-3 text-sm font-medium text-foreground"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Postings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onEnhance={handleEnhanceJob}
            onApprove={handleApproveJob}
            onReject={handleRejectJob}
            onViewDetails={handleViewDetails}
            isEnhancing={enhancing === job.id}
          />
        ))}
      </div>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title={progressData.title}
        description={progressData.description}
        totalItems={progressData.totalItems}
        completedItems={progressData.completedItems}
        results={progressData.results}
        isComplete={progressData.isComplete}
        successCount={progressData.successCount}
        failedCount={progressData.failedCount}
      />

      {/* Job Details Modal */}
      <Dialog
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Job Details
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete job posting information and analysis
                </p>
              </div>
            </div>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-8">
              {/* Basic Information Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Job Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Job Title
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedJob.title}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Company
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedJob.company_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Location
                      </label>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <p className="text-foreground font-medium">
                          {selectedJob.location}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Employment Type
                      </label>
                      <p className="text-foreground font-medium capitalize">
                        {selectedJob.employment_type.replace('-', ' ')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Salary Range
                      </label>
                      {selectedJob.salary_min && selectedJob.salary_max ? (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <p className="text-foreground font-medium">
                            ${selectedJob.salary_min.toLocaleString()} - $
                            {selectedJob.salary_max.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">
                          Not specified
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Application Deadline
                      </label>
                      {selectedJob.application_deadline ? (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="text-foreground font-medium">
                            {new Date(
                              selectedJob.application_deadline
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No deadline set
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Status
                      </label>
                      <Badge
                        variant={
                          selectedJob.status === 'published'
                            ? 'default'
                            : selectedJob.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="font-semibold"
                      >
                        {selectedJob.status.charAt(0).toUpperCase() +
                          selectedJob.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Contact Person
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedJob.contact_name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills and Requirements Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Skills & Requirements
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedJob.skills_required.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="font-medium px-4 py-2 bg-background border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {selectedJob.requirements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Requirements
                        </h4>
                        <ul className="space-y-2">
                          {selectedJob.requirements.map(
                            (requirement, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start"
                              >
                                <span className="mr-2 text-blue-500">•</span>
                                {requirement}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Job Description Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Job Description
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Original Description
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedJob.description}
                      </p>
                    </div>

                    {selectedJob.enhanced_description && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                          <Bot className="w-4 h-4 mr-2 text-blue-600" />
                          AI Enhanced Description
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedJob.enhanced_description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Enhancement Analysis Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      AI Enhancement Analysis
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">
                          AI Enhancement Score
                        </label>
                        <span className="text-lg font-bold text-foreground">
                          {Math.round(selectedJob.aiScore * 10) / 10}/10
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Progress
                          value={selectedJob.aiScore * 10}
                          className="h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">
                          Job Completeness
                        </label>
                        <span className="text-lg font-bold text-foreground">
                          {selectedJob.completeness}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Progress
                          value={selectedJob.completeness}
                          className="h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Incomplete</span>
                          <span>Complete</span>
                        </div>
                      </div>

                      {/* Completeness Breakdown */}
                      <div className="mt-4 space-y-2">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Completeness Breakdown
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div
                            className={`flex items-center justify-between p-2 rounded ${
                              selectedJob.description &&
                              selectedJob.description.length > 200
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span>
                              Description (
                              {selectedJob.description?.length || 0} chars)
                            </span>
                            <span className="font-semibold">
                              {selectedJob.description &&
                              selectedJob.description.length > 200
                                ? '20'
                                : '0'}
                              /20
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between p-2 rounded ${
                              selectedJob.skills_required &&
                              selectedJob.skills_required.length >= 3
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span>
                              Skills ({selectedJob.skills_required?.length || 0}
                              )
                            </span>
                            <span className="font-semibold">
                              {selectedJob.skills_required &&
                              selectedJob.skills_required.length >= 3
                                ? '20'
                                : '0'}
                              /20
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between p-2 rounded ${
                              selectedJob.requirements &&
                              selectedJob.requirements.length >= 2
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span>
                              Requirements (
                              {selectedJob.requirements?.length || 0})
                            </span>
                            <span className="font-semibold">
                              {selectedJob.requirements &&
                              selectedJob.requirements.length >= 2
                                ? '15'
                                : '0'}
                              /15
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between p-2 rounded ${
                              selectedJob.salary_min && selectedJob.salary_max
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span>Salary Range</span>
                            <span className="font-semibold">
                              {selectedJob.salary_min && selectedJob.salary_max
                                ? '15'
                                : '0'}
                              /15
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between p-2 rounded ${
                              selectedJob.application_deadline
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span>Deadline</span>
                            <span className="font-semibold">
                              {selectedJob.application_deadline ? '10' : '0'}/10
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between p-2 rounded ${
                              selectedJob.location
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span>Location</span>
                            <span className="font-semibold">
                              {selectedJob.location ? '10' : '0'}/10
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between p-2 rounded ${
                              selectedJob.employment_type
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span>Employment Type</span>
                            <span className="font-semibold">
                              {selectedJob.employment_type ? '10' : '0'}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedJob.aiNotes.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                        <Bot className="w-4 h-4 mr-2 text-purple-600" />
                        AI Analysis Notes
                      </h4>
                      <div className="space-y-3">
                        {selectedJob.aiNotes.map((note, index) => (
                          <div
                            key={index}
                            className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                          >
                            <div className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <p className="text-sm text-muted-foreground">
                                {note}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
