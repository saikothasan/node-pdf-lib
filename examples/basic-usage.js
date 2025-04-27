import { loadPDF, renderPage } from "node-pdf-lib"
import * as fs from "fs"
import * as path from "path"

async function main() {
  try {
    // Load a PDF from a file
    console.log("Loading PDF...")
    const document = await loadPDF("./sample.pdf")

    // Get document information
    console.log(`Number of pages: ${document.pageCount}`)
    console.log(`Title: ${document.metadata.title || "N/A"}`)
    console.log(`Author: ${document.metadata.author || "N/A"}`)

    // Process each page
    for (let i = 0; i < document.pageCount; i++) {
      console.log(`Processing page ${i + 1}...`)
      const page = document.getPage(i)

      // Extract text
      const text = await page.extractText()
      console.log(`Page ${i + 1} text (first 100 chars): ${text.substring(0, 100)}...`)

      // Render page to image
      const imageBuffer = await renderPage(page, {
        scale: 1.5,
        format: "png",
      })

      // Save the image
      const outputDir = "./output"
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      fs.writeFileSync(path.join(outputDir, `page-${i + 1}.png`), imageBuffer)
      console.log(`Page ${i + 1} rendered to output/page-${i + 1}.png`)
    }

    console.log("Processing complete!")
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
