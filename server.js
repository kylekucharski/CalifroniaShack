const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static('.'));

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
        const categoryPath = `products/${category}/${category}.html`;
        
        // Read the current category page
        let content = await fs.readFile(categoryPath, 'utf8');
        
        // Insert the new product card
        content = content.replace(
            '</div><!-- end row -->',
            `    ${productCard}\n        </div><!-- end row -->`
        );
        
        // Write the updated content back
        await fs.writeFile(categoryPath, content);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 