import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, students } = body

    if (!type || !students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Invalid request. Type and students array are required.' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'profile_approval':
        const result = await EmailService.sendBulkProfileApprovalNotifications(
          students.map((student: { name: string; email: string }) => ({
            name: student.name,
            email: student.email,
          }))
        )

        return NextResponse.json({
          success: true,
          message: `Email notifications sent successfully`,
          result: {
            successCount: result.successCount,
            failedCount: result.failedCount,
            errors: result.errors,
          },
        })

      case 'profile_rejection':
        const rejectionResult =
          await EmailService.sendBulkProfileRejectionNotifications(
            students.map(
              (student: {
                name: string
                email: string
                reasons: string[]
              }) => ({
                name: student.name,
                email: student.email,
                reasons: student.reasons,
              })
            )
          )

        return NextResponse.json({
          success: true,
          message: `Rejection email notifications sent successfully`,
          result: {
            successCount: rejectionResult.successCount,
            failedCount: rejectionResult.failedCount,
            errors: rejectionResult.errors,
          },
        })

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in send-email API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Test email configuration endpoint
export async function GET() {
  try {
    const isValid = await EmailService.testEmailConfiguration()

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Email configuration is valid',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Email configuration is invalid',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error testing email configuration:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error testing email configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
