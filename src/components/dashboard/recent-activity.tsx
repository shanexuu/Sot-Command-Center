'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UserPlus,
  Building2,
  Briefcase,
  CheckCircle,
  Clock,
  Bot,
  Target,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { clientDataService, ActivityItem } from '@/lib/data-services'

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'student':
      return UserPlus
    case 'employer':
      return Building2
    case 'job':
      return Briefcase
    case 'ai':
      return Bot
    default:
      return Clock
  }
}

const getStatusColor = (status?: ActivityItem['status']) => {
  switch (status) {
    case 'completed':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'pending':
      return 'text-amber-600 dark:text-amber-400'
    case 'in_progress':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-muted-foreground'
  }
}

const getStatusIcon = (status?: ActivityItem['status']) => {
  switch (status) {
    case 'completed':
      return CheckCircle
    case 'pending':
      return Clock
    case 'in_progress':
      return Target
    default:
      return Clock
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await clientDataService.getRecentActivity()
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) {
    return (
      <Card className="border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-start space-x-4 p-3 rounded-xl border bg-muted/50"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-24 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mx-auto mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground font-medium">
              No recent activity
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
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const StatusIcon = getStatusIcon(activity.status)

            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">
                      {activity.action}
                    </p>
                    <span className="text-xs text-muted-foreground font-medium">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {activity.user}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {activity.details}
                    </p>
                  )}
                  {activity.status && (
                    <div className="flex items-center space-x-1 mt-2">
                      <StatusIcon
                        className={`h-3 w-3 ${getStatusColor(activity.status)}`}
                      />
                      <span
                        className={`text-xs font-semibold ${getStatusColor(
                          activity.status
                        )}`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
