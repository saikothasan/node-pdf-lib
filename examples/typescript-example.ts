import { createPDF, loadPDF, mergePDFs, compressPDF, encryptPDF, type PDFDocument } from "../src/index"
import * as fs from "fs"
import * as path from "path"

async function typescriptExample(): Promise<void> {
  try {
    // Create a new PDF
    const creator = createPDF({
      metadata: {
        title: "TypeScript Example",
        author: "node-pdf-lib",
        subject: "TypeScript Integration",
        keywords: ["typescript", "pdf", "example"],
      },
    })

    // Add a page
    const page = creator.addPage({
      width: 612, // Letter size
      height: 792,
    })

    // Add text with proper typing
    creator.addText(page, "TypeScript PDF Example", {
      x: 72,
      y: 720,
      fontSize: 24,
      font: "Helvetica-Bold",
      color: "#000000",
    })

    // Add more text
    creator.addText(page, "Created with TypeScript and node-pdf-lib", {
      x: 72,
      y: 680,
      fontSize: 14,
      font: "Helvetica",
      color: "#333333",
    })

    // Create output directory
    const outputDir = "./output"
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Save the PDF
    const outputPath = path.join(outputDir, "typescript-example.pdf")
    await creator.saveToFile(outputPath)
    console.log(`PDF created and saved to ${outputPath}`)

    // Load the PDF back
    const document: PDFDocument = await loadPDF(outputPath)
    console.log("PDF loaded successfully")
    console.log(`Page count: ${document.pageCount}`)
    console.log(`Title: ${document.metadata.title}`)

    // Create a second document for merging
    const creator2 = createPDF({
      metadata: {
        title: "Second Document",
        author: "node-pdf-lib",
      },
    })

    const page2 = creator2.addPage()
    creator2.addText(page2, "This is the second document", {
      x: 72,
      y: 720,
      fontSize: 18,
    })

    const secondPath = path.join(outputDir, "second-document.pdf")
    await creator2.saveToFile(secondPath)

    // Load the second document
    const document2 = await loadPDF(secondPath)

    // Merge documents
    const mergedDoc = await mergePDFs([document, document2])
    const mergedPath = path.join(outputDir, "merged-typescript.pdf")
    await mergedDoc.save(mergedPath)
    console.log(`Merged document saved to ${mergedPath}`)

    // Compress the document
    const compressedDoc = await compressPDF(mergedDoc)
    const compressedPath = path.join(outputDir, "compressed-typescript.pdf")
    await compressedDoc.save(compressedPath)
    console.log(`Compressed document saved to ${compressedPath}`)

    // Encrypt the document
    const encryptedDoc = await encryptPDF(compressedDoc, {
      userPassword: "user123",
      ownerPassword: "owner456",
      permissions: {
        printing: true,
        modifying: false,
      },
    })

    const encryptedPath = path.join(outputDir, "encrypted-typescript.pdf")
    await encryptedDoc.save(encryptedPath)
    console.log(`Encrypted document saved to ${encryptedPath}`)

    console.log("TypeScript example completed successfully")
  } catch (error) {
    console.error("Error in TypeScript example:", error)
  }
}

// Run the example
typescriptExample()
