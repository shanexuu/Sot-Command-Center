'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { clientDataService, Student } from '@/lib/data-services'
import {
  StudentListSkeleton,
  MetricsCardsSkeleton,
  ProfileHeaderSkeleton,
  SearchFilterSkeleton,
} from '@/components/ui/skeleton-components'

export default function StudentsPage() {
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [universityFilter, setUniversityFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const data = await clientDataService.getStudents(100)
        setAllStudents(data)
        setFilteredStudents(data)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = allStudents

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (student) =>
          student.first_name.toLowerCase().includes(query) ||
          student.last_name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.university.toLowerCase().includes(query) ||
          student.degree.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((student) => student.status === statusFilter)
    }

    // University filter
    if (universityFilter !== 'all') {
      filtered = filtered.filter(
        (student) => student.university === universityFilter
      )
    }

    setFilteredStudents(filtered)
  }, [allStudents, searchQuery, statusFilter, universityFilter])

  // Calculate stats
  const approvedStudents = allStudents.filter((s) => s.status === 'approved')
  const pendingStudents = allStudents.filter((s) => s.status === 'pending')
  const rejectedStudents = allStudents.filter((s) => s.status === 'rejected')
  const totalStudents = allStudents.length

  // Get unique universities for filter
  const universities = Array.from(
    new Set(allStudents.map((s) => s.university))
  ).sort()

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setUniversityFilter('all')
  }

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <ProfileHeaderSkeleton />
        <MetricsCardsSkeleton />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            </div>
            <SearchFilterSkeleton />
          </CardHeader>
          <CardContent>
            <StudentListSkeleton count={8} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-8 border border-blue-100/50 dark:border-blue-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10" />
        <div className="relative flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 text-white shadow-lg">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Students
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Manage student profiles and track their progress through the
                  program
                </p>
              </div>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
            asChild
          >
            <Link href="/students/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
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
                  {approvedStudents.length.toLocaleString()}
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
                  {pendingStudents.length.toLocaleString()}
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
                  {rejectedStudents.length.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStudents.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Students ({filteredStudents.length})</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </CardTitle>

          {/* Search and Filter Controls */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students by name, email, university, or degree..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Status:</label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">University:</label>
                  <Select
                    value={universityFilter}
                    onValueChange={setUniversityFilter}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {universities.map((university) => (
                        <SelectItem
                          key={university}
                          value={university}
                        >
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {allStudents.length === 0
                  ? 'No students found'
                  : 'No students match your search criteria'}
              </p>
              {allStudents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                      <span className="text-sm font-medium text-accent-foreground">
                        {student.first_name[0]}
                        {student.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <Link
                        href={`/students/${student.id}`}
                        className="font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {student.first_name} {student.last_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {student.university} • {student.degree}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        student.status === 'approved'
                          ? 'default'
                          : student.status === 'pending'
                          ? 'secondary'
                          : student.status === 'rejected'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {student.status}
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Show more results indicator */}
              {filteredStudents.length >= 50 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredStudents.length} students
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
