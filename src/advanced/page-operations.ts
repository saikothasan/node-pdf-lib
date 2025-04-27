import { PDFDocument } from "../document"
import { PDFPage } from "../page"
import { PDFError, ErrorCodes } from "../error"

/**
 * PDF page operations for manipulating PDF pages
 * @class
 */
export class PDFPageOperations {
  /**
   * Split a PDF document into multiple documents
   * @param {PDFDocument} document - The document to split
   * @param {object} options - Split options
   * @returns {Promise<PDFDocument[]>} - Promise resolving to an array of documents
   */
  static async splitDocument(
    document: PDFDocument,
    options: {
      mode: "single" | "ranges" | "every"
      ranges?: Array<{ start: number; end: number }>
      pageCount?: number
    },
  ): Promise<PDFDocument[]> {
    const result: PDFDocument[] = []

    if (options.mode === "single") {
      // Split into single-page documents
      for (let i = 0; i < document.pageCount; i++) {
        const page = document.getPage(i)
        if (page) {
          const newDoc = new PDFDocument({
            metadata: {
              ...document.metadata,
              title: `${document.metadata.title || "Document"} - Page ${i + 1}`,
            },
          })
          newDoc.addPage(this.clonePage(page))
          result.push(newDoc)
        }
      }
    } else if (options.mode === "ranges" && options.ranges) {
      // Split by page ranges
      for (const range of options.ranges) {
        const start = Math.max(0, range.start)
        const end = Math.min(document.pageCount - 1, range.end)

        if (start <= end) {
          const newDoc = new PDFDocument({
            metadata: {
              ...document.metadata,
              title: `${document.metadata.title || "Document"} - Pages ${start + 1}-${end + 1}`,
            },
          })

          for (let i = start; i <= end; i++) {
            const page = document.getPage(i)
            if (page) {
              newDoc.addPage(this.clonePage(page))
            }
          }

          result.push(newDoc)
        }
      }
    } else if (options.mode === "every" && options.pageCount) {
      // Split into documents with specified page count
      const pageCount = options.pageCount

      for (let start = 0; start < document.pageCount; start += pageCount) {
        const end = Math.min(start + pageCount - 1, document.pageCount - 1)

        const newDoc = new PDFDocument({
          metadata: {
            ...document.metadata,
            title: `${document.metadata.title || "Document"} - Part ${Math.floor(start / pageCount) + 1}`,
          },
        })

        for (let i = start; i <= end; i++) {
          const page = document.getPage(i)
          if (page) {
            newDoc.addPage(this.clonePage(page))
          }
        }

        result.push(newDoc)
      }
    } else {
      throw new PDFError(ErrorCodes.INVALID_PARAMETER, "Invalid split mode or missing required parameters")
    }

    return result
  }

  /**
   * Extract specific pages from a document
   * @param {PDFDocument} document - The source document
   * @param {number[]} pageIndices - Indices of pages to extract
   * @returns {Promise<PDFDocument>} - Promise resolving to a new document with extracted pages
   */
  static async extractPages(document: PDFDocument, pageIndices: number[]): Promise<PDFDocument> {
    const newDoc = new PDFDocument({
      metadata: {
        ...document.metadata,
        title: `${document.metadata.title || "Document"} - Extracted Pages`,
      },
    })

    for (const index of pageIndices) {
      if (index >= 0 && index < document.pageCount) {
        const page = document.getPage(index)
        if (page) {
          newDoc.addPage(this.clonePage(page))
        }
      }
    }

    return newDoc
  }

  /**
   * Rotate pages in a document
   * @param {PDFDocument} document - The document to modify
   * @param {number} rotation - Rotation angle in degrees (90, 180, 270)
   * @param {number[]} pageIndices - Indices of pages to rotate, empty for all pages
   * @returns {Promise<PDFDocument>} - Promise resolving to the modified document
   */
  static async rotatePages(
    document: PDFDocument,
    rotation: 90 | 180 | 270,
    pageIndices?: number[],
  ): Promise<PDFDocument> {
    const indices = pageIndices || Array.from({ length: document.pageCount }, (_, i) => i)

    for (const index of indices) {
      if (index >= 0 && index < document.pageCount) {
        const page = document.getPage(index)
        if (page) {
          // Calculate new rotation (normalized to 0, 90, 180, 270)
          const newRotation = (page.rotation + rotation) % 360
          page.setRotation(newRotation)
        }
      }
    }

    return document
  }

  /**
   * Scale pages in a document
   * @param {PDFDocument} document - The document to modify
   * @param {number} scale - Scale factor
   * @param {number[]} pageIndices - Indices of pages to scale, empty for all pages
   * @returns {Promise<PDFDocument>} - Promise resolving to the modified document
   */
  static async scalePages(document: PDFDocument, scale: number, pageIndices?: number[]): Promise<PDFDocument> {
    if (scale <= 0) {
      throw new PDFError(ErrorCodes.INVALID_PARAMETER, "Scale factor must be greater than 0")
    }

    const indices = pageIndices || Array.from({ length: document.pageCount }, (_, i) => i)

    for (const index of indices) {
      if (index >= 0 && index < document.pageCount) {
        const page = document.getPage(index)
        if (page) {
          // Create a new page with scaled dimensions
          const newPage = new PDFPage({
            width: page.width * scale,
            height: page.height * scale,
            rotation: page.rotation,
            compressed: page.compressed,
          })

          // Scale and copy content
          for (const item of page.content) {
            if (item.position) {
              const scaledItem = { ...item }

              // Scale position
              scaledItem.position = {
                x: item.position.x * scale,
                y: item.position.y * scale,
              }

              // Scale dimensions if applicable
              if ("width" in item && "height" in item) {
                scaledItem.width = (item.width as number) * scale
                scaledItem.height = (item.height as number) * scale
              }

              // Scale font size if applicable
              if ("fontSize" in item) {
                scaledItem.fontSize = (item.fontSize as number) * scale
              }

              newPage.addContent(scaledItem)
            } else {
              newPage.addContent(item)
            }
          }

          // Replace the original page
          document.replacePage(index, newPage)
        }
      }
    }

    return document
  }

  /**
   * Crop pages in a document
   * @param {PDFDocument} document - The document to modify
   * @param {object} cropBox - Crop box dimensions
   * @param {number[]} pageIndices - Indices of pages to crop, empty for all pages
   * @returns {Promise<PDFDocument>} - Promise resolving to the modified document
   */
  static async cropPages(
    document: PDFDocument,
    cropBox: {
      x: number
      y: number
      width: number
      height: number
    },
    pageIndices?: number[],
  ): Promise<PDFDocument> {
    const indices = pageIndices || Array.from({ length: document.pageCount }, (_, i) => i)

    for (const index of indices) {
      if (index >= 0 && index < document.pageCount) {
        const page = document.getPage(index)
        if (page) {
          // Set crop box for the page
          page.setCropBox(cropBox)
        }
      }
    }

    return document
  }

  /**
   * Clone a page
   * @param {PDFPage} page - The page to clone
   * @returns {PDFPage} - The cloned page
   * @private
   */
  private static clonePage(page: PDFPage): PDFPage {
    const newPage = new PDFPage({
      width: page.width,
      height: page.height,
      rotation: page.rotation,
      compressed: page.compressed,
    })

    // Copy content
    for (const item of page.content) {
      newPage.addContent({ ...item })
    }

    // Copy annotations
    for (const annotation of page.annotations) {
      newPage.addAnnotation(annotation)
    }

    // Copy crop box if exists
    if (page.cropBox) {
      newPage.setCropBox(page.cropBox)
    }

    return newPage
  }
}
