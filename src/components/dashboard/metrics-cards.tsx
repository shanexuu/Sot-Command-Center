'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { DashboardMetrics } from '@/lib/data-services'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
  progress?: number
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  subtitle,
  progress,
}: MetricCardProps) {
  const getChangeColor = () => {
    if (!change) return 'text-muted-foreground'
    return change > 0
      ? 'text-primary dark:text-primary'
      : 'text-destructive dark:text-destructive'
  }

  const getIconColors = () => {
    if (title.includes('Students')) return 'text-blue-600 dark:text-blue-400'
    if (title.includes('Employers'))
      return 'text-emerald-600 dark:text-emerald-400'
    if (title.includes('Jobs')) return 'text-purple-600 dark:text-purple-400'
    return 'text-muted-foreground'
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${getIconColors()}`} />
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground font-medium">
                {subtitle}
              </p>
            )}
            {change !== undefined && (
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className={`h-3 w-3 ${getChangeColor()}`} />
                <span className={`text-xs font-medium ${getChangeColor()}`}>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs last month
                </span>
              </div>
            )}
            {progress !== undefined && (
              <div className="mt-2">
                <Progress
                  value={progress}
                  className="h-2 bg-muted"
                />
                <span className="text-xs text-muted-foreground font-medium mt-1 block">
                  {progress}% complete
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Students"
        value={metrics.activeStudents.toLocaleString()}
        icon={Users}
        subtitle={`${metrics.pendingStudents} pending review`}
        progress={
          metrics.activeStudents > 0
            ? Math.round(
                (metrics.activeStudents /
                  (metrics.activeStudents + metrics.pendingStudents)) *
                  100
              )
            : 0
        }
      />
      <MetricCard
        title="Approved Employers"
        value={metrics.approvedEmployers.toLocaleString()}
        icon={Building2}
        subtitle={`${metrics.pendingEmployers} pending review`}
      />
      <MetricCard
        title="Live Job Postings"
        value={metrics.liveJobPostings.toLocaleString()}
        icon={Briefcase}
        subtitle={`${metrics.pendingJobs} pending review`}
      />
    </div>
  )
}

interface AlertsSectionProps {
  metrics: DashboardMetrics
}

export function AlertsSection({ metrics }: AlertsSectionProps) {
  // Generate alerts based on metrics
  const alerts = [
    ...(metrics.pendingStudents > 0
      ? [
          {
            id: 'pending-students',
            title: 'Student Profiles Pending Review',
            description: `${metrics.pendingStudents} student profiles need approval`,
            type: 'warning' as const,
            priority: 'high' as const,
            action: 'Review Now',
          },
        ]
      : []),
    ...(metrics.pendingEmployers > 0
      ? [
          {
            id: 'pending-employers',
            title: 'Employer Profiles Pending Review',
            description: `${metrics.pendingEmployers} employer profiles need approval`,
            type: 'warning' as const,
            priority: 'high' as const,
            action: 'Review Now',
          },
        ]
      : []),
    ...(metrics.pendingJobs > 0
      ? [
          {
            id: 'pending-jobs',
            title: 'Job Postings Pending Review',
            description: `${metrics.pendingJobs} job postings need approval`,
            type: 'info' as const,
            priority: 'medium' as const,
            action: 'Review Now',
          },
        ]
      : []),
    ...(metrics.totalMatches > 0
      ? [
          {
            id: 'new-matches',
            title: 'New AI Matches Available',
            description: `${metrics.totalMatches} student-employer matches generated`,
            type: 'success' as const,
            priority: 'low' as const,
            action: 'View Matches',
          },
        ]
      : []),
  ]

  const getAlertIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning':
        return AlertTriangle
      case 'info':
        return Clock
      case 'success':
        return CheckCircle
      default:
        return Clock
    }
  }

  if (alerts.length === 0) {
    return (
      <Card className="border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Alerts & Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground font-medium">
              All caught up! No pending tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3 text-foreground">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Alerts & Tasks</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type)
          return (
            <div
              key={alert.id}
              className="flex items-start space-x-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all duration-200"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  alert.type === 'warning'
                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
                    : alert.type === 'info'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">
                    {alert.title}
                  </h4>
                  <Badge
                    variant={
                      alert.priority === 'high' ? 'destructive' : 'secondary'
                    }
                    className="font-semibold"
                  >
                    {alert.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {alert.description}
                </p>
                <button className="text-sm text-primary hover:text-primary/80 font-semibold mt-2 transition-colors">
                  {alert.action} →
                </button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
