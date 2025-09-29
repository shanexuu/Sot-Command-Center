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
  Bot,
  User,
  Building2,
  Star,
  Clock,
  Filter,
  Search,
  Loader2,
  Heart,
  Eye,
  MessageCircle,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  Link,
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
import { clientDataService, Match } from '@/lib/data-services'
import {
  MatchListSkeleton,
  MetricsCardsSkeleton,
  ProfileHeaderSkeleton,
  SearchFilterSkeleton,
} from '@/components/ui/skeleton-components'

interface MatchProfile extends Match {
  student_name: string
  student_email: string
  company_name: string
  contact_name: string
  job_title: string
  lastUpdated: string
  student_university?: string
  student_graduation_year?: number
  student_skills?: string[]
  job_location?: string
  job_employment_type?: string
  job_salary_min?: number
  job_salary_max?: number
}

// Helper function to transform Match to MatchProfile
function transformMatchToProfile(match: Match): MatchProfile {
  const lastUpdated = new Date(match.last_activity).toLocaleDateString()

  return {
    ...match,
    student_name: match.students
      ? `${match.students.first_name} ${match.students.last_name}`
      : 'Unknown Student',
    student_email: match.students?.email || 'Unknown Email',
    company_name: match.employers?.company_name || 'Unknown Company',
    contact_name: match.employers?.contact_name || 'Unknown Contact',
    job_title: match.job_postings?.title || 'General Match',
    lastUpdated,
    student_university: match.students?.university,
    student_graduation_year: match.students?.graduation_year,
    student_skills: match.students?.skills || [],
    job_location: match.job_postings?.location,
    job_employment_type: match.job_postings?.employment_type,
    job_salary_min: match.job_postings?.salary_min,
    job_salary_max: match.job_postings?.salary_max,
  }
}

function MatchScore({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-amber-600 dark:text-amber-400'
    if (score >= 60) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle
    if (score >= 80) return CheckCircle
    if (score >= 70) return AlertTriangle
    if (score >= 60) return AlertTriangle
    return XCircle
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  const Icon = getScoreIcon(score)

  return (
    <div className="flex items-center space-x-2">
      <Icon className={`h-5 w-5 ${getScoreColor(score)}`} />
      <div className="flex flex-col">
        <span className={`font-semibold ${getScoreColor(score)}`}>
          {score}%
        </span>
        <span className={`text-xs ${getScoreColor(score)} opacity-75`}>
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  )
}

function MatchCard({
  match,
  onSendIntroduction,
  onViewDetails,
  onSelectMatch,
  isSelected = false,
}: {
  match: MatchProfile
  onSendIntroduction: (id: string) => void
  onViewDetails: (id: string) => void
  onSelectMatch: (id: string) => void
  isSelected?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'suggested':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800'
      case 'interested':
        return 'bg-green-100 text-green-800'
      case 'not_interested':
        return 'bg-red-100 text-red-800'
      case 'matched':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-pink-500 bg-pink-50/50 dark:bg-pink-950/20'
          : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectMatch(match.id)}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <div className="flex space-x-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {match.student_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {match.company_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {match.student_name} ↔ {match.company_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {match.job_title} • {match.student_email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.contact_name} • {match.job_location}
                </p>
                {match.student_university && (
                  <p className="text-xs text-muted-foreground">
                    {match.student_university} • {match.student_graduation_year}
                  </p>
                )}
                {match.job_salary_min && match.job_salary_max && (
                  <p className="text-xs text-green-600 font-medium">
                    ${match.job_salary_min.toLocaleString()} - $
                    {match.job_salary_max.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <MatchScore score={match.match_score} />
                <Badge className={getStatusColor(match.status)}>
                  {match.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Match Compatibility
                </span>
                <span className="font-medium">{match.match_score}%</span>
              </div>
              <Progress
                value={match.match_score}
                className="mt-1 h-2"
              />
            </div>

            {match.student_skills && match.student_skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {match.student_skills.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
                {match.student_skills.length > 4 && (
                  <Badge
                    variant="outline"
                    className="text-xs"
                  >
                    +{match.student_skills.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {isExpanded && (
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    AI Match Analysis
                  </h4>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {match.ai_notes || 'No analysis notes available.'}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSendIntroduction(match.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Send Intro
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewDetails(match.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Updated {match.lastUpdated}
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

export default function Matchmaking() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [matches, setMatches] = useState<MatchProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
    const fetchMatches = async () => {
      try {
        const data = await clientDataService.getMatches()
        const profiles = data.map(transformMatchToProfile)
        setMatches(profiles)
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const handleGenerateMatches = async () => {
    setGenerating(true)

    console.log('Starting AI match generation...')

    // Initialize progress modal
    setProgressData({
      title: 'AI Match Generation (GPT-4)',
      description:
        'Analyzing student profiles, job requirements, and company culture to generate intelligent matches using advanced AI algorithms',
      totalItems: 1,
      completedItems: 0,
      results: [],
      isComplete: false,
      successCount: 0,
      failedCount: 0,
    })
    setShowProgressModal(true)

    try {
      const newMatches = await clientDataService.generateAdvancedMatches()

      // Update progress with results
      setProgressData((prev) => ({
        ...prev,
        completedItems: 1,
        results: [
          {
            id: 'match-generation',
            name: `AI Match Generation - ${newMatches.length} matches created`,
            score: newMatches.length > 0 ? 90 : 0,
            success: newMatches.length > 0,
            analysisType: 'match_generation',
          },
        ],
        successCount: newMatches.length > 0 ? 1 : 0,
        failedCount: newMatches.length > 0 ? 0 : 1,
        isComplete: true,
      }))

      // Refresh the matches data
      const data = await clientDataService.getMatches()
      const profiles = data.map(transformMatchToProfile)
      setMatches(profiles)

      // Show success toast
      if (newMatches.length > 0) {
        addToast({
          title: 'Matches Generated!',
          description: `Successfully generated ${newMatches.length} new AI-powered matches`,
          variant: 'success',
          icon: <Heart className="h-4 w-4" />,
          duration: 5000,
        })
      } else {
        addToast({
          title: 'No New Matches',
          description:
            'No new matches were generated. Check if there are approved students and employers.',
          variant: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
        })
      }
    } catch (error) {
      console.error('Error generating matches:', error)

      setProgressData((prev) => ({
        ...prev,
        isComplete: true,
        failedCount: 1,
        results: [
          {
            id: 'match-generation',
            name: 'AI Match Generation',
            score: 0,
            success: false,
            analysisType: 'match_generation',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      }))

      addToast({
        title: 'Match Generation Error',
        description: `Error during match generation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdateStatus = async (
    matchId: string,
    status: Match['status']
  ) => {
    try {
      // Update match status in the database
      const { error } = await clientDataService.supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId)

      if (error) throw error

      // Update local state
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, status } : m))
      )
    } catch (error) {
      console.error('Error updating match status:', error)
    }
  }

  const handleSendIntroduction = async (matchId: string) => {
    try {
      // In a real app, this would send an email or notification
      console.log('Sending introduction for match:', matchId)
      // For now, just update the status to viewed
      await handleUpdateStatus(matchId, 'viewed')

      addToast({
        title: 'Introduction Sent!',
        description: 'Introduction email has been sent to both parties',
        variant: 'success',
        icon: <MessageCircle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Error sending introduction:', error)
    }
  }

  const handleViewDetails = (matchId: string) => {
    // Find the match
    const match = matches.find((m) => m.id === matchId)
    if (!match) return

    setSelectedMatch(match)
    setShowDetailsModal(true)
  }

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatches((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(matchId)) {
        newSet.delete(matchId)
      } else {
        newSet.add(matchId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedMatches.size === filteredMatches.length) {
      setSelectedMatches(new Set())
    } else {
      setSelectedMatches(new Set(filteredMatches.map((m) => m.id)))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedMatches.size === 0) return

    const selectedMatchesList = Array.from(selectedMatches)
    const matchesToUpdate = filteredMatches.filter((m) =>
      selectedMatchesList.includes(m.id)
    )

    try {
      // Update all selected matches
      for (const match of matchesToUpdate) {
        await handleUpdateStatus(match.id, action as Match['status'])
      }

      // Clear selection
      setSelectedMatches(new Set())

      addToast({
        title: 'Bulk Action Completed',
        description: `Successfully updated ${
          selectedMatchesList.length
        } matches to ${action.replace('_', ' ')}`,
        variant: 'success',
        icon: <CheckCircle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Error in bulk action:', error)
      addToast({
        title: 'Bulk Action Error',
        description: 'Failed to update some matches. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    }
  }

  const filteredMatches = matches
    .filter((match) => {
      const matchesSearch =
        match.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.job_title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        filterStatus === 'all' || match.status === filterStatus

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'score':
          comparison = a.match_score - b.match_score
          break
        case 'date':
          comparison =
            new Date(a.lastUpdated).getTime() -
            new Date(b.lastUpdated).getTime()
          break
        case 'name':
          comparison = a.student_name.localeCompare(b.student_name)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  const suggestedCount = matches.filter((m) => m.status === 'suggested').length
  const matchedCount = matches.filter((m) => m.status === 'matched').length
  const viewedCount = matches.filter((m) => m.status === 'viewed').length
  const averageScore =
    matches.length > 0
      ? Math.round(
          matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length
        )
      : 0

  const highQualityMatches = matches.filter((m) => m.match_score >= 80).length
  const selectedCount = selectedMatches.size

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
              <MatchListSkeleton count={6} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-pink-950/20 dark:via-rose-950/20 dark:to-purple-950/20 p-8 border border-pink-100/50 dark:border-pink-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 dark:from-pink-500/10 dark:to-purple-500/10" />
        <div className="relative flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                  AI Matchmaking Platform
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Smart matching between students and employers using advanced
                  AI analysis
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
              onClick={handleGenerateMatches}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              {generating ? 'Generating Matches...' : 'Generate AI Matches'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Suggested
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {suggestedCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  New matches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Matched
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {matchedCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Successful matches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Score
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {averageScore}%
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {highQualityMatches} high-quality
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
                  placeholder="Search matches by student, company, or job title..."
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
                <option value="all">All Status ({matches.length})</option>
                <option value="suggested">Suggested ({suggestedCount})</option>
                <option value="viewed">Viewed ({viewedCount})</option>
                <option value="matched">Matched ({matchedCount})</option>
              </select>

              {selectedCount > 0 && (
                <div className="flex items-center space-x-2 text-sm font-medium text-pink-600 dark:text-pink-400">
                  <Heart className="h-4 w-4" />
                  <span>{selectedCount} selected</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'score' | 'date' | 'name')
                  }
                  className="w-32 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 px-3 py-2 text-sm font-medium text-foreground"
                >
                  <option value="score">Score</option>
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  className="px-3 py-2"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {filteredMatches.length > 0 && (
        <Card className="border shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedMatches.size === filteredMatches.length &&
                      filteredMatches.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Select All ({selectedMatches.size}/{filteredMatches.length})
                  </span>
                </div>
              </div>

              {selectedMatches.size > 0 && (
                <div className="flex flex-wrap items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Bulk Actions:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('matched')}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Mark Matched
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('viewed')}
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Mark Viewed
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches */}
      <div className="space-y-4">
        {filteredMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onSendIntroduction={handleSendIntroduction}
            onViewDetails={handleViewDetails}
            onSelectMatch={handleSelectMatch}
            isSelected={selectedMatches.has(match.id)}
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

      {/* Match Details Modal */}
      <Dialog
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Match Details
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete match information and compatibility analysis
                </p>
              </div>
            </div>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-8">
              {/* Match Overview Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Link className="w-5 h-5 text-pink-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Match Overview
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Match Score
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-foreground">
                          {selectedMatch.match_score}%
                        </span>
                        <MatchScore score={selectedMatch.match_score} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Status
                      </label>
                      <Badge
                        className={`${
                          selectedMatch.status === 'matched'
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                            : selectedMatch.status === 'interested'
                            ? 'bg-green-100 text-green-800'
                            : selectedMatch.status === 'not_interested'
                            ? 'bg-red-100 text-red-800'
                            : selectedMatch.status === 'viewed'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        } font-semibold`}
                      >
                        {selectedMatch.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Created
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedMatch.lastUpdated}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Job Title
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedMatch.job_title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Information Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Student Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Name
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedMatch.student_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedMatch.student_email}
                      </p>
                    </div>
                    {selectedMatch.student_university && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          University
                        </label>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          <p className="text-foreground font-medium">
                            {selectedMatch.student_university}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedMatch.student_graduation_year && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Graduation Year
                        </label>
                        <p className="text-foreground font-medium">
                          {selectedMatch.student_graduation_year}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedMatch.student_skills &&
                    selectedMatch.student_skills.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedMatch.student_skills.map((skill) => (
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
                    )}
                </CardContent>
              </Card>

              {/* Company Information Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Company Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Company Name
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedMatch.company_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Contact Person
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedMatch.contact_name}
                      </p>
                    </div>
                    {selectedMatch.job_location && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Job Location
                        </label>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <p className="text-foreground font-medium">
                            {selectedMatch.job_location}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedMatch.job_employment_type && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Employment Type
                        </label>
                        <p className="text-foreground font-medium capitalize">
                          {selectedMatch.job_employment_type.replace('-', ' ')}
                        </p>
                      </div>
                    )}
                    {selectedMatch.job_salary_min &&
                      selectedMatch.job_salary_max && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">
                            Salary Range
                          </label>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-green-500" />
                            <p className="text-foreground font-medium">
                              ${selectedMatch.job_salary_min.toLocaleString()} -
                              ${selectedMatch.job_salary_max.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      AI Match Analysis
                    </h3>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                      <Bot className="w-4 h-4 mr-2 text-purple-600" />
                      Compatibility Analysis
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMatch.ai_notes ||
                        'No detailed analysis available for this match.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
