import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  Users,
  Building2,
  Briefcase,
  Target,
  Download,
  RefreshCw,
  CheckCircle,
} from 'lucide-react'
import { serverDataService } from '@/lib/supabase-server'

export default async function AnalyticsPage() {
  const [students, employers, jobs] = await Promise.all([
    serverDataService.getStudents(),
    serverDataService.getEmployers(),
    serverDataService.getJobPostings(),
  ])

  const approvedStudents = students.filter(
    (s) => s.status === 'approved'
  ).length
  const approvedEmployers = employers.filter(
    (e) => e.status === 'approved'
  ).length
  const publishedJobs = jobs.filter((j) => j.status === 'published').length

  const totalStudents = students.length
  const totalEmployers = employers.length
  const totalJobs = jobs.length

  // Calculate program health score based on real data
  const studentCompletionRate =
    totalStudents > 0 ? Math.round((approvedStudents / totalStudents) * 100) : 0
  const employerApprovalRate =
    totalEmployers > 0
      ? Math.round((approvedEmployers / totalEmployers) * 100)
      : 0
  const jobPublishRate =
    totalJobs > 0 ? Math.round((publishedJobs / totalJobs) * 100) : 0

  const overallHealth = Math.round(
    (studentCompletionRate + employerApprovalRate + jobPublishRate) / 3
  )

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-blue-950/20 p-8 border border-indigo-100/50 dark:border-indigo-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10" />
        <div className="relative flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg">
                <BarChart3 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Reports & Analytics
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Comprehensive insights into program performance and AI-powered
                  analytics
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 px-4 py-3 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Program Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Program Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {overallHealth}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Health</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle
                      className={`h-4 w-4 ${
                        studentCompletionRate >= 70
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      Student Completion
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      studentCompletionRate >= 70
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {studentCompletionRate}%
                  </span>
                </div>
                <Progress
                  value={studentCompletionRate}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle
                      className={`h-4 w-4 ${
                        employerApprovalRate >= 70
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      Employer Approval
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      employerApprovalRate >= 70
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {employerApprovalRate}%
                  </span>
                </div>
                <Progress
                  value={employerApprovalRate}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle
                      className={`h-4 w-4 ${
                        jobPublishRate >= 70
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    />
                    <span className="text-sm font-medium">Job Publishing</span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      jobPublishRate >= 70
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {jobPublishRate}%
                  </span>
                </div>
                <Progress
                  value={jobPublishRate}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {approvedStudents.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalStudents} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved Employers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {approvedEmployers.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalEmployers} total
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
                  Live Job Postings
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {publishedJobs.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalJobs} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs
        defaultValue="overview"
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
          <TabsTrigger value="ai">AI Performance</TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Program Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Students</span>
                    <span className="text-sm font-medium">{totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Employers</span>
                    <span className="text-sm font-medium">
                      {totalEmployers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Job Postings</span>
                    <span className="text-sm font-medium">{totalJobs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Students Approved</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-emerald-600 dark:bg-emerald-400 h-2 rounded-full"
                          style={{ width: `${studentCompletionRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {studentCompletionRate}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Employers Approved</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                          style={{ width: `${employerApprovalRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {employerApprovalRate}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Jobs Published</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full"
                          style={{ width: `${jobPublishRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {jobPublishRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="students"
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Approved</span>
                    <span className="text-sm font-medium">
                      {approvedStudents}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="text-sm font-medium">
                      {students.filter((s) => s.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rejected</span>
                    <span className="text-sm font-medium">
                      {students.filter((s) => s.status === 'rejected').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Draft</span>
                    <span className="text-sm font-medium">
                      {students.filter((s) => s.status === 'draft').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Validation Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students
                    .filter((s) => s.ai_validation_score)
                    .slice(0, 5)
                    .map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {student.first_name} {student.last_name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                              style={{
                                width: `${
                                  (student.ai_validation_score! / 10) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(
                              (student.ai_validation_score || 0) * 10
                            ) / 10}
                            /10
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="employers"
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employer Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Approved</span>
                    <span className="text-sm font-medium">
                      {approvedEmployers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="text-sm font-medium">
                      {employers.filter((e) => e.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rejected</span>
                    <span className="text-sm font-medium">
                      {employers.filter((e) => e.status === 'rejected').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Draft</span>
                    <span className="text-sm font-medium">
                      {employers.filter((e) => e.status === 'draft').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Size Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['startup', 'small', 'medium', 'large', 'enterprise'].map(
                    (size) => {
                      const count = employers.filter(
                        (e) => e.company_size === size
                      ).length
                      const percentage =
                        totalEmployers > 0
                          ? Math.round((count / totalEmployers) * 100)
                          : 0
                      return (
                        <div
                          key={size}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm capitalize">{size}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-emerald-600 dark:bg-emerald-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {count}
                            </span>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="ai"
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Processing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {students.filter((s) => s.ai_validation_score).length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Students Processed by AI
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {jobs.filter((j) => j.ai_enhancement_score).length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Jobs Enhanced by AI
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Validation Score</span>
                    <span className="text-sm font-medium">
                      {students.filter((s) => s.ai_validation_score).length > 0
                        ? (
                            students.reduce(
                              (sum, s) => sum + (s.ai_validation_score || 0),
                              0
                            ) /
                            students.filter((s) => s.ai_validation_score).length
                          ).toFixed(1)
                        : '0'}
                      /10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Enhancement Score</span>
                    <span className="text-sm font-medium">
                      {jobs.filter((j) => j.ai_enhancement_score).length > 0
                        ? (
                            jobs.reduce(
                              (sum, j) => sum + (j.ai_enhancement_score || 0),
                              0
                            ) /
                            jobs.filter((j) => j.ai_enhancement_score).length
                          ).toFixed(1)
                        : '0'}
                      /10
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
