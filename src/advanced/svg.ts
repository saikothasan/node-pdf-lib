import type { PDFPage } from "../page"
import { PDFError, ErrorCodes } from "../error"

/**
 * SVG to PDF converter
 * @class
 */
export class SVGConverter {
  /**
   * Convert SVG to PDF content
   * @param {string} svgContent - SVG content as string
   * @param {object} options - Conversion options
   * @returns {Promise<object>} - Promise resolving to PDF content object
   */
  static async convertSVG(
    svgContent: string,
    options: {
      x?: number
      y?: number
      width?: number
      height?: number
      preserveAspectRatio?: boolean
    } = {},
  ): Promise<any> {
    try {
      // Parse SVG
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgContent, "image/svg+xml")

      // Check for parsing errors
      const parserError = svgDoc.querySelector("parsererror")
      if (parserError) {
        throw new PDFError(ErrorCodes.INVALID_PARAMETER, "Invalid SVG content: " + parserError.textContent)
      }

      // Get SVG root element
      const svgRoot = svgDoc.documentElement

      // Get SVG dimensions
      const viewBox = svgRoot.getAttribute("viewBox")
      const svgWidth = Number.parseFloat(svgRoot.getAttribute("width") || "0")
      const svgHeight = Number.parseFloat(svgRoot.getAttribute("height") || "0")

      // Parse viewBox
      let viewBoxX = 0
      let viewBoxY = 0
      let viewBoxWidth = svgWidth
      let viewBoxHeight = svgHeight

      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).map(Number.parseFloat)
        if (parts.length === 4) {
          ;[viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = parts
        }
      }

      // Calculate dimensions
      const width = options.width || svgWidth || viewBoxWidth
      const height = options.height || svgHeight || viewBoxHeight

      // Calculate scale
      let scaleX = width / (viewBoxWidth || width)
      let scaleY = height / (viewBoxHeight || height)

      // Preserve aspect ratio if requested
      if (options.preserveAspectRatio !== false) {
        const scale = Math.min(scaleX, scaleY)
        scaleX = scale
        scaleY = scale
      }

      // Convert SVG elements to PDF content
      const pdfContent = this.convertSVGElement(svgRoot, {
        x: options.x || 0,
        y: options.y || 0,
        scaleX,
        scaleY,
        offsetX: -viewBoxX,
        offsetY: -viewBoxY,
      })

      return {
        type: "svg",
        content: pdfContent,
        x: options.x || 0,
        y: options.y || 0,
        width,
        height,
      }
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNSUPPORTED_FEATURE, "Error converting SVG to PDF", error as Error)
    }
  }

  /**
   * Add SVG to a page
   * @param {PDFPage} page - The page to add SVG to
   * @param {string} svgContent - SVG content as string
   * @param {object} options - Conversion options
   * @returns {Promise<void>} - Promise resolving when SVG is added
   */
  static async addSVGToPage(
    page: PDFPage,
    svgContent: string,
    options: {
      x?: number
      y?: number
      width?: number
      height?: number
      preserveAspectRatio?: boolean
    } = {},
  ): Promise<void> {
    const pdfContent = await this.convertSVG(svgContent, options)
    page.addContent(pdfContent)
  }

  /**
   * Convert SVG element to PDF content
   * @param {SVGElement} element - SVG element to convert
   * @param {object} options - Conversion options
   * @returns {object} - PDF content object
   * @private
   */
  private static convertSVGElement(
    element: SVGElement,
    options: {
      x: number
      y: number
      scaleX: number
      scaleY: number
      offsetX: number
      offsetY: number
    },
  ): any {
    // This is a simplified implementation
    // In a real implementation, we would recursively convert all SVG elements
    // and their attributes to PDF content objects

    // For now, we'll return a placeholder
    return {
      type: "vector",
      x: options.x,
      y: options.y,
      scaleX: options.scaleX,
      scaleY: options.scaleY,
      paths: [],
      styles: {},
    }
  }
}
