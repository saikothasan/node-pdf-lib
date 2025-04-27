import { loadPDF } from "node-pdf-lib"
import * as fs from "fs"
import * as path from "path"

async function main() {
  try {
    // Load a PDF document
    console.log("Loading PDF...")
    const document = await loadPDF("./document.pdf")

    // Create output directory
    const outputDir = "./output"
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Extract text from all pages
    let allText = ""

    for (let i = 0; i < document.pageCount; i++) {
      console.log(`Extracting text from page ${i + 1}...`)
      const page = document.getPage(i)
      const text = await page.extractText()

      // Add page number and text to the combined text
      allText += `\n\n--- Page ${i + 1} ---\n\n${text}`
    }

    // Save the extracted text to a file
    fs.writeFileSync(path.join(outputDir, "extracted-text.txt"), allText)
    console.log("Text extraction complete. Saved to output/extracted-text.txt")
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
