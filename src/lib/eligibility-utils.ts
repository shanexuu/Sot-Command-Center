// Eligibility validation utilities for Summer of Tech program
// Ensures only students graduated less than 12 months ago from NZ tertiary institutions are eligible

export interface EligibilityResult {
  isEligible: boolean
  reason: string
  graduationDate?: Date
  monthsSinceGraduation?: number
  isNZInstitution?: boolean
  warnings: string[]
}

// List of recognized NZ tertiary institutions
const NZ_TERTIARY_INSTITUTIONS = [
  // Universities
  'University of Auckland',
  'Auckland University of Technology',
  'University of Waikato',
  'Massey University',
  'Victoria University of Wellington',
  'University of Canterbury',
  'Lincoln University',
  'University of Otago',
  'University of New Zealand',

  // Polytechnics and Institutes of Technology
  'Ara Institute of Canterbury',
  'Eastern Institute of Technology',
  'Manukau Institute of Technology',
  'Nelson Marlborough Institute of Technology',
  'NorthTec',
  'Open Polytechnic of New Zealand',
  'Otago Polytechnic',
  'Southern Institute of Technology',
  'Tai Poutini Polytechnic',
  'Toi Ohomai Institute of Technology',
  'Unitec Institute of Technology',
  'Universal College of Learning',
  'Waikato Institute of Technology',
  'Wellington Institute of Technology',
  'Whitireia Community Polytechnic',

  // Alternative names and variations
  'AUT',
  'UoA',
  'VUW',
  'UC',
  'UOC',
  'Massey',
  'Waikato University',
  'Canterbury University',
  'Otago University',
  'Lincoln',
  'Ara',
  'EIT',
  'MIT',
  'NMIT',
  'SIT',
  'Toi Ohomai',
  'Unitec',
  'UCOL',
  'WINTEC',
  'WelTec',
  'Whitireia',
]

// Check if a university name matches NZ tertiary institutions
export function isNZTertiaryInstitution(university: string): boolean {
  if (!university) return false

  const normalizedUniversity = university.toLowerCase().trim()

  return NZ_TERTIARY_INSTITUTIONS.some(
    (institution) =>
      normalizedUniversity.includes(institution.toLowerCase()) ||
      institution.toLowerCase().includes(normalizedUniversity)
  )
}

// Calculate months between two dates
export function getMonthsBetween(date1: Date, date2: Date): number {
  const yearDiff = date2.getFullYear() - date1.getFullYear()
  const monthDiff = date2.getMonth() - date1.getMonth()
  return yearDiff * 12 + monthDiff
}

// Validate academic records against profile information
export function validateAcademicRecordsAlignment(
  academicRecordsData: {
    university?: string
    graduationYear?: number
  },
  profileData: {
    university: string
    graduation_year: number
  }
): {
  isAligned: boolean
  alignmentScore: number
  warnings: string[]
  mismatches: string[]
} {
  const warnings: string[] = []
  const mismatches: string[] = []
  let alignmentScore = 10 // Start with perfect score

  // Check university alignment
  if (academicRecordsData.university && profileData.university) {
    const academicUni = academicRecordsData.university.toLowerCase().trim()
    const profileUni = profileData.university.toLowerCase().trim()

    // Check for exact match or partial match
    if (academicUni === profileUni) {
      // Perfect match
    } else if (
      academicUni.includes(profileUni) ||
      profileUni.includes(academicUni) ||
      // Check for common university name variations
      (academicUni.includes('university') &&
        profileUni.includes('university')) ||
      (academicUni.includes('institute') && profileUni.includes('institute'))
    ) {
      // Partial match - reduce score slightly
      alignmentScore -= 1
      warnings.push(
        'University names have minor variations between academic records and profile'
      )
    } else {
      // No match - significant penalty
      alignmentScore -= 5
      mismatches.push(
        `University mismatch: Academic records show "${academicRecordsData.university}" but profile shows "${profileData.university}"`
      )
    }
  } else {
    alignmentScore -= 3
    warnings.push(
      'University information missing in academic records or profile'
    )
  }

  // Check graduation year alignment
  if (academicRecordsData.graduationYear && profileData.graduation_year) {
    const yearDiff = Math.abs(
      academicRecordsData.graduationYear - profileData.graduation_year
    )

    if (yearDiff === 0) {
      // Perfect match
    } else if (yearDiff === 1) {
      // Close match - minor penalty
      alignmentScore -= 1
      warnings.push(
        'Graduation year has minor discrepancy between academic records and profile'
      )
    } else {
      // Significant mismatch
      alignmentScore -= 4
      mismatches.push(
        `Graduation year mismatch: Academic records show ${academicRecordsData.graduationYear} but profile shows ${profileData.graduation_year}`
      )
    }
  } else {
    alignmentScore -= 2
    warnings.push('Graduation year missing in academic records or profile')
  }

  // Ensure score doesn't go below 0
  alignmentScore = Math.max(0, alignmentScore)

  const isAligned = alignmentScore >= 7 && mismatches.length === 0

  return {
    isAligned,
    alignmentScore,
    warnings,
    mismatches,
  }
}

// Parse academic records to extract graduation information
export function parseAcademicRecords(academicRecordsAnalysis: {
  summary?: string
  graduationYear?: number
  university?: string
  degree?: string
  graduationDate?: string
  isCurrentStudent?: boolean
  warnings?: string[]
}): {
  graduationYear?: number
  university?: string
  degree?: string
  graduationDate?: Date
  isCurrentStudent?: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  if (!academicRecordsAnalysis) {
    return { warnings: ['No academic records analysis available'] }
  }

  const analysis = academicRecordsAnalysis
  let graduationYear: number | undefined = analysis.graduationYear
  const university: string | undefined = analysis.university
  const degree: string | undefined = analysis.degree
  let graduationDate: Date | undefined
  let isCurrentStudent = analysis.isCurrentStudent || false

  // Parse graduation date if available
  if (analysis.graduationDate) {
    graduationDate = new Date(analysis.graduationDate)
  }

  // If we have a summary, try to extract additional information from it
  if (analysis.summary) {
    const summaryLower = analysis.summary.toLowerCase()
    if (
      summaryLower.includes('current') ||
      summaryLower.includes('studying') ||
      summaryLower.includes('enrolled') ||
      summaryLower.includes('expected')
    ) {
      isCurrentStudent = true
    }
  }

  // If no graduation year found, try to infer from current year
  if (!graduationYear) {
    const currentYear = new Date().getFullYear()
    if (isCurrentStudent) {
      graduationYear = currentYear + 1 // Assume graduating next year
    } else {
      graduationYear = currentYear // Assume graduating this year
    }
    warnings.push(
      'Graduation year not found in academic records, using estimated year'
    )
  }

  // If no university found, add warning
  if (!university) {
    warnings.push('University not clearly identified in academic records')
  }

  // If no degree found, add warning
  if (!degree) {
    warnings.push('Degree information not found in academic records')
  }

  return {
    graduationYear,
    university,
    degree,
    graduationDate,
    isCurrentStudent,
    warnings,
  }
}

// Check eligibility using academic records analysis
export function checkEligibilityFromAcademicRecords(
  academicRecordsAnalysis: {
    summary?: string
    graduationYear?: number
    university?: string
    degree?: string
    graduationDate?: string
    isCurrentStudent?: boolean
    warnings?: string[]
  },
  fallbackGraduationYear?: number,
  fallbackUniversity?: string,
  currentDate: Date = new Date()
): EligibilityResult & {
  parsedData: {
    graduationYear?: number
    university?: string
    degree?: string
    isCurrentStudent?: boolean
    warnings: string[]
  }
} {
  // Parse academic records
  const parsedData = parseAcademicRecords(academicRecordsAnalysis)

  // Use parsed data or fallback to provided values
  const graduationYear = parsedData.graduationYear || fallbackGraduationYear
  const university = parsedData.university || fallbackUniversity

  if (!graduationYear || !university) {
    return {
      isEligible: false,
      reason: 'Insufficient information to determine eligibility',
      isNZInstitution: false,
      warnings: [
        'Missing graduation year or university information',
        ...parsedData.warnings,
      ],
      parsedData,
    }
  }

  // Check eligibility using the parsed data
  console.log(
    `Academic records eligibility check: graduationYear=${graduationYear}, university=${university}`
  )
  const eligibilityResult = checkStudentEligibility(
    graduationYear,
    university,
    currentDate
  )

  // Combine warnings from parsing and eligibility checking
  const combinedWarnings = [
    ...parsedData.warnings,
    ...eligibilityResult.warnings,
  ]

  return {
    ...eligibilityResult,
    warnings: combinedWarnings,
    parsedData,
  }
}

// Check if a student is eligible based on graduation date and university
export function checkStudentEligibility(
  graduationYear: number,
  university: string,
  currentDate: Date = new Date()
): EligibilityResult {
  const warnings: string[] = []

  // Check if university is NZ tertiary institution
  const isNZInstitution = isNZTertiaryInstitution(university)

  if (!isNZInstitution) {
    return {
      isEligible: false,
      reason: 'Not a recognized NZ tertiary institution',
      isNZInstitution: false,
      warnings: [
        `University "${university}" is not recognized as a NZ tertiary institution`,
      ],
    }
  }

  // Check graduation year validity
  const currentYear = currentDate.getFullYear()

  // Ensure graduation year is a number
  const gradYear = Number(graduationYear)
  if (isNaN(gradYear)) {
    console.log(`❌ Invalid graduation year: ${graduationYear}`)
    return {
      isEligible: false,
      reason: 'Invalid graduation year',
      isNZInstitution: true,
      warnings: [`Graduation year "${graduationYear}" is not a valid number`],
    }
  }

  // Debug logging
  console.log(`🔍 Eligibility Check:`, {
    graduationYear: gradYear,
    currentYear,
    university,
    isNZInstitution,
    comparison: `${gradYear} >= ${currentYear} = ${gradYear >= currentYear}`,
    type: typeof gradYear,
  })

  // Allow current students (graduation year >= current year) and recent graduates
  if (gradYear < currentYear - 1) {
    console.log(
      `❌ Student ${gradYear} is too far in the past (more than 1 year ago)`
    )
    return {
      isEligible: false,
      reason: 'Graduation year is too far in the past',
      isNZInstitution: true,
      warnings: [`Graduation year ${gradYear} is more than 1 year in the past`],
    }
  }

  // If graduation year is in the future or current year (current student), they are eligible
  if (gradYear >= currentYear) {
    console.log(
      `✅ Student ${gradYear} is eligible (current or future student)`
    )
    return {
      isEligible: true,
      reason:
        gradYear === currentYear
          ? 'Currently studying at a recognized NZ tertiary institution (final year)'
          : 'Currently studying at a recognized NZ tertiary institution',
      graduationDate: new Date(gradYear, 11, 31),
      monthsSinceGraduation: 0, // Current student
      isNZInstitution: true,
      warnings: [], // Remove redundant warnings since reason already explains the status
    }
  }

  // Calculate graduation date (assume December graduation)
  const graduationDate = new Date(gradYear, 11, 31) // December 31st of graduation year
  const monthsSinceGraduation = getMonthsBetween(graduationDate, currentDate)

  // Check if graduated within 12 months
  if (monthsSinceGraduation > 12) {
    return {
      isEligible: false,
      reason: `Graduated ${monthsSinceGraduation} months ago (exceeds 12-month limit)`,
      graduationDate,
      monthsSinceGraduation,
      isNZInstitution: true,
      warnings: [
        `Student graduated ${monthsSinceGraduation} months ago, which exceeds the 12-month eligibility limit`,
      ],
    }
  }

  // Check if graduated in the future (invalid)
  if (monthsSinceGraduation < 0) {
    return {
      isEligible: false,
      reason: 'Graduation date is in the future',
      graduationDate,
      monthsSinceGraduation,
      isNZInstitution: true,
      warnings: ['Graduation date cannot be in the future'],
    }
  }

  // Add warnings for students close to the limit
  if (monthsSinceGraduation >= 10) {
    warnings.push(
      `Student is close to the 12-month eligibility limit (${monthsSinceGraduation} months since graduation)`
    )
  }

  // Add warnings for recent graduates
  if (monthsSinceGraduation <= 1) {
    warnings.push(
      'Student is a very recent graduate - verify graduation status'
    )
  }

  return {
    isEligible: true,
    reason: `Eligible - graduated ${monthsSinceGraduation} months ago from NZ tertiary institution`,
    graduationDate,
    monthsSinceGraduation,
    isNZInstitution: true,
    warnings,
  }
}

// Get eligibility status for display
export function getEligibilityStatus(eligibility: EligibilityResult): {
  status: 'eligible' | 'ineligible' | 'warning'
  color: string
  icon: string
} {
  if (eligibility.isEligible) {
    if (eligibility.warnings.length > 0) {
      return {
        status: 'warning',
        color: 'text-yellow-600 bg-yellow-100',
        icon: '⚠️',
      }
    }
    return {
      status: 'eligible',
      color: 'text-green-600 bg-green-100',
      icon: '✅',
    }
  }

  return {
    status: 'ineligible',
    color: 'text-red-600 bg-red-100',
    icon: '❌',
  }
}

// Format eligibility reason for display
export function formatEligibilityReason(
  eligibility: EligibilityResult
): string {
  let reason = eligibility.reason

  if (eligibility.monthsSinceGraduation !== undefined) {
    if (eligibility.monthsSinceGraduation === 0) {
      reason += ' (currently studying)'
    } else {
      reason += ` (${eligibility.monthsSinceGraduation} months since graduation)`
    }
  }

  if (eligibility.warnings.length > 0) {
    reason += `\n\nWarnings:\n${eligibility.warnings
      .map((w) => `• ${w}`)
      .join('\n')}`
  }

  return reason
}

// Validate multiple students for eligibility
export function validateStudentsEligibility(
  students: Array<{
    id: string
    graduation_year: number
    university: string
    first_name: string
    last_name: string
  }>
): Array<{
  studentId: string
  studentName: string
  eligibility: EligibilityResult
}> {
  return students.map((student) => ({
    studentId: student.id,
    studentName: `${student.first_name} ${student.last_name}`,
    eligibility: checkStudentEligibility(
      student.graduation_year,
      student.university
    ),
  }))
}

// Get eligibility statistics
export function getEligibilityStats(
  eligibilityResults: Array<{
    studentId: string
    studentName: string
    eligibility: EligibilityResult
  }>
): {
  total: number
  eligible: number
  ineligible: number
  warnings: number
  eligiblePercentage: number
} {
  const total = eligibilityResults.length
  const eligible = eligibilityResults.filter(
    (r) => r.eligibility.isEligible && r.eligibility.warnings.length === 0
  ).length
  const ineligible = eligibilityResults.filter(
    (r) => !r.eligibility.isEligible
  ).length
  const warnings = eligibilityResults.filter(
    (r) => r.eligibility.isEligible && r.eligibility.warnings.length > 0
  ).length

  return {
    total,
    eligible,
    ineligible,
    warnings,
    eligiblePercentage: total > 0 ? Math.round((eligible / total) * 100) : 0,
  }
}
