/**
 * Represents an outline (bookmarks) in a PDF
 * @class
 */
export class PDFOutline {
  private _title: string
  private _destination: any
  private _children: PDFOutline[] = []
  private _parent: PDFOutline | null = null

  /**
   * Create a new PDFOutline
   * @param {object} options - Outline options
   */
  constructor(options: {
    title: string
    destination: any
  }) {
    this._title = options.title
    this._destination = options.destination
  }

  /**
   * Get the outline title
   * @returns {string} - Outline title
   */
  get title(): string {
    return this._title
  }

  /**
   * Get the outline destination
   * @returns {any} - Outline destination
   */
  get destination(): any {
    return this._destination
  }

  /**
   * Get the outline children
   * @returns {PDFOutline[]} - Outline children
   */
  get children(): PDFOutline[] {
    return [...this._children]
  }

  /**
   * Get the outline parent
   * @returns {PDFOutline | null} - Outline parent
   */
  get parent(): PDFOutline | null {
    return this._parent
  }

  /**
   * Add a child outline
   * @param {PDFOutline} child - Child outline
   */
  addChild(child: PDFOutline): void {
    this._children.push(child)
    child._parent = this
  }

  /**
   * Remove a child outline
   * @param {PDFOutline} child - Child outline to remove
   * @returns {boolean} - True if the child was removed
   */
  removeChild(child: PDFOutline): boolean {
    const index = this._children.indexOf(child)
    if (index !== -1) {
      this._children.splice(index, 1)
      child._parent = null
      return true
    }
    return false
  }

  /**
   * Set the outline title
   * @param {string} title - Outline title
   */
  setTitle(title: string): void {
    this._title = title
  }

  /**
   * Set the outline destination
   * @param {any} destination - Outline destination
   */
  setDestination(destination: any): void {
    this._destination = destination
  }
}
