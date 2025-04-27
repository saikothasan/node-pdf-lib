// Type definitions for node-pdf-lib error module
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

/**
 * Error codes for PDF.js
 */
export enum ErrorCodes {
  UNKNOWN_ERROR = "unknown_error",
  FILE_NOT_FOUND = "file_not_found",
  INVALID_PDF = "invalid_pdf",
  PARSE_ERROR = "parse_error",
  RENDER_ERROR = "render_error",
  UNSUPPORTED_FEATURE = "unsupported_feature",
  INVALID_PARAMETER = "invalid_parameter",
  PERMISSION_ERROR = "permission_error",
}

/**
 * Custom error class for PDF.js
 */
export class PDFError extends Error {
  constructor(code: ErrorCodes, message: string, originalError?: Error)
  readonly code: ErrorCodes
  readonly originalError: Error | null
}
