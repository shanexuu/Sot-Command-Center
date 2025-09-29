// PDF parsing and analysis utilities
// This module handles PDF upload, text extraction, and AI analysis

import { createClientClient } from './supabase-client'

export interface PDFAnalysisResult {
  extractedText: string
  analysisScore: number
  analysisNotes: string[]
  detailedAnalysis: {
    education: string[]
    experience: string[]
    skills: string[]
    achievements: string[]
    recommendations: string[]
  }
  processingTime: number
}

export interface DocumentUpload {
  file: File
  type: 'cv' | 'academic_records' | 'resume'
  studentId: string
}

// Upload document to Supabase Storage
export async function uploadDocument(
  file: File,
  studentId: string,
  type: 'cv' | 'academic_records' | 'resume'
): Promise<string> {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${studentId}_${type}_${Date.now()}.${fileExt}`
    const filePath = `documents/${studentId}/${fileName}`

    // Upload to Supabase Storage
    const supabase = createClientClient()
    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading document:', error)
    throw error
  }
}

// Extract text from PDF using client-side parsing
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // For client-side PDF parsing, we'll use a simple approach
    // In production, you might want to use a service like Adobe PDF Services API
    // or process this on the server side

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Simple PDF text extraction (this is a basic implementation)
    // For production, consider using pdf-parse or similar libraries
    const text = await extractTextFromPDFBuffer(uint8Array)

    return text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Basic PDF text extraction (simplified version)
async function extractTextFromPDFBuffer(buffer: Uint8Array): Promise<string> {
  // This is a simplified implementation
  // In production, you should use a proper PDF parsing library

  try {
    // Convert buffer to string and extract text between text markers
    const text = new TextDecoder('utf-8').decode(buffer)

    // Basic text extraction - look for text between BT and ET markers
    const textMatches = text.match(/BT\s*\((.*?)\)\s*ET/g)
    if (textMatches) {
      return textMatches
        .map((match) => match.replace(/BT\s*\(|\)\s*ET/g, ''))
        .join(' ')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .trim()
    }

    // Fallback: return a message indicating manual review needed
    return 'PDF text extraction requires manual review. Please ensure the document is readable.'
  } catch (error) {
    console.error('PDF text extraction error:', error)
    return 'Unable to extract text from PDF. Manual review required.'
  }
}

// Analyze document content using OpenAI
export async function analyzeDocumentWithAI(
  extractedText: string,
  documentType: 'cv' | 'academic_records' | 'resume'
): Promise<PDFAnalysisResult> {
  try {
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    const startTime = Date.now()

    // Create analysis prompt based on document type
    const prompt = createAnalysisPrompt(extractedText, documentType)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert career counselor and academic advisor. Analyze ${documentType} documents for students applying to tech internship programs. Provide detailed, constructive feedback and scoring.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const analysis = JSON.parse(content)
    const processingTime = Date.now() - startTime

    return {
      extractedText,
      analysisScore: Math.max(0, Math.min(10, analysis.score || 0)),
      analysisNotes: analysis.notes || [],
      detailedAnalysis: {
        education: analysis.education || [],
        experience: analysis.experience || [],
        skills: analysis.skills || [],
        achievements: analysis.achievements || [],
        recommendations: analysis.recommendations || [],
      },
      processingTime,
    }
  } catch (error) {
    console.error('AI analysis failed:', error)
    throw error
  }
}

// Create analysis prompt based on document type
function createAnalysisPrompt(text: string, documentType: string): string {
  const basePrompt = `Analyze this ${documentType} document and provide a comprehensive assessment. Return your response as a JSON object with the following structure:

{
  "score": <number between 0-10>,
  "notes": [<array of key observations and feedback>],
  "education": [<array of educational highlights>],
  "experience": [<array of relevant experience points>],
  "skills": [<array of technical and soft skills identified>],
  "achievements": [<array of notable achievements>],
  "recommendations": [<array of improvement suggestions>]
}

Document content:
${text}

Please provide a detailed analysis focusing on:
- Relevance to tech internships
- Quality and completeness
- Skills and experience alignment
- Academic performance (for academic records)
- Professional presentation (for CV/resume)
- Areas for improvement`

  return basePrompt
}

// Update student document URLs in database
export async function updateStudentDocuments(
  studentId: string,
  documentType: 'cv' | 'academic_records' | 'resume',
  documentUrl: string
): Promise<void> {
  try {
    const supabase = createClientClient()
    const updateData: Record<string, string> = {
      [`${documentType}_url`]: documentUrl,
      documents_uploaded_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId)

    if (error) {
      throw new Error(`Database update failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Error updating student documents:', error)
    throw error
  }
}

// Save document analysis to database
export async function saveDocumentAnalysis(
  studentId: string,
  documentType: 'cv' | 'academic_records' | 'resume',
  documentUrl: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  analysis: PDFAnalysisResult
): Promise<void> {
  try {
    const supabase = createClientClient()
    const { error } = await supabase.from('document_analysis').insert({
      student_id: studentId,
      document_type: documentType,
      document_url: documentUrl,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      ai_analysis: analysis.detailedAnalysis,
      extracted_text: analysis.extractedText,
      analysis_score: analysis.analysisScore,
      analysis_notes: analysis.analysisNotes.join('; '),
      processing_status: 'completed',
      processed_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`)
    }

    // Update student table with analysis results
    const updateData: Record<string, string | number> = {
      [`${documentType}_analysis_score`]: analysis.analysisScore,
      [`${documentType}_analysis_notes`]: analysis.analysisNotes.join('; '),
      documents_analyzed_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId)

    if (updateError) {
      console.error('Error updating student analysis:', updateError)
    }
  } catch (error) {
    console.error('Error saving document analysis:', error)
    throw error
  }
}

// Get document analysis for a student
export async function getDocumentAnalysis(studentId: string): Promise<
  {
    id: string
    student_id: string
    document_type: string
    analysis_score: number
    analysis_notes: string
    created_at: string
  }[]
> {
  try {
    const supabase = createClientClient()
    const { data, error } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching document analysis:', error)
    throw error
  }
}

// Note: You'll need to import supabase client
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
