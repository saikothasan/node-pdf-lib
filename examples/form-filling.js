import { loadPDF } from "node-pdf-lib"
import * as fs from "fs"
import * as path from "path"

async function main() {
  try {
    // Load a PDF form
    console.log("Loading PDF form...")
    const document = await loadPDF("./form.pdf")

    // Check if the document has a form
    if (!document.form) {
      console.log("The document does not contain a form.")
      return
    }

    // Get the form fields
    const fields = document.form.fields
    console.log(`Form contains ${fields.length} fields:`)

    for (const field of fields) {
      console.log(`- ${field.name} (${field.type}): ${field.value || "empty"}`)
    }

    // Fill the form
    console.log("Filling form...")
    document.form.setFormData({
      name: "John Doe",
      email: "john@example.com",
      phone: "555-123-4567",
      address: "123 Main St, Anytown, USA",
      comments: "This is a test form submission.",
    })

    // Save the filled form
    const outputDir = "./output"
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    await document.save(path.join(outputDir, "filled-form.pdf"))
    console.log("Form filled and saved to output/filled-form.pdf")
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
