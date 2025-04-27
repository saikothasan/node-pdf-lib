import { PDFSerializer } from "./serializer"
import { PDFError, ErrorCodes } from "./error"
import * as fs from "fs"

/**
 * Represents a PDF document
 * @class
 */
export class PDFDocument {
  private _pages: PDFPage[] = []
  private _metadata: PDFMetadata = {}
  private _outline: PDFOutline | null = null
  private _form: PDFForm | null = null
  private _compressed = false

  /**
   * Create a new PDFDocument
   * @param {object} options - Document options
   */
  constructor(options: { metadata?: PDFMetadata } = {}) {
    if (options.metadata) {
      this._metadata = options.metadata
    }
  }

  /**
   * Get the number of pages in the document
   * @returns {number} - Number of pages
   */
  get pageCount(): number {
    return this._pages.length
  }

  /**
   * Get the document metadata
   * @returns {PDFMetadata} - Document metadata
   */
  get metadata(): PDFMetadata {
    return { ...this._metadata }
  }

  /**
   * Get the document outline (bookmarks)
   * @returns {PDFOutline | null} - Document outline
   */
  get outline(): PDFOutline | null {
    return this._outline
  }

  /**
   * Get the document form
   * @returns {PDFForm | null} - Document form
   */
  get form(): PDFForm | null {
    return this._form
  }

  /**
   * Check if the document is compressed
   * @returns {boolean} - True if the document is compressed
   */
  get compressed(): boolean {
    return this._compressed
  }

  /**
   * Get a page by index
   * @param {number} index - Page index (0-based)
   * @returns {PDFPage | null} - The page, or null if index is out of bounds
   */
  getPage(index: number): PDFPage | null {
    if (index < 0 || index >= this._pages.length) {
      return null
    }
    return this._pages[index]
  }

  /**
   * Get all pages
   * @returns {PDFPage[]} - Array of pages
   */
  getPages(): PDFPage[] {
    return [...this._pages]
  }

  /**
   * Set document metadata
   * @param {PDFMetadata} metadata - Document metadata
   */
  setMetadata(metadata: PDFMetadata): void {
    this._metadata = { ...metadata }
  }

  /**
   * Add a page to the document
   * @param {PDFPage} page - The page to add
   */
  addPage(page: PDFPage): void {
    this._pages.push(page)
  }

  /**
   * Set the document outline
   * @param {PDFOutline} outline - Document outline
   */
  setOutline(outline: PDFOutline): void {
    this._outline = outline
  }

  /**
   * Set the document form
   * @param {PDFForm} form - Document form
   */
  setForm(form: PDFForm): void {
    this._form = form
  }

  /**
   * Save the document to a file
   * @param {string} filePath - Path to save the file
   * @returns {Promise<void>} - Promise resolving when the file is saved
   */
  async save(filePath: string): Promise<void> {
    try {
      const buffer = await this.toBuffer()
      await fs.promises.writeFile(filePath, buffer)
    } catch (error) {
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, `Error saving PDF to ${filePath}`, error as Error)
    }
  }

  /**
   * Convert the document to a buffer
   * @param {object} options - Serialization options
   * @returns {Promise<Buffer>} - Promise resolving to a buffer containing the PDF data
   */
  async toBuffer(
    options: {
      compress?: boolean
      encrypt?: boolean
      userPassword?: string
      ownerPassword?: string
    } = {},
  ): Promise<Buffer> {
    try {
      // Create a serializer with the specified options
      const serializer = new PDFSerializer({
        compressStreams: options.compress !== false,
        encryptDocument: options.encrypt || false,
        userPassword: options.userPassword,
        ownerPassword: options.ownerPassword,
      })

      // Serialize the document
      return await serializer.serialize(this)
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error converting PDF to buffer", error as Error)
    }
  }

  /**
   * Compress the document
   * @returns {Promise<void>} - Promise resolving when compression is complete
   */
  async compress(): Promise<void> {
    if (this._compressed) {
      return // Already compressed
    }

    try {
      // Compress each page
      for (const page of this._pages) {
        await page.compress()
      }

      this._compressed = true
    } catch (error) {
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error compressing PDF document", error as Error)
    }
  }

  /**
   * Decompress the document
   * @returns {Promise<void>} - Promise resolving when decompression is complete
   */
  async decompress(): Promise<void> {
    if (!this._compressed) {
      return // Not compressed
    }

    try {
      // Decompress each page
      for (const page of this._pages) {
        await page.decompress()
      }

      this._compressed = false
    } catch (error) {
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error decompressing PDF document", error as Error)
    }
  }
}

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

// Import at the end to avoid circular dependencies
import type { PDFPage } from "./page"
import type { PDFOutline } from "./outline"
import type { PDFForm } from "./form"
