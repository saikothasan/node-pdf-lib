import type { PDFDocument } from "../document"
import { PDFError, ErrorCodes } from "../error"

/**
 * Attachment options
 */
export interface AttachmentOptions {
  filename: string
  description?: string
  creationDate?: Date
  modificationDate?: Date
  mimeType?: string
  data: Buffer
}

/**
 * PDF attachments handler
 * @class
 */
export class PDFAttachments {
  /**
   * Add an attachment to a document
   * @param {PDFDocument} document - The document to add attachment to
   * @param {AttachmentOptions} options - Attachment options
   * @returns {Promise<void>} - Promise resolving when attachment is added
   */
  static async addAttachment(document: PDFDocument, options: AttachmentOptions): Promise<void> {
    try {
      // Get existing attachments
      const attachments = document.attachments || []

      // Add new attachment
      attachments.push({
        filename: options.filename,
        description: options.description || "",
        creationDate: options.creationDate || new Date(),
        modificationDate: options.modificationDate || new Date(),
        mimeType: options.mimeType || this.guessMimeType(options.filename),
        data: options.data,
      })

      // Update document
      document.setAttachments(attachments)
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error adding attachment to document", error as Error)
    }
  }

  /**
   * Get attachments from a document
   * @param {PDFDocument} document - The document to get attachments from
   * @returns {Promise<Array<{filename: string, description: string, creationDate: Date, modificationDate: Date, mimeType: string, data: Buffer}>>} - Promise resolving to attachments
   */
  static async getAttachments(document: PDFDocument): Promise<
    Array<{
      filename: string
      description: string
      creationDate: Date
      modificationDate: Date
      mimeType: string
      data: Buffer
    }>
  > {
    try {
      return document.attachments || []
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error getting attachments from document", error as Error)
    }
  }

  /**
   * Remove an attachment from a document
   * @param {PDFDocument} document - The document to remove attachment from
   * @param {string} filename - Attachment filename
   * @returns {Promise<boolean>} - Promise resolving to true if attachment was removed
   */
  static async removeAttachment(document: PDFDocument, filename: string): Promise<boolean> {
    try {
      const attachments = document.attachments || []
      const initialLength = attachments.length

      // Filter out the attachment with the given filename
      const filteredAttachments = attachments.filter((attachment) => attachment.filename !== filename)

      // Update document
      document.setAttachments(filteredAttachments)

      return filteredAttachments.length < initialLength
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error removing attachment from document", error as Error)
    }
  }

  /**
   * Extract an attachment from a document
   * @param {PDFDocument} document - The document to extract attachment from
   * @param {string} filename - Attachment filename
   * @returns {Promise<Buffer | null>} - Promise resolving to attachment data or null if not found
   */
  static async extractAttachment(document: PDFDocument, filename: string): Promise<Buffer | null> {
    try {
      const attachments = document.attachments || []

      // Find the attachment with the given filename
      const attachment = attachments.find((attachment) => attachment.filename === filename)

      return attachment ? attachment.data : null
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error extracting attachment from document", error as Error)
    }
  }

  /**
   * Guess MIME type from filename
   * @param {string} filename - Filename
   * @returns {string} - MIME type
   * @private
   */
  private static guessMimeType(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() || ""

    switch (extension) {
      case "pdf":
        return "application/pdf"
      case "txt":
        return "text/plain"
      case "html":
        return "text/html"
      case "htm":
        return "text/html"
      case "xml":
        return "application/xml"
      case "json":
        return "application/json"
      case "jpg":
        return "image/jpeg"
      case "jpeg":
        return "image/jpeg"
      case "png":
        return "image/png"
      case "gif":
        return "image/gif"
      case "svg":
        return "image/svg+xml"
      case "doc":
        return "application/msword"
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      case "xls":
        return "application/vnd.ms-excel"
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      case "ppt":
        return "application/vnd.ms-powerpoint"
      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      case "zip":
        return "application/zip"
      case "rar":
        return "application/x-rar-compressed"
      case "tar":
        return "application/x-tar"
      case "gz":
        return "application/gzip"
      case "mp3":
        return "audio/mpeg"
      case "mp4":
        return "video/mp4"
      default:
        return "application/octet-stream"
    }
  }
}
