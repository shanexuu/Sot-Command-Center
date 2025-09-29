'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bot,
  User,
  FileText,
  Star,
  Clock,
  Filter,
  Search,
  Loader2,
  ExternalLink,
  GraduationCap,
  Info,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toaster'
import { ProgressModal } from '@/components/ui/progress-modal'
import { RejectionDialog } from '@/components/ui/rejection-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { clientDataService, Student } from '@/lib/data-services'
import {
  checkStudentEligibility,
  getEligibilityStatus,
  type EligibilityResult,
} from '@/lib/eligibility-utils'
import {
  StudentListSkeleton,
  MetricsCardsSkeleton,
  ProfileHeaderSkeleton,
  SearchFilterSkeleton,
} from '@/components/ui/skeleton-components'

interface StudentProfile extends Student {
  name: string
  aiScore: number
  aiNotes: string[]
  completeness: number
  lastUpdated: string
  cv_url?: string
  academic_records_url?: string
  cv_analysis_score?: number
  cv_analysis_notes?: string
  academic_records_analysis_score?: number
  academic_records_analysis_notes?: string
  eligibility?: EligibilityResult
}

// Helper function to generate detailed validation criteria
function generateValidationCriteriaDetails(student: Student): string {
  const criteria = [
    `Name: ${student.first_name} ${student.last_name} ✓`,
    `Institution: ${student.university} ✓`,
    `Major: ${student.degree} ✓`,
    `Graduation Date: ${student.graduation_year} ✓`,
  ]
  return criteria.join('; ')
}

// Helper function to transform Student to StudentProfile
function transformStudentToProfile(student: Student): StudentProfile {
  const name = `${student.first_name} ${student.last_name}`

  // Calculate AI score based on document analysis scores
  // Use the LOWER of the two scores to ensure both documents are validated
  let aiScore = 0
  const missingDocuments: string[] = []

  // Check for CV analysis score
  const hasCVAnalysis =
    student.cv_analysis_score !== null &&
    student.cv_analysis_score !== undefined
  // Check for Academic Records analysis score
  const hasAcademicAnalysis =
    student.academic_records_analysis_score !== null &&
    student.academic_records_analysis_score !== undefined

  // Track missing documents
  if (!hasCVAnalysis) {
    if (student.cv_url) {
      missingDocuments.push('CV analysis')
    } else {
      missingDocuments.push('CV document')
    }
  }

  if (!hasAcademicAnalysis) {
    if (student.academic_records_url) {
      missingDocuments.push('Academic records analysis')
    } else {
      missingDocuments.push('Academic records document')
    }
  }

  // Calculate score based on available analyses
  if (hasCVAnalysis && hasAcademicAnalysis) {
    // Both analyses available - use the LOWER score to ensure both documents are good
    aiScore = Math.min(
      student.cv_analysis_score!,
      student.academic_records_analysis_score!
    )
  } else if (hasCVAnalysis) {
    // Only CV analysis available
    aiScore = student.cv_analysis_score!
  } else if (hasAcademicAnalysis) {
    // Only Academic Records analysis available
    aiScore = student.academic_records_analysis_score!
  } else {
    // No document analyses available - score remains 0
    aiScore = 0
  }

  // Scores are in 0-10 range from API (e.g., 7.5 = 7.5/10 when displayed)
  const finalAiScore = aiScore

  // Combine AI notes from profile validation and document analysis
  const aiNotes = []

  // Add missing documents information
  if (missingDocuments.length > 0) {
    aiNotes.push(`⚠️ Missing: ${missingDocuments.join(', ')}`)
  }

  // Add profile validation notes
  if (student.ai_validation_notes) {
    aiNotes.push(...student.ai_validation_notes.split('; '))
  }

  // Add CV analysis notes if available
  if (student.cv_analysis_notes) {
    try {
      const cvNotes = JSON.parse(student.cv_analysis_notes)
      if (Array.isArray(cvNotes)) {
        aiNotes.push(...cvNotes)
      }
    } catch {
      // If parsing fails, add as single note
      aiNotes.push(student.cv_analysis_notes)
    }
  }

  // Add academic records analysis notes if available
  if (student.academic_records_analysis_notes) {
    try {
      const academicNotes = JSON.parse(student.academic_records_analysis_notes)
      if (Array.isArray(academicNotes)) {
        aiNotes.push(...academicNotes)
      }
    } catch {
      // If parsing fails, add as single note
      aiNotes.push(student.academic_records_analysis_notes)
    }
  }

  // Calculate completeness
  let completeness = 0
  if (student.bio && student.bio.length > 50) completeness += 15
  if (student.skills && student.skills.length >= 3) completeness += 15
  if (student.interests && student.interests.length >= 2) completeness += 10
  if (student.linkedin_url) completeness += 10
  if (student.github_url) completeness += 10
  if (student.portfolio_url) completeness += 10
  if (student.resume_url) completeness += 10
  if (student.profile_photo_url) completeness += 10
  if (student.cv_url) completeness += 10
  if (student.academic_records_url) completeness += 10

  const lastUpdated = new Date(student.last_activity).toLocaleDateString()

  // Check eligibility using ACTUAL document data, not profile data
  let eligibility: EligibilityResult

  // Extract actual data from document analysis (CV or Academic Records)
  let documentName: string | undefined
  let documentUniversity: string | undefined
  let documentGraduationYear: number | undefined
  const documentWarnings: string[] = []

  // Try to extract data from CV analysis first
  if (student.cv_analysis_notes) {
    try {
      const cvNotes = JSON.parse(student.cv_analysis_notes)
      if (Array.isArray(cvNotes)) {
        // Look for extracted data in CV notes
        cvNotes.forEach((note: string) => {
          if (note.includes('Name correctly shows')) {
            const match = note.match(/Name correctly shows (.+)/)
            if (match) documentName = match[1]
          } else if (note.includes('University correctly shows')) {
            const match = note.match(/University correctly shows (.+)/)
            if (match) documentUniversity = match[1]
          } else if (note.includes('Graduation year correctly shows')) {
            const match = note.match(/Graduation year correctly shows (\d+)/)
            if (match) documentGraduationYear = parseInt(match[1])
          } else if (note.includes('Degree correctly shows')) {
            // Degree information extracted but not used for eligibility
          } else if (note.includes('mismatch') || note.includes('warning')) {
            documentWarnings.push(note)
          }
        })
      }
    } catch {
      // If parsing fails, check for mismatches in the raw text
      if (student.cv_analysis_notes.includes('mismatch')) {
        documentWarnings.push('CV document contains mismatches with profile')
      }
    }
  }

  // Try to extract data from Academic Records analysis if CV didn't provide data
  if (
    (!documentUniversity || !documentGraduationYear) &&
    student.academic_records_analysis_notes
  ) {
    try {
      const academicNotes = JSON.parse(student.academic_records_analysis_notes)
      if (Array.isArray(academicNotes)) {
        academicNotes.forEach((note: string) => {
          if (note.includes('Name correctly shows')) {
            const match = note.match(/Name correctly shows (.+)/)
            if (match) documentName = match[1]
          } else if (note.includes('University correctly shows')) {
            const match = note.match(/University correctly shows (.+)/)
            if (match) documentUniversity = match[1]
          } else if (note.includes('Graduation year correctly shows')) {
            const match = note.match(/Graduation year correctly shows (\d+)/)
            if (match) documentGraduationYear = parseInt(match[1])
          } else if (note.includes('Degree correctly shows')) {
            // Degree information extracted but not used for eligibility
          } else if (note.includes('mismatch') || note.includes('warning')) {
            documentWarnings.push(note)
          }
        })
      }
    } catch {
      // If parsing fails, check for mismatches in the raw text
      if (student.academic_records_analysis_notes.includes('mismatch')) {
        documentWarnings.push(
          'Academic records document contains mismatches with profile'
        )
      }
    }
  }

  // Use document data if available, otherwise fallback to profile data
  const eligibilityUniversity = documentUniversity || student.university
  const eligibilityGraduationYear =
    documentGraduationYear || student.graduation_year

  // Check if we have document analysis data
  if (documentUniversity && documentGraduationYear) {
    // Use document data for eligibility check
    eligibility = checkStudentEligibility(
      eligibilityGraduationYear,
      eligibilityUniversity
    )

    // Add document validation warnings
    if (documentWarnings.length > 0) {
      eligibility.warnings = [...eligibility.warnings, ...documentWarnings]
    }

    // Add mismatch warnings if document data differs from profile
    if (
      documentName &&
      documentName !== `${student.first_name} ${student.last_name}`
    ) {
      eligibility.warnings.push(
        `Document shows name "${documentName}" but profile shows "${student.first_name} ${student.last_name}"`
      )
    }
    if (documentUniversity !== student.university) {
      eligibility.warnings.push(
        `Document shows university "${documentUniversity}" but profile shows "${student.university}"`
      )
    }
    if (documentGraduationYear !== student.graduation_year) {
      eligibility.warnings.push(
        `Document shows graduation year "${documentGraduationYear}" but profile shows "${student.graduation_year}"`
      )
    }
  } else {
    // No document analysis available - use profile data but mark as incomplete
    eligibility = checkStudentEligibility(
      student.graduation_year,
      student.university
    )

    // Add specific missing documents information
    if (missingDocuments.length > 0) {
      eligibility.warnings.push(
        `Missing documents: ${missingDocuments.join(', ')}`
      )
    } else {
      eligibility.warnings.push(
        'No document analysis available - eligibility based on profile data only'
      )
    }
  }

  return {
    ...student,
    name,
    aiScore: Math.round(finalAiScore),
    aiNotes,
    completeness,
    lastUpdated,
    cv_url: student.cv_url,
    academic_records_url: student.academic_records_url,
    cv_analysis_score: student.cv_analysis_score,
    cv_analysis_notes: student.cv_analysis_notes,
    academic_records_analysis_score: student.academic_records_analysis_score,
    academic_records_analysis_notes: student.academic_records_analysis_notes,
    eligibility,
  }
}

function ValidationScore({ score }: { score: number }) {
  // Score is in 0-10 scale, display as-is
  const displayScore = Math.round(score * 10) / 10 // Round to 1 decimal place

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 6) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 8) return CheckCircle
    if (score >= 6) return AlertTriangle
    return XCircle
  }

  const Icon = getScoreIcon(score)

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 cursor-help">
            <Icon className={`h-5 w-5 ${getScoreColor(score)}`} />
            <span className={`font-semibold ${getScoreColor(score)}`}>
              {displayScore}/10
            </span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs"
        >
          <div>
            <p className="font-semibold mb-2">Document Validation Score</p>
            <div className="space-y-1 text-sm">
              <p>• Institution matching</p>
              <p>• Major/Degree matching</p>
              <p>• Graduation year matching</p>
              <p className="text-xs text-muted-foreground mt-2">
                Score: {displayScore}/10 (0-10 scale)
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function EligibilityStatus({
  eligibility,
}: {
  eligibility: EligibilityResult
}) {
  const status = getEligibilityStatus(eligibility)

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Eligibility:</span>
      <Badge className={`${status.color} font-semibold`}>
        {status.icon}{' '}
        {status.status === 'eligible'
          ? 'Eligible'
          : status.status === 'warning'
          ? 'Warning'
          : 'Ineligible'}
      </Badge>
    </div>
  )
}

function StudentCard({
  student,
  onValidate,
  onApprove,
  onReject,
  onViewDetails,
  onAnalyzeDocuments,
  isValidating,
}: {
  student: StudentProfile
  onValidate: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onViewDetails: (id: string) => void
  onAnalyzeDocuments: (id: string) => void
  isValidating: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student.profile_photo_url} />
            <AvatarFallback>
              {student.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {student.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {student.university} • {student.degree}
                </p>
                <p className="text-xs text-muted-foreground">
                  Graduating {student.graduation_year}
                </p>
                {student.eligibility && (
                  <div className="mt-2">
                    <EligibilityStatus eligibility={student.eligibility} />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <ValidationScore score={student.aiScore} />
                <Badge
                  variant={
                    student.status === 'approved' ? 'default' : 'secondary'
                  }
                >
                  {student.status}
                </Badge>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Profile Completeness
                </span>
                <span className="font-medium">{student.completeness}%</span>
              </div>
              <Progress
                value={student.completeness}
                className="mt-1 h-2"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {student.skills.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {student.skills.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  +{student.skills.length - 4} more
                </Badge>
              )}
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* Profile AI Analysis */}
                {student.aiNotes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                      <Bot className="w-4 h-4 mr-2 text-blue-600" />
                      Document Analysis
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs"
                      >
                        GPT-4
                      </Badge>
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          Profile Validation
                        </h5>
                        {student.ai_validation_score !== undefined &&
                          student.ai_validation_score !== null && (
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                              {Math.round(student.ai_validation_score * 10) /
                                10}
                              /10
                            </span>
                          )}
                      </div>
                      <div className="space-y-2">
                        {student.aiNotes.map((note, index) => (
                          <div
                            key={index}
                            className="flex items-start"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                              {note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Analysis Results */}
                {(student.cv_analysis_notes ||
                  student.academic_records_analysis_notes ||
                  student.cv_url ||
                  student.academic_records_url) && (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      Document Analysis
                    </h4>
                    <div className="space-y-3">
                      {/* CV Analysis */}
                      {student.cv_analysis_score !== null &&
                      student.cv_analysis_score !== undefined ? (
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-semibold text-green-700 dark:text-green-300 flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              CV Analysis
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                              >
                                GPT-4
                              </Badge>
                            </h5>
                            {student.cv_analysis_score && (
                              <span className="text-xs font-bold text-green-700 dark:text-green-300">
                                {Math.round(student.cv_analysis_score * 10) /
                                  10}
                                /10
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {student.cv_analysis_notes &&
                            student.cv_analysis_notes.trim() !== '' ? (
                              student
                                .cv_analysis_notes!.split('; ')
                                .map((note, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start"
                                  >
                                    <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                    <p className="text-xs text-green-600 dark:text-green-400 leading-relaxed">
                                      {note}
                                    </p>
                                  </div>
                                ))
                            ) : (
                              <div className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <div className="text-xs text-green-600 dark:text-green-400 leading-relaxed">
                                  {generateValidationCriteriaDetails(student)
                                    .split('; ')
                                    .map((criterion, index) => (
                                      <div
                                        key={index}
                                        className="mb-1"
                                      >
                                        {criterion}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : student.cv_url ? (
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              CV Document
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                              >
                                Uploaded
                              </Badge>
                            </h5>
                          </div>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            CV document uploaded but not yet analyzed. Run AI
                            validation to analyze this document.
                          </p>
                        </div>
                      ) : null}

                      {/* Academic Records Analysis */}
                      {student.academic_records_analysis_score !== null &&
                      student.academic_records_analysis_score !== undefined ? (
                        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Academic Records
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                              >
                                GPT-4
                              </Badge>
                            </h5>
                            {student.academic_records_analysis_score && (
                              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                {Math.round(
                                  student.academic_records_analysis_score * 10
                                ) / 10}
                                /10
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {student.academic_records_analysis_notes &&
                            student.academic_records_analysis_notes.trim() !==
                              '' ? (
                              student.academic_records_analysis_notes
                                .split('; ')
                                .map((note, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start"
                                  >
                                    <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
                                      {note}
                                    </p>
                                  </div>
                                ))
                            ) : (
                              <div className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
                                  {generateValidationCriteriaDetails(student)
                                    .split('; ')
                                    .map((criterion, index) => (
                                      <div
                                        key={index}
                                        className="mb-1"
                                      >
                                        {criterion}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : student.academic_records_url ? (
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 flex items-center">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Academic Records Document
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                              >
                                Uploaded
                              </Badge>
                            </h5>
                          </div>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Academic records document uploaded but not yet
                            analyzed. Run AI validation to analyze this
                            document.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {student.ai_validation_score === undefined && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onValidate(student.id)}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Bot className="h-4 w-4 mr-1" />
                      )}
                      Validate
                    </Button>
                  )}
                  {/* Show Analyze Documents button if documents are uploaded but not analyzed */}
                  {((student.cv_url && !student.cv_analysis_notes) ||
                    (student.academic_records_url &&
                      !student.academic_records_analysis_notes)) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAnalyzeDocuments(student.id)}
                      disabled={isValidating}
                      className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                    >
                      {isValidating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-1" />
                      )}
                      Analyze Documents
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onApprove(student.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(student.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewDetails(student.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Updated {student.lastUpdated}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StudentValidator() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEligibility, setFilterEligibility] = useState('all')
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(
    null
  )
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Rejection dialog state
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [studentToReject, setStudentToReject] = useState<StudentProfile | null>(
    null
  )
  const [isRejecting, setIsRejecting] = useState(false)

  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressData, setProgressData] = useState({
    title: '',
    description: '',
    totalItems: 0,
    completedItems: 0,
    results: [] as Array<{
      id: string
      name: string
      score: number
      success: boolean
      analysisType: string
      error?: string
    }>,
    isComplete: false,
    successCount: 0,
    failedCount: 0,
  })

  const { addToast } = useToast()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Use server-side API route to bypass RLS and get accurate data
        const response = await fetch('/api/students')

        if (!response.ok) {
          throw new Error('Failed to fetch students')
        }
        const data = await response.json()

        const profiles = data.map(transformStudentToProfile)

        setStudents(profiles)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const handleValidateStudent = async (studentId: string) => {
    setValidating(studentId)

    // Show progress modal for individual validation
    setProgressData({
      title: 'AI Student Profile Analysis',
      description: 'Analyzing student profile using advanced AI',
      totalItems: 1,
      completedItems: 0,
      results: [],
      isComplete: false,
      successCount: 0,
      failedCount: 0,
    })
    setShowProgressModal(true)

    try {
      // Simulate progress updates
      setProgressData((prev) => ({ ...prev, completedItems: 0.3 }))
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgressData((prev) => ({ ...prev, completedItems: 0.6 }))
      await clientDataService.validateStudentProfile(studentId)

      setProgressData((prev) => ({ ...prev, completedItems: 0.9 }))
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Refresh the student data using server-side API route
      const refreshResponse = await fetch('/api/students')
      if (!refreshResponse.ok) {
        throw new Error('Failed to fetch students')
      }
      const refreshData = await refreshResponse.json()
      const profiles = refreshData.map(transformStudentToProfile)
      setStudents(profiles)

      // Complete progress
      setProgressData((prev) => ({
        ...prev,
        completedItems: 1,
        isComplete: true,
        successCount: 1,
        results: [
          {
            id: studentId,
            name:
              profiles.find((s: StudentProfile) => s.id === studentId)?.name ||
              'Student',
            score:
              profiles.find((s: StudentProfile) => s.id === studentId)
                ?.aiScore || 0,
            success: true,
            analysisType: 'Individual Analysis',
          },
        ],
      }))

      addToast({
        title: 'Analysis Complete!',
        description: 'Student profile successfully analyzed with AI',
        variant: 'success',
        icon: <CheckCircle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Error validating student:', error)
      setProgressData((prev) => ({
        ...prev,
        completedItems: 1,
        isComplete: true,
        failedCount: 1,
        results: [
          {
            id: studentId,
            name: 'Student',
            score: 0,
            success: false,
            analysisType: 'Individual Analysis',
          },
        ],
      }))

      addToast({
        title: 'Analysis Failed',
        description: 'Failed to analyze student profile. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setValidating(null)
    }
  }

  const handleAnalyzeDocuments = async (studentId: string) => {
    setValidating(studentId)

    // Show progress modal for document analysis
    setProgressData({
      title: 'AI Document Analysis',
      description: 'Analyzing CV and academic records documents',
      totalItems: 1,
      completedItems: 0,
      results: [],
      isComplete: false,
      successCount: 0,
      failedCount: 0,
    })
    setShowProgressModal(true)

    try {
      // Simulate progress updates
      setProgressData((prev) => ({ ...prev, completedItems: 0.3 }))
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgressData((prev) => ({ ...prev, completedItems: 0.6 }))

      // Find the student to get document URLs
      const student = students.find((s) => s.id === studentId)
      if (!student) {
        throw new Error('Student not found')
      }

      // Call the document analysis API for CV
      const cvResponse = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          documentType: 'cv',
          documentUrl: student.cv_url,
          fileName: `cv_${studentId}.pdf`,
          fileSize: 1024000,
          mimeType: 'application/pdf',
          extractedText: '',
        }),
      })

      if (!cvResponse.ok) {
        const errorData = await cvResponse
          .json()
          .catch(() => ({ error: 'Unknown error' }))
        throw new Error(
          `API error: ${cvResponse.status} - ${
            errorData.error || cvResponse.statusText
          }`
        )
      }

      // Call the document analysis API for Academic Records if available
      let academicRecordsResponse = null
      if (student.academic_records_url) {
        academicRecordsResponse = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId,
            documentType: 'academic_records',
            documentUrl: student.academic_records_url,
            fileName: `academic_records_${studentId}.pdf`,
            fileSize: 1024000,
            mimeType: 'application/pdf',
            extractedText: '',
          }),
        })

        if (!academicRecordsResponse.ok) {
          const errorData = await academicRecordsResponse
            .json()
            .catch(() => ({ error: 'Unknown error' }))
          throw new Error(
            `API error: ${academicRecordsResponse.status} - ${
              errorData.error || academicRecordsResponse.statusText
            }`
          )
        }
      }

      setProgressData((prev) => ({
        ...prev,
        completedItems: 1,
        isComplete: true,
      }))

      // Refresh the student data with a small delay to ensure database updates are reflected
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const analysisResponse = await fetch('/api/students')
      if (!analysisResponse.ok) {
        throw new Error('Failed to fetch students')
      }
      const analysisData = await analysisResponse.json()
      const profiles = analysisData.map(transformStudentToProfile)

      setStudents(profiles)

      // Complete progress
      setProgressData((prev) => ({
        ...prev,
        completedItems: 1,
        isComplete: true,
        successCount: 1,
        results: [
          {
            id: studentId,
            name:
              profiles.find((s: StudentProfile) => s.id === studentId)?.name ||
              'Student',
            score:
              profiles.find((s: StudentProfile) => s.id === studentId)
                ?.aiScore || 0,
            success: true,
            analysisType: 'Document Analysis',
          },
        ],
      }))

      addToast({
        title: 'Analysis Complete!',
        description: 'Documents have been analyzed successfully',
        variant: 'success',
        icon: <CheckCircle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Error analyzing documents:', error)
      setProgressData((prev) => ({
        ...prev,
        completedItems: 1,
        isComplete: true,
        failedCount: 1,
        results: [
          {
            id: studentId,
            name: 'Student',
            score: 0,
            success: false,
            analysisType: 'Document Analysis',
          },
        ],
      }))

      addToast({
        title: 'Analysis Failed',
        description: 'Failed to analyze documents. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setValidating(null)
    }
  }

  const handleBulkValidate = async () => {
    setValidating('bulk')

    const pendingStudents = students.filter((s) => s.status === 'pending')
    const studentIds = pendingStudents.map((s) => s.id)

    if (pendingStudents.length === 0) {
      addToast({
        title: 'No Pending Students',
        description:
          'All students are already approved or rejected. No analysis needed.',
        variant: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
      })
      return
    }

    // Calculate total items to analyze (profiles + documents)
    const totalDocuments = pendingStudents.reduce((count, student) => {
      let docCount = 0
      if (student.cv_url) docCount++
      if (student.academic_records_url) docCount++
      return count + docCount
    }, 0)
    const totalItems = pendingStudents.length + totalDocuments

    // Initialize progress modal
    setProgressData({
      title: 'AI Student Analysis',
      description: `Analyzing ${pendingStudents.length} student profiles and ${totalDocuments} documents using advanced AI`,
      totalItems: totalItems,
      completedItems: 0,
      results: [],
      isComplete: false,
      successCount: 0,
      failedCount: 0,
    })
    setShowProgressModal(true)

    try {
      // Update progress after profile analysis completes
      setProgressData((prev) => ({
        ...prev,
        completedItems: pendingStudents.length,
      }))

      // Analyze both student profiles and documents
      const results = await clientDataService.bulkOpenAIAnalysis(studentIds)

      // Also analyze documents for each student
      const documentAnalysisResults = []
      let completedDocumentAnalysis = 0

      for (let i = 0; i < pendingStudents.length; i++) {
        const student = pendingStudents[i]
        const documentsToAnalyze = []
        if (student.cv_url) documentsToAnalyze.push('cv')
        if (student.academic_records_url)
          documentsToAnalyze.push('academic_records')

        for (const documentType of documentsToAnalyze) {
          try {
            // Update progress: profile analysis + completed document analysis
            const currentProgress =
              pendingStudents.length + completedDocumentAnalysis
            setProgressData((prev) => ({
              ...prev,
              completedItems: Math.min(currentProgress, totalItems * 0.9),
            }))

            const documentUrl =
              documentType === 'cv'
                ? student.cv_url
                : student.academic_records_url

            const response = await fetch('/api/analyze-document', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                studentId: student.id,
                documentType: documentType,
                documentUrl: documentUrl,
                fileName: `${documentType}_${student.id}.pdf`,
                fileSize: 1024000,
                mimeType: 'application/pdf',
                // Let the API handle PDF text extraction
                extractedText: '',
              }),
            })

            if (!response.ok) {
              const errorData = await response
                .json()
                .catch(() => ({ error: 'Unknown error' }))
              throw new Error(
                `API error: ${response.status} - ${
                  errorData.error || response.statusText
                }`
              )
            }

            const data = await response.json()

            documentAnalysisResults.push({
              id: student.id,
              name: student.name,
              score: data.analysis?.analysisScore || 0,
              success: true,
              analysisType: `${documentType.toUpperCase()} Analysis`,
            })
            completedDocumentAnalysis++
          } catch (error) {
            console.error(
              `Error analyzing ${documentType} for ${student.name}:`,
              error
            )
            documentAnalysisResults.push({
              id: student.id,
              name: student.name,
              score: 0,
              success: false,
              analysisType: `${documentType.toUpperCase()} Analysis`,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
            completedDocumentAnalysis++
          }
        }
      }

      // Combine profile analysis and document analysis results
      const finalResults = [
        ...results.results.map((result) => {
          const student = pendingStudents.find((s) => s.id === result.id)
          return {
            id: result.id,
            name: student?.name || 'Unknown Student',
            score: result.score,
            success: result.success,
            analysisType: result.analysisType,
          }
        }),
        ...documentAnalysisResults,
      ]

      // Calculate total success/failure counts including document analysis
      const totalSuccess = finalResults.filter((r) => r.success).length
      const totalFailed = finalResults.filter((r) => !r.success).length

      setProgressData((prev) => ({
        ...prev,
        completedItems: totalItems,
        results: finalResults,
        successCount: totalSuccess,
        failedCount: totalFailed,
        isComplete: true,
      }))

      // Refresh the students data with a small delay to ensure database updates are reflected
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const bulkResponse = await fetch('/api/students')
      if (!bulkResponse.ok) {
        throw new Error('Failed to fetch students')
      }
      const bulkData = await bulkResponse.json()
      const profiles = bulkData.map(transformStudentToProfile)

      setStudents(profiles)

      // Show success toast
      if (totalSuccess > 0) {
        addToast({
          title: 'Analysis Complete!',
          description: `Successfully analyzed ${totalSuccess} items (profiles and documents) with AI`,
          variant: 'success',
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 5000,
        })
      } else {
        addToast({
          title: 'Analysis Failed',
          description:
            'No items were successfully analyzed. Check the progress modal for details.',
          variant: 'destructive',
          icon: <XCircle className="h-4 w-4" />,
        })
      }
    } catch (error) {
      console.error('Error in bulk validation:', error)

      // Clear interval if it exists

      setProgressData((prev) => ({
        ...prev,
        isComplete: true,
        failedCount: totalItems,
      }))

      addToast({
        title: 'Analysis Error',
        description: `Error during analysis: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setValidating(null)
    }
  }

  const handleApproveStudent = async (studentId: string) => {
    try {
      // Update student status
      await clientDataService.updateStudentStatus(studentId, 'approved')

      // Update local state
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, status: 'approved' } : s))
      )

      // Find the student to get their details for email
      const student = students.find((s) => s.id === studentId)
      if (student) {
        // Send email notification
        try {
          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'profile_approval',
              students: [{ name: student.name, email: student.email }],
            }),
          })

          if (emailResponse.ok) {
            addToast({
              title: 'Student Approved & Notified!',
              description: `${student.name} has been approved and notified via email`,
              variant: 'success',
              icon: <CheckCircle className="h-4 w-4" />,
            })
          } else {
            addToast({
              title: 'Student Approved',
              description: `${student.name} has been approved, but email notification failed`,
              variant: 'warning',
              icon: <AlertTriangle className="h-4 w-4" />,
            })
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError)
          addToast({
            title: 'Student Approved',
            description: `${student.name} has been approved, but email notification failed`,
            variant: 'warning',
            icon: <AlertTriangle className="h-4 w-4" />,
          })
        }
      }
    } catch (error) {
      console.error('Error approving student:', error)
      addToast({
        title: 'Approval Failed',
        description: 'Failed to approve student. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    }
  }

  const handleRejectStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      setStudentToReject(student)
      setShowRejectionDialog(true)
    }
  }

  const handleConfirmRejection = async (rejectionReasons: string[]) => {
    if (!studentToReject) return

    setIsRejecting(true)
    try {
      // Update student status
      await clientDataService.updateStudentStatus(
        studentToReject.id,
        'rejected'
      )
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentToReject.id ? { ...s, status: 'rejected' } : s
        )
      )

      // Send rejection email
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'profile_rejection',
            students: [
              {
                name: studentToReject.name,
                email: studentToReject.email,
                reasons: rejectionReasons,
              },
            ],
          }),
        })

        if (response.ok) {
          addToast({
            title: 'Student Rejected',
            description: `${studentToReject.name} has been rejected and notified via email`,
            variant: 'default',
            icon: <XCircle className="h-4 w-4" />,
          })
        } else {
          addToast({
            title: 'Student Rejected',
            description: `${studentToReject.name} has been rejected, but email notification failed`,
            variant: 'warning',
            icon: <AlertTriangle className="h-4 w-4" />,
          })
        }
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError)
        addToast({
          title: 'Student Rejected',
          description: `${studentToReject.name} has been rejected, but email notification failed`,
          variant: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
        })
      }
    } catch (error) {
      console.error('Error rejecting student:', error)
      addToast({
        title: 'Rejection Failed',
        description: 'Failed to reject student. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setIsRejecting(false)
      setShowRejectionDialog(false)
      setStudentToReject(null)
    }
  }

  const handleViewDetails = (studentId: string) => {
    // Find the student
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    setSelectedStudent(student)
    setShowDetailsModal(true)
  }

  // Update selectedStudent when students data changes (after AI analysis)
  useEffect(() => {
    if (selectedStudent && showDetailsModal) {
      const updatedStudent = students.find((s) => s.id === selectedStudent.id)
      if (updatedStudent) {
        setSelectedStudent(updatedStudent)
      }
    }
  }, [students, selectedStudent, showDetailsModal])

  // Refresh selectedStudent data when modal opens
  const handleModalOpen = () => {
    if (selectedStudent) {
      const updatedStudent = students.find((s) => s.id === selectedStudent.id)
      if (updatedStudent) {
        setSelectedStudent(updatedStudent)
      }
    }
  }

  const handleBulkApprove = async () => {
    // Find students eligible for bulk approval
    const eligibleStudents = students.filter((student) => {
      // Must be pending status
      if (student.status !== 'pending') return false

      // Must have document analysis score (CV or academic records)
      if (
        !student.cv_analysis_score &&
        !student.academic_records_analysis_score
      )
        return false

      // Must have high enough score (7 or higher out of 10)
      // API uses 0-10 scale: 7 = 7.0/10, 8 = 8.0/10, etc.
      if (student.aiScore < 7) return false

      // Must be eligible (no eligibility issues)
      if (!student.eligibility?.isEligible) return false

      return true
    })

    if (eligibleStudents.length === 0) {
      addToast({
        title: 'No Eligible Students',
        description:
          'No students found with high enough AI scores for bulk approval.',
        variant: 'destructive',
        icon: <AlertTriangle className="h-4 w-4" />,
      })
      return
    }

    try {
      setValidating('bulk-approve')

      // Show progress modal with email notification step
      setProgressData({
        title: 'Bulk Approval & Email Notifications',
        description: `Approving ${eligibleStudents.length} students and sending email notifications`,
        totalItems: eligibleStudents.length * 2, // Approve + Email
        completedItems: 0,
        results: [],
        isComplete: false,
        successCount: 0,
        failedCount: 0,
      })
      setShowProgressModal(true)

      let successCount = 0
      let failedCount = 0
      const results: Array<{
        id: string
        name: string
        score: number
        success: boolean
        analysisType: string
        error?: string
      }> = []

      const approvedStudents: Array<{ name: string; email: string }> = []

      // Step 1: Approve each student
      for (let i = 0; i < eligibleStudents.length; i++) {
        const student = eligibleStudents[i]

        try {
          setProgressData((prev) => ({
            ...prev,
            completedItems: i + 0.5,
            description: `Approving ${student.name}...`,
          }))

          await clientDataService.updateStudentStatus(student.id, 'approved')

          setProgressData((prev) => ({
            ...prev,
            completedItems: i + 1,
            description: `Approved ${student.name}`,
          }))

          results.push({
            id: student.id,
            name: student.name,
            score: student.aiScore,
            success: true,
            analysisType: 'Profile Approval',
          })

          // Add to approved students list for email notifications
          approvedStudents.push({
            name: student.name,
            email: student.email,
          })

          successCount++
        } catch (error) {
          console.error(`Error approving ${student.name}:`, error)
          results.push({
            id: student.id,
            name: student.name,
            score: student.aiScore,
            success: false,
            analysisType: 'Profile Approval',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          failedCount++
        }
      }

      // Step 2: Send email notifications to approved students
      if (approvedStudents.length > 0) {
        setProgressData((prev) => ({
          ...prev,
          description: `Sending email notifications to ${approvedStudents.length} students...`,
        }))

        try {
          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'profile_approval',
              students: approvedStudents,
            }),
          })

          if (emailResponse.ok) {
            const emailResult = await emailResponse.json()

            // Add email results to progress
            setProgressData((prev) => ({
              ...prev,
              completedItems: eligibleStudents.length + approvedStudents.length,
              description: `Sent ${emailResult.result.successCount} email notifications successfully`,
            }))

            // Add email results to the results array
            approvedStudents.forEach((student, index) => {
              const emailSuccess = index < emailResult.result.successCount
              results.push({
                id: `email-${student.email}`,
                name: student.name,
                score: 100,
                success: emailSuccess,
                analysisType: 'Email Notification',
                error: emailSuccess ? undefined : 'Email sending failed',
              })
            })

            addToast({
              title: 'Email Notifications Sent!',
              description: `Successfully sent ${emailResult.result.successCount} email notifications to approved students`,
              variant: 'success',
              icon: <CheckCircle className="h-4 w-4" />,
              duration: 5000,
            })

            if (emailResult.result.failedCount > 0) {
              addToast({
                title: 'Some Emails Failed',
                description: `${emailResult.result.failedCount} email notifications could not be sent. Check the progress modal for details.`,
                variant: 'destructive',
                icon: <XCircle className="h-4 w-4" />,
              })
            }
          } else {
            throw new Error('Failed to send email notifications')
          }
        } catch (emailError) {
          console.error('Error sending email notifications:', emailError)

          // Add failed email results
          approvedStudents.forEach((student) => {
            results.push({
              id: `email-${student.email}`,
              name: student.name,
              score: 0,
              success: false,
              analysisType: 'Email Notification',
              error:
                emailError instanceof Error
                  ? emailError.message
                  : 'Unknown error',
            })
          })

          addToast({
            title: 'Email Notifications Failed',
            description:
              'Profile approvals were successful, but email notifications failed to send.',
            variant: 'destructive',
            icon: <XCircle className="h-4 w-4" />,
          })
        }
      }

      // Update local state
      setStudents((prev) =>
        prev.map((s) => {
          const eligibleStudent = eligibleStudents.find((es) => es.id === s.id)
          return eligibleStudent ? { ...s, status: 'approved' as const } : s
        })
      )

      // Complete progress
      setProgressData((prev) => ({
        ...prev,
        completedItems: eligibleStudents.length * 2,
        results,
        successCount: results.filter((r) => r.success).length,
        failedCount: results.filter((r) => !r.success).length,
        isComplete: true,
        description: `Completed: ${
          results.filter((r) => r.success).length
        } successful operations`,
      }))

      // Show final success toast
      if (successCount > 0) {
        addToast({
          title: 'Bulk Approval Complete!',
          description: `Successfully approved ${successCount} students and sent email notifications`,
          variant: 'success',
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 5000,
        })
      }

      if (failedCount > 0) {
        addToast({
          title: 'Some Operations Failed',
          description: `${failedCount} operations failed. Check the progress modal for details.`,
          variant: 'destructive',
          icon: <XCircle className="h-4 w-4" />,
        })
      }
    } catch (error) {
      console.error('Error during bulk approval:', error)
      addToast({
        title: 'Bulk Approval Failed',
        description:
          'An error occurred during bulk approval. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setValidating(null)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesFilter =
      filterStatus === 'all' || student.status === filterStatus

    const matchesEligibility =
      filterEligibility === 'all' ||
      (student.eligibility &&
        ((filterEligibility === 'eligible' &&
          student.eligibility.isEligible &&
          student.eligibility.warnings.length === 0) ||
          (filterEligibility === 'warning' &&
            student.eligibility.isEligible &&
            student.eligibility.warnings.length > 0) ||
          (filterEligibility === 'ineligible' &&
            !student.eligibility.isEligible))) ||
      (!student.eligibility && filterEligibility === 'all')

    return matchesSearch && matchesFilter && matchesEligibility
  })

  const pendingCount = students.filter((s) => s.status === 'pending').length
  const approvedCount = students.filter((s) => s.status === 'approved').length

  // Count students eligible for bulk approval
  const bulkApproveEligibleCount = students.filter((student) => {
    if (student.status !== 'pending') return false
    if (!student.cv_analysis_score && !student.academic_records_analysis_score)
      return false
    if (student.aiScore < 7) return false
    if (!student.eligibility?.isEligible) return false
    return true
  }).length
  const averageScore =
    students.length > 0
      ? Math.round(
          (students.reduce((sum, s) => sum + s.aiScore, 0) / students.length) *
            10
        )
      : 0

  // Eligibility statistics
  const eligibleCount = students.filter(
    (s) => s.eligibility?.isEligible && s.eligibility.warnings.length === 0
  ).length
  const ineligibleCount = students.filter(
    (s) => s.eligibility && !s.eligibility.isEligible
  ).length
  const warningCount = students.filter(
    (s) => s.eligibility?.isEligible && s.eligibility.warnings.length > 0
  ).length

  if (loading) {
    return (
      <div className="space-y-6">
        <ProfileHeaderSkeleton />
        <MetricsCardsSkeleton />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              </div>
              <SearchFilterSkeleton />
              <StudentListSkeleton count={6} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 p-8 border border-purple-100/50 dark:border-purple-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10" />
        <div className="relative flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Student Profile Validator
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Automatically validate student profiles and analyze
                  CV/academic records using advanced AI analysis
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
              onClick={handleBulkValidate}
              disabled={pendingCount === 0 || validating === 'bulk'}
            >
              {validating === 'bulk' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              {validating === 'bulk'
                ? 'Running AI Analysis...'
                : 'Run AI Analysis'}
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
              onClick={handleBulkApprove}
              disabled={
                bulkApproveEligibleCount === 0 || validating === 'bulk-approve'
              }
            >
              {validating === 'bulk-approve' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {validating === 'bulk-approve'
                ? 'Approving Students...'
                : `Bulk Approve (${bulkApproveEligibleCount})`}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {pendingCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Awaiting analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {approvedCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Ready to match
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg AI Score
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {averageScore}%
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  AI quality rating
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Profiles
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {students.length}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  In system
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Eligible Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {eligibleCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Current students & recent graduates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Warning
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {warningCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Close to limit
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
                  Ineligible
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {ineligibleCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Not current student or recent graduate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search students by name, university, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4" />
                <span>Filter:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-48 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 px-4 py-3 text-sm font-medium text-foreground"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={filterEligibility}
                onChange={(e) => setFilterEligibility(e.target.value)}
                className="w-48 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 px-4 py-3 text-sm font-medium text-foreground"
              >
                <option value="all">All Eligibility</option>
                <option value="eligible">
                  ✅ Current Students & Recent Graduates
                </option>
                <option value="warning">⚠️ Close to Limit</option>
                <option value="ineligible">❌ Not Eligible</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Profiles */}
      <div className="space-y-4">
        {filteredStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onValidate={handleValidateStudent}
            onApprove={handleApproveStudent}
            onReject={handleRejectStudent}
            onViewDetails={handleViewDetails}
            onAnalyzeDocuments={handleAnalyzeDocuments}
            isValidating={validating === student.id}
          />
        ))}
      </div>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title={progressData.title}
        description={progressData.description}
        totalItems={progressData.totalItems}
        completedItems={progressData.completedItems}
        results={progressData.results}
        isComplete={progressData.isComplete}
        successCount={progressData.successCount}
        failedCount={progressData.failedCount}
      />

      {/* Student Details Modal */}
      <Dialog
        open={showDetailsModal}
        onOpenChange={(open) => {
          setShowDetailsModal(open)
          if (open) {
            handleModalOpen()
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Student Details
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete profile information and analysis
                </p>
              </div>
            </div>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-8">
              {/* Basic Information Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Basic Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Full Name
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedStudent.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Email Address
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedStudent.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        University
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedStudent.university}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Degree Program
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedStudent.degree}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Graduation Year
                      </label>
                      <div className="flex items-center space-x-2">
                        <p className="text-foreground font-medium">
                          {selectedStudent.graduation_year}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {selectedStudent.graduation_year >=
                          new Date().getFullYear()
                            ? 'Current Student'
                            : 'Graduate'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Location
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedStudent.location}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Application Status
                      </label>
                      <Badge
                        variant={
                          selectedStudent.status === 'approved'
                            ? 'default'
                            : selectedStudent.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="font-semibold"
                      >
                        {selectedStudent.status.charAt(0).toUpperCase() +
                          selectedStudent.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">
                        Availability
                      </label>
                      <p className="text-foreground font-medium capitalize">
                        {selectedStudent.availability.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility Status Card */}
              {selectedStudent.eligibility && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div
                        className={`p-2 rounded-lg ${
                          selectedStudent.eligibility.isEligible
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {selectedStudent.eligibility.isEligible ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Eligibility Status
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <EligibilityStatus
                          eligibility={selectedStudent.eligibility}
                        />
                        {selectedStudent.eligibility.monthsSinceGraduation !==
                          undefined &&
                          selectedStudent.eligibility.monthsSinceGraduation >
                            0 && (
                            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                              {
                                selectedStudent.eligibility
                                  .monthsSinceGraduation
                              }{' '}
                              months since graduation
                            </div>
                          )}
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-3">
                          <span className="font-semibold text-foreground">
                            Reason:
                          </span>{' '}
                          {selectedStudent.eligibility.reason}
                        </div>

                        {selectedStudent.eligibility.warnings.length > 0 && (
                          <div className="border-t pt-3">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                              Warnings
                            </h4>
                            <ul className="space-y-2">
                              {selectedStudent.eligibility.warnings.map(
                                (warning, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-amber-700 flex items-start bg-amber-50 p-3 rounded-lg"
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                                    {warning}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Skills Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Skills & Expertise
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedStudent.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="font-medium px-4 py-2 bg-background border-border hover:bg-muted/50 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bio Card */}
              {selectedStudent.bio && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Personal Bio
                      </h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedStudent.bio}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Links Card */}
              {(selectedStudent.linkedin_url ||
                selectedStudent.github_url ||
                selectedStudent.portfolio_url) && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        External Links
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStudent.linkedin_url && (
                        <div className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-sm">
                                in
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                LinkedIn
                              </p>
                              <a
                                href={selectedStudent.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                              >
                                View Profile
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedStudent.github_url && (
                        <div className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                              <span className="text-muted-foreground font-bold text-sm">
                                GH
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                GitHub
                              </p>
                              <a
                                href={selectedStudent.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                              >
                                View Profile
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedStudent.portfolio_url && (
                        <div className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-sm">
                                P
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                Portfolio
                              </p>
                              <a
                                href={selectedStudent.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                              >
                                View Portfolio
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Documents
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* CV Document */}
                    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="text-md font-semibold text-foreground">
                            CV Document
                          </h4>
                        </div>
                        {selectedStudent.cv_analysis_score && (
                          <Badge
                            variant={
                              selectedStudent.cv_analysis_score >= 7
                                ? 'default'
                                : selectedStudent.cv_analysis_score >= 5
                                ? 'secondary'
                                : 'destructive'
                            }
                            className="font-semibold"
                          >
                            {Math.round(
                              selectedStudent.cv_analysis_score * 10
                            ) / 10}
                            /10
                          </Badge>
                        )}
                      </div>

                      {selectedStudent.cv_url ? (
                        <div className="space-y-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 justify-start"
                              onClick={() =>
                                window.open(selectedStudent.cv_url, '_blank')
                              }
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View CV Document
                            </Button>
                          </div>

                          {selectedStudent.cv_analysis_notes && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                                <Bot className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                AI Analysis
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {selectedStudent.cv_analysis_notes}
                              </p>
                            </div>
                          )}

                          {selectedStudent.documents_analyzed_at && (
                            <p className="text-xs text-muted-foreground text-center">
                              Analyzed:{' '}
                              {new Date(
                                selectedStudent.documents_analyzed_at
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            No CV uploaded
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Academic Records Document */}
                    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h4 className="text-md font-semibold text-foreground">
                            Academic Records
                          </h4>
                        </div>
                        {selectedStudent.academic_records_analysis_score && (
                          <Badge
                            variant={
                              selectedStudent.academic_records_analysis_score >=
                              7
                                ? 'default'
                                : selectedStudent.academic_records_analysis_score >=
                                  5
                                ? 'secondary'
                                : 'destructive'
                            }
                            className="font-semibold"
                          >
                            {Math.round(
                              selectedStudent.academic_records_analysis_score *
                                10
                            ) / 10}
                            /10
                          </Badge>
                        )}
                      </div>

                      {selectedStudent.academic_records_url ? (
                        <div className="space-y-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 justify-start"
                              onClick={() =>
                                window.open(
                                  selectedStudent.academic_records_url,
                                  '_blank'
                                )
                              }
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Academic Records
                            </Button>
                          </div>

                          {selectedStudent.academic_records_analysis_notes && (
                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                              <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                                <Bot className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                                AI Analysis
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {
                                  selectedStudent.academic_records_analysis_notes
                                }
                              </p>
                            </div>
                          )}

                          {selectedStudent.documents_analyzed_at && (
                            <p className="text-xs text-muted-foreground text-center">
                              Analyzed:{' '}
                              {new Date(
                                selectedStudent.documents_analyzed_at
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            No academic records uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* AI Analysis Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      AI Analysis
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">
                          Comprehensive AI Score
                        </label>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-2 cursor-help">
                                <span className="text-lg font-bold text-foreground">
                                  {selectedStudent.ai_validation_score !==
                                    undefined &&
                                  selectedStudent.ai_validation_score !== null
                                    ? `${
                                        Math.round(
                                          selectedStudent.ai_validation_score *
                                            10
                                        ) / 10
                                      }/10`
                                    : 'Not analyzed'}
                                </span>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs"
                            >
                              <div>
                                <p className="font-semibold mb-2">
                                  Score Breakdown
                                </p>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    • CV Analysis:{' '}
                                    {selectedStudent.cv_analysis_score
                                      ? `${
                                          Math.round(
                                            selectedStudent.cv_analysis_score *
                                              10
                                          ) / 10
                                        }/10`
                                      : 'Not analyzed'}
                                  </p>
                                  <p>
                                    • Academic Records:{' '}
                                    {selectedStudent.academic_records_analysis_score
                                      ? `${
                                          Math.round(
                                            selectedStudent.academic_records_analysis_score *
                                              10
                                          ) / 10
                                        }/10`
                                      : 'Not analyzed'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Score based on institution, major, and
                                    graduation year matching
                                  </p>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="space-y-2">
                        <Progress
                          value={
                            selectedStudent.ai_validation_score
                              ? selectedStudent.ai_validation_score * 10
                              : 0
                          }
                          className="h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">
                          Profile Completeness
                        </label>
                        <span className="text-lg font-bold text-foreground">
                          {selectedStudent.completeness}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Progress
                          value={selectedStudent.completeness}
                          className="h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Incomplete</span>
                          <span>Complete</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Analysis Scores */}
                  {(selectedStudent.cv_analysis_score ||
                    selectedStudent.academic_records_analysis_score) && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-purple-600" />
                        Document Analysis Scores
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedStudent.cv_analysis_score && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-muted-foreground">
                                CV Analysis Score
                              </label>
                              <span className="text-lg font-bold text-foreground">
                                {Math.round(
                                  selectedStudent.cv_analysis_score * 10
                                ) / 10}
                                /10
                              </span>
                            </div>
                            <div className="space-y-2">
                              <Progress
                                value={selectedStudent.cv_analysis_score * 10}
                                className="h-3"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Poor</span>
                                <span>Excellent</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedStudent.academic_records_analysis_score && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-muted-foreground">
                                Academic Records Score
                              </label>
                              <span className="text-lg font-bold text-foreground">
                                {Math.round(
                                  selectedStudent.academic_records_analysis_score *
                                    10
                                ) / 10}
                                /10
                              </span>
                            </div>
                            <div className="space-y-2">
                              <Progress
                                value={
                                  selectedStudent.academic_records_analysis_score *
                                  10
                                }
                                className="h-3"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Poor</span>
                                <span>Excellent</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Comprehensive AI Analysis Results */}
                  {(selectedStudent.aiNotes.length > 0 ||
                    selectedStudent.cv_analysis_notes ||
                    selectedStudent.academic_records_analysis_notes) && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                        <Bot className="w-4 h-4 mr-2 text-purple-600" />
                        Detailed AI Analysis Results
                      </h4>
                      <div className="space-y-4">
                        {/* Profile Analysis */}
                        {selectedStudent.aiNotes.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <div className="p-1 bg-blue-500 dark:bg-blue-400 rounded-full mr-3">
                                <User className="w-3 h-3 text-white" />
                              </div>
                              <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                Document Analysis
                              </h5>
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                              >
                                GPT-4
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {selectedStudent.aiNotes.map((note, index) => (
                                <div
                                  key={index}
                                  className="flex items-start"
                                >
                                  <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                                    {note}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CV Analysis */}
                        {selectedStudent.cv_analysis_notes && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <div className="p-1 bg-green-500 dark:bg-green-400 rounded-full mr-3">
                                <FileText className="w-3 h-3 text-white" />
                              </div>
                              <h5 className="text-sm font-semibold text-green-700 dark:text-green-300">
                                CV Analysis
                              </h5>
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                              >
                                GPT-4
                              </Badge>
                              {selectedStudent.cv_analysis_score && (
                                <div className="ml-auto flex items-center">
                                  <span className="text-xs text-green-600 dark:text-green-400 mr-2">
                                    Score:
                                  </span>
                                  <span className="text-sm font-bold text-green-700 dark:text-green-300">
                                    {Math.round(
                                      selectedStudent.cv_analysis_score * 10
                                    ) / 10}
                                    /10
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              {selectedStudent.cv_analysis_notes
                                .split('; ')
                                .map((note, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start"
                                  >
                                    <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <p className="text-sm text-green-600 dark:text-green-400 leading-relaxed">
                                      {note}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Academic Records Analysis */}
                        {selectedStudent.academic_records_analysis_score !==
                          null &&
                          selectedStudent.academic_records_analysis_score !==
                            undefined && (
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                              <div className="flex items-center mb-3">
                                <div className="p-1 bg-purple-500 dark:bg-purple-400 rounded-full mr-3">
                                  <GraduationCap className="w-3 h-3 text-white" />
                                </div>
                                <h5 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                  Academic Records Analysis
                                </h5>
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  GPT-4
                                </Badge>
                                {selectedStudent.academic_records_analysis_score && (
                                  <div className="ml-auto flex items-center">
                                    <span className="text-xs text-purple-600 dark:text-purple-400 mr-2">
                                      Score:
                                    </span>
                                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                                      {Math.round(
                                        selectedStudent.academic_records_analysis_score *
                                          10
                                      ) / 10}
                                      /10
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                {selectedStudent.academic_records_analysis_notes &&
                                selectedStudent.academic_records_analysis_notes.trim() !==
                                  '' ? (
                                  selectedStudent
                                    .academic_records_analysis_notes!.split(
                                      '; '
                                    )
                                    .map((note, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start"
                                      >
                                        <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <p className="text-sm text-purple-600 dark:text-purple-400 leading-relaxed">
                                          {note}
                                        </p>
                                      </div>
                                    ))
                                ) : (
                                  <div className="flex items-start">
                                    <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div className="text-sm text-purple-600 dark:text-purple-400 leading-relaxed">
                                      {generateValidationCriteriaDetails(
                                        selectedStudent
                                      )
                                        .split('; ')
                                        .map((criterion, index) => (
                                          <div
                                            key={index}
                                            className="mb-1"
                                          >
                                            {criterion}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <RejectionDialog
        isOpen={showRejectionDialog}
        onClose={() => {
          setShowRejectionDialog(false)
          setStudentToReject(null)
        }}
        onConfirm={handleConfirmRejection}
        studentName={studentToReject?.name || ''}
        isLoading={isRejecting}
      />
    </div>
  )
}
