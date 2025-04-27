/**
 * PDF Web Worker for browser environments
 * @class
 */
export class PDFWebWorker {
  private _worker: Worker | null = null
  private _callbacks: Map<string, (result: any) => void> = new Map()
  private _errorCallbacks: Map<string, (error: Error) => void> = new Map()
  private _nextTaskId = 1

  /**
   * Create a new PDFWebWorker
   * @param {string} workerUrl - URL to worker script
   */
  constructor(private workerUrl: string) {}

  /**
   * Initialize the worker
   * @returns {Promise<void>} - Promise resolving when worker is initialized
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this._worker = new Worker(this.workerUrl)

        this._worker.onmessage = (event) => {
          const { taskId, type, result, error } = event.data

          if (type === "init") {
            resolve()
          } else if (type === "result") {
            const callback = this._callbacks.get(taskId)
            if (callback) {
              callback(result)
              this._callbacks.delete(taskId)
              this._errorCallbacks.delete(taskId)
            }
          } else if (type === "error") {
            const errorCallback = this._errorCallbacks.get(taskId)
            if (errorCallback) {
              errorCallback(new Error(error.message))
              this._callbacks.delete(taskId)
              this._errorCallbacks.delete(taskId)
            }
          }
        }

        this._worker.onerror = (error) => {
          reject(new Error(`Worker initialization error: ${error.message}`))
        }

        // Send initialization message
        this._worker.postMessage({ type: "init" })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Render a page
   * @param {object} pageData - Page data
   * @param {object} options - Rendering options
   * @returns {Promise<ImageData>} - Promise resolving to rendered page
   */
  async renderPage(
    pageData: any,
    options: {
      scale?: number
      rotation?: number
      format?: string
    } = {},
  ): Promise<ImageData> {
    return this._postTask("renderPage", { pageData, options })
  }

  /**
   * Extract text from a page
   * @param {object} pageData - Page data
   * @returns {Promise<string>} - Promise resolving to extracted text
   */
  async extractText(pageData: any): Promise<string> {
    return this._postTask("extractText", { pageData })
  }

  /**
   * Extract images from a page
   * @param {object} pageData - Page data
   * @returns {Promise<any[]>} - Promise resolving to extracted images
   */
  async extractImages(pageData: any): Promise<any[]> {
    return this._postTask("extractImages", { pageData })
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this._worker) {
      this._worker.terminate()
      this._worker = null
    }
  }

  /**
   * Post a task to the worker
   * @param {string} type - Task type
   * @param {any} data - Task data
   * @returns {Promise<any>} - Promise resolving to task result
   * @private
   */
  private _postTask(type: string, data: any): Promise<any> {
    if (!this._worker) {
      throw new Error("Worker not initialized")
    }

    return new Promise((resolve, reject) => {
      const taskId = String(this._nextTaskId++)

      this._callbacks.set(taskId, resolve)
      this._errorCallbacks.set(taskId, reject)

      this._worker!.postMessage({
        taskId,
        type,
        data,
      })
    })
  }
}
