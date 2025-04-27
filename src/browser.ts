import type { PDFDocument } from "./document"
import { PDFParser } from "./parser"
import { PDFError, ErrorCodes } from "./error"

/**
 * Load a PDF document from a Uint8Array in the browser
 * @param {Uint8Array} data - Uint8Array containing PDF data
 * @returns {Promise<PDFDocument>} - Promise resolving to a PDFDocument
 */
export async function loadPDFInBrowser(data: Uint8Array): Promise<PDFDocument> {
  try {
    const buffer = Buffer.from(data)
    const parser = new PDFParser()
    return await parser.parse(buffer)
  } catch (error) {
    throw new PDFError(ErrorCodes.PARSE_ERROR, "Could not parse PDF from data", error as Error)
  }
}

/**
 * Render a PDF page to a canvas element in the browser
 * @param {PDFPage} page - The PDF page to render
 * @param {HTMLCanvasElement} canvas - The canvas element to render to
 * @param {object} options - Rendering options
 * @returns {Promise<void>} - Promise resolving when rendering is complete
 */
export async function renderPageToCanvas(
  page: any, // Using any to avoid circular dependency with PDFPage
  canvas: HTMLCanvasElement,
  options: {
    scale?: number
    rotation?: number
    background?: string
  } = {},
): Promise<void> {
  try {
    // Set canvas dimensions
    const scale = options.scale || 1.0
    const rotation = options.rotation !== undefined ? options.rotation : page.rotation

    // Calculate dimensions based on rotation
    let width = page.width
    let height = page.height

    if (rotation === 90 || rotation === 270) {
      // Swap dimensions for 90° and 270° rotations
      ;[width, height] = [height, width]
    }

    canvas.width = width * scale
    canvas.height = height * scale

    // Get context and configure
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new PDFError(ErrorCodes.RENDER_ERROR, "Could not get canvas context")
    }

    // Clear background
    ctx.fillStyle = options.background || "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
    }

    // In a real implementation, this would render the page content
    // For now, we'll just draw a placeholder
    ctx.fillStyle = "lightgray"
    ctx.fillRect(50 * scale, 50 * scale, width - 100 * scale, height - 100 * scale)

    ctx.font = `${12 * scale}px Arial`
    ctx.fillStyle = "black"
    ctx.fillText("PDF Page Content", 100 * scale, 100 * scale)
  } catch (error) {
    throw new PDFError(ErrorCodes.RENDER_ERROR, "Error rendering PDF page to canvas", error as Error)
  }
}

/**
 * Download a PDF document as a file in the browser
 * @param {PDFDocument} document - The document to download
 * @param {string} filename - The filename to use
 * @returns {Promise<void>} - Promise resolving when the download starts
 */
export async function downloadPDF(document: PDFDocument, filename: string): Promise<void> {
  try {
    const buffer = await document.toBuffer()
    const blob = new Blob([buffer], { type: "application/pdf" })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename

    // Append to the document, click, and clean up
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Release the blob URL
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error downloading PDF", error as Error)
  }
}
