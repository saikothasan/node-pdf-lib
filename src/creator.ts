import { PDFDocument } from "./document"
import { PDFPage } from "./page"
import { PDFText } from "./text"
import { PDFImage } from "./image"
import { PDFError, ErrorCodes } from "./error"
import * as fs from "fs"

/**
 * PDF creator for creating PDF documents from scratch
 * @class
 */
export class PDFCreator {
  private _document: PDFDocument

  /**
   * Create a new PDFCreator
   * @param {object} options - Creator options
   */
  constructor(
    options: {
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
    } = {},
  ) {
    this._document = new PDFDocument({ metadata: options.metadata })
  }

  /**
   * Get the document being created
   * @returns {PDFDocument} - The document
   */
  get document(): PDFDocument {
    return this._document
  }

  /**
   * Add a new blank page to the document
   * @param {object} options - Page options
   * @returns {PDFPage} - The added page
   */
  addPage(
    options: {
      width?: number
      height?: number
      rotation?: number
    } = {},
  ): PDFPage {
    const page = new PDFPage(options)
    this._document.addPage(page)
    return page
  }

  /**
   * Add text to a page
   * @param {PDFPage} page - The page to add text to
   * @param {string} text - The text to add
   * @param {object} options - Text options
   * @returns {PDFText} - The added text
   */
  addText(
    page: PDFPage,
    text: string,
    options: {
      x?: number
      y?: number
      font?: string
      fontSize?: number
      color?: string
    } = {},
  ): PDFText {
    const pdfText = new PDFText({
      text,
      font: options.font,
      fontSize: options.fontSize,
      color: options.color,
      position: { x: options.x || 0, y: options.y || 0 },
    })

    page.addContent(pdfText)
    return pdfText
  }

  /**
   * Add an image to a page
   * @param {PDFPage} page - The page to add the image to
   * @param {Buffer} imageData - The image data
   * @param {object} options - Image options
   * @returns {Promise<PDFImage>} - Promise resolving to the added image
   */
  async addImage(
    page: PDFPage,
    imageData: Buffer,
    options: {
      x?: number
      y?: number
      width?: number
      height?: number
      format?: "jpeg" | "png" | "gif"
    } = {},
  ): Promise<PDFImage> {
    // Ensure format is specified or detect from image data
    const format = options.format || this.detectImageFormat(imageData)
    if (!format) {
      throw new PDFError(ErrorCodes.INVALID_PARAMETER, "Image format not specified and could not be detected")
    }

    // Get image dimensions (simplified implementation)
    const { width, height } = await this.getImageDimensions(imageData, format)

    const pdfImage = new PDFImage({
      width: options.width || width,
      height: options.height || height,
      data: imageData,
      format,
      position: { x: options.x || 0, y: options.y || 0 },
    })

    page.addContent(pdfImage)
    return pdfImage
  }

  /**
   * Save the document to a file
   * @param {string} filePath - Path to save the file
   * @returns {Promise<void>} - Promise resolving when the file is saved
   */
  async saveToFile(filePath: string): Promise<void> {
    const buffer = await this._document.toBuffer()
    await fs.promises.writeFile(filePath, buffer)
  }

  /**
   * Detect the format of an image from its data
   * @param {Buffer} imageData - The image data
   * @returns {"jpeg" | "png" | "gif" | null} - The detected format, or null if unknown
   * @private
   */
  private detectImageFormat(imageData: Buffer): "jpeg" | "png" | "gif" | null {
    if (imageData.length < 4) {
      return null
    }

    // Check PNG signature
    if (imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4e && imageData[3] === 0x47) {
      return "png"
    }

    // Check JPEG signature
    if (
      imageData[0] === 0xff &&
      imageData[1] === 0xd8 &&
      imageData[imageData.length - 2] === 0xff &&
      imageData[imageData.length - 1] === 0xd9
    ) {
      return "jpeg"
    }

    // Check GIF signature
    if (imageData[0] === 0x47 && imageData[1] === 0x49 && imageData[2] === 0x46 && imageData[3] === 0x38) {
      return "gif"
    }

    return null
  }

  /**
   * Get the dimensions of an image
   * @param {Buffer} imageData - The image data
   * @param {"jpeg" | "png" | "gif"} format - The image format
   * @returns {Promise<{ width: number, height: number }>} - Promise resolving to the image dimensions
   * @private
   */
  private async getImageDimensions(
    imageData: Buffer,
    format: "jpeg" | "png" | "gif",
  ): Promise<{ width: number; height: number }> {
    // This is a simplified implementation that would normally use image processing
    // libraries to determine the dimensions

    // For now, return a placeholder size
    return { width: 100, height: 100 }
  }
}
