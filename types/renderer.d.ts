// Type definitions for node-pdf-lib renderer module
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

import type { Buffer } from "buffer"
import type { PDFPage } from "./page"

/**
 * PDF renderer for rendering PDF pages
 */
export class PDFRenderer {
  renderPage(
    page: PDFPage,
    options?: {
      scale?: number
      format?: "png" | "jpeg"
      quality?: number
    },
  ): Promise<Buffer>
}
