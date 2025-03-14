const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadPath = path.dirname(req.body.path);
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(req.body.path));
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
            path: req.body.path
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save a new file
app.post('/api/save-file', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        
        // Create directory if it doesn't exist
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // Write the file
        await fs.writeFile(filePath, content);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update category page
app.post('/api/update-category', async (req, res) => {
    try {
        const { category, productCard } = req.body;
        const categoryPath = path.join(__dirname, 'products', category, `${category}.html`);
        
        // Read the current category page
        let content = await fs.readFile(categoryPath, 'utf8');
        
        // Find the products grid and insert the new product card
        const gridEndMarker = '</div><!-- end row -->';
        const insertPosition = content.lastIndexOf(gridEndMarker);
        
        if (insertPosition === -1) {
            throw new Error('Could not find products grid in category page');
        }
        
        // Insert the new product card before the grid end marker
        content = content.slice(0, insertPosition) + 
                 `    ${productCard}\n        ` +
                 content.slice(insertPosition);
        
        // Write the updated content back
        await fs.writeFile(categoryPath, content);
        
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