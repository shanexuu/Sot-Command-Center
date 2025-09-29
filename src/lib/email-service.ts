import nodemailer from 'nodemailer'

// Email configuration for Zoho Mail
const emailConfig = {
  host: 'smtp.zoho.com.au',
  port: 587, // TLS port
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.ZOHO_EMAIL_USER || 'hello@yun-xu.com',
    pass: process.env.ZOHO_EMAIL_PASSWORD || '', // This should be set in environment variables
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
    ciphers: 'SSLv3',
  },
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

// Email templates
export const emailTemplates = {
  profileApproved: (studentName: string, studentEmail: string) => ({
    from: `"Summer of Tech" <${emailConfig.auth.user}>`,
    to: studentEmail,
    subject: '🎉 Your Profile is Now Live! - Summer of Tech',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Approved - Summer of Tech</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
            }
            .logo h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .highlight {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
            }
            .contact-info {
              background: #f1f5f9;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <h1>🎓 Summer of Tech</h1>
              </div>
              <div class="success-icon">🎉</div>
              <h2 style="color: #1e293b; margin: 0;">Congratulations!</h2>
            </div>
            
            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <p>We're thrilled to inform you that your student profile has been <strong>approved and is now live</strong> on the Summer of Tech platform!</p>
              
              <div class="highlight">
                <h3 style="margin: 0;">Your Profile is Now Active</h3>
                <p style="margin: 10px 0 0 0;">Employers can now discover and connect with you</p>
              </div>
              
              <h3>What this means for you:</h3>
              <ul>
                <li>✅ Your profile is visible to participating employers</li>
                <li>✅ You're eligible for job matching and opportunities</li>
                <li>✅ Employers can view your skills, experience, and documents</li>
                <li>✅ You'll receive notifications about relevant job opportunities</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  'https://command-center.sot.org.nz'
                }/students/${studentEmail}" class="cta-button">
                  View Your Live Profile
                </a>
              </div>
              
              <h3>Next Steps:</h3>
              <ol>
                <li><strong>Keep your profile updated</strong> - Add any new skills or experiences</li>
                <li><strong>Check your email regularly</strong> - We'll notify you about job matches</li>
                <li><strong>Be responsive</strong> - Employers may reach out directly</li>
                <li><strong>Attend events</strong> - Join our networking and skill-building events</li>
              </ol>
              
              <div class="contact-info">
                <h4 style="margin-top: 0;">Need Help?</h4>
                <p>If you have any questions or need assistance, don't hesitate to reach out:</p>
                <p><strong>Email:</strong> hello@yun-xu.com</p>
                <p><strong>Response Time:</strong> We typically respond within 24 hours</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for being part of Summer of Tech!</p>
              <p>Best regards,<br>The Summer of Tech Team</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8;">
                This email was sent to ${studentEmail}. If you believe you received this email in error, please contact us at hello@yun-xu.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Congratulations ${studentName}!
      
      Your student profile has been approved and is now live on the Summer of Tech platform!
      
      What this means for you:
      ✅ Your profile is visible to participating employers
      ✅ You're eligible for job matching and opportunities
      ✅ Employers can view your skills, experience, and documents
      ✅ You'll receive notifications about relevant job opportunities
      
      Next Steps:
      1. Keep your profile updated - Add any new skills or experiences
      2. Check your email regularly - We'll notify you about job matches
      3. Be responsive - Employers may reach out directly
      4. Attend events - Join our networking and skill-building events
      
      Need Help?
      Email: hello@yun-xu.com
      Response Time: We typically respond within 24 hours
      
      Thank you for being part of Summer of Tech!
      
      Best regards,
      The Summer of Tech Team
    `,
  }),

  profileRejected: (
    studentName: string,
    studentEmail: string,
    rejectionReasons: string[]
  ) => ({
    from: `"Summer of Tech" <${emailConfig.auth.user}>`,
    to: studentEmail,
    subject: '📋 Profile Review Update - Summer of Tech',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Review Update - Summer of Tech</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
            }
            .logo h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .info-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .highlight {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .reasons-box {
              background: #fef2f2;
              border: 1px solid #f87171;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .reasons-list {
              margin: 10px 0;
              padding-left: 20px;
            }
            .reasons-list li {
              margin: 8px 0;
              color: #dc2626;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
            }
            .contact-info {
              background: #f1f5f9;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .encouragement {
              background: #f0f9ff;
              border: 1px solid #0ea5e9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <h1>🎓 Summer of Tech</h1>
              </div>
              <div class="info-icon">📋</div>
              <h2 style="color: #1e293b; margin: 0;">Profile Review Update</h2>
            </div>
            
            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <p>Thank you for submitting your profile to Summer of Tech. After careful review, we need to provide you with some feedback regarding your application.</p>
              
              <div class="highlight">
                <h3 style="margin: 0; color: #92400e;">Profile Review Complete</h3>
                <p style="margin: 10px 0 0 0; color: #92400e;">Your profile requires some updates before it can be approved</p>
              </div>
              
              <div class="reasons-box">
                <h3 style="margin-top: 0; color: #dc2626;">Areas that need attention:</h3>
                <ul class="reasons-list">
                  ${rejectionReasons
                    .map((reason) => `<li>${reason}</li>`)
                    .join('')}
                </ul>
              </div>
              
              <div class="encouragement">
                <h3 style="margin-top: 0; color: #0369a1;">Don't worry - you can resubmit!</h3>
                <p>This is not the end of your journey with Summer of Tech. We encourage you to address the feedback above and resubmit your profile. Many students improve their profiles based on our feedback and go on to have successful experiences.</p>
              </div>
              
              <h3>Next Steps:</h3>
              <ol>
                <li><strong>Review the feedback</strong> - Carefully consider each point mentioned above</li>
                <li><strong>Update your profile</strong> - Make the necessary improvements</li>
                <li><strong>Resubmit your application</strong> - We'll review it again promptly</li>
                <li><strong>Contact us if needed</strong> - We're here to help you succeed</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  'https://command-center.sot.org.nz'
                }/students/add" class="cta-button">
                  Update Your Profile
                </a>
              </div>
              
              <div class="contact-info">
                <h4 style="margin-top: 0;">Need Help?</h4>
                <p>If you have any questions about the feedback or need assistance improving your profile, please don't hesitate to reach out:</p>
                <p><strong>Email:</strong> hello@yun-xu.com</p>
                <p><strong>Response Time:</strong> We typically respond within 24 hours</p>
                <p><strong>Office Hours:</strong> Monday to Friday, 9 AM - 5 PM NZST</p>
              </div>
            </div>
            
            <div class="footer">
              <p>We believe in your potential and look forward to seeing your improved profile!</p>
              <p>Best regards,<br>The Summer of Tech Team</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8;">
                This email was sent to ${studentEmail}. If you believe you received this email in error, please contact us at hello@yun-xu.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Profile Review Update - Summer of Tech
      
      Dear ${studentName},
      
      Thank you for submitting your profile to Summer of Tech. After careful review, we need to provide you with some feedback regarding your application.
      
      Profile Review Complete
      Your profile requires some updates before it can be approved
      
      Areas that need attention:
      ${rejectionReasons.map((reason) => `• ${reason}`).join('\n')}
      
      Don't worry - you can resubmit!
      This is not the end of your journey with Summer of Tech. We encourage you to address the feedback above and resubmit your profile. Many students improve their profiles based on our feedback and go on to have successful experiences.
      
      Next Steps:
      1. Review the feedback - Carefully consider each point mentioned above
      2. Update your profile - Make the necessary improvements
      3. Resubmit your application - We'll review it again promptly
      4. Contact us if needed - We're here to help you succeed
      
      Need Help?
      Email: hello@yun-xu.com
      Response Time: We typically respond within 24 hours
      Office Hours: Monday to Friday, 9 AM - 5 PM NZST
      
      We believe in your potential and look forward to seeing your improved profile!
      
      Best regards,
      The Summer of Tech Team
    `,
  }),
}

// Email service functions
export class EmailService {
  /**
   * Send profile approval notification to a student
   */
  static async sendProfileApprovalNotification(
    studentName: string,
    studentEmail: string
  ): Promise<boolean> {
    try {
      const mailOptions = emailTemplates.profileApproved(
        studentName,
        studentEmail
      )

      const result = await transporter.sendMail(mailOptions)
      console.log('Profile approval email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Error sending profile approval email:', error)
      return false
    }
  }

  /**
   * Send bulk profile approval notifications
   */
  static async sendBulkProfileApprovalNotifications(
    students: Array<{ name: string; email: string }>
  ): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (const student of students) {
      try {
        const success = await this.sendProfileApprovalNotification(
          student.name,
          student.email
        )
        if (success) {
          successCount++
        } else {
          failedCount++
          errors.push(
            `Failed to send email to ${student.name} (${student.email})`
          )
        }
      } catch (error) {
        failedCount++
        const errorMessage = `Error sending email to ${student.name} (${
          student.email
        }): ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMessage)
        console.error(errorMessage)
      }
    }

    return { successCount, failedCount, errors }
  }

  /**
   * Send profile rejection notification to a student
   */
  static async sendProfileRejectionNotification(
    studentName: string,
    studentEmail: string,
    rejectionReasons: string[]
  ): Promise<boolean> {
    try {
      const mailOptions = emailTemplates.profileRejected(
        studentName,
        studentEmail,
        rejectionReasons
      )

      const result = await transporter.sendMail(mailOptions)
      console.log(
        'Profile rejection email sent successfully:',
        result.messageId
      )
      return true
    } catch (error) {
      console.error('Error sending profile rejection email:', error)
      return false
    }
  }

  /**
   * Send bulk profile rejection notifications
   */
  static async sendBulkProfileRejectionNotifications(
    students: Array<{ name: string; email: string; reasons: string[] }>
  ): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (const student of students) {
      try {
        const success = await this.sendProfileRejectionNotification(
          student.name,
          student.email,
          student.reasons
        )
        if (success) {
          successCount++
        } else {
          failedCount++
          errors.push(
            `Failed to send rejection email to ${student.name} (${student.email})`
          )
        }
      } catch (error) {
        failedCount++
        const errorMessage = `Error sending rejection email to ${
          student.name
        } (${student.email}): ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
        errors.push(errorMessage)
        console.error(errorMessage)
      }
    }

    return { successCount, failedCount, errors }
  }

  /**
   * Test email configuration
   */
  static async testEmailConfiguration(): Promise<boolean> {
    try {
      await transporter.verify()
      console.log('Email configuration is valid')
      return true
    } catch (error) {
      console.error('Email configuration error:', error)
      return false
    }
  }
}

export default EmailService
