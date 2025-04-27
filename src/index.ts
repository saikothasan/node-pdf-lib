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

export {
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
 * Library version
 */
export const version = "1.0.0"
