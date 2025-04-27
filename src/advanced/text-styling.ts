import { PDFText } from "../text"

/**
 * Text styling options for advanced text formatting
 */
export interface TextStyleOptions {
  font?: string
  fontSize?: number
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  lineHeight?: number
  letterSpacing?: number
  alignment?: "left" | "center" | "right" | "justify"
  opacity?: number
  transform?: {
    rotate?: number
    scaleX?: number
    scaleY?: number
    skewX?: number
    skewY?: number
  }
}

/**
 * Advanced text styling for PDF documents
 * @class
 */
export class PDFTextStyling {
  /**
   * Apply styling to text
   * @param {PDFText} text - The text to style
   * @param {TextStyleOptions} options - Styling options
   * @returns {PDFText} - The styled text
   */
  static applyStyle(text: PDFText, options: TextStyleOptions): PDFText {
    // Apply basic styling
    if (options.font) {
      text.setFont(options.font)
    }

    if (options.fontSize) {
      text.setFontSize(options.fontSize)
    }

    if (options.color) {
      text.setColor(options.color)
    }

    // Apply advanced styling
    if (options.bold || options.italic) {
      let fontName = text.font

      // Handle font variants
      if (options.bold && options.italic) {
        if (!fontName.includes("BoldItalic") && !fontName.includes("Bold-Italic")) {
          fontName = fontName.replace(/(-Bold|-Italic|Bold|Italic)?$/, "-BoldItalic")
        }
      } else if (options.bold) {
        if (!fontName.includes("Bold")) {
          fontName = fontName.replace(/(-Italic|Italic)?$/, "-Bold")
        }
      } else if (options.italic) {
        if (!fontName.includes("Italic")) {
          fontName = fontName.replace(/(-Bold|Bold)?$/, "-Italic")
        }
      }

      text.setFont(fontName)
    }

    // Store additional styling in text metadata
    const metadata: Record<string, any> = text.metadata || {}

    if (options.underline !== undefined) {
      metadata.underline = options.underline
    }

    if (options.strikethrough !== undefined) {
      metadata.strikethrough = options.strikethrough
    }

    if (options.lineHeight !== undefined) {
      metadata.lineHeight = options.lineHeight
    }

    if (options.letterSpacing !== undefined) {
      metadata.letterSpacing = options.letterSpacing
    }

    if (options.alignment !== undefined) {
      metadata.alignment = options.alignment
    }

    if (options.opacity !== undefined) {
      metadata.opacity = options.opacity
    }

    if (options.transform) {
      metadata.transform = options.transform
    }

    text.setMetadata(metadata)

    return text
  }

  /**
   * Create rich text with multiple styles
   * @param {string} text - The text content
   * @param {Array<{text: string, style: TextStyleOptions}>} segments - Text segments with styles
   * @param {object} options - Position options
   * @returns {PDFText[]} - Array of styled text segments
   */
  static createRichText(
    text: string,
    segments: Array<{ text: string; style: TextStyleOptions }>,
    options: {
      x: number
      y: number
      width?: number
      height?: number
    },
  ): PDFText[] {
    const result: PDFText[] = []
    let currentX = options.x

    for (const segment of segments) {
      const pdfText = new PDFText({
        text: segment.text,
        font: segment.style.font || "Helvetica",
        fontSize: segment.style.fontSize || 12,
        color: segment.style.color || "#000000",
        position: { x: currentX, y: options.y },
      })

      this.applyStyle(pdfText, segment.style)

      // Update position for next segment
      // This is a simplified calculation; in a real implementation,
      // we would calculate based on font metrics
      const textWidth = segment.text.length * (segment.style.fontSize || 12) * 0.6
      currentX += textWidth

      result.push(pdfText)
    }

    return result
  }
}
