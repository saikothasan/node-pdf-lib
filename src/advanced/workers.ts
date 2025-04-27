import { Worker } from "worker_threads"
import * as path from "path"
import { PDFDocument } from "../document"
import { PDFPage } from "../page"
import { PDFError, ErrorCodes } from "../error"

/**
 * PDF worker for CPU-intensive operations
 * @class
 */
export class PDFWorker {
  /**
   * Render pages in parallel using worker threads
   * @param {PDFDocument} document - The document to render
   * @param {object} options - Rendering options
   * @returns {Promise<Buffer[]>} - Promise resolving to an array of image buffers
   */
  static async renderPagesParallel(
    document: PDFDocument,
    options: {
      format?: "png" | "jpeg"
      quality?: number
      scale?: number
      dpi?: number
      pageIndices?: number[]
      maxWorkers?: number
    } = {},
  ): Promise<Buffer[]> {
    try {
      // Determine which pages to render
      const pageIndices = options.pageIndices || Array.from({ length: document.pageCount }, (_, i) => i)

      // Determine number of workers
      const maxWorkers = options.maxWorkers || Math.max(1, require("os").cpus().length - 1)
      const numWorkers = Math.min(maxWorkers, pageIndices.length)

      // Prepare pages data
      const pagesData = await Promise.all(
        pageIndices.map(async (index) => {
          const page = document.getPage(index)
          if (!page) {
            throw new PDFError(ErrorCodes.INVALID_PARAMETER, `Page index ${index} is out of bounds`)
          }

          // Serialize page data for worker
          return {
            index,
            width: page.width,
            height: page.height,
            rotation: page.rotation,
            content: page.content,
            options: {
              format: options.format || "png",
              quality: options.quality || 0.9,
              scale: options.scale || 1.0,
              dpi: options.dpi,
            },
          }
        }),
      )

      // Distribute pages among workers
      const workerData: any[][] = Array(numWorkers)
        .fill(null)
        .map(() => [])

      pagesData.forEach((pageData, i) => {
        const workerIndex = i % numWorkers
        workerData[workerIndex].push(pageData)
      })

      // Create and run workers
      const results = await Promise.all(workerData.map((data, i) => this.runWorker(data, i)))

      // Combine and sort results
      const flatResults = results.flat()
      flatResults.sort((a, b) => a.index - b.index)

      return flatResults.map((result) => result.buffer)
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.RENDER_ERROR, "Error rendering pages in parallel", error as Error)
    }
  }

  /**
   * Process document in parallel using worker threads
   * @param {PDFDocument} document - The document to process
   * @param {string} operation - Operation to perform
   * @param {any} options - Operation options
   * @returns {Promise<PDFDocument>} - Promise resolving to the processed document
   */
  static async processDocumentParallel(
    document: PDFDocument,
    operation: string,
    options: any = {},
  ): Promise<PDFDocument> {
    try {
      // Determine number of workers
      const maxWorkers = options.maxWorkers || Math.max(1, require("os").cpus().length - 1)
      const numWorkers = Math.min(maxWorkers, document.pageCount)

      // Distribute pages among workers
      const pageIndices = Array.from({ length: document.pageCount }, (_, i) => i)
      const workerPageIndices: number[][] = Array(numWorkers)
        .fill(null)
        .map(() => [])

      pageIndices.forEach((index, i) => {
        const workerIndex = i % numWorkers
        workerPageIndices[workerIndex].push(index)
      })

      // Create and run workers
      const results = await Promise.all(
        workerPageIndices.map((indices, i) => this.runProcessingWorker(document, operation, indices, options, i)),
      )

      // Combine results into a new document
      const newDocument = new PDFDocument({
        metadata: document.metadata,
      })

      // Add processed pages in order
      const processedPages: { index: number; page: PDFPage }[] = results.flat()
      processedPages.sort((a, b) => a.index - b.index)

      for (const { page } of processedPages) {
        newDocument.addPage(page)
      }

      // Copy document-level data
      if (document.outline) {
        newDocument.setOutline(document.outline)
      }

      if (document.form) {
        newDocument.setForm(document.form)
      }

      return newDocument
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(
        ErrorCodes.UNKNOWN_ERROR,
        `Error processing document with operation: ${operation}`,
        error as Error,
      )
    }
  }

  /**
   * Run a worker for rendering pages
   * @param {any[]} pagesData - Pages data for the worker
   * @param {number} workerId - Worker ID
   * @returns {Promise<Array<{index: number, buffer: Buffer}>>} - Promise resolving to rendering results
   * @private
   */
  private static runWorker(pagesData: any[], workerId: number): Promise<Array<{ index: number; buffer: Buffer }>> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "render-worker.js"), {
        workerData: {
          pagesData,
          workerId,
        },
      })

      worker.on("message", (result) => {
        resolve(result)
      })

      worker.on("error", (error) => {
        reject(new PDFError(ErrorCodes.UNKNOWN_ERROR, `Worker ${workerId} error: ${error.message}`, error))
      })

      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new PDFError(ErrorCodes.UNKNOWN_ERROR, `Worker ${workerId} exited with code ${code}`))
        }
      })
    })
  }

  /**
   * Run a worker for processing pages
   * @param {PDFDocument} document - The document to process
   * @param {string} operation - Operation to perform
   * @param {number[]} pageIndices - Page indices to process
   * @param {any} options - Operation options
   * @param {number} workerId - Worker ID
   * @returns {Promise<Array<{index: number, page: PDFPage}>>} - Promise resolving to processing results
   * @private
   */
  private static runProcessingWorker(
    document: PDFDocument,
    operation: string,
    pageIndices: number[],
    options: any,
    workerId: number,
  ): Promise<Array<{ index: number; page: PDFPage }>> {
    return new Promise((resolve, reject) => {
      // Prepare pages data
      const pagesData = pageIndices.map((index) => {
        const page = document.getPage(index)
        if (!page) {
          throw new PDFError(ErrorCodes.INVALID_PARAMETER, `Page index ${index} is out of bounds`)
        }

        return {
          index,
          width: page.width,
          height: page.height,
          rotation: page.rotation,
          content: page.content,
          annotations: page.annotations,
          compressed: page.compressed,
        }
      })

      const worker = new Worker(path.join(__dirname, "process-worker.js"), {
        workerData: {
          pagesData,
          operation,
          options,
          workerId,
        },
      })

      worker.on("message", (result) => {
        // Convert serialized pages back to PDFPage objects
        const processedPages = result.map((item: any) => {
          const page = new PDFPage({
            width: item.width,
            height: item.height,
            rotation: item.rotation,
            compressed: item.compressed,
          })

          // Add content
          for (const content of item.content) {
            page.addContent(content)
          }

          // Add annotations
          for (const annotation of item.annotations) {
            page.addAnnotation(annotation)
          }

          return {
            index: item.index,
            page,
          }
        })

        resolve(processedPages)
      })

      worker.on("error", (error) => {
        reject(new PDFError(ErrorCodes.UNKNOWN_ERROR, `Worker ${workerId} error: ${error.message}`, error))
      })

      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new PDFError(ErrorCodes.UNKNOWN_ERROR, `Worker ${workerId} exited with code ${code}`))
        }
      })
    })
  }
}
