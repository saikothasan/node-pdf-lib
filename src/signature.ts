/**
 * Represents a digital signature in a PDF
 * @class
 */
export class PDFSignature {
  private _name: string
  private _reason: string
  private _location: string
  private _contactInfo: string
  private _date: Date
  private _rect: { x: number; y: number; width: number; height: number }

  /**
   * Create a new PDFSignature
   * @param {object} options - Signature options
   */
  constructor(options: {
    name: string
    reason?: string
    location?: string
    contactInfo?: string
    date?: Date
    rect: { x: number; y: number; width: number; height: number }
  }) {
    this._name = options.name
    this._reason = options.reason || ""
    this._location = options.location || ""
    this._contactInfo = options.contactInfo || ""
    this._date = options.date || new Date()
    this._rect = { ...options.rect }
  }

  /**
   * Get the signature name
   * @returns {string} - Signature name
   */
  get name(): string {
    return this._name
  }

  /**
   * Get the signature reason
   * @returns {string} - Signature reason
   */
  get reason(): string {
    return this._reason
  }

  /**
   * Get the signature location
   * @returns {string} - Signature location
   */
  get location(): string {
    return this._location
  }

  /**
   * Get the signature contact info
   * @returns {string} - Signature contact info
   */
  get contactInfo(): string {
    return this._contactInfo
  }

  /**
   * Get the signature date
   * @returns {Date} - Signature date
   */
  get date(): Date {
    return new Date(this._date)
  }

  /**
   * Get the signature rectangle
   * @returns {{ x: number; y: number; width: number; height: number }} - Signature rectangle
   */
  get rect(): { x: number; y: number; width: number; height: number } {
    return { ...this._rect }
  }

  /**
   * Set the signature name
   * @param {string} name - Signature name
   */
  setName(name: string): void {
    this._name = name
  }

  /**
   * Set the signature reason
   * @param {string} reason - Signature reason
   */
  setReason(reason: string): void {
    this._reason = reason
  }

  /**
   * Set the signature location
   * @param {string} location - Signature location
   */
  setLocation(location: string): void {
    this._location = location
  }
}
