/**
 * Represents an annotation in a PDF
 * @class
 */
export class PDFAnnotation {
  private _type: string
  private _rect: { x: number; y: number; width: number; height: number }
  private _contents: string
  private _author: string
  private _creationDate: Date

  /**
   * Create a new PDFAnnotation
   * @param {object} options - Annotation options
   */
  constructor(options: {
    type: string
    rect: { x: number; y: number; width: number; height: number }
    contents?: string
    author?: string
    creationDate?: Date
  }) {
    this._type = options.type
    this._rect = { ...options.rect }
    this._contents = options.contents || ""
    this._author = options.author || ""
    this._creationDate = options.creationDate || new Date()
  }

  /**
   * Get the annotation type
   * @returns {string} - Annotation type
   */
  get type(): string {
    return this._type
  }

  /**
   * Get the annotation rectangle
   * @returns {{ x: number; y: number; width: number; height: number }} - Annotation rectangle
   */
  get rect(): { x: number; y: number; width: number; height: number } {
    return { ...this._rect }
  }

  /**
   * Get the annotation contents
   * @returns {string} - Annotation contents
   */
  get contents(): string {
    return this._contents
  }

  /**
   * Get the annotation author
   * @returns {string} - Annotation author
   */
  get author(): string {
    return this._author
  }

  /**
   * Get the annotation creation date
   * @returns {Date} - Annotation creation date
   */
  get creationDate(): Date {
    return new Date(this._creationDate)
  }

  /**
   * Set the annotation contents
   * @param {string} contents - Annotation contents
   */
  setContents(contents: string): void {
    this._contents = contents
  }

  /**
   * Set the annotation author
   * @param {string} author - Annotation author
   */
  setAuthor(author: string): void {
    this._author = author
  }
}
