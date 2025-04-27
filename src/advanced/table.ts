import type { PDFPage } from "../page"
import { PDFText } from "../text"
import { PDFTextStyling, type TextStyleOptions } from "./text-styling"

/**
 * Table cell options
 */
export interface TableCellOptions {
  text: string
  colSpan?: number
  rowSpan?: number
  style?: TextStyleOptions
  backgroundColor?: string
  borderWidth?: number
  borderColor?: string
  padding?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}

/**
 * Table options
 */
export interface TableOptions {
  x: number
  y: number
  width: number
  columnWidths?: number[]
  rowHeights?: number[]
  headerRows?: number
  borderWidth?: number
  borderColor?: string
  backgroundColor?: string
  headerStyle?: TextStyleOptions
  bodyStyle?: TextStyleOptions
  alternateRowStyle?: TextStyleOptions
}

/**
 * PDF table for creating tables in PDF documents
 * @class
 */
export class PDFTable {
  private _cells: TableCellOptions[][] = []
  private _options: TableOptions

  /**
   * Create a new PDFTable
   * @param {TableOptions} options - Table options
   */
  constructor(options: TableOptions) {
    this._options = {
      ...options,
      borderWidth: options.borderWidth ?? 1,
      borderColor: options.borderColor ?? "#000000",
      headerStyle: options.headerStyle ?? {
        bold: true,
        backgroundColor: "#f0f0f0",
      },
      bodyStyle: options.bodyStyle ?? {
        fontSize: 10,
      },
    }
  }

  /**
   * Add a row to the table
   * @param {TableCellOptions[]} cells - Row cells
   */
  addRow(cells: TableCellOptions[]): void {
    this._cells.push(cells)
  }

  /**
   * Add multiple rows to the table
   * @param {TableCellOptions[][]} rows - Rows to add
   */
  addRows(rows: TableCellOptions[][]): void {
    for (const row of rows) {
      this.addRow(row)
    }
  }

  /**
   * Draw the table on a page
   * @param {PDFPage} page - The page to draw on
   * @returns {object} - Table dimensions and position
   */
  drawOnPage(page: PDFPage): {
    x: number
    y: number
    width: number
    height: number
  } {
    const { x, y, width } = this._options

    // Calculate column widths if not provided
    const columnCount = Math.max(...this._cells.map((row) => row.length))
    const columnWidths = this._options.columnWidths || Array(columnCount).fill(width / columnCount)

    // Calculate row heights (simplified)
    const rowHeights = this._options.rowHeights || Array(this._cells.length).fill(20)

    // Calculate total height
    const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0)

    // Draw table background
    if (this._options.backgroundColor) {
      page.addContent({
        type: "rectangle",
        x,
        y: y - totalHeight,
        width,
        height: totalHeight,
        fillColor: this._options.backgroundColor,
      })
    }

    // Draw cells
    let currentY = y

    for (let rowIndex = 0; rowIndex < this._cells.length; rowIndex++) {
      const row = this._cells[rowIndex]
      const rowHeight = rowHeights[rowIndex]
      let currentX = x

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex]
        const colWidth = columnWidths[colIndex]

        // Apply cell styling
        const isHeader = rowIndex < (this._options.headerRows || 1)
        const isAlternateRow = !isHeader && rowIndex % 2 === 1

        let cellStyle: TextStyleOptions = { ...this._options.bodyStyle }

        if (isHeader) {
          cellStyle = { ...cellStyle, ...this._options.headerStyle }
        } else if (isAlternateRow && this._options.alternateRowStyle) {
          cellStyle = { ...cellStyle, ...this._options.alternateRowStyle }
        }

        if (cell.style) {
          cellStyle = { ...cellStyle, ...cell.style }
        }

        // Draw cell background
        if (cell.backgroundColor) {
          page.addContent({
            type: "rectangle",
            x: currentX,
            y: currentY - rowHeight,
            width: colWidth,
            height: rowHeight,
            fillColor: cell.backgroundColor,
          })
        }

        // Draw cell borders
        const borderWidth = cell.borderWidth ?? this._options.borderWidth
        const borderColor = cell.borderColor ?? this._options.borderColor

        if (borderWidth && borderWidth > 0) {
          // Top border
          page.addContent({
            type: "line",
            x1: currentX,
            y1: currentY,
            x2: currentX + colWidth,
            y2: currentY,
            lineWidth: borderWidth,
            lineColor: borderColor,
          })

          // Right border
          page.addContent({
            type: "line",
            x1: currentX + colWidth,
            y1: currentY,
            x2: currentX + colWidth,
            y2: currentY - rowHeight,
            lineWidth: borderWidth,
            lineColor: borderColor,
          })

          // Bottom border
          page.addContent({
            type: "line",
            x1: currentX,
            y1: currentY - rowHeight,
            x2: currentX + colWidth,
            y2: currentY - rowHeight,
            lineWidth: borderWidth,
            lineColor: borderColor,
          })

          // Left border
          page.addContent({
            type: "line",
            x1: currentX,
            y1: currentY,
            x2: currentX,
            y2: currentY - rowHeight,
            lineWidth: borderWidth,
            lineColor: borderColor,
          })
        }

        // Draw cell text
        const padding = cell.padding || { top: 5, right: 5, bottom: 5, left: 5 }
        const textX = currentX + (padding.left || 5)
        const textY = currentY - (padding.top || 5)

        const text = new PDFText({
          text: cell.text,
          position: { x: textX, y: textY },
          font: cellStyle.font || "Helvetica",
          fontSize: cellStyle.fontSize || 10,
          color: cellStyle.color || "#000000",
        })

        PDFTextStyling.applyStyle(text, cellStyle)
        page.addContent(text)

        // Move to next column
        currentX += colWidth
      }

      // Move to next row
      currentY -= rowHeight
    }

    return {
      x,
      y,
      width,
      height: totalHeight,
    }
  }
}
