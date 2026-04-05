/**
 * Admin API - Simple endpoints for blog CMS
 * Add this to your existing Express server or run separately
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const REPO_ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(REPO_ROOT, 'src', 'content', 'blog', 'posts');
const IMAGES_DIR = path.join(REPO_ROOT, 'src', 'images', 'Portfolios');

// Multer storage configuration for uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Upload image to portfolio
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { portfolio, folder } = req.body;
    
    if (!portfolio || !req.file) {
      return res.status(400).json({ error: 'Portfolio and image file required' });
    }
    
    // Sanitize folder name
    const targetFolder = folder?.replace(/[^a-zA-Z0-9-_\s]/g, '').trim() || 'Uncategorized';
    const uploadDir = path.join(IMAGES_DIR, portfolio, targetFolder);
    
    // Create directory if needed
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Generate safe filename
    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${safeName}`;
    const filepath = path.join(uploadDir, filename);
    
    // Save file
    await fs.writeFile(filepath, req.file.buffer);
    
    const relativePath = `/images/Portfolios/${portfolio}/${targetFolder}/${filename}`.replace(/\\/g, '/');
    
    res.json({ 
      success: true, 
      path: relativePath,
      filename: safeName,
      size: req.file.size 
    });
  } catch (error) {
    console.error('Upload error: - api.js:56', error);
    res.status(500).json({ error: error.message });
  }
});

// List available portfolio images
router.get('/images', async (req, res) => {
  try {
    const images = [];
    const tree = {};
    
    // Helper to build tree structure
    function addToTree(pathParts, image, currentLevel) {
      if (pathParts.length === 0) {
        // Leaf node - add image
        if (!currentLevel._images) currentLevel._images = [];
        currentLevel._images.push(image);
        return;
      }
      
      const part = pathParts[0];
      if (!currentLevel[part]) currentLevel[part] = {};
      addToTree(pathParts.slice(1), image, currentLevel[part]);
    }
    
    // Helper to scan directory recursively
    async function scanDir(dir, basePath = '') {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
          
          if (entry.isDirectory()) {
            await scanDir(fullPath, relativePath);
          } else if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(entry.name)) {
            const imgPath = `/images/Portfolios/${relativePath.replace(/\\/g, '/')}`;
            const pathParts = relativePath.replace(/\\/g, '/').split('/');
            const folder = pathParts[0];
            
            const image = {
              path: imgPath,
              folder: folder,
              filename: entry.name,
              relativePath: relativePath.replace(/\\/g, '/')
            };
            
            images.push(image);
            addToTree(pathParts.slice(0, -1), image, tree);
          }
        }
      } catch {
        // Skip directories we can't read
      }
    }
    
    await scanDir(IMAGES_DIR);
    
    // Group by top-level folder (backward compat)
    const grouped = images.reduce((acc, img) => {
      if (!acc[img.folder]) acc[img.folder] = [];
      acc[img.folder].push(img);
      return acc;
    }, {});
    
    res.json({ images, grouped, tree });
  } catch (error) {
    res.status(500).json({ error: error.message, images: [] });
  }
});

// List all posts
router.get('/posts', async (req, res) => {
  try {
    const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
    const posts = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      try {
        const postJsonPath = path.join(POSTS_DIR, entry.name, 'post.json');
        const content = await fs.readFile(postJsonPath, 'utf-8');
        const post = JSON.parse(content);

        posts.push({
          slug: entry.name,
          title: post.title,
          date: post.date,
          category: post.category,
          draft: post.draft,
          excerpt: post.excerpt?.slice(0, 100) + (post.excerpt?.length > 100 ? '...' : ''),
        });
      } catch {
        // Skip invalid posts
      }
    }

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json({ posts });
  } catch (err) {
    console.error('Error listing posts: - api.js:158', err);
    res.status(500).json({ error: err.message, posts: [] });
  }
});

// Get single post
router.get('/posts/:slug', async (req, res) => {
  try {
    const postDir = path.join(POSTS_DIR, req.params.slug);
    const postJsonPath = path.join(postDir, 'post.json');
    const postMdPath = path.join(postDir, 'post.md');

    const content = await fs.readFile(postJsonPath, 'utf-8');
    const post = JSON.parse(content);

    // Try to read markdown version
    let markdown = '';
    try {
      markdown = await fs.readFile(postMdPath, 'utf-8');
    } catch {
      // If no markdown, convert body blocks to markdown
      markdown = post.body.map(block => {
        if (block.type === 'text') return block.content;
        if (block.type === 'quote') return `> ${block.content}`;
        if (block.type === 'code') return `\`\`\`\n${block.content}\n\`\`\``;
        if (block.type === 'image') return `![${block.alt || ''}](${block.src})`;
        return '';
      }).join('\n\n');
    }

    res.json({ ...post, markdown });
  } catch (error) {
    res.status(404).json({ error: 'Post not found' });
  }
});

// Create post
router.post('/posts', async (req, res) => {
  try {
    const { title, slug, excerpt, category, tags, body, draft } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug required' });
    }

    const postDir = path.join(POSTS_DIR, slug);

    // Check if exists
    try {
      await fs.access(postDir);
      return res.status(409).json({ error: 'Post already exists' });
    } catch {
      // Good, doesn't exist
    }

    await fs.mkdir(postDir, { recursive: true });

    const today = new Date().toISOString().split('T')[0];

    // Parse markdown body into blocks
    const bodyBlocks = parseMarkdown(body);

    const postData = {
      title,
      slug,
      excerpt: excerpt || '',
      date: today,
      category: category || 'essay',
      tags: tags || [],
      draft: draft !== false,
      authorId: 'mccal',
      authorName: 'Caleb McCartney',
      body: bodyBlocks,
    };

    await fs.writeFile(
      path.join(postDir, 'post.json'),
      JSON.stringify(postData, null, 2),
      'utf-8'
    );

    // Also save as markdown for easy editing
    await fs.writeFile(
      path.join(postDir, 'post.md'),
      body,
      'utf-8'
    );

    res.json({ success: true, slug, message: 'Post created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
router.put('/posts/:slug', async (req, res) => {
  try {
    const { title, date, excerpt, category, tags, body, draft } = req.body;
    const postDir = path.join(POSTS_DIR, req.params.slug);
    const postJsonPath = path.join(postDir, 'post.json');

    const content = await fs.readFile(postJsonPath, 'utf-8');
    const post = JSON.parse(content);

    if (title !== undefined) post.title = title;
    if (date !== undefined) post.date = date;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (category !== undefined) post.category = category;
    if (tags !== undefined) post.tags = tags;
    if (body !== undefined) post.body = parseMarkdown(body);
    if (draft !== undefined) post.draft = draft;

    await fs.writeFile(postJsonPath, JSON.stringify(post, null, 2), 'utf-8');

    // Update markdown file too
    if (body !== undefined) {
      await fs.writeFile(path.join(postDir, 'post.md'), body, 'utf-8');
    }

    res.json({ success: true, message: 'Post updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
router.delete('/posts/:slug', async (req, res) => {
  try {
    const postDir = path.join(POSTS_DIR, req.params.slug);
    await fs.rm(postDir, { recursive: true });
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parse markdown into blocks
function parseMarkdown(markdown) {
  const blocks = [];
  const lines = markdown.split('\n');
  let currentBlock = { type: 'text', content: '' };

  for (const line of lines) {
    const trimmed = line.trim();

    // Code block
    if (trimmed.startsWith('```')) {
      if (currentBlock.type === 'code') {
        // End code block
        blocks.push(currentBlock);
        currentBlock = { type: 'text', content: '' };
      } else {
        // Start code block
        if (currentBlock.content.trim()) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'code', content: '' };
      }
      continue;
    }

    if (currentBlock.type === 'code') {
      currentBlock.content += line + '\n';
      continue;
    }

    // Quote
    if (trimmed.startsWith('>')) {
      if (currentBlock.type !== 'quote') {
        if (currentBlock.content.trim()) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'quote', content: trimmed.slice(1).trim() };
      } else {
        currentBlock.content += '\n' + trimmed.slice(1).trim();
      }
      continue;
    }

    // Image
    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.+?)\)$/);
    if (imageMatch) {
      if (currentBlock.content.trim()) {
        blocks.push(currentBlock);
      }
      blocks.push({ type: 'image', src: imageMatch[2], alt: imageMatch[1] });
      currentBlock = { type: 'text', content: '' };
      continue;
    }

    // Regular text
    if (currentBlock.type !== 'text') {
      if (currentBlock.content.trim()) {
        blocks.push(currentBlock);
      }
      currentBlock = { type: 'text', content: trimmed };
    } else {
      currentBlock.content += (currentBlock.content ? '\n' : '') + trimmed;
    }
  }

  if (currentBlock.content.trim()) {
    blocks.push(currentBlock);
  }

  return blocks.filter(b => b.content.trim() || b.type === 'image');
}

module.exports = router;
