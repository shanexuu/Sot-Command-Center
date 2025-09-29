'use client'

import { useState, useEffect } from 'react'
import { createClientClient } from '@/lib/supabase-client'

interface SidebarData {
  students: {
    pending: number
    approved: number
    total: number
  }
  employers: {
    pending: number
    approved: number
    total: number
  }
  jobs: {
    pending: number
    published: number
    total: number
  }
}

export function useSidebarData() {
  const [data, setData] = useState<SidebarData>({
    students: { pending: 0, approved: 0, total: 0 },
    employers: { pending: 0, approved: 0, total: 0 },
    jobs: { pending: 0, published: 0, total: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClientClient()

        // Fetch all data in parallel
        const [studentsResult, employersResult, jobsResult] = await Promise.all(
          [
            supabase.from('students').select('status'),
            supabase.from('employers').select('status'),
            supabase.from('job_postings').select('status'),
          ]
        )

        // Process students data
        const students = studentsResult.data || []
        const studentsData = {
          pending: students.filter((s) => s.status === 'pending').length,
          approved: students.filter((s) => s.status === 'approved').length,
          total: students.length,
        }

        // Process employers data
        const employers = employersResult.data || []
        const employersData = {
          pending: employers.filter((e) => e.status === 'pending').length,
          approved: employers.filter((e) => e.status === 'approved').length,
          total: employers.length,
        }

        // Process jobs data
        const jobs = jobsResult.data || []
        const jobsData = {
          pending: jobs.filter((j) => j.status === 'pending_review').length,
          published: jobs.filter((j) => j.status === 'published').length,
          total: jobs.length,
        }

        setData({
          students: studentsData,
          employers: employersData,
          jobs: jobsData,
        })
      } catch (err) {
        console.error('Error fetching sidebar data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')

        // Check if it's a Supabase configuration error
        const errorMessage = err instanceof Error ? err.message : ''
        if (
          errorMessage.includes('Invalid API key') ||
          errorMessage.includes('fetch')
        ) {
          console.log('Supabase not configured, using default sidebar data')
        }

        // Set default data on error
        setData({
          students: { pending: 0, approved: 0, total: 0 },
          employers: { pending: 0, approved: 0, total: 0 },
          jobs: { pending: 0, published: 0, total: 0 },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
