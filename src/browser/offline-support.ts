/**
 * PDF offline support for browser environments
 * @class
 */
export class PDFOfflineSupport {
  private _dbName: string
  private _storeName: string
  private _db: IDBDatabase | null = null

  /**
   * Create a new PDFOfflineSupport
   * @param {object} options - Options
   */
  constructor(
    options: {
      dbName?: string
      storeName?: string
    } = {},
  ) {
    this._dbName = options.dbName || "pdf-lib-cache"
    this._storeName = options.storeName || "pdf-documents"
  }

  /**
   * Initialize the database
   * @returns {Promise<void>} - Promise resolving when database is initialized
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this._dbName, 1)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(this._storeName)) {
          db.createObjectStore(this._storeName, { keyPath: "id" })
        }
      }

      request.onsuccess = (event) => {
        this._db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onerror = (event) => {
        reject(new Error(`Failed to open database: ${(event.target as IDBOpenDBRequest).error}`))
      }
    })
  }

  /**
   * Store a PDF document
   * @param {string} id - Document ID
   * @param {Uint8Array} data - PDF data
   * @param {object} metadata - Document metadata
   * @returns {Promise<void>} - Promise resolving when document is stored
   */
  async storeDocument(id: string, data: Uint8Array, metadata: any = {}): Promise<void> {
    if (!this._db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this._db!.transaction([this._storeName], "readwrite")
      const store = transaction.objectStore(this._storeName)

      const request = store.put({
        id,
        data,
        metadata,
        timestamp: Date.now(),
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error(`Failed to store document: ${request.error}`))
    })
  }

  /**
   * Retrieve a PDF document
   * @param {string} id - Document ID
   * @returns {Promise<{data: Uint8Array, metadata: any} | null>} - Promise resolving to document data or null
   */
  async retrieveDocument(id: string): Promise<{ data: Uint8Array; metadata: any } | null> {
    if (!this._db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this._db!.transaction([this._storeName], "readonly")
      const store = transaction.objectStore(this._storeName)

      const request = store.get(id)

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            data: request.result.data,
            metadata: request.result.metadata,
          })
        } else {
          resolve(null)
        }
      }

      request.onerror = () => reject(new Error(`Failed to retrieve document: ${request.error}`))
    })
  }

  /**
   * Delete a PDF document
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} - Promise resolving to true if document was deleted
   */
  async deleteDocument(id: string): Promise<boolean> {
    if (!this._db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this._db!.transaction([this._storeName], "readwrite")
      const store = transaction.objectStore(this._storeName)

      const request = store.delete(id)

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(new Error(`Failed to delete document: ${request.error}`))
    })
  }

  /**
   * List all stored documents
   * @returns {Promise<Array<{id: string, metadata: any, timestamp: number}>>} - Promise resolving to document list
   */
  async listDocuments(): Promise<Array<{ id: string; metadata: any; timestamp: number }>> {
    if (!this._db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this._db!.transaction([this._storeName], "readonly")
      const store = transaction.objectStore(this._storeName)

      const request = store.getAll()

      request.onsuccess = () => {
        const documents = request.result.map((doc) => ({
          id: doc.id,
          metadata: doc.metadata,
          timestamp: doc.timestamp,
        }))

        resolve(documents)
      }

      request.onerror = () => reject(new Error(`Failed to list documents: ${request.error}`))
    })
  }

  /**
   * Clear all stored documents
   * @returns {Promise<void>} - Promise resolving when all documents are cleared
   */
  async clearDocuments(): Promise<void> {
    if (!this._db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this._db!.transaction([this._storeName], "readwrite")
      const store = transaction.objectStore(this._storeName)

      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error(`Failed to clear documents: ${request.error}`))
    })
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this._db) {
      this._db.close()
      this._db = null
    }
  }
}
