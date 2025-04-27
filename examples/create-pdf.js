import { createPDF } from "node-pdf-lib"
import * as fs from "fs"
import * as path from "path"

async function main() {
  try {
    console.log("Creating PDF document...")

    // Create a new PDF
    const creator = createPDF({
      metadata: {
        title: "Sample Generated PDF",
        author: "node-pdf-lib",
        subject: "PDF Creation Example",
        keywords: ["node-pdf-lib", "example", "creation"],
      },
    })

    // Get the document
    const document = creator.document

    // Add the first page (Letter size)
    const page1 = creator.addPage({
      width: 612,
      height: 792,
    })

    // Add title text
    creator.addText(page1, "Node PDF Library", {
      x: 72,
      y: 720,
      fontSize: 24,
      font: "Helvetica-Bold",
      color: "#000000",
    })

    // Add subtitle
    creator.addText(page1, "PDF Creation Example", {
      x: 72,
      y: 690,
      fontSize: 16,
      font: "Helvetica",
      color: "#333333",
    })

    // Add paragraph text
    const paragraphText =
      "This is a sample PDF document created with node-pdf-lib. " +
      "The library supports creating PDFs from scratch, adding text, images, and more. " +
      "This example demonstrates basic PDF creation capabilities."

    creator.addText(page1, paragraphText, {
      x: 72,
      y: 650,
      fontSize: 12,
      font: "Times-Roman",
      color: "#333333",
    })

    // Load an image (if it exists)
    try {
      if (fs.existsSync("./sample-image.jpg")) {
        const imageData = fs.readFileSync("./sample-image.jpg")
        await creator.addImage(page1, imageData, {
          x: 72,
          y: 450,
          width: 300,
          height: 200,
          format: "jpeg",
        })

        creator.addText(page1, "Sample Image", {
          x: 72,
          y: 440,
          fontSize: 10,
          font: "Helvetica-Oblique",
          color: "#666666",
        })
      }
    } catch (error) {
      console.log("Sample image not found, skipping image insertion")
    }

    // Add a second page (A4 size)
    const page2 = creator.addPage({
      width: 595,
      height: 842,
    })

    // Add page title
    creator.addText(page2, "Page 2 - More Content", {
      x: 72,
      y: 770,
      fontSize: 20,
      font: "Helvetica-Bold",
      color: "#000000",
    })

    // Add some bullet points
    const bulletPoints = [
      "Supports multiple pages",
      "Various text formatting options",
      "Image embedding capabilities",
      "PDF compression",
      "Document encryption",
    ]

    creator.addText(page2, "Key Features:", {
      x: 72,
      y: 730,
      fontSize: 14,
      font: "Helvetica-Bold",
      color: "#333333",
    })

    let yPos = 700
    for (const point of bulletPoints) {
      creator.addText(page2, `• ${point}`, {
        x: 90,
        y: yPos,
        fontSize: 12,
        font: "Helvetica",
        color: "#333333",
      })
      yPos -= 20
    }

    // Add footer text
    creator.addText(page2, "Generated with node-pdf-lib", {
      x: 72,
      y: 72,
      fontSize: 10,
      font: "Helvetica-Oblique",
      color: "#999999",
    })

    // Save the PDF
    const outputDir = "./output"
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    await creator.saveToFile(path.join(outputDir, "created-document.pdf"))
    console.log("PDF created successfully! Saved to output/created-document.pdf")
  } catch (error) {
    console.error("Error creating PDF:", error)
  }
}

main()
