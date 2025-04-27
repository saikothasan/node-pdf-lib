import type { PDFDocument } from "../document"
import type { PDFPage } from "../page"
import { PDFRenderer } from "../renderer"
import { PDFError, ErrorCodes } from "../error"

/**
 * PDF to image converter
 * @class
 */
export class PDFToImage {
  /**
   * Convert a PDF document to images
   * @param {PDFDocument} document - The document to convert
   * @param {object} options - Conversion options
   * @returns {Promise<Buffer[]>} - Promise resolving to an array of image buffers
   */
  static async convertToImages(
    document: PDFDocument,
    options: {
      format?: "png" | "jpeg"
      quality?: number
      scale?: number
      dpi?: number
      pageIndices?: number[]
    } = {},
  ): Promise<Buffer[]> {
    try {
      const renderer = new PDFRenderer()
      const result: Buffer[] = []

      // Determine which pages to convert
      const pageIndices = options.pageIndices || Array.from({ length: document.pageCount }, (_, i) => i)

      // Calculate scale based on DPI if provided
      let scale = options.scale || 1.0
      if (options.dpi) {
        // Standard PDF is 72 DPI
        scale = options.dpi / 72
      }

      // Convert each page
      for (const index of pageIndices) {
        if (index >= 0 && index < document.pageCount) {
          const page = document.getPage(index)
          if (page) {
            const imageBuffer = await renderer.renderPage(page, {
              scale,
              format: options.format || "png",
              quality: options.quality || 0.9,
            })

            result.push(imageBuffer)
          }
        }
      }

      return result
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.RENDER_ERROR, "Error converting PDF to images", error as Error)
    }
  }

  /**
   * Convert a PDF page to an image
   * @param {PDFPage} page - The page to convert
   * @param {object} options - Conversion options
   * @returns {Promise<Buffer>} - Promise resolving to an image buffer
   */
  static async convertPageToImage(
    page: PDFPage,
    options: {
      format?: "png" | "jpeg"
      quality?: number
      scale?: number
      dpi?: number
    } = {},
  ): Promise<Buffer> {
    try {
      const renderer = new PDFRenderer()

      // Calculate scale based on DPI if provided
      let scale = options.scale || 1.0
      if (options.dpi) {
        // Standard PDF is 72 DPI
        scale = options.dpi / 72
      }

      return await renderer.renderPage(page, {
        scale,
        format: options.format || "png",
        quality: options.quality || 0.9,
      })
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.RENDER_ERROR, "Error converting PDF page to image", error as Error)
    }
  }

  /**
   * Convert a PDF document to a thumbnail
   * @param {PDFDocument} document - The document to convert
   * @param {object} options - Conversion options
   * @returns {Promise<Buffer>} - Promise resolving to a thumbnail image buffer
   */
  static async createThumbnail(
    document: PDFDocument,
    options: {
      pageIndex?: number
      width?: number
      height?: number
      format?: "png" | "jpeg"
      quality?: number
    } = {},
  ): Promise<Buffer> {
    try {
      const pageIndex = options.pageIndex || 0
      const page = document.getPage(pageIndex)

      if (!page) {
        throw new PDFError(ErrorCodes.INVALID_PARAMETER, `Page index ${pageIndex} is out of bounds`)
      }

      const renderer = new PDFRenderer()

      // Calculate scale to fit the requested dimensions
      let scale = 1.0

      if (options.width && options.height) {
        const scaleX = options.width / page.width
        const scaleY = options.height / page.height
        scale = Math.min(scaleX, scaleY)
      } else if (options.width) {
        scale = options.width / page.width
      } else if (options.height) {
        scale = options.height / page.height
      }

      return await renderer.renderPage(page, {
        scale,
        format: options.format || "jpeg",
        quality: options.quality || 0.8,
      })
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.RENDER_ERROR, "Error creating thumbnail", error as Error)
    }
  }
}
