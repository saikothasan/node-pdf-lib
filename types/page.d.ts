// Type definitions for node-pdf-lib page module
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

import type { PDFAnnotation } from "./annotation"
import type { PDFImage } from "./image"

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
