// Type definitions for node-pdf-lib merger module
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

import type { PDFDocument } from "./document"

/**
 * PDF merger for merging multiple PDF documents
 */
export class PDFMerger {
  constructor(documents?: PDFDocument[])

  addDocument(document: PDFDocument): void
  addDocuments(documents: PDFDocument[]): void

  merge(options?: {
    keepOutlines?: boolean
    keepAnnotations?: boolean
    keepFormFields?: boolean
  }): Promise<PDFDocument>
}
