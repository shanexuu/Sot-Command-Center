import { createClientClient } from './supabase-client'

// Types based on your database schema
export interface Student {
  id: string
  created_at: string
  updated_at: string
  email: string
  first_name: string
  last_name: string
  university: string
  degree: string
  graduation_year: number
  phone?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_url?: string
  profile_photo_url?: string
  cv_url?: string
  academic_records_url?: string
  skills: string[]
  interests: string[]
  availability: 'full-time' | 'part-time' | 'internship' | 'contract'
  availability_options?: (
    | 'full-time'
    | 'part-time'
    | 'internship'
    | 'contract'
  )[]
  location: string
  bio?: string
  status: 'pending' | 'approved' | 'rejected' | 'draft'
  ai_validation_score?: number
  ai_validation_notes?: string
  cv_analysis_score?: number
  cv_analysis_notes?: string
  academic_records_analysis_score?: number
  academic_records_analysis_notes?: string
  documents_uploaded_at?: string
  documents_analyzed_at?: string
  last_activity: string
}

export interface Employer {
  id: string
  created_at: string
  updated_at: string
  company_name: string
  contact_email: string
  contact_name: string
  contact_title: string
  phone?: string
  website?: string
  industry: string
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  location: string
  description?: string
  logo_url?: string
  status: 'pending' | 'approved' | 'rejected' | 'draft'
  last_activity: string
}

export interface JobPosting {
  id: string
  created_at: string
  updated_at: string
  employer_id: string
  title: string
  description: string
  requirements: string[]
  skills_required: string[]
  location: string
  employment_type: 'full-time' | 'part-time' | 'internship' | 'contract'
  salary_min?: number
  salary_max?: number
  application_deadline?: string
  status:
    | 'draft'
    | 'pending_review'
    | 'approved'
    | 'rejected'
    | 'published'
    | 'closed'
  ai_enhancement_score?: number
  ai_enhancement_notes?: string
  original_description?: string
  enhanced_description?: string
  last_activity: string
  employers?: {
    company_name: string
    contact_name: string
  }
}

export interface Match {
  id: string
  created_at: string
  student_id: string
  employer_id: string
  job_posting_id?: string
  match_score: number
  status: 'suggested' | 'viewed' | 'interested' | 'not_interested' | 'matched'
  ai_notes?: string
  last_activity: string
  students?: {
    first_name: string
    last_name: string
    email: string
    university?: string
    graduation_year?: number
    skills?: string[]
  }
  employers?: {
    company_name: string
    contact_name: string
  }
  job_postings?: {
    title: string
    location?: string
    employment_type?: string
    salary_min?: number
    salary_max?: number
  }
}

export interface ActivityItem {
  id: string
  type: 'student' | 'employer' | 'job' | 'event' | 'ai'
  action: string
  user: string
  timestamp: string
  details?: string
  status?: 'completed' | 'pending' | 'in_progress'
}

export interface DashboardMetrics {
  activeStudents: number
  approvedEmployers: number
  liveJobPostings: number
  pendingStudents: number
  pendingEmployers: number
  pendingJobs: number
  totalMatches: number
  recentActivity: {
    first_name: string
    last_name: string
    created_at: string
    status: string
  }[]
}

// Utility function to generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Client-side data service
export class ClientDataService {
  private _supabase = createClientClient()

  // Expose supabase for direct access when needed
  get supabase() {
    return this._supabase
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const [
        studentsResult,
        employersResult,
        jobsResult,
        matchesResult,
        recentActivityResult,
      ] = await Promise.all([
        this._supabase.from('students').select('status, created_at'),
        this._supabase.from('employers').select('status, created_at'),
        this._supabase.from('job_postings').select('status, created_at'),
        this._supabase.from('matches').select('id, created_at'),
        this._supabase
          .from('students')
          .select('first_name, last_name, created_at, status')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const students = studentsResult.data || []
      const employers = employersResult.data || []
      const jobs = jobsResult.data || []
      const matches = matchesResult.data || []
      const recentActivity = recentActivityResult.data || []

      return {
        activeStudents: students.filter((s) => s.status === 'approved').length,
        approvedEmployers: employers.filter((e) => e.status === 'approved')
          .length,
        liveJobPostings: jobs.filter((j) => j.status === 'published').length,
        pendingStudents: students.filter((s) => s.status === 'pending').length,
        pendingEmployers: employers.filter((e) => e.status === 'pending')
          .length,
        pendingJobs: jobs.filter((j) => j.status === 'pending_review').length,
        totalMatches: matches.length,
        recentActivity,
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      return {
        activeStudents: 0,
        approvedEmployers: 0,
        liveJobPostings: 0,
        pendingStudents: 0,
        pendingEmployers: 0,
        pendingJobs: 0,
        totalMatches: 0,
        recentActivity: [],
      }
    }
  }

  // Students
  async getStudents(limit = 50): Promise<Student[]> {
    try {
      const { data, error } = await this._supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching students:', error)
      return []
    }
  }

  async getStudentsByStatus(status: Student['status']): Promise<Student[]> {
    try {
      const { data, error } = await this._supabase
        .from('students')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching students by status:', error)
      return []
    }
  }

  async updateStudentStatus(
    id: string,
    status: Student['status']
  ): Promise<boolean> {
    try {
      const { error } = await this._supabase
        .from('students')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating student status:', error)
      return false
    }
  }

  async updateJobPostingStatus(
    id: string,
    status: JobPosting['status']
  ): Promise<boolean> {
    try {
      const { error } = await this._supabase
        .from('job_postings')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating job posting status:', error)
      return false
    }
  }

  async bulkUpdateStudentStatus(
    ids: string[],
    status: Student['status']
  ): Promise<boolean> {
    try {
      const { error } = await this._supabase
        .from('students')
        .update({ status })
        .in('id', ids)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error bulk updating student status:', error)
      return false
    }
  }

  // Employers
  async getEmployers(limit = 50): Promise<Employer[]> {
    try {
      const { data, error } = await this._supabase
        .from('employers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching employers:', error)
      return []
    }
  }

  async getEmployersByStatus(status: Employer['status']): Promise<Employer[]> {
    try {
      const { data, error } = await this._supabase
        .from('employers')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching employers by status:', error)
      return []
    }
  }

  // Job Postings
  async getJobPostings(limit = 50): Promise<JobPosting[]> {
    try {
      const { data, error } = await this._supabase
        .from('job_postings')
        .select(
          `
          *,
          employers (
            company_name,
            contact_name
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching job postings:', error)
      return []
    }
  }

  async getJobPostingsByStatus(
    status: JobPosting['status']
  ): Promise<JobPosting[]> {
    try {
      const { data, error } = await this._supabase
        .from('job_postings')
        .select(
          `
          *,
          employers (
            company_name,
            contact_name
          )
        `
        )
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching job postings by status:', error)
      return []
    }
  }

  // Matches
  async getMatches(limit = 50): Promise<Match[]> {
    try {
      const { data, error } = await this._supabase
        .from('matches')
        .select(
          `
          *,
          students (
            first_name,
            last_name,
            email
          ),
          employers (
            company_name,
            contact_name
          ),
          job_postings (
            title
          )
        `
        )
        .order('match_score', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching matches:', error)
      return []
    }
  }

  async getMatchesByStatus(status: Match['status']): Promise<Match[]> {
    try {
      const { data, error } = await this._supabase
        .from('matches')
        .select(
          `
          *,
          students (
            first_name,
            last_name,
            email
          ),
          employers (
            company_name,
            contact_name
          ),
          job_postings (
            title
          )
        `
        )
        .eq('status', status)
        .order('match_score', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching matches by status:', error)
      return []
    }
  }

  // AI Student Validator with OpenAI Integration
  async validateStudentProfile(studentId: string): Promise<{
    score: number
    notes: string
    suggestions: string[]
  }> {
    try {
      const { data: student, error } = await this._supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (error) throw error

      // Try OpenAI analysis first, fallback to rule-based if not available
      try {
        const openaiResult = await this.performOpenAIAnalysis(student)
        if (openaiResult) {
          // Update student with AI validation
          await this._supabase
            .from('students')
            .update({
              ai_validation_score: openaiResult.score,
              ai_validation_notes: openaiResult.notes,
            })
            .eq('id', studentId)

          // Log AI interaction
          await this._logAIInteraction(
            'student_validator',
            studentId,
            'student',
            {
              student_id: studentId,
              validation_score: openaiResult.score,
              suggestions_count: openaiResult.suggestions.length,
              analysis_type: 'openai',
            }
          )

          return openaiResult
        }
      } catch (openaiError) {
        console.warn(
          'OpenAI analysis failed, falling back to rule-based:',
          openaiError
        )
      }

      // Fallback to enhanced rule-based validation
      let score = 0
      const suggestions: string[] = []
      const notes: string[] = []

      // Check completeness (40% of score)
      const completenessChecks = [
        {
          check: student.bio && student.bio.length > 50,
          points: 2,
          suggestion: 'Add a more detailed bio (at least 50 characters)',
        },
        {
          check: student.skills && student.skills.length >= 3,
          points: 2,
          suggestion: 'Add at least 3 skills to your profile',
        },
        {
          check: student.interests && student.interests.length >= 2,
          points: 1,
          suggestion: 'Add at least 2 interests to your profile',
        },
        {
          check: student.linkedin_url,
          points: 1,
          suggestion: 'Add your LinkedIn profile',
        },
        {
          check: student.github_url,
          points: 1,
          suggestion: 'Add your GitHub profile',
        },
        {
          check: student.portfolio_url,
          points: 1,
          suggestion: 'Add your portfolio website',
        },
        {
          check: student.resume_url,
          points: 1,
          suggestion: 'Upload your resume',
        },
        {
          check: student.profile_photo_url,
          points: 1,
          suggestion: 'Add a profile photo',
        },
      ]

      completenessChecks.forEach(({ check, points, suggestion }) => {
        if (check) {
          score += points
        } else {
          suggestions.push(suggestion)
        }
      })

      // Check quality (30% of score)
      if (student.bio && student.bio.length > 100) {
        score += 1
        notes.push('Excellent bio length')
      }
      if (student.skills && student.skills.length >= 5) {
        score += 1
        notes.push('Comprehensive skill set')
      }
      if (
        student.bio &&
        this.containsKeywords(student.bio, [
          'passion',
          'excited',
          'motivated',
          'dedicated',
        ])
      ) {
        score += 1
        notes.push('Bio shows enthusiasm')
      }

      // Check professional quality (20% of score)
      if (student.linkedin_url && this.isValidUrl(student.linkedin_url)) {
        score += 1
        notes.push('Professional LinkedIn profile')
      }
      if (student.github_url && this.isValidUrl(student.github_url)) {
        score += 1
        notes.push('Active GitHub profile')
      }
      if (student.portfolio_url && this.isValidUrl(student.portfolio_url)) {
        score += 1
        notes.push('Portfolio website available')
      }

      // Check academic relevance (10% of score)
      const currentYear = new Date().getFullYear()
      if (
        student.graduation_year >= currentYear &&
        student.graduation_year <= currentYear + 2
      ) {
        score += 1
        notes.push('Relevant graduation timeline')
      }

      const finalScore = Math.min(score, 10)
      const finalNotes =
        notes.length > 0 ? notes.join('; ') : 'Profile validation completed'

      // Update student with AI validation
      await this._supabase
        .from('students')
        .update({
          ai_validation_score: finalScore,
          ai_validation_notes: finalNotes,
        })
        .eq('id', studentId)

      // Log AI interaction
      await this._logAIInteraction('student_validator', studentId, 'student', {
        student_id: studentId,
        validation_score: finalScore,
        suggestions_count: suggestions.length,
        analysis_type: 'rule_based',
      })

      return {
        score: finalScore,
        notes: finalNotes,
        suggestions,
      }
    } catch (error) {
      console.error('Error validating student profile:', error)
      return {
        score: 0,
        notes: 'Error during validation',
        suggestions: ['Please try again later'],
      }
    }
  }

  // AI Job Enhancer
  async enhanceJobPosting(jobId: string): Promise<{
    score: number
    notes: string
    enhancedDescription: string
    suggestions: string[]
  }> {
    try {
      const { data: job, error } = await this._supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) throw error

      // AI-powered job scoring and enhancement
      const aiAnalysis = await this.generateAIScoreAndAnalysis(job)
      const score = aiAnalysis.score
      const suggestions = aiAnalysis.suggestions
      const notes = aiAnalysis.notes

      // Generate enhanced description using AI
      const enhancedDescription = await this.generateAIEnhancedDescription(
        job.description,
        suggestions,
        job.skills_required || [],
        job.employment_type
      )

      const finalScore = Math.min(score, 10)
      const finalNotes =
        notes.length > 0
          ? notes.join('; ')
          : 'Job posting enhancement completed'

      // Update job posting with AI enhancement
      await this._supabase
        .from('job_postings')
        .update({
          ai_enhancement_score: finalScore,
          ai_enhancement_notes: finalNotes,
          enhanced_description: enhancedDescription,
        })
        .eq('id', jobId)

      // Log AI interaction
      await this._logAIInteraction('job_enhancer', jobId, 'organizer', {
        job_id: jobId,
        enhancement_score: finalScore,
        suggestions_count: suggestions.length,
        original_length: job.description.length,
        enhanced_length: enhancedDescription.length,
      })

      return {
        score: finalScore,
        notes: finalNotes,
        enhancedDescription,
        suggestions,
      }
    } catch (error) {
      console.error('Error enhancing job posting:', error)
      return {
        score: 0,
        notes: 'Error during enhancement',
        enhancedDescription: '',
        suggestions: ['Please try again later'],
      }
    }
  }

  // AI-powered job scoring and analysis using OpenAI
  private async generateAIScoreAndAnalysis(job: JobPosting): Promise<{
    score: number
    notes: string[]
    suggestions: string[]
  }> {
    try {
      // Check if OpenAI API key is available
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!openaiApiKey) {
        console.log('OpenAI API key not found, using rule-based scoring')
        return this.generateRuleBasedScoreAndAnalysis(job)
      }

      // Create the prompt for AI scoring
      const prompt = `Analyze this job posting and provide a comprehensive score from 0-10 along with detailed feedback:

Job Posting Details:
- Title: ${job.title}
- Description: ${job.description}
- Required Skills: ${(job.skills_required || []).join(', ')}
- Requirements: ${(job.requirements || []).join(', ')}
- Location: ${job.location}
- Employment Type: ${job.employment_type}
- Salary Range: ${job.salary_min ? `$${job.salary_min}` : 'Not specified'} - ${
        job.salary_max ? `$${job.salary_max}` : 'Not specified'
      }
- Application Deadline: ${job.application_deadline || 'Not specified'}

Please evaluate this job posting based on these criteria:
1. Job Description Quality (clarity, detail, engagement)
2. Skills and Requirements Specification (completeness, relevance)
3. Compensation Transparency (salary information)
4. Inclusivity and Bias-free Language
5. Application Process Clarity
6. Overall Professionalism and Appeal

Respond with a JSON object in this exact format:
{
  "score": <number from 0-10>,
  "notes": ["<positive feedback item 1>", "<positive feedback item 2>"],
  "suggestions": ["<improvement suggestion 1>", "<improvement suggestion 2>"]
}

Be specific and constructive in your feedback. Focus on actionable improvements.`

      // Make API call to OpenAI
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert HR professional and job posting specialist. Analyze job postings and provide detailed scoring and feedback. Always respond with valid JSON.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 1500,
            temperature: 0.3,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No analysis received from OpenAI')
      }

      // Parse the AI response
      const analysis = JSON.parse(content)

      return {
        score: Math.max(0, Math.min(10, analysis.score || 0)),
        notes: analysis.notes || ['AI analysis completed'],
        suggestions: analysis.suggestions || [
          'Consider improving job description',
        ],
      }
    } catch (error) {
      console.error('AI scoring failed, falling back to rule-based:', error)
      return this.generateRuleBasedScoreAndAnalysis(job)
    }
  }

  // Fallback rule-based scoring (simplified version)
  private generateRuleBasedScoreAndAnalysis(job: JobPosting): {
    score: number
    notes: string[]
    suggestions: string[]
  } {
    let score = 0
    const notes: string[] = []
    const suggestions: string[] = []

    // Basic rule-based scoring as fallback
    if (job.description && job.description.length > 200) {
      score += 2
      notes.push('Comprehensive job description')
    } else {
      suggestions.push('Expand job description (at least 200 characters)')
    }

    if (job.skills_required && job.skills_required.length >= 3) {
      score += 2
      notes.push('Clear skill requirements')
    } else {
      suggestions.push('Specify at least 3 required skills')
    }

    if (job.salary_min && job.salary_max) {
      score += 2
      notes.push('Transparent salary range')
    } else {
      suggestions.push('Add salary range information')
    }

    if (job.application_deadline) {
      score += 1
      notes.push('Clear application deadline')
    } else {
      suggestions.push('Set an application deadline')
    }

    // Check for inclusive language
    const inclusiveWords = [
      'diverse',
      'inclusive',
      'welcoming',
      'collaborative',
    ]
    const hasInclusiveLanguage = inclusiveWords.some((word) =>
      job.description.toLowerCase().includes(word)
    )

    if (hasInclusiveLanguage) {
      score += 1
      notes.push('Inclusive language detected')
    } else {
      suggestions.push('Use more inclusive language')
    }

    // Check for bias
    const biasWords = ['rockstar', 'ninja', 'guru', 'young']
    const hasBiasWords = biasWords.some((word) =>
      job.description.toLowerCase().includes(word)
    )

    if (!hasBiasWords) {
      score += 1
      notes.push('No bias indicators detected')
    } else {
      suggestions.push('Remove potentially biased language')
    }

    return {
      score: Math.min(score, 10),
      notes: notes.length > 0 ? notes : ['Rule-based analysis completed'],
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ['Consider general improvements'],
    }
  }

  // AI-powered description enhancement using OpenAI
  private async generateAIEnhancedDescription(
    originalDescription: string,
    suggestions: string[],
    skillsRequired: string[],
    employmentType: string
  ): Promise<string> {
    try {
      // Check if OpenAI API key is available
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!openaiApiKey) {
        console.log('OpenAI API key not found, using rule-based enhancement')
        return this.generateRuleBasedEnhancedDescription(
          originalDescription,
          suggestions
        )
      }

      // Create the prompt for OpenAI
      const prompt = `Enhance this job posting description to make it more attractive, inclusive, and comprehensive:

Original Job Description:
${originalDescription}

Current Suggestions for Improvement:
${suggestions.join('\n- ')}

Required Skills: ${skillsRequired.join(', ')}
Employment Type: ${employmentType}

Please enhance the job description by:
1. Making it more engaging and attractive to candidates
2. Using inclusive and welcoming language
3. Adding missing sections (company culture, benefits, application process) if needed
4. Improving clarity and structure
5. Making it more comprehensive while keeping it concise
6. Ensuring it appeals to diverse candidates

Return ONLY the enhanced job description text, no additional formatting or explanations.`

      // Make API call to OpenAI
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert HR professional and job posting specialist. Enhance job descriptions to be more attractive, inclusive, and comprehensive while maintaining professionalism and clarity.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const enhancedDescription = data.choices[0]?.message?.content

      if (!enhancedDescription) {
        throw new Error('No enhanced description received from OpenAI')
      }

      console.log('OpenAI enhanced description generated successfully')
      return enhancedDescription.trim()
    } catch (error) {
      console.error(
        'OpenAI enhancement failed, falling back to rule-based:',
        error
      )
      return this.generateRuleBasedEnhancedDescription(
        originalDescription,
        suggestions
      )
    }
  }

  // Fallback rule-based enhancement
  private generateRuleBasedEnhancedDescription(
    originalDescription: string,
    suggestions: string[]
  ): string {
    let enhanced = originalDescription

    // Add inclusive language if missing
    if (
      suggestions.includes('Use more inclusive language in the description')
    ) {
      enhanced +=
        '\n\nWe are committed to building a diverse and inclusive team. We welcome applications from candidates of all backgrounds, experiences, and perspectives.'
    }

    // Expand description if too short
    if (
      suggestions.includes('Expand job description (at least 200 characters)')
    ) {
      enhanced +=
        '\n\nThis is an exciting opportunity to join our dynamic team and make a real impact. You will work alongside talented professionals in a collaborative environment where innovation and creativity are valued.'
    }

    // Add company culture section
    if (
      !enhanced.toLowerCase().includes('culture') &&
      !enhanced.toLowerCase().includes('environment')
    ) {
      enhanced +=
        '\n\nCompany Culture:\nWe foster a supportive and inclusive work environment where every team member can thrive. We believe in work-life balance, continuous learning, and providing opportunities for professional growth.'
    }

    // Add benefits section if not present
    if (
      !enhanced.toLowerCase().includes('benefit') &&
      !enhanced.toLowerCase().includes('perk')
    ) {
      enhanced +=
        '\n\nBenefits:\n• Competitive salary and equity package\n• Flexible working arrangements\n• Professional development opportunities\n• Health and wellness benefits\n• Collaborative and innovative team environment'
    }

    // Add application instructions
    if (
      !enhanced.toLowerCase().includes('apply') &&
      !enhanced.toLowerCase().includes('submit')
    ) {
      enhanced +=
        "\n\nHow to Apply:\nPlease submit your resume and a brief cover letter explaining why you're excited about this opportunity. We look forward to hearing from you!"
    }

    return enhanced
  }

  private generateEnhancedDescription(
    originalDescription: string,
    suggestions: string[]
  ): string {
    // Fallback method for backward compatibility
    let enhanced = originalDescription

    if (
      suggestions.includes('Use more inclusive language in the description')
    ) {
      enhanced +=
        '\n\nWe are committed to building a diverse and inclusive team. We welcome applications from candidates of all backgrounds.'
    }

    if (suggestions.includes('Expand job description')) {
      enhanced +=
        '\n\nThis is an exciting opportunity to join our dynamic team and make a real impact. You will work alongside talented professionals in a collaborative environment.'
    }

    return enhanced
  }

  // Recent Activity
  async getRecentActivity(): Promise<ActivityItem[]> {
    try {
      const { data, error } = await this._supabase
        .from('students')
        .select('id, first_name, last_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Transform the data to ActivityItem format
      const activities: ActivityItem[] = (data || []).map((student) => ({
        id: student.id,
        type: 'student' as const,
        action: `Student ${
          student.status === 'approved' ? 'approved' : 'registered'
        }`,
        user: `${student.first_name} ${student.last_name}`,
        timestamp: new Date(student.created_at).toLocaleDateString(),
        details: `Status: ${student.status}`,
        status: student.status === 'approved' ? 'completed' : 'pending',
      }))

      return activities
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  // CRUD Operations for Students
  async createStudent(
    data: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'last_activity'>
  ): Promise<Student> {
    try {
      const { data: result, error } = await this._supabase
        .from('students')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating student:', error)

      // Handle specific database errors
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        'message' in error
      ) {
        const dbError = error as { code: string; message: string }

        if (
          dbError.code === '23505' &&
          dbError.message.includes('students_email_key')
        ) {
          throw new Error(
            'A student with this email address already exists. Please use a different email address.'
          )
        }

        // Handle other constraint violations
        if (dbError.code === '23505') {
          throw new Error(
            'This information conflicts with existing data. Please check your input and try again.'
          )
        }

        // Handle foreign key violations
        if (dbError.code === '23503') {
          throw new Error(
            'Invalid reference data. Please check your input and try again.'
          )
        }

        // Handle not null violations
        if (dbError.code === '23502') {
          throw new Error(
            'Required fields are missing. Please fill in all required information.'
          )
        }

        // Generic error fallback
        throw new Error(
          dbError.message || 'Failed to create student. Please try again.'
        )
      }

      // Fallback for non-database errors
      throw new Error('Failed to create student. Please try again.')
    }
  }

  async updateStudent(
    id: string,
    data: Partial<
      Omit<Student, 'id' | 'created_at' | 'updated_at' | 'last_activity'>
    >
  ): Promise<Student> {
    try {
      const { data: result, error } = await this._supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating student:', error)

      // Handle specific database errors
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        'message' in error
      ) {
        const dbError = error as { code: string; message: string }

        if (
          dbError.code === '23505' &&
          dbError.message.includes('students_email_key')
        ) {
          throw new Error(
            'A student with this email address already exists. Please use a different email address.'
          )
        }

        // Handle other constraint violations
        if (dbError.code === '23505') {
          throw new Error(
            'This information conflicts with existing data. Please check your input and try again.'
          )
        }

        // Handle foreign key violations
        if (dbError.code === '23503') {
          throw new Error(
            'Invalid reference data. Please check your input and try again.'
          )
        }

        // Handle not null violations
        if (dbError.code === '23502') {
          throw new Error(
            'Required fields are missing. Please fill in all required information.'
          )
        }

        // Generic error fallback
        throw new Error(
          dbError.message || 'Failed to update student. Please try again.'
        )
      }

      // Fallback for non-database errors
      throw new Error('Failed to update student. Please try again.')
    }
  }

  // CRUD Operations for Employers
  async createEmployer(
    data: Omit<Employer, 'id' | 'created_at' | 'updated_at' | 'last_activity'>
  ): Promise<Employer> {
    try {
      const { data: result, error } = await this._supabase
        .from('employers')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating employer:', error)

      // Handle specific database errors
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        'message' in error
      ) {
        const dbError = error as { code: string; message: string }

        if (
          dbError.code === '23505' &&
          dbError.message.includes('employers_contact_email_key')
        ) {
          throw new Error(
            'An employer with this email address already exists. Please use a different email address.'
          )
        }

        // Handle other constraint violations
        if (dbError.code === '23505') {
          throw new Error(
            'This information conflicts with existing data. Please check your input and try again.'
          )
        }

        // Handle foreign key violations
        if (dbError.code === '23503') {
          throw new Error(
            'Invalid reference data. Please check your input and try again.'
          )
        }

        // Handle not null violations
        if (dbError.code === '23502') {
          throw new Error(
            'Required fields are missing. Please fill in all required information.'
          )
        }

        // Generic error fallback
        throw new Error(
          dbError.message || 'Failed to create employer. Please try again.'
        )
      }

      // Fallback for non-database errors
      throw new Error('Failed to create employer. Please try again.')
    }
  }

  async updateEmployer(
    id: string,
    data: Partial<
      Omit<Employer, 'id' | 'created_at' | 'updated_at' | 'last_activity'>
    >
  ): Promise<Employer> {
    try {
      const { data: result, error } = await this._supabase
        .from('employers')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating employer:', error)

      // Handle specific database errors
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        'message' in error
      ) {
        const dbError = error as { code: string; message: string }

        if (
          dbError.code === '23505' &&
          dbError.message.includes('employers_contact_email_key')
        ) {
          throw new Error(
            'An employer with this email address already exists. Please use a different email address.'
          )
        }

        // Handle other constraint violations
        if (dbError.code === '23505') {
          throw new Error(
            'This information conflicts with existing data. Please check your input and try again.'
          )
        }

        // Handle foreign key violations
        if (dbError.code === '23503') {
          throw new Error(
            'Invalid reference data. Please check your input and try again.'
          )
        }

        // Handle not null violations
        if (dbError.code === '23502') {
          throw new Error(
            'Required fields are missing. Please fill in all required information.'
          )
        }

        // Generic error fallback
        throw new Error(
          dbError.message || 'Failed to update employer. Please try again.'
        )
      }

      // Fallback for non-database errors
      throw new Error('Failed to update employer. Please try again.')
    }
  }

  // CRUD Operations for Job Postings
  async createJobPosting(
    data: Omit<
      JobPosting,
      'id' | 'created_at' | 'updated_at' | 'last_activity' | 'employers'
    >
  ): Promise<JobPosting> {
    try {
      const { data: result, error } = await this._supabase
        .from('job_postings')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error creating job posting:', error)
      throw error
    }
  }

  async updateJobPosting(
    id: string,
    data: Partial<
      Omit<
        JobPosting,
        'id' | 'created_at' | 'updated_at' | 'last_activity' | 'employers'
      >
    >
  ): Promise<JobPosting> {
    try {
      const { data: result, error } = await this._supabase
        .from('job_postings')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating job posting:', error)
      throw error
    }
  }

  // AI Matchmaking
  async generateMatches(): Promise<Match[]> {
    try {
      // Get all approved students and employers
      const [studentsResult, employersResult, jobsResult] = await Promise.all([
        this._supabase.from('students').select('*').eq('status', 'approved'),
        this._supabase.from('employers').select('*').eq('status', 'approved'),
        this._supabase
          .from('job_postings')
          .select('*')
          .eq('status', 'published'),
      ])

      const students = studentsResult.data || []
      const employers = employersResult.data || []
      const jobs = jobsResult.data || []

      const matches: Match[] = []

      // Simple matching algorithm
      for (const student of students) {
        for (const employer of employers) {
          for (const job of jobs) {
            if (job.employer_id === employer.id) {
              const matchScore = this.calculateMatchScore(
                student,
                employer,
                job
              )

              if (matchScore > 50) {
                // Only create matches with score > 50%
                matches.push({
                  id: `${student.id}-${employer.id}-${job.id}`,
                  created_at: new Date().toISOString(),
                  student_id: student.id,
                  employer_id: employer.id,
                  job_posting_id: job.id,
                  match_score: matchScore,
                  status: 'suggested',
                  last_activity: new Date().toISOString(),
                })
              }
            }
          }
        }
      }

      // Insert matches into database
      if (matches.length > 0) {
        const { error } = await this._supabase.from('matches').upsert(matches, {
          onConflict: 'student_id,employer_id,job_posting_id',
        })

        if (error) throw error
      }

      return matches
    } catch (error) {
      console.error('Error generating matches:', error)
      return []
    }
  }

  private calculateMatchScore(
    student: Student,
    employer: Employer,
    job: JobPosting
  ): number {
    let score = 0

    // Skills match
    const studentSkills = student.skills || []
    const requiredSkills = job.skills_required || []
    const matchingSkills = studentSkills.filter((skill) =>
      requiredSkills.some(
        (required) =>
          required.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(required.toLowerCase())
      )
    )

    if (requiredSkills.length > 0) {
      score += (matchingSkills.length / requiredSkills.length) * 40
    }

    // Location match
    if (student.location.toLowerCase() === job.location.toLowerCase()) {
      score += 20
    } else if (
      student.location.toLowerCase().includes(job.location.toLowerCase()) ||
      job.location.toLowerCase().includes(student.location.toLowerCase())
    ) {
      score += 10
    }

    // Availability match
    if (student.availability === job.employment_type) {
      score += 20
    }

    // Industry interest (simplified)
    if (
      student.interests &&
      student.interests.some((interest) =>
        employer.industry.toLowerCase().includes(interest.toLowerCase())
      )
    ) {
      score += 10
    }

    // Graduation year relevance
    const currentYear = new Date().getFullYear()
    if (
      student.graduation_year >= currentYear &&
      student.graduation_year <= currentYear + 2
    ) {
      score += 10
    }

    return Math.min(Math.round(score), 100)
  }

  // OpenAI Integration for Advanced Analysis
  private async performOpenAIAnalysis(student: Student): Promise<{
    score: number
    notes: string
    suggestions: string[]
  } | null> {
    try {
      // Check if OpenAI API key is available
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!openaiApiKey) {
        console.log('OpenAI API key not found, skipping OpenAI analysis')
        return null
      }

      // Prepare student data for analysis
      const studentData = {
        name: `${student.first_name} ${student.last_name}`,
        university: student.university,
        degree: student.degree,
        graduationYear: student.graduation_year,
        bio: student.bio || '',
        skills: student.skills || [],
        interests: student.interests || [],
        linkedinUrl: student.linkedin_url,
        githubUrl: student.github_url,
        portfolioUrl: student.portfolio_url,
        resumeUrl: student.resume_url,
        profilePhotoUrl: student.profile_photo_url,
        availability: student.availability,
        location: student.location,
      }

      // Create the prompt for OpenAI
      const prompt = `Analyze this student profile for a tech internship program and provide a comprehensive assessment:

Student Profile:
- Name: ${studentData.name}
- University: ${studentData.university}
- Degree: ${studentData.degree}
- Graduation Year: ${studentData.graduationYear}
- Bio: ${studentData.bio}
- Skills: ${studentData.skills.join(', ')}
- Interests: ${studentData.interests.join(', ')}
- LinkedIn: ${studentData.linkedinUrl || 'Not provided'}
- GitHub: ${studentData.githubUrl || 'Not provided'}
- Portfolio: ${studentData.portfolioUrl || 'Not provided'}
- Resume: ${studentData.resumeUrl || 'Not provided'}
- Profile Photo: ${studentData.profilePhotoUrl ? 'Provided' : 'Not provided'}
- Availability: ${studentData.availability}
- Location: ${studentData.location}

Please provide:
1. A score from 0-10 (where 10 is excellent)
2. Detailed analysis notes highlighting strengths and areas for improvement
3. Specific, actionable suggestions for profile enhancement

Respond in JSON format:
{
  "score": number,
  "notes": "string",
  "suggestions": ["string1", "string2", ...]
}`

      // Make API call to OpenAI
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert career counselor and tech industry recruiter. Analyze student profiles for tech internship programs with focus on completeness, professionalism, and potential for success.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      // Parse the JSON response
      const analysis = JSON.parse(content)

      // Validate the response structure
      if (
        typeof analysis.score !== 'number' ||
        typeof analysis.notes !== 'string' ||
        !Array.isArray(analysis.suggestions)
      ) {
        throw new Error('Invalid response format from OpenAI')
      }

      // Ensure score is within valid range
      const score = Math.max(0, Math.min(10, analysis.score))

      return {
        score,
        notes: analysis.notes,
        suggestions: analysis.suggestions,
      }
    } catch (error) {
      console.error('OpenAI analysis failed:', error)
      return null
    }
  }

  // Helper methods for AI functionality
  private containsKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase()
    return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // AI interaction logging
  private async _logAIInteraction(
    toolType: 'student_validator' | 'job_enhancer' | 'matchmaking',
    userId: string,
    userType: 'student' | 'employer' | 'organizer',
    inputData: Record<string, unknown>
  ): Promise<void> {
    try {
      await this._supabase.from('ai_interactions').insert({
        tool_type: toolType,
        user_id: userId,
        user_type: userType,
        input_data: inputData,
        processing_time_ms: Math.floor(Math.random() * 1000) + 500, // Simulate processing time
        success: true,
      })
    } catch (error) {
      console.error('Error logging AI interaction:', error)
      // Don't throw error as this is not critical
    }
  }

  // Advanced AI Matchmaking with enhanced scoring
  async generateAdvancedMatches(): Promise<Match[]> {
    try {
      const [studentsResult, employersResult, jobsResult] = await Promise.all([
        this._supabase.from('students').select('*').eq('status', 'approved'),
        this._supabase.from('employers').select('*').eq('status', 'approved'),
        this._supabase
          .from('job_postings')
          .select('*')
          .eq('status', 'published'),
      ])

      const students = studentsResult.data || []
      const employers = employersResult.data || []
      const jobs = jobsResult.data || []

      // Validate data integrity
      if (!students.length) {
        console.log('No approved students found for matchmaking')
        return []
      }
      if (!employers.length) {
        console.log('No approved employers found for matchmaking')
        return []
      }
      if (!jobs.length) {
        console.log('No published jobs found for matchmaking')
        return []
      }

      console.log(
        `Starting matchmaking with ${students.length} students, ${employers.length} employers, ${jobs.length} jobs`
      )

      const matches: Match[] = []

      // Enhanced matching algorithm with multiple factors
      for (const student of students) {
        for (const employer of employers) {
          for (const job of jobs) {
            if (job.employer_id === employer.id) {
              try {
                const matchScore = await this.calculateAdvancedMatchScore(
                  student,
                  employer,
                  job
                )

                if (matchScore > 60) {
                  // Higher threshold for better matches
                  const aiNotes = await this.generateMatchNotes(
                    student,
                    employer,
                    job,
                    matchScore
                  )

                  matches.push({
                    id: generateUUID(),
                    created_at: new Date().toISOString(),
                    student_id: student.id,
                    employer_id: employer.id,
                    job_posting_id: job.id,
                    match_score: matchScore,
                    status: 'suggested',
                    ai_notes: aiNotes,
                    last_activity: new Date().toISOString(),
                  })
                }
              } catch (matchError) {
                console.error(
                  `Error processing match for student ${student.id}, employer ${employer.id}, job ${job.id}:`,
                  {
                    message:
                      matchError instanceof Error
                        ? matchError.message
                        : 'Unknown error',
                    stack:
                      matchError instanceof Error
                        ? matchError.stack
                        : undefined,
                    error: matchError,
                  }
                )
                // Continue with next match instead of breaking the entire process
              }
            }
          }
        }
      }

      // Insert matches into database
      if (matches.length > 0) {
        console.log(
          `Attempting to insert ${matches.length} matches into database`
        )

        // Test Supabase connection first
        try {
          const { data: testData, error: testError } = await this._supabase
            .from('matches')
            .select('id')
            .limit(1)

          console.log('Supabase connection test:', { testData, testError })

          if (testError) {
            console.error('Supabase connection test failed:', testError)
            throw new Error(`Supabase connection failed: ${testError.message}`)
          }
        } catch (connectionError) {
          console.error('Supabase connection test error:', connectionError)
          throw connectionError
        }

        // Check for existing matches to avoid duplicates
        // Since we're using proper UUIDs now, we need to check for existing combinations
        const existingMatches = await this._supabase
          .from('matches')
          .select('student_id, employer_id, job_posting_id')
          .in(
            'student_id',
            matches.map((m) => m.student_id)
          )
          .in(
            'employer_id',
            matches.map((m) => m.employer_id)
          )
          .in(
            'job_posting_id',
            matches.map((m) => m.job_posting_id)
          )

        if (existingMatches.error) {
          console.error(
            'Error checking existing matches:',
            existingMatches.error
          )
          throw existingMatches.error
        }

        console.log(
          'Existing matches found:',
          existingMatches.data?.length || 0
        )

        // Filter out matches that already exist
        const newMatches = matches.filter((match) => {
          const exists = existingMatches.data?.some(
            (existing) =>
              existing.student_id === match.student_id &&
              existing.employer_id === match.employer_id &&
              existing.job_posting_id === match.job_posting_id
          )
          return !exists
        })

        console.log(
          `Filtered to ${newMatches.length} new matches (removed ${
            matches.length - newMatches.length
          } duplicates)`
        )

        if (newMatches.length === 0) {
          console.log('No new matches to insert - all are duplicates')
          return matches
        }

        // Log sample match data for debugging
        if (newMatches.length > 0) {
          console.log('Sample new match data:', {
            id: newMatches[0].id,
            student_id: newMatches[0].student_id,
            employer_id: newMatches[0].employer_id,
            job_posting_id: newMatches[0].job_posting_id,
            match_score: newMatches[0].match_score,
            status: newMatches[0].status,
          })

          // Validate match data structure
          const invalidMatches = newMatches.filter(
            (match) =>
              !match.id ||
              !match.student_id ||
              !match.employer_id ||
              !match.job_posting_id ||
              typeof match.match_score !== 'number' ||
              !match.status ||
              match.match_score < 0 ||
              match.match_score > 100
          )

          if (invalidMatches.length > 0) {
            console.error(
              `Found ${invalidMatches.length} invalid matches:`,
              invalidMatches
            )
            throw new Error(
              `Invalid match data: ${invalidMatches.length} matches have invalid data`
            )
          }
        }

        try {
          console.log('About to call Supabase upsert...')
          console.log('Supabase client:', !!this._supabase)
          console.log('Matches count:', matches.length)

          // Insert only new matches to avoid constraint violations
          console.log('Inserting new matches:', newMatches.length)

          // Try insert first, if it fails due to duplicates, we'll handle it gracefully
          console.log(
            'About to insert matches:',
            JSON.stringify(newMatches.slice(0, 2), null, 2)
          )
          console.log(
            'Sample match ID format:',
            newMatches[0]?.id,
            'Length:',
            newMatches[0]?.id?.length
          )

          const result = await this._supabase.from('matches').insert(newMatches)

          console.log('Supabase result:', result)
          console.log('Supabase error:', result.error)
          console.log('Supabase data:', result.data)

          if (result.error) {
            console.error('Database error inserting matches:', {
              message: result.error.message || 'Unknown database error',
              details: result.error.details || 'No additional details',
              hint: result.error.hint || 'No hint provided',
              code: result.error.code || 'No error code',
              error: result.error,
              errorType: typeof result.error,
              errorKeys: Object.keys(result.error || {}),
              errorStringified: JSON.stringify(result.error, null, 2),
              fullResult: JSON.stringify(result, null, 2),
            })

            // If it's a duplicate key error, that's okay - matches already exist
            if (result.error.code === '23505') {
              console.log(
                'Duplicate matches detected - this is expected behavior'
              )
              return matches
            }

            throw result.error
          }

          console.log('Successfully inserted matches into database')
        } catch (dbError) {
          console.error('Unexpected database operation error:', {
            message:
              dbError instanceof Error ? dbError.message : 'Unknown error',
            stack: dbError instanceof Error ? dbError.stack : undefined,
            error: dbError,
            errorType: typeof dbError,
            errorStringified: JSON.stringify(dbError, null, 2),
            dbErrorConstructor: dbError?.constructor?.name,
            dbErrorPrototype: Object.getPrototypeOf(dbError),
          })
          throw dbError
        }

        // Log AI interaction
        try {
          await this._logAIInteraction('matchmaking', 'system', 'organizer', {
            matches_generated: newMatches.length,
            total_matches_found: matches.length,
            duplicates_filtered: matches.length - newMatches.length,
            students_processed: students.length,
            employers_processed: employers.length,
            jobs_processed: jobs.length,
          })
        } catch (logError) {
          console.error('Error logging AI interaction:', logError)
          // Don't throw as this is not critical
        }
      }

      return matches
    } catch (error) {
      console.error('Error generating advanced matches:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      })
      return []
    }
  }

  private async calculateAdvancedMatchScore(
    student: Student,
    employer: Employer,
    job: JobPosting
  ): Promise<number> {
    try {
      // Check if OpenAI API key is available for enhanced scoring
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (openaiApiKey) {
        return await this.calculateOpenAIMatchScore(student, employer, job)
      }
    } catch (error) {
      console.warn(
        'OpenAI match scoring failed, falling back to rule-based:',
        error
      )
    }

    // Fallback to rule-based scoring
    let score = 0

    // Skills match (40% weight)
    const studentSkills = student.skills || []
    const requiredSkills = job.skills_required || []
    const matchingSkills = studentSkills.filter((skill) =>
      requiredSkills.some(
        (required) => this.calculateSkillSimilarity(skill, required) > 0.7
      )
    )

    if (requiredSkills.length > 0) {
      score += (matchingSkills.length / requiredSkills.length) * 40
    }

    // Location compatibility (20% weight)
    const locationScore = this.calculateLocationCompatibility(
      student.location,
      job.location
    )
    score += locationScore * 20

    // Availability match (15% weight)
    if (student.availability === job.employment_type) {
      score += 15
    } else if (
      this.isCompatibleAvailability(student.availability, job.employment_type)
    ) {
      score += 10
    }

    // Industry interest alignment (10% weight)
    const interestScore = this.calculateInterestAlignment(
      student.interests,
      employer.industry
    )
    score += interestScore * 10

    // Academic timeline relevance (10% weight)
    const timelineScore = this.calculateTimelineRelevance(
      student.graduation_year
    )
    score += timelineScore * 10

    // Profile completeness bonus (5% weight)
    const completenessScore = this.calculateProfileCompleteness(student)
    score += completenessScore * 5

    return Math.min(Math.round(score), 100)
  }

  // OpenAI-powered match scoring
  private async calculateOpenAIMatchScore(
    student: Student,
    employer: Employer,
    job: JobPosting
  ): Promise<number> {
    try {
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not available')
      }

      // Prepare data for OpenAI analysis
      const studentData = {
        name: `${student.first_name} ${student.last_name}`,
        university: student.university,
        degree: student.degree,
        graduationYear: student.graduation_year,
        bio: student.bio || '',
        skills: student.skills || [],
        interests: student.interests || [],
        location: student.location,
        availability: student.availability,
        linkedinUrl: student.linkedin_url,
        githubUrl: student.github_url,
        portfolioUrl: student.portfolio_url,
      }

      const employerData = {
        companyName: employer.company_name,
        industry: employer.industry || '',
        companySize: employer.company_size || '',
        description: employer.description || '',
      }

      const jobData = {
        title: job.title,
        description: job.description,
        location: job.location,
        employmentType: job.employment_type,
        skillsRequired: job.skills_required || [],
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
      }

      // Create the prompt for OpenAI
      const prompt = `Analyze the compatibility between this student and job opportunity, then provide a match score from 0-100.

Student Profile:
- Name: ${studentData.name}
- University: ${studentData.university}
- Degree: ${studentData.degree}
- Graduation Year: ${studentData.graduationYear}
- Bio: ${studentData.bio}
- Skills: ${studentData.skills.join(', ')}
- Interests: ${studentData.interests.join(', ')}
- Location: ${studentData.location}
- Availability: ${studentData.availability}
- LinkedIn: ${studentData.linkedinUrl || 'Not provided'}
- GitHub: ${studentData.githubUrl || 'Not provided'}
- Portfolio: ${studentData.portfolioUrl || 'Not provided'}

Employer Profile:
- Company: ${employerData.companyName}
- Industry: ${employerData.industry}
- Company Size: ${employerData.companySize}
- Description: ${employerData.description}

Job Posting:
- Title: ${jobData.title}
- Description: ${jobData.description}
- Location: ${jobData.location}
- Employment Type: ${jobData.employmentType}
- Required Skills: ${jobData.skillsRequired.join(', ')}
- Salary Range: ${
        jobData.salaryMin ? `$${jobData.salaryMin}` : 'Not specified'
      } - ${jobData.salaryMax ? `$${jobData.salaryMax}` : 'Not specified'}

Consider these factors in your scoring:
1. Skills alignment and technical fit (30%)
2. Location and availability compatibility (20%)
3. Academic timeline and career readiness (15%)
4. Company culture and values alignment (15%)
5. Profile completeness and professionalism (10%)
6. Interest and motivation indicators (10%)

Respond with ONLY a number between 0-100 representing the match score.`

      // Make API call to OpenAI
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert recruitment specialist and career counselor. Analyze student-job matches and provide accurate compatibility scores based on multiple factors.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 50,
            temperature: 0.2,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const scoreText = data.choices[0]?.message?.content

      if (!scoreText) {
        throw new Error('No score received from OpenAI')
      }

      // Extract numeric score from response
      const score = parseInt(scoreText.trim().replace(/[^\d]/g, ''), 10)

      if (isNaN(score) || score < 0 || score > 100) {
        throw new Error('Invalid score format from OpenAI')
      }

      console.log(`OpenAI match score generated: ${score}`)
      return score
    } catch (error) {
      console.error('OpenAI match scoring failed:', error)
      throw error
    }
  }

  private calculateSkillSimilarity(skill1: string, skill2: string): number {
    const s1 = skill1.toLowerCase()
    const s2 = skill2.toLowerCase()

    if (s1 === s2) return 1.0
    if (s1.includes(s2) || s2.includes(s1)) return 0.8

    // Check for related technologies
    const relatedTechs: Record<string, string[]> = {
      javascript: ['js', 'node', 'react', 'vue', 'angular'],
      python: ['django', 'flask', 'pandas', 'numpy'],
      java: ['spring', 'hibernate', 'maven'],
      react: ['jsx', 'javascript', 'frontend'],
      sql: ['database', 'mysql', 'postgresql'],
    }

    for (const [main, related] of Object.entries(relatedTechs)) {
      if (
        (s1 === main && related.includes(s2)) ||
        (s2 === main && related.includes(s1))
      ) {
        return 0.6
      }
    }

    return 0.0
  }

  private calculateLocationCompatibility(
    studentLocation: string,
    jobLocation: string
  ): number {
    const sLoc = studentLocation.toLowerCase()
    const jLoc = jobLocation.toLowerCase()

    if (sLoc === jLoc) return 1.0
    if (sLoc.includes(jLoc) || jLoc.includes(sLoc)) return 0.8

    // Check for remote work compatibility
    if (jLoc.includes('remote') || jLoc.includes('hybrid')) return 0.7

    return 0.3
  }

  private isCompatibleAvailability(
    studentAvail: string,
    jobType: string
  ): boolean {
    const compatibility: Record<string, string[]> = {
      'full-time': ['full-time', 'contract'],
      'part-time': ['part-time', 'contract'],
      internship: ['internship', 'part-time'],
      contract: ['contract', 'full-time', 'part-time'],
    }

    return compatibility[studentAvail]?.includes(jobType) || false
  }

  private calculateInterestAlignment(
    interests: string[],
    industry: string
  ): number {
    if (!interests || interests.length === 0) return 0.5

    const industryLower = industry.toLowerCase()
    const matchingInterests = interests.filter(
      (interest) =>
        interest.toLowerCase().includes(industryLower) ||
        industryLower.includes(interest.toLowerCase())
    )

    return Math.min(matchingInterests.length / interests.length, 1.0)
  }

  private calculateTimelineRelevance(graduationYear: number): number {
    const currentYear = new Date().getFullYear()
    const yearsUntilGraduation = graduationYear - currentYear

    if (yearsUntilGraduation === 0) return 1.0 // Graduating this year
    if (yearsUntilGraduation === 1) return 0.9 // Graduating next year
    if (yearsUntilGraduation === 2) return 0.7 // Graduating in 2 years
    if (yearsUntilGraduation < 0) return 0.3 // Already graduated
    return 0.5 // More than 2 years away
  }

  private calculateProfileCompleteness(student: Student): number {
    let completeness = 0
    const fields = [
      'bio',
      'linkedin_url',
      'github_url',
      'portfolio_url',
      'resume_url',
      'profile_photo_url',
      'skills',
      'interests',
    ]

    fields.forEach((field) => {
      if (
        student[field as keyof Student] &&
        (Array.isArray(student[field as keyof Student])
          ? (student[field as keyof Student] as string[]).length > 0
          : (student[field as keyof Student] as string).length > 0)
      ) {
        completeness += 1
      }
    })

    return completeness / fields.length
  }

  private async generateMatchNotes(
    student: Student,
    employer: Employer,
    job: JobPosting,
    matchScore: number
  ): Promise<string> {
    try {
      // Check if OpenAI API key is available
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!openaiApiKey) {
        console.log('OpenAI API key not found, using rule-based match notes')
        return this.generateRuleBasedMatchNotes(
          student,
          employer,
          job,
          matchScore
        )
      }

      // Prepare match data for OpenAI analysis
      const studentData = {
        name: `${student.first_name} ${student.last_name}`,
        university: student.university,
        degree: student.degree,
        graduationYear: student.graduation_year,
        bio: student.bio || '',
        skills: student.skills || [],
        interests: student.interests || [],
        location: student.location,
        availability: student.availability,
        linkedinUrl: student.linkedin_url,
        githubUrl: student.github_url,
        portfolioUrl: student.portfolio_url,
      }

      const employerData = {
        companyName: employer.company_name,
        industry: employer.industry || '',
        companySize: employer.company_size || '',
        description: employer.description || '',
      }

      const jobData = {
        title: job.title,
        description: job.description,
        location: job.location,
        employmentType: job.employment_type,
        skillsRequired: job.skills_required || [],
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
      }

      // Create the prompt for OpenAI
      const prompt = `Analyze this student-employer-job match and provide intelligent insights:

Student Profile:
- Name: ${studentData.name}
- University: ${studentData.university}
- Degree: ${studentData.degree}
- Graduation Year: ${studentData.graduationYear}
- Bio: ${studentData.bio}
- Skills: ${studentData.skills.join(', ')}
- Interests: ${studentData.interests.join(', ')}
- Location: ${studentData.location}
- Availability: ${studentData.availability}
- LinkedIn: ${studentData.linkedinUrl || 'Not provided'}
- GitHub: ${studentData.githubUrl || 'Not provided'}
- Portfolio: ${studentData.portfolioUrl || 'Not provided'}

Employer Profile:
- Company: ${employerData.companyName}
- Industry: ${employerData.industry}
- Company Size: ${employerData.companySize}
- Description: ${employerData.description}

Job Posting:
- Title: ${jobData.title}
- Description: ${jobData.description}
- Location: ${jobData.location}
- Employment Type: ${jobData.employmentType}
- Required Skills: ${jobData.skillsRequired.join(', ')}
- Salary Range: ${
        jobData.salaryMin ? `$${jobData.salaryMin}` : 'Not specified'
      } - ${jobData.salaryMax ? `$${jobData.salaryMax}` : 'Not specified'}

Match Score: ${matchScore}%

Please provide:
1. A brief, engaging explanation of why this is a good match (2-3 sentences)
2. Key strengths that make this student suitable for this role
3. Any potential concerns or areas for improvement
4. Specific reasons why this student would thrive at this company

Keep the response concise, professional, and encouraging. Focus on the most compelling aspects of the match.`

      // Make API call to OpenAI
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert career counselor and recruitment specialist. Analyze student-employer-job matches and provide intelligent, personalized insights that help both parties understand the value of the connection.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 500,
            temperature: 0.4,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiNotes = data.choices[0]?.message?.content

      if (!aiNotes) {
        throw new Error('No match notes received from OpenAI')
      }

      console.log('OpenAI match notes generated successfully')
      return aiNotes.trim()
    } catch (error) {
      console.error('OpenAI match notes failed, falling back to rule-based:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      })
      return this.generateRuleBasedMatchNotes(
        student,
        employer,
        job,
        matchScore
      )
    }
  }

  // Fallback rule-based match notes generation
  private generateRuleBasedMatchNotes(
    student: Student,
    employer: Employer,
    job: JobPosting,
    matchScore: number
  ): string {
    const notes = []

    // Skills alignment
    const studentSkills = student.skills || []
    const requiredSkills = job.skills_required || []
    const matchingSkills = studentSkills.filter((skill) =>
      requiredSkills.some(
        (required) => this.calculateSkillSimilarity(skill, required) > 0.7
      )
    )

    if (matchingSkills.length > 0) {
      notes.push(`Strong skills alignment: ${matchingSkills.join(', ')}`)
    }

    // Location compatibility
    if (student.location === job.location) {
      notes.push('Perfect location match')
    } else if (job.location.toLowerCase().includes('remote')) {
      notes.push('Remote work opportunity')
    }

    // Availability match
    if (student.availability === job.employment_type) {
      notes.push('Availability perfectly matches job type')
    }

    // Profile quality
    const completeness = this.calculateProfileCompleteness(student)
    if (completeness > 0.8) {
      notes.push('Excellent profile completeness')
    }

    // Academic timeline
    const currentYear = new Date().getFullYear()
    if (student.graduation_year === currentYear) {
      notes.push('Graduating this year - perfect timing')
    }

    return (
      notes.join('; ') ||
      `Match score: ${matchScore}% based on overall compatibility`
    )
  }

  // AI Analytics and Insights
  async getAIInsights(): Promise<{
    studentProfileQuality: number
    jobPostingQuality: number
    matchSuccessRate: number
    recommendations: string[]
  }> {
    try {
      const [studentsResult, jobsResult, matchesResult] = await Promise.all([
        this._supabase.from('students').select('ai_validation_score'),
        this._supabase.from('job_postings').select('ai_enhancement_score'),
        this._supabase.from('matches').select('status, match_score'),
      ])

      const students = studentsResult.data || []
      const jobs = jobsResult.data || []
      const matches = matchesResult.data || []

      // Calculate average student profile quality
      const studentScores = students
        .filter((s) => s.ai_validation_score !== null)
        .map((s) => s.ai_validation_score)
      const studentProfileQuality =
        studentScores.length > 0
          ? studentScores.reduce((sum, score) => sum + score, 0) /
            studentScores.length
          : 0

      // Calculate average job posting quality
      const jobScores = jobs
        .filter((j) => j.ai_enhancement_score !== null)
        .map((j) => j.ai_enhancement_score)
      const jobPostingQuality =
        jobScores.length > 0
          ? jobScores.reduce((sum, score) => sum + score, 0) / jobScores.length
          : 0

      // Calculate match success rate
      const totalMatches = matches.length
      const successfulMatches = matches.filter(
        (m) => m.status === 'matched' || m.status === 'interested'
      ).length
      const matchSuccessRate =
        totalMatches > 0 ? (successfulMatches / totalMatches) * 100 : 0

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        studentProfileQuality,
        jobPostingQuality,
        matchSuccessRate
      )

      return {
        studentProfileQuality: Math.round(studentProfileQuality * 10) / 10,
        jobPostingQuality: Math.round(jobPostingQuality * 10) / 10,
        matchSuccessRate: Math.round(matchSuccessRate),
        recommendations,
      }
    } catch (error) {
      console.error('Error getting AI insights:', error)
      return {
        studentProfileQuality: 0,
        jobPostingQuality: 0,
        matchSuccessRate: 0,
        recommendations: ['Unable to generate insights at this time'],
      }
    }
  }

  private generateRecommendations(
    studentQuality: number,
    jobQuality: number,
    matchRate: number
  ): string[] {
    const recommendations = []

    if (studentQuality < 6) {
      recommendations.push(
        'Consider running AI validation on more student profiles to improve overall quality'
      )
    }

    if (jobQuality < 6) {
      recommendations.push(
        'Use AI job enhancer to improve job posting quality and attract better candidates'
      )
    }

    if (matchRate < 30) {
      recommendations.push(
        'Review matching criteria and consider adjusting the algorithm for better compatibility'
      )
    }

    if (studentQuality > 8 && jobQuality > 8 && matchRate > 70) {
      recommendations.push(
        'Excellent system performance! Consider expanding the program'
      )
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'System is performing well. Continue monitoring for optimization opportunities'
      )
    }

    return recommendations
  }

  // AI-powered bulk operations
  async bulkValidateStudents(studentIds: string[]): Promise<{
    success: number
    failed: number
    results: Array<{
      id: string
      score: number
      success: boolean
      analysisType: string
    }>
  }> {
    const results = []
    let success = 0
    let failed = 0

    for (const studentId of studentIds) {
      try {
        const result = await this.validateStudentProfile(studentId)
        results.push({
          id: studentId,
          score: result.score,
          success: true,
          analysisType: 'ai_analysis',
        })
        success++
      } catch {
        results.push({
          id: studentId,
          score: 0,
          success: false,
          analysisType: 'failed',
        })
        failed++
      }
    }

    return { success, failed, results }
  }

  // Advanced bulk OpenAI analysis
  async bulkOpenAIAnalysis(studentIds: string[]): Promise<{
    success: number
    failed: number
    results: Array<{
      id: string
      score: number
      success: boolean
      analysisType: string
    }>
  }> {
    console.log(`Starting bulk analysis for ${studentIds.length} students`)
    const results = []
    let success = 0
    let failed = 0

    // Check if OpenAI is available
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    console.log('OpenAI API key available:', !!openaiApiKey)

    if (!openaiApiKey) {
      console.log('No OpenAI API key found, using rule-based analysis')
      // Fallback to regular validation
      return this.bulkValidateStudents(studentIds)
    }

    for (const studentId of studentIds) {
      try {
        console.log(`Analyzing student ${studentId}`)

        // Get student data
        const { data: student, error } = await this._supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single()

        if (error) {
          console.error(`Error fetching student ${studentId}:`, error)
          throw error
        }

        console.log(`Student data for ${studentId}:`, {
          name: `${student.first_name} ${student.last_name}`,
          status: student.status,
        })

        // Perform OpenAI analysis
        const openaiResult = await this.performOpenAIAnalysis(student)
        console.log(`OpenAI result for ${studentId}:`, openaiResult)

        if (openaiResult) {
          // Update student with AI validation
          await this._supabase
            .from('students')
            .update({
              ai_validation_score: openaiResult.score,
              ai_validation_notes: openaiResult.notes,
            })
            .eq('id', studentId)

          // Log AI interaction
          await this._logAIInteraction(
            'student_validator',
            studentId,
            'student',
            {
              student_id: studentId,
              validation_score: openaiResult.score,
              suggestions_count: openaiResult.suggestions.length,
              analysis_type: 'openai_bulk',
            }
          )

          results.push({
            id: studentId,
            score: openaiResult.score,
            success: true,
            analysisType: 'openai',
          })
          success++
        } else {
          // Fallback to rule-based
          const result = await this.validateStudentProfile(studentId)
          results.push({
            id: studentId,
            score: result.score,
            success: true,
            analysisType: 'rule_based_fallback',
          })
          success++
        }
      } catch {
        results.push({
          id: studentId,
          score: 0,
          success: false,
          analysisType: 'failed',
        })
        failed++
      }
    }

    return { success, failed, results }
  }

  async bulkEnhanceJobs(jobIds: string[]): Promise<{
    success: number
    failed: number
    results: Array<{ id: string; score: number; success: boolean }>
  }> {
    console.log(`Starting bulk enhancement for ${jobIds.length} jobs`)
    const results = []
    let success = 0
    let failed = 0

    // Check if OpenAI is available
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    console.log('OpenAI API key available for job enhancement:', !!openaiApiKey)

    for (const jobId of jobIds) {
      try {
        console.log(`Enhancing job ${jobId}`)
        const result = await this.enhanceJobPosting(jobId)
        results.push({ id: jobId, score: result.score, success: true })
        success++
      } catch (error) {
        console.error(`Error enhancing job ${jobId}:`, error)
        results.push({ id: jobId, score: 0, success: false })
        failed++
      }
    }

    console.log(
      `Bulk enhancement completed: ${success} successful, ${failed} failed`
    )
    return { success, failed, results }
  }

  // AI Performance Analytics
  async getAIPerformanceMetrics(): Promise<{
    totalInteractions: number
    averageProcessingTime: number
    successRate: number
    toolUsage: Record<string, number>
  }> {
    try {
      const { data: interactions, error } = await this._supabase
        .from('ai_interactions')
        .select('tool_type, processing_time_ms, success')

      if (error) throw error

      const totalInteractions = interactions.length
      const successfulInteractions = interactions.filter(
        (i) => i.success
      ).length
      const successRate =
        totalInteractions > 0
          ? (successfulInteractions / totalInteractions) * 100
          : 0

      const averageProcessingTime =
        interactions.length > 0
          ? interactions.reduce(
              (sum, i) => sum + (i.processing_time_ms || 0),
              0
            ) / interactions.length
          : 0

      const toolUsage = interactions.reduce((acc, interaction) => {
        acc[interaction.tool_type] = (acc[interaction.tool_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalInteractions,
        averageProcessingTime: Math.round(averageProcessingTime),
        successRate: Math.round(successRate),
        toolUsage,
      }
    } catch (error) {
      console.error('Error getting AI performance metrics:', error)
      return {
        totalInteractions: 0,
        averageProcessingTime: 0,
        successRate: 0,
        toolUsage: {},
      }
    }
  }

  // Move documents from temp folder to proper student folder
  async moveDocumentsFromTemp(
    tempStudentId: string,
    realStudentId: string
  ): Promise<void> {
    try {
      const supabase = createClientClient()

      // List all files in temp folder for this student
      const { data: tempFiles, error: listError } = await supabase.storage
        .from('documents')
        .list(`temp/${tempStudentId}`)

      if (listError) {
        console.error('Error listing temp files:', listError)
        return
      }

      if (!tempFiles || tempFiles.length === 0) {
        return // No files to move
      }

      // Track URLs that need to be updated
      const urlUpdates: { cv_url?: string; academic_records_url?: string } = {}

      // Move each file from temp to proper location
      for (const file of tempFiles) {
        const tempPath = `temp/${tempStudentId}/${file.name}`
        const newPath = `documents/${realStudentId}/${file.name}`

        // Copy file to new location
        const { error: copyError } = await supabase.storage
          .from('documents')
          .copy(tempPath, newPath)

        if (copyError) {
          console.error(`Error copying file ${file.name}:`, copyError)
          continue
        }

        // Get the new public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(newPath)

        if (urlData?.publicUrl) {
          // Determine document type from filename
          if (file.name.includes('_cv_')) {
            urlUpdates.cv_url = urlData.publicUrl
          } else if (file.name.includes('_academic_records_')) {
            urlUpdates.academic_records_url = urlData.publicUrl
          }
        }

        // Delete original temp file
        const { error: deleteError } = await supabase.storage
          .from('documents')
          .remove([tempPath])

        if (deleteError) {
          console.error(`Error deleting temp file ${file.name}:`, deleteError)
        }
      }

      // Update student record with new URLs
      if (Object.keys(urlUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from('students')
          .update(urlUpdates)
          .eq('id', realStudentId)

        if (updateError) {
          console.error('Error updating student URLs:', updateError)
        } else {
          console.log('Updated student document URLs:', urlUpdates)
        }
      }
    } catch (error) {
      console.error('Error moving documents from temp:', error)
      throw error
    }
  }
}

// Export singleton instance
export const clientDataService = new ClientDataService()
