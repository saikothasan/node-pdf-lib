// Type definitions for node-pdf-lib security module
// Project: https://github.com/yourusername/node-pdf-lib
// Definitions by: Your Name

import type { PDFDocument } from "./document"

/**
 * PDF permissions
 */
export interface PDFPermissions {
  printing?: boolean
  modifying?: boolean
  copying?: boolean
  annotating?: boolean
  fillingForms?: boolean
  contentAccessibility?: boolean
  documentAssembly?: boolean
}

/**
 * PDF security handler for encryption and decryption
 */
export class PDFSecurity {
  constructor(options?: {
    userPassword?: string
    ownerPassword?: string
    permissions?: PDFPermissions
    encryptionMethod?: "rc4" | "aes" | "aes256"
    encryptMetadata?: boolean
  })

  encrypt(document: PDFDocument): Promise<PDFDocument>
  decrypt(document: PDFDocument, password: string): Promise<PDFDocument>
}
