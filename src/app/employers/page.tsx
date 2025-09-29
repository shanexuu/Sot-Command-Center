import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { serverDataService } from '@/lib/supabase-server'

export default async function EmployersPage() {
  const [approvedEmployers, pendingEmployers, rejectedEmployers, allEmployers] =
    await Promise.all([
      serverDataService.getEmployersByStatus('approved'),
      serverDataService.getEmployersByStatus('pending'),
      serverDataService.getEmployersByStatus('rejected'),
      serverDataService.getEmployers(100),
    ])

  const totalEmployers = allEmployers.length

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20 p-8 border border-emerald-100/50 dark:border-emerald-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
        <div className="relative flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Employers
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Manage employer profiles and track their engagement with the
                  program
                </p>
              </div>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
            asChild
          >
            <Link href="/employers/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Employer
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
                  Approved
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {approvedEmployers.length.toLocaleString()}
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
                  {pendingEmployers.length.toLocaleString()}
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
                  {rejectedEmployers.length.toLocaleString()}
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
                  Total
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalEmployers.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Employers</span>
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
          {allEmployers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No employers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allEmployers.slice(0, 10).map((employer) => (
                <div
                  key={employer.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                      <span className="text-sm font-medium text-accent-foreground">
                        {employer.company_name[0]}
                      </span>
                    </div>
                    <div>
                      <a
                        href={`/employers/${employer.id}`}
                        className="font-medium text-foreground hover:text-green-600 transition-colors"
                      >
                        {employer.company_name}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        {employer.contact_name} • {employer.industry}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        employer.status === 'approved'
                          ? 'default'
                          : employer.status === 'pending'
                          ? 'secondary'
                          : employer.status === 'rejected'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {employer.status}
                    </Badge>
                    <Badge variant="outline">{employer.company_size}</Badge>
                  </div>
                </div>
              ))}
              {allEmployers.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All Employers ({allEmployers.length})
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
