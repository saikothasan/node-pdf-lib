import { loadPDF, mergePDFs, compressPDF, encryptPDF } from "node-pdf-lib"
import * as fs from "fs"
import * as path from "path"

async function main() {
  try {
    // Create output directory
    const outputDir = "./output"
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Check if sample PDFs exist
    const pdfFiles = ["./sample1.pdf", "./sample2.pdf", "./sample3.pdf"]
    const existingFiles = pdfFiles.filter((file) => fs.existsSync(file))

    if (existingFiles.length < 2) {
      console.log("Not enough sample PDFs found. Please provide at least 2 PDF files.")
      console.log("Expected files: sample1.pdf, sample2.pdf, sample3.pdf")
      return
    }

    console.log(`Found ${existingFiles.length} PDF files to process.`)

    // Load PDF documents
    console.log("Loading PDF documents...")
    const documents = []

    for (const file of existingFiles) {
      console.log(`Loading ${file}...`)
      const document = await loadPDF(file)
      console.log(`- ${path.basename(file)}: ${document.pageCount} pages`)
      documents.push(document)
    }

    // Merge PDFs
    console.log("\nMerging PDF documents...")
    const mergedDoc = await mergePDFs(documents, {
      keepOutlines: true,
      keepAnnotations: true,
      keepFormFields: true,
    })

    console.log(`Merged document created with ${mergedDoc.pageCount} pages.`)

    // Save the merged document
    const mergedPath = path.join(outputDir, "merged.pdf")
    await mergedDoc.save(mergedPath)
    console.log(`Merged PDF saved to ${mergedPath}`)

    // Compress the merged document
    console.log("\nCompressing the merged document...")
    const compressedDoc = await compressPDF(mergedDoc)

    // Save the compressed document
    const compressedPath = path.join(outputDir, "merged-compressed.pdf")
    await compressedDoc.save(compressedPath)
    console.log(`Compressed PDF saved to ${compressedPath}`)

    // Get file sizes for comparison
    const mergedSize = fs.statSync(mergedPath).size
    const compressedSize = fs.statSync(compressedPath).size
    const compressionRatio = (((mergedSize - compressedSize) / mergedSize) * 100).toFixed(2)

    console.log("\nFile size comparison:")
    console.log(`- Original merged PDF: ${(mergedSize / 1024).toFixed(2)} KB`)
    console.log(`- Compressed PDF: ${(compressedSize / 1024).toFixed(2)} KB`)
    console.log(`- Space saved: ${compressionRatio}%`)

    // Encrypt the compressed document
    console.log("\nEncrypting the compressed document...")
    const encryptedDoc = await encryptPDF(compressedDoc, {
      userPassword: "user123",
      ownerPassword: "owner456",
      permissions: {
        printing: true,
        modifying: false,
        copying: false,
        annotating: true,
        fillingForms: true,
      },
      encryptionMethod: "aes256",
    })

    // Save the encrypted document
    const encryptedPath = path.join(outputDir, "merged-compressed-encrypted.pdf")
    await encryptedDoc.save(encryptedPath)
    console.log(`Encrypted PDF saved to ${encryptedPath}`)
    console.log("User password: user123")
    console.log("Owner password: owner456")

    console.log("\nProcessing complete!")
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
