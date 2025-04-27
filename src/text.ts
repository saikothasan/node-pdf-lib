/**
 * Represents text content in a PDF
 * @class
 */
export class PDFText {
  private _text: string
  private _font: string
  private _fontSize: number
  private _color: string
  private _position: { x: number; y: number }

  /**
   * Create a new PDFText
   * @param {object} options - Text options
   */
  constructor(options: {
    text: string
    font?: string
    fontSize?: number
    color?: string
    position?: { x: number; y: number }
  }) {
    this._text = options.text
    this._font = options.font || "Helvetica"
    this._fontSize = options.fontSize || 12
    this._color = options.color || "#000000"
    this._position = options.position || { x: 0, y: 0 }
  }

  /**
   * Get the text content
   * @returns {string} - Text content
   */
  get text(): string {
    return this._text
  }

  /**
   * Get the font name
   * @returns {string} - Font name
   */
  get font(): string {
    return this._font
  }

  /**
   * Get the font size
   * @returns {number} - Font size
   */
  get fontSize(): number {
    return this._fontSize
  }

  /**
   * Get the text color
   * @returns {string} - Text color
   */
  get color(): string {
    return this._color
  }

  /**
   * Get the text position
   * @returns {{ x: number; y: number }} - Text position
   */
  get position(): { x: number; y: number } {
    return { ...this._position }
  }

  /**
   * Set the text content
   * @param {string} text - Text content
   */
  setText(text: string): void {
    this._text = text
  }

  /**
   * Set the font
   * @param {string} font - Font name
   */
  setFont(font: string): void {
    this._font = font
  }

  /**
   * Set the font size
   * @param {number} fontSize - Font size
   */
  setFontSize(fontSize: number): void {
    this._fontSize = fontSize
  }

  /**
   * Set the text color
   * @param {string} color - Text color
   */
  setColor(color: string): void {
    this._color = color
  }

  /**
   * Set the text position
   * @param {{ x: number; y: number }} position - Text position
   */
  setPosition(position: { x: number; y: number }): void {
    this._position = { ...position }
  }
}
