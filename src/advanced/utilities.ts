import type { PDFDocument } from "../document"
import type { PDFPage } from "../page"
import { PDFError, ErrorCodes } from "../error"

/**
 * PDF comparison result
 */
export interface PDFComparisonResult {
  identical: boolean
  pageCount: {
    identical: boolean
    document1: number
    document2: number
  }
  metadata: {
    identical: boolean
    differences: string[]
  }
  pages: Array<{
    pageNumber: number
    identical: boolean
    differences: string[]
  }>
}

/**
 * PDF statistics
 */
export interface PDFStatistics {
  pageCount: number
  pageSize: {
    width: number
    height: number
  }
  metadata: any
  textCount: number
  imageCount: number
  fontCount: number
  annotationCount: number
  formFieldCount: number
  hasOutline: boolean
  hasAttachments: boolean
  isEncrypted: boolean
  isLinearized: boolean
  fileSize: number
  version: string
}

/**
 * PDF utilities
 * @class
 */
export class PDFUtilities {
  /**
   * Compare two PDF documents
   * @param {PDFDocument} document1 - First document
   * @param {PDFDocument} document2 - Second document
   * @param {object} options - Comparison options
   * @returns {Promise<PDFComparisonResult>} - Promise resolving to comparison result
   */
  static async compareDocuments(
    document1: PDFDocument,
    document2: PDFDocument,
    options: {
      compareMetadata?: boolean
      compareContent?: boolean
      compareAnnotations?: boolean
      tolerance?: number
    } = {},
  ): Promise<PDFComparisonResult> {
    try {
      const result: PDFComparisonResult = {
        identical: true,
        pageCount: {
          identical: document1.pageCount === document2.pageCount,
          document1: document1.pageCount,
          document2: document2.pageCount,
        },
        metadata: {
          identical: true,
          differences: [],
        },
        pages: [],
      }

      // Update overall identical flag based on page count
      if (!result.pageCount.identical) {
        result.identical = false
      }

      // Compare metadata if requested
      if (options.compareMetadata !== false) {
        result.metadata = this.compareMetadata(document1.metadata, document2.metadata)

        if (!result.metadata.identical) {
          result.identical = false
        }
      }

      // Compare pages
      const pageCount = Math.min(document1.pageCount, document2.pageCount)

      for (let i = 0; i < pageCount; i++) {
        const page1 = document1.getPage(i)
        const page2 = document2.getPage(i)

        if (page1 && page2) {
          const pageComparison = await this.comparePages(page1, page2, {
            compareContent: options.compareContent,
            compareAnnotations: options.compareAnnotations,
            tolerance: options.tolerance,
          })

          result.pages.push({
            pageNumber: i + 1,
            identical: pageComparison.identical,
            differences: pageComparison.differences,
          })

          if (!pageComparison.identical) {
            result.identical = false
          }
        }
      }

      return result
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error comparing PDF documents", error as Error)
    }
  }

  /**
   * Get statistics for a PDF document
   * @param {PDFDocument} document - The document to analyze
   * @param {object} options - Analysis options
   * @returns {Promise<PDFStatistics>} - Promise resolving to document statistics
   */
  static async getDocumentStatistics(
    document: PDFDocument,
    options: {
      includeTextStats?: boolean
      includeImageStats?: boolean
      includeFontStats?: boolean
    } = {},
  ): Promise<PDFStatistics> {
    try {
      // Initialize statistics
      const stats: PDFStatistics = {
        pageCount: document.pageCount,
        pageSize: { width: 0, height: 0 },
        metadata: document.metadata,
        textCount: 0,
        imageCount: 0,
        fontCount: 0,
        annotationCount: 0,
        formFieldCount: 0,
        hasOutline: document.outline !== null,
        hasAttachments: document.attachments && document.attachments.length > 0,
        isEncrypted: document.metadata.encrypted || false,
        isLinearized: false, // Would need to check the PDF structure
        fileSize: 0,
        version: document.metadata.pdfVersion || "1.7",
      }

      // Calculate file size
      const buffer = await document.toBuffer()
      stats.fileSize = buffer.length

      // Get page size from first page
      const firstPage = document.getPage(0)
      if (firstPage) {
        stats.pageSize = {
          width: firstPage.width,
          height: firstPage.height,
        }
      }

      // Count annotations and analyze content
      for (let i = 0; i < document.pageCount; i++) {
        const page = document.getPage(i)
        if (page) {
          stats.annotationCount += page.annotations.length

          // Analyze content if requested
          if (options.includeTextStats || options.includeImageStats || options.includeFontStats) {
            for (const item of page.content) {
              if (options.includeTextStats && item.type === "text") {
                stats.textCount++
              }

              if (options.includeImageStats && item.type === "image") {
                stats.imageCount++
              }

              if (options.includeFontStats && item.font) {
                stats.fontCount++
              }
            }
          }
        }
      }

      // Count form fields if form exists
      if (document.form) {
        stats.formFieldCount = document.form.fields.length
      }

      return stats
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error getting PDF document statistics", error as Error)
    }
  }

  /**
   * Check PDF/A compliance
   * @param {PDFDocument} document - The document to check
   * @returns {Promise<{compliant: boolean, level?: string, errors?: string[]}>} - Promise resolving to compliance result
   */
  static async checkPDFACompliance(document: PDFDocument): Promise<{
    compliant: boolean
    level?: string
    errors?: string[]
  }> {
    try {
      // This is a simplified implementation
      // In a real implementation, we would:
      // 1. Check document structure
      // 2. Verify fonts are embedded
      // 3. Check color spaces
      // 4. Verify metadata
      // 5. Check for prohibited features

      const errors: string[] = []

      // Check if document has PDF/A metadata
      if (!document.metadata.pdfaCompliance) {
        errors.push("Document does not have PDF/A metadata")
      }

      // Check if all fonts are embedded
      // This is a placeholder - would need to check actual font data

      // Check for encryption (not allowed in PDF/A)
      if (document.metadata.encrypted) {
        errors.push("Document is encrypted (not allowed in PDF/A)")
      }

      // Check for output intent
      if (!document.metadata.outputIntent) {
        errors.push("Document does not have an output intent")
      }

      return {
        compliant: errors.length === 0,
        level: document.metadata.pdfaCompliance?.level,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error checking PDF/A compliance", error as Error)
    }
  }

  /**
   * Compare metadata of two documents
   * @param {any} metadata1 - First document metadata
   * @param {any} metadata2 - Second document metadata
   * @returns {{identical: boolean, differences: string[]}} - Comparison result
   * @private
   */
  private static compareMetadata(metadata1: any, metadata2: any): { identical: boolean; differences: string[] } {
    const differences: string[] = []

    // Compare common metadata fields
    const fields = ["title", "author", "subject", "keywords", "creator", "producer", "creationDate", "modificationDate"]

    for (const field of fields) {
      if (metadata1[field] !== metadata2[field]) {
        differences.push(`${field}: "${metadata1[field]}" vs "${metadata2[field]}"`)
      }
    }

    return {
      identical: differences.length === 0,
      differences,
    }
  }

  /**
   * Compare two PDF pages
   * @param {PDFPage} page1 - First page
   * @param {PDFPage} page2 - Second page
   * @param {object} options - Comparison options
   * @returns {Promise<{identical: boolean, differences: string[]}>} - Promise resolving to comparison result
   * @private
   */
  private static async comparePages(
    page1: PDFPage,
    page2: PDFPage,
    options: {
      compareContent?: boolean
      compareAnnotations?: boolean
      tolerance?: number
    },
  ): Promise<{ identical: boolean; differences: string[] }> {
    const differences: string[] = []

    // Compare basic properties
    if (page1.width !== page2.width) {
      differences.push(`Width: ${page1.width} vs ${page2.width}`)
    }

    if (page1.height !== page2.height) {
      differences.push(`Height: ${page1.height} vs ${page2.height}`)
    }

    if (page1.rotation !== page2.rotation) {
      differences.push(`Rotation: ${page1.rotation} vs ${page2.rotation}`)
    }

    // Compare content if requested
    if (options.compareContent !== false) {
      // Compare text content (simplified)
      const text1 = await page1.extractText()
      const text2 = await page2.extractText()

      if (text1 !== text2) {
        differences.push("Text content differs")
      }

      // Compare content items (simplified)
      if (page1.content.length !== page2.content.length) {
        differences.push(`Content item count: ${page1.content.length} vs ${page2.content.length}`)
      }
    }

    // Compare annotations if requested
    if (options.compareAnnotations !== false) {
      if (page1.annotations.length !== page2.annotations.length) {
        differences.push(`Annotation count: ${page1.annotations.length} vs ${page2.annotations.length}`)
      }
    }

    return {
      identical: differences.length === 0,
      differences,
    }
  }
}
