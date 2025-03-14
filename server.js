const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const uploadPath = req.body.path ? path.dirname(req.body.path) : 'uploads';
            // Create all directories in the path
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const filename = req.body.path ? path.basename(req.body.path) : file.originalname;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Handle image uploads
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }
        res.json({
            success: true,
            path: req.body.path || path.join('uploads', req.file.filename)
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Handle file saving
app.post('/api/save-file', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        
        // Create the directory if it doesn't exist
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        
        // Write the file
        await fs.writeFile(filePath, content);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Handle category page updates
app.post('/api/update-category', async (req, res) => {
    try {
        const { path: filePath, productCard } = req.body;
        
        // Create the directory if it doesn't exist
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        
        // Read the current content or create a new file if it doesn't exist
        let content;
        try {
            content = await fs.readFile(filePath, 'utf8');
        } catch (error) {
            // If file doesn't exist, create a new category page
            content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - CaliforniaShack</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Montserrat', sans-serif;
            padding-top: 80px;
        }
        .product-grid {
            padding: 2rem 0;
        }
        .product-card {
            display: block;
            text-decoration: none;
            color: inherit;
            transition: transform 0.3s ease;
        }
        .product-card:hover {
            transform: translateY(-5px);
        }
        .product-card img {
            width: 100%;
            height: 400px;
            object-fit: cover;
            margin-bottom: 1rem;
        }
        .product-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .product-price {
            font-size: 1.2rem;
            font-weight: 700;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="product-grid">
            <div class="row" id="productContainer">
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
        }
        
        // Find the product container div and insert the new product card
        const containerStart = content.indexOf('<div class="row" id="productContainer">') + '<div class="row" id="productContainer">'.length;
        const containerEnd = content.indexOf('</div>', containerStart);
        
        // Insert the new product card at the beginning of the container
        const updatedContent = content.slice(0, containerStart) + '\n                ' + productCard + content.slice(containerStart);
        
        // Write the updated content back to the file
        await fs.writeFile(filePath, updatedContent);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open listing-builder.html in your browser to create new listings`);
}); 