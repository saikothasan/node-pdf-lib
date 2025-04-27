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
 * @class
 */
export class PDFError extends Error {
  private _code: ErrorCodes
  private _originalError: Error | null

  /**
   * Create a new PDFError
   * @param {ErrorCodes} code - Error code
   * @param {string} message - Error message
   * @param {Error} originalError - Original error
   */
  constructor(code: ErrorCodes, message: string, originalError?: Error) {
    super(message)
    this.name = "PDFError"
    this._code = code
    this._originalError = originalError || null
  }

  /**
   * Get the error code
   * @returns {ErrorCodes} - Error code
   */
  get code(): ErrorCodes {
    return this._code
  }

  /**
   * Get the original error
   * @returns {Error | null} - Original error
   */
  get originalError(): Error | null {
    return this._originalError
  }
}
