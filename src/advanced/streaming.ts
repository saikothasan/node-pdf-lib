import { Readable, type Writable } from "stream"
import type { PDFDocument } from "../document"
import { PDFParser } from "../parser"
import { PDFError, ErrorCodes } from "../error"

/**
 * PDF streaming handler for large files
 * @class
 */
export class PDFStreaming {
  /**
   * Parse a PDF document from a readable stream
   * @param {Readable} stream - Readable stream containing PDF data
   * @param {object} options - Parsing options
   * @returns {Promise<PDFDocument>} - Promise resolving to a PDFDocument
   */
  static async parseStream(
    stream: Readable,
    options: {
      chunkSize?: number
      onProgress?: (bytesRead: number, totalBytes?: number) => void
    } = {},
  ): Promise<PDFDocument> {
    try {
      const chunkSize = options.chunkSize || 65536 // 64KB chunks by default
      const chunks: Buffer[] = []
      let bytesRead = 0

      return new Promise<PDFDocument>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => {
          chunks.push(chunk)
          bytesRead += chunk.length

          if (options.onProgress) {
            options.onProgress(bytesRead)
          }
        })

        stream.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks)
            const parser = new PDFParser()
            const document = await parser.parse(buffer)
            resolve(document)
          } catch (error) {
            reject(error)
          }
        })

        stream.on("error", (error) => {
          reject(new PDFError(ErrorCodes.PARSE_ERROR, "Error reading PDF stream", error))
        })
      })
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.PARSE_ERROR, "Error parsing PDF stream", error as Error)
    }
  }

  /**
   * Write a PDF document to a writable stream
   * @param {PDFDocument} document - The document to write
   * @param {Writable} stream - Writable stream to write to
   * @param {object} options - Writing options
   * @returns {Promise<void>} - Promise resolving when writing is complete
   */
  static async writeToStream(
    document: PDFDocument,
    stream: Writable,
    options: {
      compress?: boolean
      encrypt?: boolean
      userPassword?: string
      ownerPassword?: string
      chunkSize?: number
      onProgress?: (bytesWritten: number, totalBytes: number) => void
    } = {},
  ): Promise<void> {
    try {
      const buffer = await document.toBuffer({
        compress: options.compress,
        encrypt: options.encrypt,
        userPassword: options.userPassword,
        ownerPassword: options.ownerPassword,
      })

      const chunkSize = options.chunkSize || 65536 // 64KB chunks by default
      const totalBytes = buffer.length
      let bytesWritten = 0

      return new Promise<void>((resolve, reject) => {
        function writeChunk() {
          try {
            const end = Math.min(bytesWritten + chunkSize, totalBytes)
            const chunk = buffer.slice(bytesWritten, end)
            bytesWritten = end

            if (options.onProgress) {
              options.onProgress(bytesWritten, totalBytes)
            }

            if (bytesWritten < totalBytes) {
              stream.write(chunk, (error) => {
                if (error) {
                  reject(new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error writing to stream", error))
                } else {
                  // Continue with next chunk
                  process.nextTick(writeChunk)
                }
              })
            } else {
              // Last chunk
              stream.write(chunk, (error) => {
                if (error) {
                  reject(new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error writing to stream", error))
                } else {
                  stream.end()
                  resolve()
                }
              })
            }
          } catch (error) {
            reject(new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error writing to stream", error as Error))
          }
        }

        // Start writing chunks
        writeChunk()

        stream.on("error", (error) => {
          reject(new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error writing to stream", error))
        })
      })
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error writing PDF to stream", error as Error)
    }
  }

  /**
   * Create a readable stream from a PDF document
   * @param {PDFDocument} document - The document to stream
   * @param {object} options - Streaming options
   * @returns {Promise<Readable>} - Promise resolving to a readable stream
   */
  static async createReadStream(
    document: PDFDocument,
    options: {
      compress?: boolean
      encrypt?: boolean
      userPassword?: string
      ownerPassword?: string
      chunkSize?: number
    } = {},
  ): Promise<Readable> {
    try {
      const buffer = await document.toBuffer({
        compress: options.compress,
        encrypt: options.encrypt,
        userPassword: options.userPassword,
        ownerPassword: options.ownerPassword,
      })

      const chunkSize = options.chunkSize || 65536 // 64KB chunks by default
      let position = 0

      const stream = new Readable({
        read(size) {
          try {
            if (position >= buffer.length) {
              this.push(null) // End of stream
              return
            }

            const end = Math.min(position + chunkSize, buffer.length)
            const chunk = buffer.slice(position, end)
            position = end

            this.push(chunk)
          } catch (error) {
            this.emit("error", new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error reading from buffer", error as Error))
          }
        },
      })

      return stream
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error creating read stream", error as Error)
    }
  }
}
