import * as fs from "fs"
import { PDFDocument } from "./document"
import { PDFPage } from "./page"
import { PDFRenderer } from "./renderer"
import { PDFParser } from "./parser"
import { PDFText } from "./text"
import { PDFImage } from "./image"
import { PDFAnnotation } from "./annotation"
import { PDFOutline } from "./outline"
import { PDFForm, PDFFormField } from "./form"
import { PDFSignature } from "./signature"
import { PDFError, ErrorCodes } from "./error"
import { PDFCreator } from "./creator"
import { PDFMerger } from "./merger"
import { PDFSecurity, PDFPermissions } from "./security"
import { loadPDFInBrowser, renderPageToCanvas, downloadPDF } from "./browser"

// Advanced features
import { PDFTextStyling, TextStyleOptions } from "./advanced/text-styling"
import { PDFTable, TableOptions, TableCellOptions } from "./advanced/table"
import { PDFWatermark, WatermarkOptions } from "./advanced/watermark"
import { PDFPageOperations } from "./advanced/page-operations"
import { SVGConverter } from "./advanced/svg"
import { PDFToImage } from "./advanced/pdf-to-image"
import { PDFDigitalSignature, DigitalSignatureOptions } from "./advanced/digital-signature"
import { PDFAConverter, PDFALevel, PDFAConversionOptions } from "./advanced/pdf-a"
import { PDFLinks, LinkDestination, LinkOptions } from "./advanced/links"
import { PDFAttachments, AttachmentOptions } from "./advanced/attachments"
import { PDFStreaming } from "./advanced/streaming"
import { PDFWorker } from "./advanced/workers"
import { PDFUtilities, PDFComparisonResult, PDFStatistics } from "./advanced/utilities"
import { PDFAccessibility, AccessibilityCheckResult } from "./advanced/accessibility"
import { PDFRepair, PDFRepairOptions, PDFRepairResult } from "./advanced/repair"

// Browser-specific features
import { PDFWebWorker } from "./browser/web-worker"
import { PDFProgressiveLoader } from "./browser/progressive-loader"
import { PDFOfflineSupport } from "./browser/offline-support"

export {
  // Core classes
  PDFDocument,
  PDFPage,
  PDFRenderer,
  PDFParser,
  PDFText,
  PDFImage,
  PDFAnnotation,
  PDFOutline,
  PDFForm,
  PDFFormField,
  PDFSignature,
  PDFError,
  ErrorCodes,
  PDFCreator,
  PDFMerger,
  PDFSecurity,
  PDFPermissions,
  // Advanced features
  PDFTextStyling,
  TextStyleOptions,
  PDFTable,
  TableOptions,
  TableCellOptions,
  PDFWatermark,
  WatermarkOptions,
  PDFPageOperations,
  SVGConverter,
  PDFToImage,
  PDFDigitalSignature,
  DigitalSignatureOptions,
  PDFAConverter,
  PDFALevel,
  PDFAConversionOptions,
  PDFLinks,
  LinkDestination,
  LinkOptions,
  PDFAttachments,
  AttachmentOptions,
  PDFStreaming,
  PDFWorker,
  PDFUtilities,
  PDFComparisonResult,
  PDFStatistics,
  PDFAccessibility,
  AccessibilityCheckResult,
  PDFRepair,
  PDFRepairOptions,
  PDFRepairResult,
  // Browser-specific features
  PDFWebWorker,
  PDFProgressiveLoader,
  PDFOfflineSupport,
  loadPDFInBrowser,
  renderPageToCanvas,
  downloadPDF,
}

/**
 * Load a PDF document from a file path
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<PDFDocument>} - Promise resolving to a PDFDocument
 */
export async function loadPDF(filePath: string): Promise<PDFDocument> {
  try {
    const buffer = await fs.promises.readFile(filePath)
    return loadPDFFromBuffer(buffer)
  } catch (error) {
    throw new PDFError(ErrorCodes.FILE_NOT_FOUND, `Could not load PDF from path: ${filePath}`, error as Error)
  }
}

/**
 * Load a PDF document from a buffer
 * @param {Buffer} buffer - Buffer containing PDF data
 * @returns {Promise<PDFDocument>} - Promise resolving to a PDFDocument
 */
export async function loadPDFFromBuffer(buffer: Buffer): Promise<PDFDocument> {
  try {
    const parser = new PDFParser()
    return await parser.parse(buffer)
  } catch (error) {
    throw new PDFError(ErrorCodes.PARSE_ERROR, "Could not parse PDF from buffer", error as Error)
  }
}

/**
 * Load a PDF document from a readable stream
 * @param {NodeJS.ReadableStream} stream - Readable stream containing PDF data
 * @param {object} options - Loading options
 * @returns {Promise<PDFDocument>} - Promise resolving to a PDFDocument
 */
export async function loadPDFFromStream(
  stream: NodeJS.ReadableStream,
  options: {
    onProgress?: (bytesRead: number, totalBytes?: number) => void
  } = {},
): Promise<PDFDocument> {
  return PDFStreaming.parseStream(stream, options)
}

/**
 * Create a new PDF document
 * @param {object} options - Document options
 * @returns {PDFCreator} - PDFCreator instance
 */
export function createPDF(
  options: {
    metadata?: {
      title?: string
      author?: string
      subject?: string
      keywords?: string[]
      creator?: string
      producer?: string
    }
  } = {},
): PDFCreator {
  return new PDFCreator({
    metadata: {
      ...options.metadata,
      creator: options.metadata?.creator || "node-pdf-lib",
      producer: options.metadata?.producer || "node-pdf-lib",
      creationDate: new Date(),
    },
  })
}

/**
 * Merge multiple PDF documents
 * @param {PDFDocument[]} documents - Documents to merge
 * @param {object} options - Merge options
 * @returns {Promise<PDFDocument>} - Promise resolving to the merged document
 */
export async function mergePDFs(
  documents: PDFDocument[],
  options: {
    keepOutlines?: boolean
    keepAnnotations?: boolean
    keepFormFields?: boolean
  } = {},
): Promise<PDFDocument> {
  const merger = new PDFMerger(documents)
  return merger.merge(options)
}

/**
 * Split a PDF document
 * @param {PDFDocument} document - Document to split
 * @param {object} options - Split options
 * @returns {Promise<PDFDocument[]>} - Promise resolving to an array of documents
 */
export async function splitPDF(
  document: PDFDocument,
  options: {
    mode: "single" | "ranges" | "every"
    ranges?: Array<{ start: number; end: number }>
    pageCount?: number
  },
): Promise<PDFDocument[]> {
  return PDFPageOperations.splitDocument(document, options)
}

/**
 * Extract specific pages from a document
 * @param {PDFDocument} document - The source document
 * @param {number[]} pageIndices - Indices of pages to extract
 * @returns {Promise<PDFDocument>} - Promise resolving to a new document with extracted pages
 */
export async function extractPages(document: PDFDocument, pageIndices: number[]): Promise<PDFDocument> {
  return PDFPageOperations.extractPages(document, pageIndices)
}

/**
 * Compress a PDF document
 * @param {PDFDocument} document - Document to compress
 * @returns {Promise<PDFDocument>} - Promise resolving to the compressed document
 */
export async function compressPDF(document: PDFDocument): Promise<PDFDocument> {
  await document.compress()
  return document
}

/**
 * Encrypt a PDF document
 * @param {PDFDocument} document - Document to encrypt
 * @param {object} options - Encryption options
 * @returns {Promise<PDFDocument>} - Promise resolving to the encrypted document
 */
export async function encryptPDF(
  document: PDFDocument,
  options: {
    userPassword?: string
    ownerPassword?: string
    permissions?: PDFPermissions
    encryptionMethod?: "rc4" | "aes" | "aes256"
  },
): Promise<PDFDocument> {
  const security = new PDFSecurity(options)
  return security.encrypt(document)
}

/**
 * Decrypt a PDF document
 * @param {PDFDocument} document - Document to decrypt
 * @param {string} password - Password to use for decryption
 * @returns {Promise<PDFDocument>} - Promise resolving to the decrypted document
 */
export async function decryptPDF(document: PDFDocument, password: string): Promise<PDFDocument> {
  const security = new PDFSecurity()
  return security.decrypt(document, password)
}

/**
 * Render a PDF page to a canvas
 * @param {PDFPage} page - The PDF page to render
 * @param {object} options - Rendering options
 * @returns {Promise<Buffer>} - Promise resolving to an image buffer
 */
export async function renderPage(
  page: PDFPage,
  options: {
    scale?: number
    format?: "png" | "jpeg"
    quality?: number
  } = {},
): Promise<Buffer> {
  const renderer = new PDFRenderer()
  return renderer.renderPage(page, options)
}

/**
 * Convert a PDF document to images
 * @param {PDFDocument} document - The document to convert
 * @param {object} options - Conversion options
 * @returns {Promise<Buffer[]>} - Promise resolving to an array of image buffers
 */
export async function convertToImages(
  document: PDFDocument,
  options: {
    format?: "png" | "jpeg"
    quality?: number
    scale?: number
    dpi?: number
    pageIndices?: number[]
  } = {},
): Promise<Buffer[]> {
  return PDFToImage.convertToImages(document, options)
}

/**
 * Create a thumbnail for a PDF document
 * @param {PDFDocument} document - The document to convert
 * @param {object} options - Conversion options
 * @returns {Promise<Buffer>} - Promise resolving to a thumbnail image buffer
 */
export async function createThumbnail(
  document: PDFDocument,
  options: {
    pageIndex?: number
    width?: number
    height?: number
    format?: "png" | "jpeg"
    quality?: number
  } = {},
): Promise<Buffer> {
  return PDFToImage.createThumbnail(document, options)
}

/**
 * Add a watermark to a PDF document
 * @param {PDFDocument} document - The document to add watermark to
 * @param {WatermarkOptions} options - Watermark options
 * @returns {Promise<PDFDocument>} - Promise resolving to the document with watermark
 */
export async function addWatermark(document: PDFDocument, options: WatermarkOptions): Promise<PDFDocument> {
  return PDFWatermark.addWatermark(document, options)
}

/**
 * Add a background to a PDF document
 * @param {PDFDocument} document - The document to add background to
 * @param {PDFImage | string} background - Background image or color
 * @param {object} options - Background options
 * @returns {Promise<PDFDocument>} - Promise resolving to the document with background
 */
export async function addBackground(
  document: PDFDocument,
  background: PDFImage | string,
  options: {
    opacity?: number
    scale?: "fit" | "stretch" | "tile" | number
    pages?: number[]
  } = {},
): Promise<PDFDocument> {
  return PDFWatermark.addBackground(document, background, options)
}

/**
 * Convert a PDF document to PDF/A
 * @param {PDFDocument} document - The document to convert
 * @param {PDFAConversionOptions} options - Conversion options
 * @returns {Promise<PDFDocument>} - Promise resolving to the converted document
 */
export async function convertToPDFA(document: PDFDocument, options: PDFAConversionOptions): Promise<PDFDocument> {
  return PDFAConverter.convertToPDFA(document, options)
}

/**
 * Verify PDF/A compliance
 * @param {PDFDocument} document - The document to verify
 * @returns {Promise<{compliant: boolean, level?: PDFALevel, errors?: string[]}>} - Promise resolving to verification result
 */
export async function verifyPDFACompliance(document: PDFDocument): Promise<{
  compliant: boolean
  level?: PDFALevel
  errors?: string[]
}> {
  return PDFAConverter.verifyPDFACompliance(document)
}

/**
 * Sign a PDF document
 * @param {PDFDocument} document - The document to sign
 * @param {DigitalSignatureOptions} options - Signature options
 * @returns {Promise<PDFDocument>} - Promise resolving to the signed document
 */
export async function signPDF(document: PDFDocument, options: DigitalSignatureOptions): Promise<PDFDocument> {
  return PDFDigitalSignature.signDocument(document, options)
}

/**
 * Verify signatures in a PDF document
 * @param {PDFDocument} document - The document to verify
 * @returns {Promise<{valid: boolean, signatures: Array<{name: string, date: Date, valid: boolean, reason?: string}>}>} - Promise resolving to verification result
 */
export async function verifySignatures(document: PDFDocument): Promise<{
  valid: boolean
  signatures: Array<{
    name: string
    date: Date
    valid: boolean
    reason?: string
  }>
}> {
  return PDFDigitalSignature.verifySignatures(document)
}

/**
 * Add bookmarks to a PDF document
 * @param {PDFDocument} document - The document to add bookmarks to
 * @param {Array<{title: string, destination: LinkDestination, children?: any[]}>} bookmarks - Bookmark items
 * @returns {Promise<void>} - Promise resolving when bookmarks are added
 */
export async function addBookmarks(
  document: PDFDocument,
  bookmarks: Array<{
    title: string
    destination: LinkDestination
    children?: any[]
  }>,
): Promise<void> {
  return PDFLinks.addBookmarks(document, bookmarks)
}

/**
 * Add an attachment to a PDF document
 * @param {PDFDocument} document - The document to add attachment to
 * @param {AttachmentOptions} options - Attachment options
 * @returns {Promise<void>} - Promise resolving when attachment is added
 */
export async function addAttachment(document: PDFDocument, options: AttachmentOptions): Promise<void> {
  return PDFAttachments.addAttachment(document, options)
}

/**
 * Extract text from a PDF page
 * @param {PDFPage} page - The PDF page to extract text from
 * @returns {Promise<string>} - Promise resolving to the extracted text
 */
export async function extractText(page: PDFPage): Promise<string> {
  return page.extractText()
}

/**
 * Extract text from all pages in a PDF document
 * @param {PDFDocument} document - The PDF document to extract text from
 * @returns {Promise<string>} - Promise resolving to the extracted text
 */
export async function extractAllText(document: PDFDocument): Promise<string> {
  let text = ""

  for (let i = 0; i < document.pageCount; i++) {
    const page = document.getPage(i)
    if (page) {
      const pageText = await page.extractText()
      text += `--- Page ${i + 1} ---\n${pageText}\n\n`
    }
  }

  return text
}

/**
 * Extract images from a PDF page
 * @param {PDFPage} page - The PDF page to extract images from
 * @returns {Promise<PDFImage[]>} - Promise resolving to an array of images
 */
export async function extractImages(page: PDFPage): Promise<PDFImage[]> {
  return page.extractImages()
}

/**
 * Compare two PDF documents
 * @param {PDFDocument} document1 - First document
 * @param {PDFDocument} document2 - Second document
 * @param {object} options - Comparison options
 * @returns {Promise<PDFComparisonResult>} - Promise resolving to comparison result
 */
export async function comparePDFs(
  document1: PDFDocument,
  document2: PDFDocument,
  options: {
    compareMetadata?: boolean
    compareContent?: boolean
    compareAnnotations?: boolean
    tolerance?: number
  } = {},
): Promise<PDFComparisonResult> {
  return PDFUtilities.compareDocuments(document1, document2, options)
}

/**
 * Get statistics for a PDF document
 * @param {PDFDocument} document - The document to analyze
 * @param {object} options - Analysis options
 * @returns {Promise<PDFStatistics>} - Promise resolving to document statistics
 */
export async function getDocumentStatistics(
  document: PDFDocument,
  options: {
    includeTextStats?: boolean
    includeImageStats?: boolean
    includeFontStats?: boolean
  } = {},
): Promise<PDFStatistics> {
  return PDFUtilities.getDocumentStatistics(document, options)
}

/**
 * Check document accessibility
 * @param {PDFDocument} document - The document to check
 * @param {object} options - Check options
 * @returns {Promise<AccessibilityCheckResult>} - Promise resolving to check result
 */
export async function checkAccessibility(
  document: PDFDocument,
  options: {
    checkTags?: boolean
    checkAltText?: boolean
    checkLanguage?: boolean
    checkTitle?: boolean
    checkReadingOrder?: boolean
    checkFonts?: boolean
    checkColor?: boolean
  } = {},
): Promise<AccessibilityCheckResult> {
  return PDFAccessibility.checkAccessibility(document, options)
}

/**
 * Fix common accessibility issues
 * @param {PDFDocument} document - The document to fix
 * @param {object} options - Fix options
 * @returns {Promise<{fixed: boolean, fixedIssues: string[], document: PDFDocument}>} - Promise resolving to fix result
 */
export async function fixAccessibilityIssues(
  document: PDFDocument,
  options: {
    addTags?: boolean
    addAltText?: boolean
    setLanguage?: string
    setTitle?: string
    fixReadingOrder?: boolean
    fixFonts?: boolean
    fixColor?: boolean
  } = {},
): Promise<{
  fixed: boolean
  fixedIssues: string[]
  document: PDFDocument
}> {
  return PDFAccessibility.fixAccessibilityIssues(document, options)
}

/**
 * Repair a damaged PDF document
 * @param {Buffer} buffer - Buffer containing PDF data
 * @param {PDFRepairOptions} options - Repair options
 * @returns {Promise<{result: PDFRepairResult, document?: PDFDocument}>} - Promise resolving to repair result and document
 */
export async function repairPDF(
  buffer: Buffer,
  options: PDFRepairOptions = {},
): Promise<{
  result: PDFRepairResult
  document?: PDFDocument
}> {
  return PDFRepair.repairDocument(buffer, options)
}

/**
 * Library version
 */
export const version = "2.0.0"
