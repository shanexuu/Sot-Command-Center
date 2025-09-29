import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for API operations (bypasses RLS)
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY environment variable is required'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function GET() {
  console.log('🔍 Server API - /api/students endpoint called')
  console.log('🔍 Server API - Request timestamp:', new Date().toISOString())

  try {
    // Create service role client to bypass RLS
    const supabase = createServiceRoleClient()
    console.log('🔍 Server API - Service role client created')

    // Fetch students with all data
    console.log('🔍 Server API - Fetching students from database...')
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    console.log('🔍 Server API - Database query completed')
    console.log('🔍 Server API - Error:', error)
    console.log('🔍 Server API - Data count:', data?.length || 0)

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    // Debug: Log the raw data from service role client
    console.log(
      '🔍 Server API - Raw student data:',
      data?.map((d) => ({
        id: d.id,
        name: `${d.first_name} ${d.last_name}`,
        cv_analysis_score: d.cv_analysis_score,
        academic_records_analysis_score: d.academic_records_analysis_score,
        ai_validation_score: d.ai_validation_score,
        updated_at: d.updated_at,
        documents_analyzed_at: d.documents_analyzed_at,
      }))
    )

    // Debug: Check specific student ID from API logs
    const yunXuStudent = data?.find(
      (d) => d.id === '138a9507-d487-44d3-a73b-7d94903269c6'
    )
    if (yunXuStudent) {
      console.log('🔍 Server API - Yun Xu student details:', {
        id: yunXuStudent.id,
        name: `${yunXuStudent.first_name} ${yunXuStudent.last_name}`,
        cv_analysis_score: yunXuStudent.cv_analysis_score,
        academic_records_analysis_score:
          yunXuStudent.academic_records_analysis_score,
        ai_validation_score: yunXuStudent.ai_validation_score,
        updated_at: yunXuStudent.updated_at,
        documents_analyzed_at: yunXuStudent.documents_analyzed_at,
      })
    } else {
      console.log(
        '🔍 Server API - Yun Xu student NOT FOUND with ID: 138a9507-d487-44d3-a73b-7d94903269c6'
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Students API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
