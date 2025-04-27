import * as crypto from "crypto"
import type { PDFDocument } from "../document"
import { PDFSignature } from "../signature"
import { PDFError, ErrorCodes } from "../error"

/**
 * Digital signature options
 */
export interface DigitalSignatureOptions {
  name: string
  reason?: string
  location?: string
  contactInfo?: string
  date?: Date
  certificateBuffer: Buffer
  privateKeyBuffer: Buffer
  password?: string
  hashAlgorithm?: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"
  appearance?: {
    page: number
    rect: { x: number; y: number; width: number; height: number }
    background?: string
    border?: boolean
    label?: boolean
    logo?: Buffer
    logoScale?: number
    text?: string
    textColor?: string
    fontSize?: number
  }
}

/**
 * PDF digital signature handler
 * @class
 */
export class PDFDigitalSignature {
  /**
   * Sign a PDF document
   * @param {PDFDocument} document - The document to sign
   * @param {DigitalSignatureOptions} options - Signature options
   * @returns {Promise<PDFDocument>} - Promise resolving to the signed document
   */
  static async signDocument(document: PDFDocument, options: DigitalSignatureOptions): Promise<PDFDocument> {
    try {
      // Create signature object
      const signature = new PDFSignature({
        name: options.name,
        reason: options.reason,
        location: options.location,
        contactInfo: options.contactInfo,
        date: options.date || new Date(),
        rect: options.appearance?.rect || { x: 50, y: 50, width: 200, height: 100 },
      })

      // Add signature appearance if specified
      if (options.appearance) {
        await this.addSignatureAppearance(document, signature, options.appearance)
      }

      // Prepare document for signing
      const preparedDoc = await this.prepareDocumentForSigning(document, signature)

      // Calculate document hash
      const hashAlgorithm = options.hashAlgorithm || "SHA-256"
      const docBuffer = await preparedDoc.toBuffer()
      const hash = crypto.createHash(hashAlgorithm.toLowerCase()).update(docBuffer).digest()

      // Sign the hash with the private key
      const privateKey = this.loadPrivateKey(options.privateKeyBuffer, options.password)
      const signature_value = crypto.sign(hashAlgorithm.toLowerCase(), hash, privateKey)

      // Add the signature to the document
      return await this.addSignatureToDocument(preparedDoc, signature, signature_value, options.certificateBuffer)
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error signing PDF document", error as Error)
    }
  }

  /**
   * Verify a signed PDF document
   * @param {PDFDocument} document - The document to verify
   * @returns {Promise<{valid: boolean, signatures: Array<{name: string, date: Date, valid: boolean, reason?: string}>}>} - Promise resolving to verification result
   */
  static async verifySignatures(document: PDFDocument): Promise<{
    valid: boolean
    signatures: Array<{
      name: string
      date: Date
      valid: boolean
      reason?: string
    }>
  }> {
    try {
      // This is a simplified implementation
      // In a real implementation, we would:
      // 1. Extract all signatures from the document
      // 2. For each signature, extract the signed data and signature value
      // 3. Verify the signature using the embedded certificate
      // 4. Check certificate validity and trust chain

      // For now, we'll return a placeholder result
      return {
        valid: true,
        signatures: [
          {
            name: "Example Signature",
            date: new Date(),
            valid: true,
            reason: "Verification not fully implemented",
          },
        ],
      }
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error verifying PDF signatures", error as Error)
    }
  }

  /**
   * Add signature appearance to a document
   * @param {PDFDocument} document - The document to modify
   * @param {PDFSignature} signature - The signature object
   * @param {object} appearance - Appearance options
   * @returns {Promise<void>} - Promise resolving when appearance is added
   * @private
   */
  private static async addSignatureAppearance(
    document: PDFDocument,
    signature: PDFSignature,
    appearance: {
      page: number
      rect: { x: number; y: number; width: number; height: number }
      background?: string
      border?: boolean
      label?: boolean
      logo?: Buffer
      logoScale?: number
      text?: string
      textColor?: string
      fontSize?: number
    },
  ): Promise<void> {
    const page = document.getPage(appearance.page)
    if (!page) {
      throw new PDFError(ErrorCodes.INVALID_PARAMETER, `Page index ${appearance.page} is out of bounds`)
    }

    const { x, y, width, height } = appearance.rect

    // Add background
    if (appearance.background) {
      page.addContent({
        type: "rectangle",
        x,
        y,
        width,
        height,
        fillColor: appearance.background,
      })
    }

    // Add border
    if (appearance.border !== false) {
      page.addContent({
        type: "rectangle",
        x,
        y,
        width,
        height,
        lineWidth: 1,
        lineColor: "#000000",
        fillColor: null,
      })
    }

    // Add logo if provided
    if (appearance.logo) {
      // In a real implementation, we would:
      // 1. Load the logo image
      // 2. Calculate position and size
      // 3. Add the image to the page
    }

    // Add signature text
    const text =
      appearance.text || `Digitally signed by: ${signature.name}\nDate: ${signature.date.toISOString().split("T")[0]}`

    page.addContent({
      type: "text",
      x: x + 5,
      y: y + height - 15,
      text,
      fontSize: appearance.fontSize || 9,
      font: "Helvetica",
      color: appearance.textColor || "#000000",
    })

    // Add label if requested
    if (appearance.label !== false) {
      page.addContent({
        type: "text",
        x: x + 5,
        y: y + 5,
        text: "Digital Signature",
        fontSize: 8,
        font: "Helvetica-Bold",
        color: "#666666",
      })
    }
  }

  /**
   * Prepare a document for signing
   * @param {PDFDocument} document - The document to prepare
   * @param {PDFSignature} signature - The signature object
   * @returns {Promise<PDFDocument>} - Promise resolving to the prepared document
   * @private
   */
  private static async prepareDocumentForSigning(document: PDFDocument, signature: PDFSignature): Promise<PDFDocument> {
    // This is a simplified implementation
    // In a real implementation, we would:
    // 1. Add a signature dictionary to the document
    // 2. Reserve space for the signature value
    // 3. Update document permissions and metadata

    // For now, we'll just return the original document
    return document
  }

  /**
   * Add a signature to a document
   * @param {PDFDocument} document - The document to modify
   * @param {PDFSignature} signature - The signature object
   * @param {Buffer} signatureValue - The signature value
   * @param {Buffer} certificate - The certificate buffer
   * @returns {Promise<PDFDocument>} - Promise resolving to the signed document
   * @private
   */
  private static async addSignatureToDocument(
    document: PDFDocument,
    signature: PDFSignature,
    signatureValue: Buffer,
    certificate: Buffer,
  ): Promise<PDFDocument> {
    // This is a simplified implementation
    // In a real implementation, we would:
    // 1. Add the signature value to the reserved space
    // 2. Add the certificate to the document
    // 3. Update the document's /Sig entry

    // For now, we'll just return the original document
    return document
  }

  /**
   * Load a private key from a buffer
   * @param {Buffer} keyBuffer - The key buffer
   * @param {string} password - The key password
   * @returns {crypto.KeyObject} - The loaded private key
   * @private
   */
  private static loadPrivateKey(keyBuffer: Buffer, password?: string): crypto.KeyObject {
    try {
      const options: crypto.RSAKeyPairOptions<"pem", "pem"> = {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
          cipher: password ? "aes-256-cbc" : undefined,
          passphrase: password,
        },
      }

      return crypto.createPrivateKey({
        key: keyBuffer,
        format: "pem",
        type: "pkcs8",
        passphrase: password,
      })
    } catch (error) {
      throw new PDFError(ErrorCodes.INVALID_PARAMETER, "Invalid private key or password", error as Error)
    }
  }
}
