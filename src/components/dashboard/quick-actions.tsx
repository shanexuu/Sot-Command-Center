'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bot,
  Users,
  Building2,
  Briefcase,
  BarChart3,
  Zap,
  Target,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { clientDataService, DashboardMetrics } from '@/lib/data-services'

const getQuickActions = (metrics: DashboardMetrics | null) => [
  {
    title: 'AI Profile Validator',
    description: 'Review and approve student profiles',
    icon: Bot,
    href: '/ai/student-validator',
    color:
      'bg-purple-500 hover:bg-purple-600 dark:bg-purple-400 dark:hover:bg-purple-500',
    count: metrics ? `${metrics.pendingStudents} pending` : 'Loading...',
  },
  {
    title: 'Job Ad Enhancer',
    description: 'Improve job postings with AI',
    icon: Zap,
    href: '/ai/job-enhancer',
    color:
      'bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500',
    count: metrics ? `${metrics.pendingJobs} pending` : 'Loading...',
  },
  {
    title: 'Smart Matchmaking',
    description: 'Find perfect student-employer matches',
    icon: Target,
    href: '/ai/matchmaking',
    color:
      'bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500',
    count: metrics ? `${metrics.totalMatches} matches` : 'Loading...',
  },
]

const getRegularActions = (metrics: DashboardMetrics | null) => [
  {
    title: 'View Students',
    description: 'Browse and manage student profiles',
    icon: Users,
    href: '/students',
    count: metrics ? `${metrics.activeStudents} active` : 'Loading...',
  },
  {
    title: 'Manage Employers',
    description: 'Review employer applications',
    icon: Building2,
    href: '/employers',
    count: metrics ? `${metrics.approvedEmployers} approved` : 'Loading...',
  },
  {
    title: 'Job Postings',
    description: 'Oversee job posting pipeline',
    icon: Briefcase,
    href: '/jobs',
    count: metrics ? `${metrics.liveJobPostings} active` : 'Loading...',
  },
  {
    title: 'Analytics Dashboard',
    description: 'View detailed program metrics',
    icon: BarChart3,
    href: '/analytics',
    count: 'Live data',
  },
]

export function QuickActions() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await clientDataService.getDashboardMetrics()
        setMetrics(data)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    fetchMetrics()
  }, [])

  const quickActions = getQuickActions(metrics)
  const regularActions = getRegularActions(metrics)

  return (
    <div className="space-y-8">
      {/* AI Tools Section */}
      <Card className="border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">AI-Powered Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-6 justify-start text-left hover:bg-muted/50 transition-all duration-200 rounded-xl"
                asChild
              >
                <a href={action.href}>
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} text-white shadow-sm`}
                    >
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-base">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        {action.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 font-semibold">
                        {action.count}
                      </p>
                    </div>
                  </div>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regular Actions Section */}
      <Card className="border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold">Quick Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularActions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                className="h-auto p-4 justify-start text-left hover:!bg-muted/50 transition-all duration-200 rounded-xl"
                asChild
              >
                <a href={action.href}>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {action.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {action.count}
                      </p>
                    </div>
                  </div>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
