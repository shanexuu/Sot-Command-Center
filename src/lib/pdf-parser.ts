// PDF parser using pdf-parse with proper ES module handling
export interface PDFInfo {
  Title?: string
  Author?: string
  Subject?: string
  Keywords?: string
  Creator?: string
  Producer?: string
  CreationDate?: string
  ModDate?: string
  Trapped?: string
}

export interface PDFParseResult {
  text: string
  pages: number
  info?: PDFInfo
}

interface PDFParseData {
  text: string
  numpages: number
  info?: PDFInfo
}

export async function parsePDFWithFallback(
  buffer: Buffer
): Promise<PDFParseResult> {
  try {
    // Use dynamic import to handle pdf-parse ES module issues
    const pdfParseModule = await import('pdf-parse')
    const pdfParse = pdfParseModule.default || pdfParseModule
    const data = (await pdfParse(buffer)) as PDFParseData

    return {
      text: data.text.trim(),
      pages: data.numpages,
      info: data.info,
    }
  } catch (error) {
    console.error('PDF parsing failed:', error)
    throw new Error(
      `PDF parsing failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}
