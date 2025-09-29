'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { createClientClient } from '@/lib/supabase-client'
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Download,
} from 'lucide-react'
import { useToast } from '@/components/ui/toaster'

interface DocumentUploadProps {
  studentId: string
  documentType: 'cv' | 'academic_records' | 'resume'
  currentUrl?: string
  onUploadComplete: (url: string) => void
  onAnalysisComplete?: (analysis: {
    score: number
    strengths: string[]
    improvements: string[]
    summary: string
  }) => void
}

export function DocumentUpload({
  studentId,
  documentType,
  currentUrl,
  onUploadComplete,
}: DocumentUploadProps) {
  console.log('DocumentUpload component rendered', {
    studentId,
    documentType,
    currentUrl,
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered', event.target.files)
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type)
      addToast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF file only.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size)
      addToast({
        title: 'File Too Large',
        description: 'Please upload a file smaller than 10MB.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
      return
    }

    console.log('File validation passed, setting uploaded file')
    setUploadedFile(file)
  }

  const handleUpload = async () => {
    console.log('Upload button clicked', { uploadedFile: !!uploadedFile })
    if (!uploadedFile) {
      console.log('No uploaded file, returning')
      return
    }

    console.log('Starting upload process...')
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload file (this would call your actual upload function)
      const documentUrl = await uploadDocument(
        uploadedFile,
        studentId,
        documentType
      )

      clearInterval(progressInterval)
      setUploadProgress(100)

      onUploadComplete(documentUrl)

      addToast({
        title: 'Upload Successful',
        description: `${documentType.toUpperCase()} uploaded successfully.`,
        variant: 'success',
        icon: <CheckCircle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Upload error:', error)
      addToast({
        title: 'Upload Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Upload failed. Please try again.',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getDocumentTypeLabel = () => {
    switch (documentType) {
      case 'cv':
        return 'CV/Resume'
      case 'academic_records':
        return 'Academic Records'
      case 'resume':
        return 'Resume'
      default:
        return 'Document'
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  {getDocumentTypeLabel()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload and analyze your document
                </p>
              </div>
            </div>
            {currentUrl && (
              <Badge
                variant="outline"
                className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Uploaded
              </Badge>
            )}
          </div>

          {/* Upload Section */}
          {!currentUrl && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Click to upload or drag and drop your PDF
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Maximum file size: 10MB
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    console.log('Select file button clicked')
                    fileInputRef.current?.click()
                  }}
                  variant="outline"
                  className="mt-4"
                  disabled={isUploading}
                >
                  Select File
                </Button>
              </div>

              {uploadedFile && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        console.log('Upload & Analyze button clicked')
                        handleUpload()
                      }}
                      disabled={isUploading}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload'
                      )}
                    </Button>
                  </div>

                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Uploading...
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {uploadProgress}%
                        </span>
                      </div>
                      <Progress
                        value={uploadProgress}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Current Document */}
          {currentUrl && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-emerald-900 dark:text-emerald-100">
                      Document Uploaded
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Ready for analysis
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(currentUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(currentUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Upload document to Supabase Storage
async function uploadDocument(
  file: File,
  studentId: string,
  type: string
): Promise<string> {
  try {
    console.log('Starting document upload...', {
      file: file.name,
      studentId,
      type,
    })

    const supabase = createClientClient()

    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${studentId}_${type}_${Date.now()}.${fileExt}`

    // Use temp path for new students (temporary UUIDs)
    // This bypasses the student existence check in the database trigger
    const filePath = `temp/${studentId}/${fileName}`

    console.log('Upload details:', { fileName, filePath, fileSize: file.size })

    // Check authentication status
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    console.log(
      'Current user:',
      user ? 'authenticated' : 'not authenticated',
      authError
    )

    // Check if documents bucket exists
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets()
    console.log(
      'Available buckets:',
      buckets?.map((b) => b.name)
    )

    if (bucketError) {
      console.error('Error listing buckets:', bucketError)
    }

    // Upload file to Supabase Storage
    console.log('Uploading to Supabase Storage...')
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      console.error('Error details:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    console.log('Upload successful, data:', data)

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file')
    }

    console.log(`Document uploaded successfully: ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading document:', error)
    throw error
  }
}
