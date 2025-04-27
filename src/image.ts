/**
 * Represents an image in a PDF
 * @class
 */
export class PDFImage {
  private _width: number
  private _height: number
  private _data: Buffer
  private _format: "jpeg" | "png" | "gif"
  private _position: { x: number; y: number }

  /**
   * Create a new PDFImage
   * @param {object} options - Image options
   */
  constructor(options: {
    width: number
    height: number
    data: Buffer
    format: "jpeg" | "png" | "gif"
    position?: { x: number; y: number }
  }) {
    this._width = options.width
    this._height = options.height
    this._data = options.data
    this._format = options.format
    this._position = options.position || { x: 0, y: 0 }
  }

  /**
   * Get the image width
   * @returns {number} - Image width
   */
  get width(): number {
    return this._width
  }

  /**
   * Get the image height
   * @returns {number} - Image height
   */
  get height(): number {
    return this._height
  }

  /**
   * Get the image data
   * @returns {Buffer} - Image data
   */
  get data(): Buffer {
    return this._data
  }

  /**
   * Get the image format
   * @returns {'jpeg' | 'png' | 'gif'} - Image format
   */
  get format(): "jpeg" | "png" | "gif" {
    return this._format
  }

  /**
   * Get the image position
   * @returns {{ x: number; y: number }} - Image position
   */
  get position(): { x: number; y: number } {
    return { ...this._position }
  }

  /**
   * Set the image position
   * @param {{ x: number; y: number }} position - Image position
   */
  setPosition(position: { x: number; y: number }): void {
    this._position = { ...position }
  }

  /**
   * Resize the image
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width: number, height: number): void {
    this._width = width
    this._height = height
  }
}
