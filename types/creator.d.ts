// Type definitions for node-pdf-lib creator module
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

import type { Buffer } from "buffer"
import type { PDFDocument } from "./document"
import type { PDFPage } from "./page"
import type { PDFText } from "./text"
import type { PDFImage } from "./image"

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
