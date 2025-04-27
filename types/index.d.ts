// Type definitions for node-pdf-lib
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

/// <reference types="node" />

import type { Buffer } from "buffer"

/**
 * PDF document metadata
 */
export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  encrypted?: boolean
  encryptionMethod?: string
  [key: string]: any
}

/**
 * PDF permissions
 */
export interface PDFPermissions {
  printing?: boolean
  modifying?: boolean
  copying?: boolean
  annotating?: boolean
  fillingForms?: boolean
  contentAccessibility?: boolean
  documentAssembly?: boolean
}

/**
 * Error codes for PDF.js
 */
export enum ErrorCodes {
  UNKNOWN_ERROR = "unknown_error",
  FILE_NOT_FOUND = "file_not_found",
  INVALID_PDF = "invalid_pdf",
  PARSE_ERROR = "parse_error",
  RENDER_ERROR = "render_error",
  UNSUPPORTED_FEATURE = "unsupported_feature",
  INVALID_PARAMETER = "invalid_parameter",
  PERMISSION_ERROR = "permission_error",
}

/**
 * Custom error class for PDF.js
 */
export class PDFError extends Error {
  constructor(code: ErrorCodes, message: string, originalError?: Error)
  readonly code: ErrorCodes
  readonly originalError: Error | null
}

/**
 * Represents a PDF document
 */
export class PDFDocument {
  constructor(options?: { metadata?: PDFMetadata })

  readonly pageCount: number
  readonly metadata: PDFMetadata
  readonly outline: PDFOutline | null
  readonly form: PDFForm | null
  readonly compressed: boolean

  getPage(index: number): PDFPage | null
  getPages(): PDFPage[]
  setMetadata(metadata: PDFMetadata): void
  addPage(page: PDFPage): void
  setOutline(outline: PDFOutline): void
  setForm(form: PDFForm): void
  save(filePath: string): Promise<void>
  toBuffer(options?: {
    compress?: boolean
    encrypt?: boolean
    userPassword?: string
    ownerPassword?: string
  }): Promise<Buffer>
  compress(): Promise<void>
  decompress(): Promise<void>
}

/**
 * Represents a page in a PDF document
 */
export class PDFPage {
  constructor(options?: {
    width?: number
    height?: number
    rotation?: number
    content?: any
    compressed?: boolean
  })

  readonly width: number
  readonly height: number
  readonly rotation: number
  readonly content: any[]
  readonly annotations: PDFAnnotation[]
  readonly compressed: boolean

  addContent(content: any): void
  extractText(): Promise<string>
  extractImages(): Promise<PDFImage[]>
  addAnnotation(annotation: PDFAnnotation): void
  setRotation(rotation: number): void
  compress(): Promise<void>
  decompress(): Promise<void>
}

/**
 * PDF parser for parsing PDF documents
 */
export class PDFParser {
  parse(buffer: Buffer): Promise<PDFDocument>
}

/**
 * PDF renderer for rendering PDF pages
 */
export class PDFRenderer {
  renderPage(
    page: PDFPage,
    options?: {
      scale?: number
      format?: "png" | "jpeg"
      quality?: number
    },
  ): Promise<Buffer>
}

/**
 * Represents text content in a PDF
 */
export class PDFText {
  constructor(options: {
    text: string
    font?: string
    fontSize?: number
    color?: string
    position?: { x: number; y: number }
  })

  readonly text: string
  readonly font: string
  readonly fontSize: number
  readonly color: string
  readonly position: { x: number; y: number }

  setText(text: string): void
  setFont(font: string): void
  setFontSize(fontSize: number): void
  setColor(color: string): void
  setPosition(position: { x: number; y: number }): void
}

/**
 * Represents an image in a PDF
 */
export class PDFImage {
  constructor(options: {
    width: number
    height: number
    data: Buffer
    format: "jpeg" | "png" | "gif"
    position?: { x: number; y: number }
  })

  readonly width: number
  readonly height: number
  readonly data: Buffer
  readonly format: "jpeg" | "png" | "gif"
  readonly position: { x: number; y: number }

  setPosition(position: { x: number; y: number }): void
  resize(width: number, height: number): void
}

/**
 * Represents an annotation in a PDF
 */
export class PDFAnnotation {
  constructor(options: {
    type: string
    rect: { x: number; y: number; width: number; height: number }
    contents?: string
    author?: string
    creationDate?: Date
  })

  readonly type: string
  readonly rect: { x: number; y: number; width: number; height: number }
  readonly contents: string
  readonly author: string
  readonly creationDate: Date

  setContents(contents: string): void
  setAuthor(author: string): void
}

/**
 * Represents an outline (bookmarks) in a PDF
 */
export class PDFOutline {
  constructor(options: {
    title: string
    destination: any
  })

  readonly title: string
  readonly destination: any
  readonly children: PDFOutline[]
  readonly parent: PDFOutline | null

  addChild(child: PDFOutline): void
  removeChild(child: PDFOutline): boolean
  setTitle(title: string): void
  setDestination(destination: any): void
}

/**
 * Represents a form in a PDF
 */
export class PDFForm {
  constructor()

  readonly fields: PDFFormField[]

  addField(field: PDFFormField): void
  getField(name: string): PDFFormField | null
  removeField(field: PDFFormField): boolean
  getFormData(): { [key: string]: any }
  setFormData(data: { [key: string]: any }): void
}

/**
 * Represents a field in a PDF form
 */
export class PDFFormField {
  constructor(options: {
    name: string
    type: string
    value?: any
    rect: { x: number; y: number; width: number; height: number }
    required?: boolean
    readOnly?: boolean
  })

  readonly name: string
  readonly type: string
  readonly value: any
  readonly rect: { x: number; y: number; width: number; height: number }
  readonly required: boolean
  readonly readOnly: boolean

  setValue(value: any): void
  setRequired(required: boolean): void
  setReadOnly(readOnly: boolean): void
}

/**
 * Represents a digital signature in a PDF
 */
export class PDFSignature {
  constructor(options: {
    name: string
    reason?: string
    location?: string
    contactInfo?: string
    date?: Date
    rect: { x: number; y: number; width: number; height: number }
  })

  readonly name: string
  readonly reason: string
  readonly location: string
  readonly contactInfo: string
  readonly date: Date
  readonly rect: { x: number; y: number; width: number; height: number }

  setName(name: string): void
  setReason(reason: string): void
  setLocation(location: string): void
}

/**
 * PDF creator for creating PDF documents from scratch
 */
export class PDFCreator {
  constructor(options?: {
    metadata?: {
      title?: string
      author?: string
      subject?: string
      keywords?: string[]
      creator?: string
      producer?: string
      creationDate?: Date
      modificationDate?: Date
    }
  })

  readonly document: PDFDocument

  addPage(options?: {
    width?: number
    height?: number
    rotation?: number
  }): PDFPage

  addText(
    page: PDFPage,
    text: string,
    options?: {
      x?: number
      y?: number
      font?: string
      fontSize?: number
      color?: string
    },
  ): PDFText

  addImage(
    page: PDFPage,
    imageData: Buffer,
    options?: {
      x?: number
      y?: number
      width?: number
      height?: number
      format?: "jpeg" | "png" | "gif"
    },
  ): Promise<PDFImage>

  saveToFile(filePath: string): Promise<void>
}

/**
 * PDF merger for merging multiple PDF documents
 */
export class PDFMerger {
  constructor(documents?: PDFDocument[])

  addDocument(document: PDFDocument): void
  addDocuments(documents: PDFDocument[]): void

  merge(options?: {
    keepOutlines?: boolean
    keepAnnotations?: boolean
    keepFormFields?: boolean
  }): Promise<PDFDocument>
}

/**
 * PDF security handler for encryption and decryption
 */
export class PDFSecurity {
  constructor(options?: {
    userPassword?: string
    ownerPassword?: string
    permissions?: PDFPermissions
    encryptionMethod?: "rc4" | "aes" | "aes256"
    encryptMetadata?: boolean
  })

  encrypt(document: PDFDocument): Promise<PDFDocument>
  decrypt(document: PDFDocument, password: string): Promise<PDFDocument>
}

/**
 * Load a PDF document from a file path
 */
export function loadPDF(filePath: string): Promise<PDFDocument>

/**
 * Load a PDF document from a buffer
 */
export function loadPDFFromBuffer(buffer: Buffer): Promise<PDFDocument>

/**
 * Create a new PDF document
 */
export function createPDF(options?: {
  metadata?: {
    title?: string
    author?: string
    subject?: string
    keywords?: string[]
    creator?: string
    producer?: string
  }
}): PDFCreator

/**
 * Merge multiple PDF documents
 */
export function mergePDFs(
  documents: PDFDocument[],
  options?: {
    keepOutlines?: boolean
    keepAnnotations?: boolean
    keepFormFields?: boolean
  },
): Promise<PDFDocument>

/**
 * Compress a PDF document
 */
export function compressPDF(document: PDFDocument): Promise<PDFDocument>

/**
 * Encrypt a PDF document
 */
export function encryptPDF(
  document: PDFDocument,
  options: {
    userPassword?: string
    ownerPassword?: string
    permissions?: PDFPermissions
    encryptionMethod?: "rc4" | "aes" | "aes256"
  },
): Promise<PDFDocument>

/**
 * Decrypt a PDF document
 */
export function decryptPDF(document: PDFDocument, password: string): Promise<PDFDocument>

/**
 * Render a PDF page to a canvas
 */
export function renderPage(
  page: PDFPage,
  options?: {
    scale?: number
    format?: "png" | "jpeg"
    quality?: number
  },
): Promise<Buffer>

/**
 * Extract text from a PDF page
 */
export function extractText(page: PDFPage): Promise<string>

/**
 * Extract text from all pages in a PDF document
 */
export function extractAllText(document: PDFDocument): Promise<string>

/**
 * Extract images from a PDF page
 */
export function extractImages(page: PDFPage): Promise<PDFImage[]>

/**
 * Load a PDF document from a Uint8Array in the browser
 */
export function loadPDFInBrowser(data: Uint8Array): Promise<PDFDocument>

/**
 * Render a PDF page to a canvas element in the browser
 */
export function renderPageToCanvas(
  page: PDFPage,
  canvas: HTMLCanvasElement,
  options?: {
    scale?: number
    rotation?: number
    background?: string
  },
): Promise<void>

/**
 * Download a PDF document as a file in the browser
 */
export function downloadPDF(document: PDFDocument, filename: string): Promise<void>

/**
 * Library version
 */
export const version: string
