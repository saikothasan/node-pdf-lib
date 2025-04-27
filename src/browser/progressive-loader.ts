import type { PDFDocument } from "../document"
import type { PDFPage } from "../page"
import { PDFError, ErrorCodes } from "../error"

/**
 * PDF progressive loader for browser environments
 * @class
 */
export class PDFProgressiveLoader {
  private _buffer: Uint8Array | null = null
  private _document: PDFDocument | null = null
  private _loadedPages: Set<number> = new Set()
  private _pagePromises: Map<number, Promise<PDFPage>> = new Map()
  private _aborted = false

  /**
   * Create a new PDFProgressiveLoader
   * @param {object} options - Loader options
   */
  constructor(
    private options: {
      maxPageCacheSize?: number
      preloadPages?: boolean
    } = {},
  ) {}

  /**
   * Load a PDF document progressively
   * @param {Uint8Array | string} source - PDF data or URL
   * @param {object} options - Loading options
   * @returns {Promise<PDFDocument>} - Promise resolving to a PDFDocument
   */
  async load(
    source: Uint8Array | string,
    options: {
      onProgress?: (loaded: number, total: number) => void
      onPageLoad?: (pageIndex: number) => void
      withCredentials?: boolean
      headers?: Record<string, string>
    } = {},
  ): Promise<PDFDocument> {
    try {
      this._aborted = false

      // Load the document data
      if (typeof source === "string") {
        // Load from URL
        this._buffer = await this._loadFromUrl(source, options)
      } else {
        // Use provided data
        this._buffer = source
      }

      // Parse document structure (but not page content)
      this._document = await this._parseDocumentStructure(this._buffer)

      // Preload pages if requested
      if (this.options.preloadPages) {
        this._preloadPages(this._document)
      }

      return this._document
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.PARSE_ERROR, "Error loading PDF document", error as Error)
    }
  }

  /**
   * Load a specific page
   * @param {number} pageIndex - Page index
   * @returns {Promise<PDFPage>} - Promise resolving to a PDFPage
   */
  async loadPage(pageIndex: number): Promise<PDFPage> {
    if (!this._document) {
      throw new PDFError(ErrorCodes.INVALID_PARAMETER, "Document not loaded")
    }

    if (pageIndex < 0 || pageIndex >= this._document.pageCount) {
      throw new PDFError(ErrorCodes.INVALID_PARAMETER, `Page index ${pageIndex} is out of bounds`)
    }

    // Check if page is already loaded
    if (this._loadedPages.has(pageIndex)) {
      return this._document.getPage(pageIndex)!
    }

    // Check if page is being loaded
    if (this._pagePromises.has(pageIndex)) {
      return this._pagePromises.get(pageIndex)!
    }

    // Load the page
    const pagePromise = this._loadPageContent(pageIndex)
    this._pagePromises.set(pageIndex, pagePromise)

    try {
      const page = await pagePromise
      this._loadedPages.add(pageIndex)
      this._pagePromises.delete(pageIndex)
      return page
    } catch (error) {
      this._pagePromises.delete(pageIndex)
      throw error
    }
  }

  /**
   * Abort current loading operations
   */
  abort(): void {
    this._aborted = true
  }

  /**
   * Clear the page cache
   */
  clearCache(): void {
    this._loadedPages.clear()
  }

  /**
   * Load PDF data from a URL
   * @private
   * @param {string} url - URL to load from
   * @param {object} options - Loading options
   * @returns {Promise<Uint8Array>} - Promise resolving to PDF data
   */
  private async _loadFromUrl(
    url: string,
    options: {
      onProgress?: (loaded: number, total: number) => void
      withCredentials?: boolean
      headers?: Record<string, string>
    },
  ): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("GET", url, true)
      xhr.responseType = "arraybuffer"

      if (options.withCredentials) {
        xhr.withCredentials = true
      }

      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
      }

      xhr.onprogress = (event) => {
        if (options.onProgress && event.lengthComputable) {
          options.onProgress(event.loaded, event.total)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
          const arrayBuffer = xhr.response
          resolve(new Uint8Array(arrayBuffer))
        } else {
          reject(new PDFError(ErrorCodes.NETWORK_ERROR, `HTTP error ${xhr.status}: ${xhr.statusText}`))
        }
      }

      xhr.onerror = () => {
        reject(new PDFError(ErrorCodes.NETWORK_ERROR, "Network error while loading PDF"))
      }

      xhr.onabort = () => {
        reject(new PDFError(ErrorCodes.OPERATION_CANCELED, "PDF loading aborted"))
      }

      xhr.send()
    })
  }

  /**
   * Parse document structure without loading page content
   * @private
   * @param {Uint8Array} buffer - PDF data
   * @returns {Promise<PDFDocument>} - Promise resolving to a PDFDocument
   */
  private async _parseDocumentStructure(buffer: Uint8Array): Promise<PDFDocument> {
    // This is a placeholder for the actual implementation
    // In a real implementation, this would parse the PDF structure
    // without loading all page content
    return {} as PDFDocument
  }

  /**
   * Preload pages in the background
   * @private
   * @param {PDFDocument} document - PDF document
   */
  private _preloadPages(document: PDFDocument): void {
    // This is a placeholder for the actual implementation
    // In a real implementation, this would start loading pages
    // in the background
  }

  /**
   * Load page content
   * @private
   * @param {number} pageIndex - Page index
   * @returns {Promise<PDFPage>} - Promise resolving to a PDFPage
   */
  private async _loadPageContent(pageIndex: number): Promise<PDFPage> {
    // This is a placeholder for the actual implementation
    // In a real implementation, this would load the content
    // for a specific page
    return {} as PDFPage
  }
}
