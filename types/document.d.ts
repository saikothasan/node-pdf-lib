// Type definitions for node-pdf-lib document module
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

import type { Buffer } from "buffer"
import type { PDFPage } from "./page"
import type { PDFOutline } from "./outline"
import type { PDFForm } from "./form"

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
