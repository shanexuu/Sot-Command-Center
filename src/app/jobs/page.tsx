import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { serverDataService } from '@/lib/supabase-server'

export default async function JobsPage() {
  const [publishedJobs, pendingJobs, rejectedJobs, allJobs] = await Promise.all(
    [
      serverDataService.getJobPostingsByStatus('published'),
      serverDataService.getJobPostingsByStatus('pending_review'),
      serverDataService.getJobPostingsByStatus('rejected'),
      serverDataService.getJobPostings(100),
    ]
  )

  const totalJobs = allJobs.length

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 p-8 border border-purple-100/50 dark:border-purple-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10" />
        <div className="relative flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                <Briefcase className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Job Postings
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Manage job postings and track their performance
                </p>
              </div>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
            asChild
          >
            <Link href="/jobs/add">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {publishedJobs.length.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {pendingJobs.length.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {rejectedJobs.length.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalJobs.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Job Postings</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No job postings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allJobs.slice(0, 10).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                      <Briefcase className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <a
                        href={`/jobs/${job.id}`}
                        className="font-medium text-foreground hover:text-purple-600 transition-colors"
                      >
                        {job.title}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        {job.location} • {job.employment_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                    {job.ai_enhancement_score && (
                      <Badge variant="outline">
                        AI Score: {job.ai_enhancement_score}/10
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {allJobs.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All Jobs ({allJobs.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
