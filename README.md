# Node PDF Library

A general-purpose, web standards-based JavaScript library for parsing, creating, and rendering PDFs in Node.js and browser environments.

## Features

- Parse PDF documents from files or buffers
- Create new PDF documents from scratch
- Extract text and images from PDF documents
- Render PDF pages to images
- Work with PDF forms, annotations, and outlines
- Merge multiple PDF documents
- Compress PDF documents
- Encrypt and decrypt PDF documents
- Browser compatibility for client-side PDF processing
- Digital signatures support

## Installation

\`\`\`bash
npm install node-pdf-lib
\`\`\`

## Usage

### Loading a PDF

\`\`\`javascript
import { loadPDF } from 'node-pdf-lib';

// Load a PDF from a file
const document = await loadPDF('/path/to/document.pdf');

// Get the number of pages
console.log(`Number of pages: ${document.pageCount}`);

// Get the document metadata
console.log(`Title: ${document.metadata.title}`);
console.log(`Author: ${document.metadata.author}`);
\`\`\`

### Creating a PDF

\`\`\`javascript
import { createPDF } from 'node-pdf-lib';

// Create a new PDF
const creator = createPDF({
  metadata: {
    title: 'My PDF Document',
    author: 'John Doe',
    subject: 'Example PDF',
    keywords: ['example', 'pdf', 'creation']
  }
});

// Add a page
const page = creator.addPage({
  width: 612,  // Letter size width in points
  height: 792  // Letter size height in points
});

// Add text to the page
creator.addText(page, 'Hello, World!', {
  x: 72,
  y: 720,
  fontSize: 24,
  color: '#000000'
});

// Save the PDF
await creator.saveToFile('output.pdf');
\`\`\`

### Extracting Text

\`\`\`javascript
import { loadPDF, extractAllText } from 'node-pdf-lib';

// Load a PDF from a file
const document = await loadPDF('/path/to/document.pdf');

// Extract text from all pages
const text = await extractAllText(document);
console.log(text);
\`\`\`

### Rendering Pages

\`\`\`javascript
import { loadPDF, renderPage } from 'node-pdf-lib';
import * as fs from 'fs';

// Load a PDF from a file
const document = await loadPDF('/path/to/document.pdf');

// Get the first page
const page = document.getPage(0);

// Render the page to a PNG image
const imageBuffer = await renderPage(page, {
  scale: 2.0,  // 2x scale for higher resolution
  format: 'png'
});

// Save the image to a file
fs.writeFileSync('page.png', imageBuffer);
\`\`\`

### Merging PDFs

\`\`\`javascript
import { loadPDF, mergePDFs } from 'node-pdf-lib';

// Load PDF documents
const doc1 = await loadPDF('/path/to/document1.pdf');
const doc2 = await loadPDF('/path/to/document2.pdf');

// Merge the documents
const mergedDoc = await mergePDFs([doc1, doc2], {
  keepOutlines: true,
  keepAnnotations: true
});

// Save the merged document
await mergedDoc.save('/path/to/merged.pdf');
\`\`\`

### Compressing a PDF

\`\`\`javascript
import { loadPDF, compressPDF } from 'node-pdf-lib';

// Load a PDF from a file
const document = await loadPDF('/path/to/document.pdf');

// Compress the document
const compressedDoc = await compressPDF(document);

// Save the compressed document
await compressedDoc.save('/path/to/compressed.pdf');
\`\`\`

### Encrypting and Decrypting PDFs

\`\`\`javascript
import { loadPDF, encryptPDF, decryptPDF } from 'node-pdf-lib';

// Load a PDF from a file
const document = await loadPDF('/path/to/document.pdf');

// Encrypt the document
const encryptedDoc = await encryptPDF(document, {
  userPassword: 'user123',
  ownerPassword: 'owner456',
  permissions: {
    printing: true,
    modifying: false,
    copying: false,
    annotating: true,
    fillingForms: true
  },
  encryptionMethod: 'aes256'
});

// Save the encrypted document
await encryptedDoc.save('/path/to/encrypted.pdf');

// Decrypt the document
const decryptedDoc = await decryptPDF(encryptedDoc, 'owner456');

// Save the decrypted document
await decryptedDoc.save('/path/to/decrypted.pdf');
\`\`\`

### Browser Usage

\`\`\`javascript
import { loadPDFInBrowser, renderPageToCanvas, downloadPDF } from 'node-pdf-lib';

// Handle file input
document.getElementById('fileInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    
    // Load the PDF
    const document = await loadPDFInBrowser(data);
    
    // Get the first page
    const page = document.getPage(0);
    
    // Render the page to a canvas
    const canvas = document.getElementById('pdfCanvas');
    await renderPageToCanvas(page, canvas, {
      scale: 1.5
    });
    
    // Download the PDF
    document.getElementById('downloadBtn').addEventListener('click', () => {
      downloadPDF(document, 'downloaded.pdf');
    });
  }
});
\`\`\`

### Working with Forms

\`\`\`javascript
import { loadPDF } from 'node-pdf-lib';

// Load a PDF from a file
const document = await loadPDF('/path/to/form.pdf');

// Get the form
const form = document.form;

if (form) {
  // Get form data
  const formData = form.getFormData();
  console.log(formData);

  // Set form data
  form.setFormData({
    name: 'John Doe',
    email: 'john@example.com'
  });

  // Save the modified document
  await document.save('/path/to/filled-form.pdf');
}
\`\`\`

## API Reference

### Main Functions

- `loadPDF(filePath: string): Promise<PDFDocument>` - Load a PDF from a file
- `loadPDFFromBuffer(buffer: Buffer): Promise<PDFDocument>` - Load a PDF from a buffer
- `createPDF(options?: object): PDFCreator` - Create a new PDF document
- `mergePDFs(documents: PDFDocument[], options?: object): Promise<PDFDocument>` - Merge multiple PDF documents
- `compressPDF(document: PDFDocument): Promise<PDFDocument>` - Compress a PDF document
- `encryptPDF(document: PDFDocument, options: object): Promise<PDFDocument>` - Encrypt a PDF document
- `decryptPDF(document: PDFDocument, password: string): Promise<PDFDocument>` - Decrypt a PDF document
- `renderPage(page: PDFPage, options?: object): Promise<Buffer>` - Render a page to an image
- `extractText(page: PDFPage): Promise<string>` - Extract text from a page
- `extractAllText(document: PDFDocument): Promise<string>` - Extract text from all pages
- `extractImages(page: PDFPage): Promise<PDFImage[]>` - Extract images from a page

### Browser Functions

- `loadPDFInBrowser(data: Uint8Array): Promise<PDFDocument>` - Load a PDF from a Uint8Array in the browser
- `renderPageToCanvas(page: PDFPage, canvas: HTMLCanvasElement, options?: object): Promise<void>` - Render a page to a canvas element
- `downloadPDF(document: PDFDocument, filename: string): Promise<void>` - Download a PDF document as a file

### Classes

- `PDFDocument` - Represents a PDF document
- `PDFPage` - Represents a page in a PDF document
- `PDFParser` - Parser for PDF documents
- `PDFRenderer` - Renderer for PDF pages
- `PDFCreator` - Creator for PDF documents
- `PDFMerger` - Merger for PDF documents
- `PDFSecurity` - Security handler for PDF documents
- `PDFText` - Represents text content in a PDF
- `PDFImage` - Represents an image in a PDF
- `PDFAnnotation` - Represents an annotation in a PDF
- `PDFOutline` - Represents an outline (bookmarks) in a PDF
- `PDFForm` - Represents a form in a PDF
- `PDFFormField` - Represents a field in a PDF form
- `PDFSignature` - Represents a digital signature in a PDF
- `PDFError` - Custom error class for PDF.js

## Browser Compatibility

The library can be used in both Node.js and browser environments. When used in a browser, certain Node.js-specific functionality (like file system operations) is automatically replaced with browser-compatible alternatives.

## TypeScript Support

The library includes TypeScript declaration files (.d.ts) for better IDE support and type checking. When using the library in a TypeScript project, you'll get:

- Autocompletion for all methods and properties
- Type checking for function parameters and return values
- Documentation comments in your IDE

Example usage in TypeScript:

\`\`\`typescript
import { createPDF, PDFDocument, PDFPage } from 'node-pdf-lib';

async function createSimplePDF(): Promise<PDFDocument> {
  const creator = createPDF({
    metadata: {
      title: 'TypeScript Example',
      author: 'node-pdf-lib'
    }
  });
  
  const page: PDFPage = creator.addPage();
  
  creator.addText(page, 'Hello from TypeScript!', {
    x: 72,
    y: 720,
    fontSize: 24
  });
  
  return creator.document;
}
\`\`\`

The declaration files are automatically included when you install the package.

## License

MIT
