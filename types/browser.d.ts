// Type definitions for node-pdf-lib browser version
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

import type { PDFDocument, PDFPage } from "./index"

/**
 * Load a PDF document from a Uint8Array in the browser
 */
export function loadPDFInBrowser(data: Uint8Array): Promise<PDFDocument>

/**
 * Render a PDF page to a canvas element in the browser
 */
export function renderPageToCanvas(
  page: PDFPage,
  canvas: HTMLCanvasElement,
  options?: {
    scale?: number
    rotation?: number
    background?: string
  },
): Promise<void>

/**
 * Download a PDF document as a file in the browser
 */
export function downloadPDF(document: PDFDocument, filename: string): Promise<void>

// Re-export types from the main module
export * from "./index"
