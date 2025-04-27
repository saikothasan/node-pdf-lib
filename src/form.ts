/**
 * Represents a form in a PDF
 * @class
 */
export class PDFForm {
  private _fields: PDFFormField[] = []

  /**
   * Create a new PDFForm
   */
  constructor() {
    // Initialize form
  }

  /**
   * Get the form fields
   * @returns {PDFFormField[]} - Form fields
   */
  get fields(): PDFFormField[] {
    return [...this._fields]
  }

  /**
   * Add a field to the form
   * @param {PDFFormField} field - Field to add
   */
  addField(field: PDFFormField): void {
    this._fields.push(field)
  }

  /**
   * Get a field by name
   * @param {string} name - Field name
   * @returns {PDFFormField | null} - Field with the given name, or null if not found
   */
  getField(name: string): PDFFormField | null {
    return this._fields.find((field) => field.name === name) || null
  }

  /**
   * Remove a field from the form
   * @param {PDFFormField} field - Field to remove
   * @returns {boolean} - True if the field was removed
   */
  removeField(field: PDFFormField): boolean {
    const index = this._fields.indexOf(field)
    if (index !== -1) {
      this._fields.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Get the form data as an object
   * @returns {object} - Form data
   */
  getFormData(): { [key: string]: any } {
    const data: { [key: string]: any } = {}
    for (const field of this._fields) {
      data[field.name] = field.value
    }
    return data
  }

  /**
   * Set the form data from an object
   * @param {object} data - Form data
   */
  setFormData(data: { [key: string]: any }): void {
    for (const [name, value] of Object.entries(data)) {
      const field = this.getField(name)
      if (field) {
        field.setValue(value)
      }
    }
  }
}

/**
 * Represents a field in a PDF form
 * @class
 */
export class PDFFormField {
  private _name: string
  private _type: string
  private _value: any
  private _rect: { x: number; y: number; width: number; height: number }
  private _required: boolean
  private _readOnly: boolean

  /**
   * Create a new PDFFormField
   * @param {object} options - Field options
   */
  constructor(options: {
    name: string
    type: string
    value?: any
    rect: { x: number; y: number; width: number; height: number }
    required?: boolean
    readOnly?: boolean
  }) {
    this._name = options.name
    this._type = options.type
    this._value = options.value
    this._rect = { ...options.rect }
    this._required = options.required || false
    this._readOnly = options.readOnly || false
  }

  /**
   * Get the field name
   * @returns {string} - Field name
   */
  get name(): string {
    return this._name
  }

  /**
   * Get the field type
   * @returns {string} - Field type
   */
  get type(): string {
    return this._type
  }

  /**
   * Get the field value
   * @returns {any} - Field value
   */
  get value(): any {
    return this._value
  }

  /**
   * Get the field rectangle
   * @returns {{ x: number; y: number; width: number; height: number }} - Field rectangle
   */
  get rect(): { x: number; y: number; width: number; height: number } {
    return { ...this._rect }
  }

  /**
   * Check if the field is required
   * @returns {boolean} - True if the field is required
   */
  get required(): boolean {
    return this._required
  }

  /**
   * Check if the field is read-only
   * @returns {boolean} - True if the field is read-only
   */
  get readOnly(): boolean {
    return this._readOnly
  }

  /**
   * Set the field value
   * @param {any} value - Field value
   */
  setValue(value: any): void {
    if (!this._readOnly) {
      this._value = value
    }
  }

  /**
   * Set the field as required
   * @param {boolean} required - True to set the field as required
   */
  setRequired(required: boolean): void {
    this._required = required
  }

  /**
   * Set the field as read-only
   * @param {boolean} readOnly - True to set the field as read-only
   */
  setReadOnly(readOnly: boolean): void {
    this._readOnly = readOnly
  }
}
