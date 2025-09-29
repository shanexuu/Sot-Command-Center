import Image from 'next/image'
import {
  MetricsCards,
  AlertsSection,
} from '@/components/dashboard/metrics-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { serverDataService } from '@/lib/supabase-server'

export default async function Dashboard() {
  // Fetch dashboard data from Supabase
  const metrics = await serverDataService.getDashboardMetrics()

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-8 border border-blue-100/50 dark:border-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10" />
        <div className="relative space-y-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden">
              <Image
                src="/logo.png"
                alt="SoT Command Center Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 text-base">
                Welcome to the Summer of Tech Command Center. Monitor program
                health and manage AI-powered tools.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        {/* Left Column - Alerts */}
        <div className="lg:col-span-1">
          <AlertsSection metrics={metrics} />
        </div>

        {/* Right Column - Activity & Actions */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <RecentActivity />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
