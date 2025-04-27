import type { PDFDocument } from "../document"
import type { PDFPage } from "../page"
import { PDFOutline } from "../outline"
import { PDFError, ErrorCodes } from "../error"

/**
 * Link destination types
 */
export type LinkDestinationType =
  | "page"
  | "url"
  | "named"
  | "xyz"
  | "fit"
  | "fith"
  | "fitv"
  | "fitr"
  | "fitb"
  | "fitbh"
  | "fitbv"

/**
 * Link destination
 */
export interface LinkDestination {
  type: LinkDestinationType
  page?: number
  url?: string
  name?: string
  left?: number
  top?: number
  zoom?: number
  width?: number
  height?: number
}

/**
 * Link options
 */
export interface LinkOptions {
  rect: { x: number; y: number; width: number; height: number }
  destination: LinkDestination
  borderWidth?: number
  borderColor?: string
  borderStyle?: "solid" | "dashed" | "underline" | "none"
  highlightMode?: "none" | "invert" | "outline" | "push"
}

/**
 * PDF links and bookmarks handler
 * @class
 */
export class PDFLinks {
  /**
   * Add a link to a page
   * @param {PDFPage} page - The page to add link to
   * @param {LinkOptions} options - Link options
   * @returns {Promise<void>} - Promise resolving when link is added
   */
  static async addLink(page: PDFPage, options: LinkOptions): Promise<void> {
    try {
      // Create link annotation
      const annotation = {
        type: "link",
        rect: options.rect,
        destination: options.destination,
        borderWidth: options.borderWidth,
        borderColor: options.borderColor,
        borderStyle: options.borderStyle,
        highlightMode: options.highlightMode,
      }

      // Add annotation to page
      page.addAnnotation(annotation)
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error adding link to page", error as Error)
    }
  }

  /**
   * Add a URL link to a page
   * @param {PDFPage} page - The page to add link to
   * @param {string} url - The URL to link to
   * @param {object} rect - Link rectangle
   * @param {object} options - Link options
   * @returns {Promise<void>} - Promise resolving when link is added
   */
  static async addURLLink(
    page: PDFPage,
    url: string,
    rect: { x: number; y: number; width: number; height: number },
    options: {
      borderWidth?: number
      borderColor?: string
      borderStyle?: "solid" | "dashed" | "underline" | "none"
      highlightMode?: "none" | "invert" | "outline" | "push"
    } = {},
  ): Promise<void> {
    return this.addLink(page, {
      rect,
      destination: {
        type: "url",
        url,
      },
      ...options,
    })
  }

  /**
   * Add a page link to a page
   * @param {PDFPage} page - The page to add link to
   * @param {number} targetPage - The target page index
   * @param {object} rect - Link rectangle
   * @param {object} options - Link options
   * @returns {Promise<void>} - Promise resolving when link is added
   */
  static async addPageLink(
    page: PDFPage,
    targetPage: number,
    rect: { x: number; y: number; width: number; height: number },
    options: {
      left?: number
      top?: number
      zoom?: number
      borderWidth?: number
      borderColor?: string
      borderStyle?: "solid" | "dashed" | "underline" | "none"
      highlightMode?: "none" | "invert" | "outline" | "push"
    } = {},
  ): Promise<void> {
    return this.addLink(page, {
      rect,
      destination: {
        type: "xyz",
        pe: "xyz",
        page: targetPage,
        left: options.left,
        top: options.top,
        zoom: options.zoom,
      },
      ...options,
    })
  }

  /**
   * Add bookmarks to a document
   * @param {PDFDocument} document - The document to add bookmarks to
   * @param {Array<{title: string, destination: LinkDestination, children?: any[]}>} bookmarks - Bookmark items
   * @returns {Promise<void>} - Promise resolving when bookmarks are added
   */
  static async addBookmarks(
    document: PDFDocument,
    bookmarks: Array<{
      title: string
      destination: LinkDestination
      children?: any[]
    }>,
  ): Promise<void> {
    try {
      // Create root outline
      const outline = new PDFOutline({
        title: "Bookmarks",
        destination: null,
      })

      // Add bookmark items recursively
      for (const bookmark of bookmarks) {
        const outlineItem = new PDFOutline({
          title: bookmark.title,
          destination: bookmark.destination,
        })

        outline.addChild(outlineItem)

        if (bookmark.children && bookmark.children.length > 0) {
          await this.addBookmarkChildren(outlineItem, bookmark.children)
        }
      }

      // Set document outline
      document.setOutline(outline)
    } catch (error) {
      if (error instanceof PDFError) {
        throw error
      }
      throw new PDFError(ErrorCodes.UNKNOWN_ERROR, "Error adding bookmarks to document", error as Error)
    }
  }

  /**
   * Add bookmark children recursively
   * @param {PDFOutline} parent - Parent outline item
   * @param {Array<{title: string, destination: LinkDestination, children?: any[]}>} children - Child bookmark items
   * @returns {Promise<void>} - Promise resolving when children are added
   * @private
   */
  private static async addBookmarkChildren(
    parent: PDFOutline,
    children: Array<{
      title: string
      destination: LinkDestination
      children?: any[]
    }>,
  ): Promise<void> {
    for (const child of children) {
      const outlineItem = new PDFOutline({
        title: child.title,
        destination: child.destination,
      })

      parent.addChild(outlineItem)

      if (child.children && child.children.length > 0) {
        await this.addBookmarkChildren(outlineItem, child.children)
      }
    }
  }
}
