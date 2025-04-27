import type { PDFDocument } from "../document"
import type { PDFPage } from "../page"
import { PDFText } from "../text"
import type { PDFImage } from "../image"
import { PDFTextStyling } from "./text-styling"

/**
 * Watermark options
 */
export interface WatermarkOptions {
  text?: string
  image?: PDFImage
  opacity?: number
  rotation?: number
  scale?: number
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | { x: number; y: number }
  pages?: number[] // Specific pages to apply watermark to, empty for all pages
  textStyle?: {
    font?: string
    fontSize?: number
    color?: string
    bold?: boolean
    italic?: boolean
  }
}

/**
 * PDF watermark for adding watermarks to PDF documents
 * @class
 */
export class PDFWatermark {
  /**
   * Add a watermark to a document
   * @param {PDFDocument} document - The document to add watermark to
   * @param {WatermarkOptions} options - Watermark options
   * @returns {Promise<PDFDocument>} - Promise resolving to the document with watermark
   */
  static async addWatermark(document: PDFDocument, options: WatermarkOptions): Promise<PDFDocument> {
    // Determine which pages to apply watermark to
    const pageIndices =
      options.pages && options.pages.length > 0
        ? options.pages
        : Array.from({ length: document.pageCount }, (_, i) => i)

    // Apply watermark to each page
    for (const pageIndex of pageIndices) {
      const page = document.getPage(pageIndex)
      if (page) {
        await this.addWatermarkToPage(page, options)
      }
    }

    return document
  }

  /**
   * Add a watermark to a page
   * @param {PDFPage} page - The page to add watermark to
   * @param {WatermarkOptions} options - Watermark options
   * @returns {Promise<void>} - Promise resolving when watermark is added
   */
  static async addWatermarkToPage(page: PDFPage, options: WatermarkOptions): Promise<void> {
    // Calculate position
    const { width, height } = page
    let x = 0
    let y = 0

    if (typeof options.position === "object") {
      x = options.position.x
      y = options.position.y
    } else {
      switch (options.position || "center") {
        case "center":
          x = width / 2
          y = height / 2
          break
        case "top-left":
          x = 20
          y = height - 20
          break
        case "top-right":
          x = width - 20
          y = height - 20
          break
        case "bottom-left":
          x = 20
          y = 20
          break
        case "bottom-right":
          x = width - 20
          y = 20
          break
      }
    }

    // Create watermark content
    if (options.text) {
      // Text watermark
      const text = new PDFText({
        text: options.text,
        position: { x, y },
        font: options.textStyle?.font || "Helvetica",
        fontSize: options.textStyle?.fontSize || 72,
        color: options.textStyle?.color || "#CCCCCC",
      })

      // Apply styling
      PDFTextStyling.applyStyle(text, {
        ...options.textStyle,
        opacity: options.opacity || 0.3,
        transform: {
          rotate: options.rotation || -45,
          scaleX: options.scale || 1,
          scaleY: options.scale || 1,
        },
      })

      // Add to page as watermark
      page.addContent({
        ...text,
        isWatermark: true,
      })
    } else if (options.image) {
      // Image watermark
      const image = { ...options.image }

      // Apply transformations
      const scale = options.scale || 1
      const scaledWidth = image.width * scale
      const scaledHeight = image.height * scale

      // Position the image
      image.setPosition({ x: x - scaledWidth / 2, y: y - scaledHeight / 2 })

      // Add to page as watermark with opacity and rotation
      page.addContent({
        ...image,
        isWatermark: true,
        opacity: options.opacity || 0.3,
        rotation: options.rotation || 0,
      })
    }
  }

  /**
   * Add a background to a document
   * @param {PDFDocument} document - The document to add background to
   * @param {PDFImage | string} background - Background image or color
   * @param {object} options - Background options
   * @returns {Promise<PDFDocument>} - Promise resolving to the document with background
   */
  static async addBackground(
    document: PDFDocument,
    background: PDFImage | string,
    options: {
      opacity?: number
      scale?: "fit" | "stretch" | "tile" | number
      pages?: number[]
    } = {},
  ): Promise<PDFDocument> {
    // Determine which pages to apply background to
    const pageIndices =
      options.pages && options.pages.length > 0
        ? options.pages
        : Array.from({ length: document.pageCount }, (_, i) => i)

    // Apply background to each page
    for (const pageIndex of pageIndices) {
      const page = document.getPage(pageIndex)
      if (page) {
        await this.addBackgroundToPage(page, background, options)
      }
    }

    return document
  }

  /**
   * Add a background to a page
   * @param {PDFPage} page - The page to add background to
   * @param {PDFImage | string} background - Background image or color
   * @param {object} options - Background options
   * @returns {Promise<void>} - Promise resolving when background is added
   */
  static async addBackgroundToPage(
    page: PDFPage,
    background: PDFImage | string,
    options: {
      opacity?: number
      scale?: "fit" | "stretch" | "tile" | number
    } = {},
  ): Promise<void> {
    const { width, height } = page

    if (typeof background === "string") {
      // Color background
      page.addContent({
        type: "rectangle",
        x: 0,
        y: 0,
        width,
        height,
        fillColor: background,
        opacity: options.opacity || 1,
        isBackground: true,
      })
    } else {
      // Image background
      const image = { ...background }
      let scale = 1

      // Calculate scaling
      if (typeof options.scale === "number") {
        scale = options.scale
      } else {
        switch (options.scale) {
          case "fit":
            const scaleX = width / image.width
            const scaleY = height / image.height
            scale = Math.min(scaleX, scaleY)
            break
          case "stretch":
            image.resize(width, height)
            break
          case "tile":
            // For tiling, we'll create a pattern
            page.addContent({
              type: "pattern",
              image,
              width: image.width,
              height: image.height,
              x: 0,
              y: 0,
              patternWidth: width,
              patternHeight: height,
              opacity: options.opacity || 1,
              isBackground: true,
            })
            return
        }
      }

      if (options.scale !== "stretch") {
        const scaledWidth = image.width * scale
        const scaledHeight = image.height * scale

        // Center the image
        const x = (width - scaledWidth) / 2
        const y = (height - scaledHeight) / 2

        image.setPosition({ x, y })
        image.resize(scaledWidth, scaledHeight)
      }

      // Add to page as background
      page.addContent({
        ...image,
        opacity: options.opacity || 1,
        isBackground: true,
      })
    }
  }
}
