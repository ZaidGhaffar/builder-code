const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
// const { convert } = require('pdf-poppler');
const { PDF2Pic } = require("pdf2pic");
const morgan = require('morgan');

const { bucket } = require('./firebase-admin');
const fetch = require('node-fetch');

// App Configuration
const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Middleware
const allowedOrigins = [
  'https://builder-pro-y2xf-builder-pro-ai.vercel.app', // Your Vercel frontend
  // Add 'http://localhost:3000' if you need to test from local frontend dev server
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    // or requests from allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use the configured CORS options
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('combined'));
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));













app.get('/proxy-pdf', async (req, res) => {
  const timeoutId = setTimeout(() => {
    console.error('Proxy request timed out');
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timed out while fetching the PDF' });
    }
  }, 30000); // 30-second timeout

  try {
    const fileUrl = req.query.url;

    if (!fileUrl) {
      clearTimeout(timeoutId);
      return res.status(400).json({ error: 'Missing URL parameter' });
    }

    // Basic URL validation (can be enhanced further)
    if (!fileUrl.startsWith('https://')) {
      clearTimeout(timeoutId);
      return res.status(400).json({ error: 'Invalid URL format. Only HTTPS URLs are allowed.' });
    }

    console.log(`Proxying PDF request to: ${fileUrl}`);

    // Fetch with timeout
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(fileUrl, { signal: controller.signal });
    clearTimeout(fetchTimeout);

    if (!response.ok) {
      clearTimeout(timeoutId);
      const errorType = response.status >= 500 ? 'Server error' :
        response.status >= 400 ? 'Client error' : 'Unknown error';

      console.error(`Proxy ${errorType}: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: `Failed to fetch PDF: ${errorType}`,
        details: response.statusText,
        statusCode: response.status
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="document.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Add caching for 1 hour

    // Stream the PDF directly to the client
    response.body.pipe(res);
    response.body.on('end', () => {
      clearTimeout(timeoutId);
    });

    response.body.on('error', (err) => {
      clearTimeout(timeoutId);
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming PDF data', details: err.message });
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Proxy error:', error);

    // More specific error handling based on error type
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Request timed out while fetching the PDF' });
    } else if (error.code === 'ENOTFOUND') {
      res.status(502).json({ error: 'Could not resolve the host name', details: error.message });
    } else {
      res.status(500).json({
        error: 'Failed to proxy PDF file',
        details: error.message
      });
    }
  }
});

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
});

// Helper Functions
// Enhanced PDF conversion with memory safeguards
// const convertPdfToImage = async (pdfPath, outputDir, outputPrefix) => {
//   // Get file size to determine if we need special handling
//   const stats = await fs.promises.stat(pdfPath);
//   const fileSizeMB = stats.size / (1024 * 1024);

//   // Default options
//   const opts = {
//     format: 'jpeg',
//     out_dir: outputDir,
//     out_prefix: outputPrefix,
//     page: 1,
//   };

//   // For larger files (over 50MB), add density restriction to limit memory usage
//   if (fileSizeMB > 50) {
//     console.log(`Large PDF detected (${fileSizeMB.toFixed(2)}MB). Applying memory optimization.`);
//     opts.density = 150; // Lower resolution to save memory
//   }

//   // For very large files, we might want to further restrict options
//   if (fileSizeMB > 100) {
//     console.log(`Very large PDF detected (${fileSizeMB.toFixed(2)}MB). Applying strict memory optimization.`);
//     opts.density = 100; // Even lower resolution
//   }

//   try {
//     await convert(pdfPath, opts);
//   } catch (error) {
//     // Enhanced error reporting
//     if (error.message.includes('memory')) {
//       throw new Error(`PDF conversion failed due to memory limits. File size: ${fileSizeMB.toFixed(2)}MB. Try splitting the PDF into smaller parts.`);
//     } else {
//       throw new Error(`PDF conversion failed: ${error.message}`);
//     }
//   }
// };

// const getGeneratedImagePath = async (directory, prefix) => {
//   const files = await fs.promises.readdir(directory);
//   const generatedFile = files.find(
//     (file) => file.includes(prefix) && file.endsWith('.jpg')
//   );

//   if (!generatedFile) {
//     throw new Error('Generated image file not found');
//   }

//   return {
//     filePath: path.join(directory, generatedFile),
//     newPath: path.join(directory, `${prefix}.jpg`)
//   };
// };

// Helper Functions
// REPLACED PDF conversion function using pdf2pic
const convertPdfToImage = async (pdfPath, outputDir, outputPrefix) => {
  const stats = await fs.promises.stat(pdfPath);
  const fileSizeMB = stats.size / (1024 * 1024);

  // Base options for pdf2pic
  const options = {
    density: 200,           // Start with a reasonable DPI
    savename: outputPrefix, // Use the prefix as the base filename
    savedir: outputDir,     // Output directory
    format: "jpeg",         // Output format (jpg is alias for jpeg)
    size: "1024x768"        // Optional: constrain output size
  };

  // Adjust density based on file size to manage memory
  if (fileSizeMB > 50) {
    console.log(`Large PDF detected (${fileSizeMB.toFixed(2)}MB). Lowering density.`);
    options.density = 150;
  }
  if (fileSizeMB > 100) {
    console.log(`Very large PDF detected (${fileSizeMB.toFixed(2)}MB). Lowering density further.`);
    options.density = 100;
  }

  const pdf2pic = new PDF2Pic(options);

  try {
    // Convert only the first page (page: 1)
    const conversionResultArray = await pdf2pic.convert(pdfPath, 1); // Returns an array

    if (!conversionResultArray || conversionResultArray.length === 0 || !conversionResultArray[0].path) {
      throw new Error('PDF conversion did not return a valid path.');
    }

    const generatedPath = conversionResultArray[0].path; // e.g., /path/to/uploads/prefix_1.jpeg
    console.log("PDF page 1 converted successfully:", generatedPath);

    // Rename the output file to match the desired format (prefix.jpeg)
    const desiredOutputPath = path.join(outputDir, `${outputPrefix}.${options.format}`);

    if (fs.existsSync(generatedPath)) {
      await fs.promises.rename(generatedPath, desiredOutputPath);
      console.log(`Renamed ${generatedPath} to ${desiredOutputPath}`);
      return desiredOutputPath; // Return the final path
    } else {
      // If rename fails because source doesn't exist, throw error
      throw new Error(`Converted image file not found at expected path after conversion: ${generatedPath}`);
    }

  } catch (error) {
    console.error("Error during PDF conversion with pdf2pic:", error);
    // Check for memory-related errors specifically if possible
    if (error.message && (error.message.toLowerCase().includes('memory') || error.message.includes('limit'))) {
      throw new Error(`PDF conversion failed due to memory limits. File size: ${fileSizeMB.toFixed(2)}MB. Try splitting the PDF or reducing quality.`);
    } else if (error.message && error.message.includes('Failed to load')) {
      throw new Error(`PDF conversion failed: Could not load the PDF file. It might be corrupted or password-protected. Path: ${pdfPath}`);
    }
    else {
      throw new Error(`PDF conversion failed: ${error.message || error}`); // Ensure a message is thrown
    }
  }
};
const uploadToFirebase = async (filePath, originalFilename) => { // Renamed second param for clarity
  // Decide the firebase filename based on the original PDF name
  const baseOriginalName = path.basename(originalFilename, path.extname(originalFilename));
  const firebaseFileName = `pdfs/${Date.now()}-${baseOriginalName}.jpg`; // Store as JPG in Firebase

  const file = bucket.file(firebaseFileName);

  // Read the file content (the generated JPEG)
  const fileBuffer = fs.readFileSync(filePath);

  await file.save(fileBuffer, {
    // metadata: { contentType: 'application/pdf' }, // WRONG: This was uploading a JPG as a PDF
    metadata: { contentType: 'image/jpeg' },      // CORRECT: Set the content type to JPEG
    // Optional: Make the file publicly readable directly (alternative to signed URLs if desired)
    // public: true,
    // predefinedAcl: 'publicRead' // Another way to make public
  });
  console.log(`Uploaded ${filePath} to ${firebaseFileName} with contentType image/jpeg`);

  // Get a signed URL for reading
  const [downloadUrl] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2030', // Consider a shorter expiry for security unless permanent access is needed
  });

  return {
    firebaseFileName,
    downloadUrl
  };
};

// Routes
// File Upload Route
// app.post('/upload', upload.array('files'), async (req, resp) => {
//   // Track temporary files for cleanup in case of errors
//   const tempFilePaths = [];

//   try {
//     if (!req.files || req.files.length === 0) {
//       return resp.status(400).json({ error: 'No files uploaded or invalid file type.' });
//     }

//     // Process files in parallel instead of sequentially
//     const filePromises = req.files.map(async (uploadedFile) => {
//       const pdfPath = uploadedFile.path;
//       const outputFilePrefix = path.basename(pdfPath, path.extname(pdfPath));

//       // Add to tracking array for potential cleanup
//       tempFilePaths.push(pdfPath);

//       try {
//         // Convert PDF to JPEG - with memory limit consideration
//         await convertPdfToImage(pdfPath, UPLOAD_DIR, outputFilePrefix);

//         // Get the generated image path
//         const { filePath, newPath } = await getGeneratedImagePath(UPLOAD_DIR, outputFilePrefix);
//         await fs.promises.rename(filePath, newPath);

//         // Add image path to tracking
//         tempFilePaths.push(newPath);

//         // Upload to Firebase
//         const { firebaseFileName, downloadUrl } = await uploadToFirebase(
//           newPath,
//           uploadedFile.originalname
//         );

//         const currentDate = new Date().toISOString();
//         const formattedDate = new Date().toLocaleDateString('en-US', {
//           month: 'long',
//           day: 'numeric',
//           year: 'numeric'
//         });

//         // Clean up local files after successful processing
//         await fs.promises.unlink(pdfPath);
//         await fs.promises.unlink(newPath);

//         // Remove from tracking after cleanup
//         const pdfIndex = tempFilePaths.indexOf(pdfPath);
//         if (pdfIndex > -1) tempFilePaths.splice(pdfIndex, 1);

//         const imageIndex = tempFilePaths.indexOf(newPath);
//         if (imageIndex > -1) tempFilePaths.splice(imageIndex, 1);

//         return {
//           originalname: uploadedFile.originalname,
//           url: downloadUrl,
//           firebasePath: firebaseFileName,
//           date: currentDate,
//           formattedDate: formattedDate
//         };
//       } catch (fileError) {
//         // Individual file error handling
//         console.error(`Error processing file ${uploadedFile.originalname}:`, fileError);
//         return {
//           originalname: uploadedFile.originalname,
//           error: fileError.message,
//           status: 'failed'
//         };
//       }
//     });

//     const results = await Promise.all(filePromises);

//     // Filter successful uploads
//     const uploadedFiles = results.filter(result => !result.error);
//     const failedFiles = results.filter(result => result.error);

//     // Provide detailed response with both successes and failures
//     return resp.json({
//       files: uploadedFiles,
//       failedFiles: failedFiles,
//       totalSuccess: uploadedFiles.length,
//       totalFailed: failedFiles.length
//     });
//   } catch (err) {
//     console.error('Error during file upload or conversion:', err);

//     // Clean up any remaining temporary files
//     await cleanupTempFiles(tempFilePaths);

//     // More specific error types
//     if (err.code === 'ENOSPC') {
//       return resp.status(507).json({ error: 'Storage capacity exceeded', details: err.message });
//     } else if (err.code === 'EMFILE') {
//       return resp.status(503).json({ error: 'Too many open files', details: err.message });
//     } else {
//       return resp.status(500).json({ error: 'Internal Server Error', details: err.message });
//     }
//   }
// });

// Routes
// File Upload Route
app.post('/upload', upload.array('files'), async (req, resp) => {
  const tempFilePaths = [];

  try {
    if (!req.files || req.files.length === 0) {
      return resp.status(400).json({ error: 'No files uploaded or invalid file type.' });
    }

    const filePromises = req.files.map(async (uploadedFile) => {
      const pdfPath = uploadedFile.path;
      const outputFilePrefix = path.basename(pdfPath, path.extname(pdfPath));
      tempFilePaths.push(pdfPath); // Track original PDF

      let imagePath; // Declare imagePath here to ensure it's in scope for cleanup

      try {
        // ---- MODIFICATION START ----
        // Convert PDF to JPEG - returns the final path of the generated/renamed image
        imagePath = await convertPdfToImage(pdfPath, UPLOAD_DIR, outputFilePrefix);
        tempFilePaths.push(imagePath); // Track generated image

        // // Get the generated image path // REMOVE THESE LINES
        // const { filePath, newPath } = await getGeneratedImagePath(UPLOAD_DIR, outputFilePrefix); // REMOVE THESE LINES
        // await fs.promises.rename(filePath, newPath); // REMOVE THESE LINES
        // tempFilePaths.push(newPath); // REMOVE THESE LINES


        // Upload the generated JPEG image to Firebase
        const { firebaseFileName, downloadUrl } = await uploadToFirebase(
          imagePath, // Use the path returned by convertPdfToImage
          uploadedFile.originalname // Pass the original PDF filename for reference
        );
        // ---- MODIFICATION END ----


        const currentDate = new Date().toISOString();
        const formattedDate = new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

        // Clean up local files after successful processing
        await fs.promises.unlink(pdfPath);
        // await fs.promises.unlink(newPath); // OLD - Use imagePath now
        await fs.promises.unlink(imagePath); // NEW - Use the correct variable


        // Remove from tracking after cleanup (simple removal from end might be sufficient if order is preserved)
        // Be careful with async and splice if order isn't guaranteed, but for cleanup it's often okay.
        const pdfIndex = tempFilePaths.indexOf(pdfPath);
        if (pdfIndex > -1) tempFilePaths.splice(pdfIndex, 1);
        const imageIndex = tempFilePaths.indexOf(imagePath);
        if (imageIndex > -1) tempFilePaths.splice(imageIndex, 1);


        return {
          originalname: uploadedFile.originalname,
          url: downloadUrl,
          firebasePath: firebaseFileName, // This is the path in Firebase (e.g., pdfs/timestamp-name.jpg)
          date: currentDate,
          formattedDate: formattedDate
        };
      } catch (fileError) {
        console.error(`Error processing file ${uploadedFile.originalname}:`, fileError);
        // Attempt to clean up files even if this specific one failed
        if (fs.existsSync(pdfPath)) await fs.promises.unlink(pdfPath).catch(e => console.error(`Cleanup failed for ${pdfPath}`, e));
        if (imagePath && fs.existsSync(imagePath)) await fs.promises.unlink(imagePath).catch(e => console.error(`Cleanup failed for ${imagePath}`, e));
        return {
          originalname: uploadedFile.originalname,
          error: fileError.message || 'Unknown processing error', // Ensure error has a message
          status: 'failed'
        };
      }
    });

    const results = await Promise.all(filePromises);
    const uploadedFiles = results.filter(result => !result.error);
    const failedFiles = results.filter(result => result.error);

    return resp.json({
      files: uploadedFiles,
      failedFiles: failedFiles,
      totalSuccess: uploadedFiles.length,
      totalFailed: failedFiles.length
    });

  } catch (err) { // Catch errors from multer or initial setup
    console.error('Error during file upload setup or final processing:', err);
    await cleanupTempFiles(tempFilePaths); // Attempt cleanup on outer error too
    // ... (rest of your outer catch block remains the same)
    if (err.code === 'LIMIT_FILE_SIZE') { // Handle multer errors specifically
      return resp.status(413).json({ error: 'File too large', details: `Maximum size is ${upload.limits.fileSize / (1024 * 1024)}MB` });
    } else if (err.message === 'Only PDF files are allowed!') {
      return resp.status(415).json({ error: 'Invalid file type', details: err.message });
    } else if (err.code === 'ENOSPC') {
      return resp.status(507).json({ error: 'Storage capacity exceeded', details: err.message });
    } else if (err.code === 'EMFILE') {
      return resp.status(503).json({ error: 'Too many open files', details: err.message });
    } else {
      return resp.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  }
});

// Helper function for cleaning up temporary files
async function cleanupTempFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(`Cleaned up temporary file: ${filePath}`);
      }
    } catch (cleanupError) {
      console.error(`Failed to clean up file ${filePath}:`, cleanupError);
    }
  }
}

// Get Files Route
app.get('/files', async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: 'pdfs/' });

    const filePromises = files.map(async (file) => {
      const [metadata] = await file.getMetadata();

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2030',
      });
      const creationTime = metadata.timeCreated;

      return {
        filename: file.name,
        originalname: file.name.split('/').pop(),
        url: url,
        date: creationTime,

        formattedDate: new Date(creationTime).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      };
    });

    const fileData = await Promise.all(filePromises);
    res.json({ files: fileData });
  } catch (err) {
    console.error('Error reading Firebase Storage:', err);
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
});


app.delete('/files/:path(*)', async (req, res) => {
  try {
    const fullPath = req.params.path;
    console.log(`Attempting to delete file at path: ${fullPath}`);

    // Check if file exists before deleting
    const file = bucket.file(fullPath);
    const [exists] = await file.exists();

    if (!exists) {
      console.log(`File not found at path: ${fullPath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    await file.delete();
    console.log(`Successfully deleted file: ${fullPath}`);
    res.json({ message: 'File deleted successfully', path: fullPath });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: 'Failed to delete file', details: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});