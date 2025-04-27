// Type definitions for node-pdf-lib parser module
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

import type { Buffer } from "buffer"
import type { PDFDocument } from "./document"

/**
 * PDF parser for parsing PDF documents
 */
export class PDFParser {
  parse(buffer: Buffer): Promise<PDFDocument>
}
