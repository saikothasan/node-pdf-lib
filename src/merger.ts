import { PDFDocument } from "./document"
import { PDFPage } from "./page"
import { PDFError, ErrorCodes } from "./error"

/**
 * PDF merger for merging multiple PDF documents
 * @class
 */
export class PDFMerger {
  private _documents: PDFDocument[] = []

  /**
   * Create a new PDFMerger
   * @param {PDFDocument[]} documents - Documents to add
   */
  constructor(documents: PDFDocument[] = []) {
    this._documents = [...documents]
  }

  /**
   * Add a document to the merger
   * @param {PDFDocument} document - The document to add
   */
  addDocument(document: PDFDocument): void {
    this._documents.push(document)
  }

  /**
   * Add documents to the merger
   * @param {PDFDocument[]} documents - The documents to add
   */
  addDocuments(documents: PDFDocument[]): void {
    this._documents.push(...documents)
  }

  /**
   * Merge the documents
   * @param {object} options - Merge options
   * @returns {Promise<PDFDocument>} - Promise resolving to the merged document
   */
  async merge(
    options: {
      keepOutlines?: boolean
      keepAnnotations?: boolean
      keepFormFields?: boolean
    } = {},
  ): Promise<PDFDocument> {
    try {
      if (this._documents.length === 0) {
        throw new PDFError(ErrorCodes.INVALID_PARAMETER, "No documents to merge")
      }

      // Create a new document for the result
      const mergedDocument = new PDFDocument()

      // Process each document
      for (const document of this._documents) {
        // Add all pages
        for (let i = 0; i < document.pageCount; i++) {
          const page = document.getPage(i)
          if (page) {
            // Clone the page (in a real implementation, this would involve
            // deep copying the page's content and resources)
            const newPage = this.clonePage(page)
            mergedDocument.addPage(newPage)
          }
        }

        // Merge metadata (simple approach - use the first document's metadata)
        if (mergedDocument.metadata.title === undefined && document.metadata.title) {
          mergedDocument.setMetadata({
            ...mergedDocument.metadata,
            title: document.metadata.title,
          })
        }

        // Merge outlines if requested
        if (options.keepOutlines && document.outline) {
          // In a real implementation, this would properly merge the outlines
          if (!mergedDocument.outline) {
            mergedDocument.setOutline(document.outline)
          }
        }

        // Merge annotations if requested
        if (options.keepAnnotations) {
          // Would merge annotations in a real implementation
        }

        // Merge form fields if requested
        if (options.keepFormFields && document.form) {
          // Would merge form fields in a real implementation
          if (!mergedDocument.form) {
            mergedDocument.setForm(document.form)
          }
        }
      }

      return mergedDocument
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error merging PDF documents", error as Error)
    }
  }

  /**
   * Clone a page
   * @param {PDFPage} page - The page to clone
   * @returns {PDFPage} - The cloned page
   * @private
   */
  private clonePage(page: PDFPage): PDFPage {
    // In a real implementation, this would create a deep copy of the page
    const newPage = new PDFPage({
      width: page.width,
      height: page.height,
      rotation: page.rotation,
      content: page.content,
    })

    // Clone annotations
    for (const annotation of page.annotations) {
      newPage.addAnnotation(annotation)
    }

    return newPage
  }
}
