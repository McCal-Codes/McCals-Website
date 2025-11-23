#!/usr/bin/env node
/**
 * Admin Portfolio Import Backend
 * Handles actual file operations for the admin portfolio importer widget
 * 
 * Author: McCal-Codes
 * Version: 1.0.0
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ExifParser = require('exif-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Configuration
const CONFIG = {
  portfolioBasePath: path.resolve(__dirname, '../src/images/Portfolios'),
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  portfolioTypes: {
    Concert: 'Concert',
    Events: 'Events', 
    Journalism: 'Journalism'
  }
};

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: CONFIG.maxFileSize,
    files: 100 // Max 100 files per request
  },
  fileFilter: (req, file, cb) => {
    if (CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

// Admin authentication middleware (must be used after multer)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const formPassword = req.body.adminPassword; // From multipart form data
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  console.log('Auth check  Header: - admin-import-backend.js:59', authHeader);
  console.log('Auth check  Form password: - admin-import-backend.js:60', formPassword);
  console.log('Auth check  Expected: - admin-import-backend.js:61', adminPassword);
  
  // Check authorization header first
  if (authHeader && authHeader === `Bearer ${adminPassword}`) {
    console.log('Auth success via header - admin-import-backend.js:65');
    return next();
  }
  
  // Check form data password (from multer)
  if (formPassword && formPassword === adminPassword) {
    console.log('Auth success via form data - admin-import-backend.js:71');
    return next();
  }
  
  console.log('Auth failed  no valid credentials found - admin-import-backend.js:75');
  return res.status(401).json({ 
    error: 'Unauthorized - Invalid admin password',
    debug: {
      hasHeader: !!authHeader,
      hasFormPassword: !!formPassword,
      expectedPassword: adminPassword
    }
  });
}

// Utility functions
function extractDateFromFilename(filename) {
  const patterns = [
    /^(\d{2})(\d{2})(\d{2})/, // YYMMDD
    /^(\d{4})(\d{2})(\d{2})/, // YYYYMMDD
    /(\d{2})-(\d{2})-(\d{2})/ // DD-MM-YY
  ];

  for (const [index, pattern] of patterns.entries()) {
    const match = filename.match(pattern);
    if (match) {
      let year, month, day;
      if (index === 0) { // YYMMDD
        year = parseInt(match[1]) + (parseInt(match[1]) > 50 ? 1900 : 2000);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
      } else if (index === 1) { // YYYYMMDD
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
      } else { // DD-MM-YY
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]) + 2000;
      }

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return {
          year,
          month,
          day,
          date: new Date(year, month - 1, day),
          source: 'filename'
        };
      }
    }
  }

  return null;
}

function extractDateFromExif(buffer) {
  try {
    const parser = ExifParser.create(buffer);
    const result = parser.parse();
    
    if (result.tags && (result.tags.DateTime || result.tags.DateTimeOriginal)) {
      const timestamp = result.tags.DateTimeOriginal || result.tags.DateTime;
      const date = new Date(timestamp * 1000);
      
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        date: date,
        source: 'exif'
      };
    }
  } catch (error) {
    // EXIF parsing failed, continue without it
  }
  
  return null;
}

function formatMonthYear(date) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function extractEntityName(filename, folderName = null) {
  if (folderName) {
    return folderName;
  }
  
  // Extract from filename pattern like "250829_BandName_Photo.jpg"
  const parts = filename.split('_');
  if (parts.length >= 2) {
    return parts[1];
  }
  
  return 'Unknown';
}

function generateTargetPath(portfolioType, filename, dateInfo, entityName) {
  const basePath = CONFIG.portfolioBasePath;
  let targetPath;

  if (portfolioType === 'Concert' || portfolioType === 'Events') {
    const monthYear = dateInfo ? formatMonthYear(dateInfo.date) : 'Unknown Date';
    targetPath = path.join(basePath, portfolioType, entityName, monthYear);
  } else if (portfolioType === 'Journalism') {
    targetPath = path.join(basePath, portfolioType, entityName);
  } else {
    throw new Error(`Unsupported portfolio type: ${portfolioType}`);
  }

  return { directory: targetPath, fullPath: path.join(targetPath, filename) };
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Preview import operation
app.post('/api/admin/import/preview', upload.array('files'), requireAuth, async (req, res) => {
  try {
    const { portfolioType, folderMapping } = req.body;
    const files = req.files;

    if (!portfolioType || !CONFIG.portfolioTypes[portfolioType]) {
      return res.status(400).json({ error: 'Invalid portfolio type' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const preview = [];
    const folderMappingObj = folderMapping ? JSON.parse(folderMapping) : {};

    for (const file of files) {
      // Extract date from filename and EXIF
      const filenameDate = extractDateFromFilename(file.originalname);
      const exifDate = extractDateFromExif(file.buffer);
      const dateInfo = filenameDate || exifDate;

      // Determine entity name (band/event/category)
      const folderName = folderMappingObj[file.originalname];
      const entityName = extractEntityName(file.originalname, folderName);

      // Generate target path
      const targetInfo = generateTargetPath(portfolioType, file.originalname, dateInfo, entityName);

      // Validate import
      const validation = {
        hasDate: !!dateInfo,
        hasEntityName: entityName !== 'Unknown',
        fileSize: file.size,
        mimeType: file.mimetype
      };

      preview.push({
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        dateInfo: dateInfo,
        entityName: entityName,
        targetPath: path.relative(CONFIG.portfolioBasePath, targetInfo.fullPath),
        validation: validation,
        status: validation.hasDate && validation.hasEntityName ? 'ready' : 'warning'
      });
    }

    res.json({
      success: true,
      portfolioType: portfolioType,
      fileCount: files.length,
      preview: preview
    });

  } catch (error) {
    console.error('Preview error: - admin-import-backend.js:266', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// Execute import operation
app.post('/api/admin/import/execute', upload.array('files'), requireAuth, async (req, res) => {
  try {
    const { portfolioType, folderMapping } = req.body;
    const files = req.files;

    if (!portfolioType || !CONFIG.portfolioTypes[portfolioType]) {
      return res.status(400).json({ error: 'Invalid portfolio type' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const results = [];
    const folderMappingObj = folderMapping ? JSON.parse(folderMapping) : {};
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        // Extract date and entity info
        const filenameDate = extractDateFromFilename(file.originalname);
        const exifDate = extractDateFromExif(file.buffer);
        const dateInfo = filenameDate || exifDate;

        const folderName = folderMappingObj[file.originalname];
        const entityName = extractEntityName(file.originalname, folderName);

        // Generate target path
        const targetInfo = generateTargetPath(portfolioType, file.originalname, dateInfo, entityName);

        // Ensure target directory exists
        await ensureDirectoryExists(targetInfo.directory);

        // Check if file already exists
        let finalPath = targetInfo.fullPath;
        let counter = 1;
        while (true) { // eslint-disable-line no-constant-condition
          try {
            await fs.access(finalPath);
            // File exists, try with counter
            const ext = path.extname(file.originalname);
            const nameWithoutExt = path.basename(file.originalname, ext);
            const newFilename = `${nameWithoutExt}_${counter}${ext}`;
            finalPath = path.join(targetInfo.directory, newFilename);
            counter++;
          } catch {
            // File doesn't exist, we can use this path
            break;
          }
        }

        // Write the file
        await fs.writeFile(finalPath, file.buffer);

        results.push({
          filename: file.originalname,
          targetPath: path.relative(CONFIG.portfolioBasePath, finalPath),
          status: 'success',
          dateInfo: dateInfo,
          entityName: entityName
        });

        successCount++;

      } catch (error) {
        console.error(`Error processing file ${file.originalname}: - admin-import-backend.js:338`, error);
        results.push({
          filename: file.originalname,
          status: 'error',
          error: error.message
        });
        errorCount++;
      }
    }

    // Trigger manifest regeneration (optional)
    if (successCount > 0) {
      try {
        const { spawn } = require('child_process');
        
        if (portfolioType === 'Concert') {
          // First generate individual manifests
          const enhancedScript = path.join(__dirname, 'manifest/enhanced-manifest-generator.js');
          spawn('node', [enhancedScript, '--auto'], { 
            detached: true, 
            stdio: 'ignore' 
          }).unref();
          
          // Then generate the concert rollup manifest (after a small delay)
          setTimeout(() => {
            const concertScript = path.join(__dirname, 'manifest/generate-concert-manifest.js');
            spawn('node', [concertScript], { 
              detached: true, 
              stdio: 'ignore' 
            }).unref();
          }, 2000); // 2 second delay to let individual manifests complete
        } else if (portfolioType === 'Events') {
          // Generate events manifest
          setTimeout(() => {
            const eventsScript = path.join(__dirname, 'manifest/generate-events-manifest.js');
            spawn('node', [eventsScript], { 
              detached: true, 
              stdio: 'ignore' 
            }).unref();
          }, 1000);
        } else if (portfolioType === 'Journalism') {
          // Generate journalism manifest
          setTimeout(() => {
            const journalismScript = path.join(__dirname, 'manifest/generate-journalism-manifest.js');
            spawn('node', [journalismScript], { 
              detached: true, 
              stdio: 'ignore' 
            }).unref();
          }, 1000);
        }
        
        // Always regenerate the universal manifest after any portfolio change
        setTimeout(() => {
          const universalScript = path.join(__dirname, 'manifest/generate-universal-manifest.js');
          spawn('node', [universalScript], { 
            detached: true, 
            stdio: 'ignore' 
          }).unref();
        }, 3000); // Delay to let portfolio-specific manifests complete first
      } catch (manifestError) {
        console.warn('Failed to trigger manifest regeneration: - admin-import-backend.js:398', manifestError);
      }
    }

    res.json({
      success: true,
      portfolioType: portfolioType,
      totalFiles: files.length,
      successCount: successCount,
      errorCount: errorCount,
      results: results
    });

  } catch (error) {
    console.error('Import execution error: - admin-import-backend.js:412', error);
    res.status(500).json({ error: 'Failed to execute import' });
  }
});

// Get portfolio status with folder details
app.get('/api/admin/portfolios/:type/status', requireAuth, async (req, res) => {
  try {
    const portfolioType = req.params.type;
    
    if (!CONFIG.portfolioTypes[portfolioType]) {
      return res.status(400).json({ error: 'Invalid portfolio type' });
    }

    const portfolioPath = path.join(CONFIG.portfolioBasePath, portfolioType);
    
    try {
      const stats = await fs.stat(portfolioPath);
      const entries = await fs.readdir(portfolioPath, { withFileTypes: true });
      
      const folders = entries.filter(entry => entry.isDirectory());
      const files = entries.filter(entry => entry.isFile());

      // Get detailed folder information
      const folderDetails = [];
      for (const folder of folders) {
        const folderPath = path.join(portfolioPath, folder.name);
        try {
          const folderStats = await fs.stat(folderPath);
          const folderEntries = await fs.readdir(folderPath, { withFileTypes: true });
          
          // Get subfolders (date folders)
          const subfolders = [];
          for (const subfolder of folderEntries.filter(e => e.isDirectory())) {
            const subfolderPath = path.join(folderPath, subfolder.name);
            const subStats = await fs.stat(subfolderPath);
            const subEntries = await fs.readdir(subfolderPath);
            const imageCount = subEntries.filter(f => f.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)).length;
            
            subfolders.push({
              name: subfolder.name,
              imageCount: imageCount,
              lastModified: subStats.mtime,
              hasManifest: subEntries.includes('manifest.json')
            });
          }
          
          folderDetails.push({
            name: folder.name,
            subfolderCount: subfolders.length,
            subfolders: subfolders,
            lastModified: folderStats.mtime,
            totalImages: subfolders.reduce((sum, sf) => sum + sf.imageCount, 0)
          });
        } catch (err) {
          folderDetails.push({
            name: folder.name,
            error: 'Could not read folder details'
          });
        }
      }

      res.json({
        success: true,
        portfolioType: portfolioType,
        path: portfolioPath,
        exists: true,
        folderCount: folders.length,
        fileCount: files.length,
        lastModified: stats.mtime,
        folders: folderDetails
      });

    } catch (error) {
      res.json({
        success: true,
        portfolioType: portfolioType,
        path: portfolioPath,
        exists: false,
        error: 'Portfolio directory not found'
      });
    }

  } catch (error) {
    console.error('Portfolio status error: - admin-import-backend.js:496', error);
    res.status(500).json({ error: 'Failed to get portfolio status' });
  }
});

// Folder management operations
app.post('/api/admin/portfolios/:type/folders/:folderName/rename', requireAuth, async (req, res) => {
  try {
    const { portfolioType, folderName } = req.params;
    const { newName } = req.body;
    
    if (!CONFIG.portfolioTypes[portfolioType]) {
      return res.status(400).json({ error: 'Invalid portfolio type' });
    }
    
    if (!newName || newName.trim() === '') {
      return res.status(400).json({ error: 'New folder name required' });
    }
    
    const portfolioPath = path.join(CONFIG.portfolioBasePath, portfolioType);
    const oldPath = path.join(portfolioPath, folderName);
    const newPath = path.join(portfolioPath, newName.trim());
    
    // Check if old folder exists
    try {
      await fs.access(oldPath);
    } catch {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Check if new name already exists
    try {
      await fs.access(newPath);
      return res.status(400).json({ error: 'Folder with new name already exists' });
    } catch {
      // Good - new name doesn't exist
    }
    
    // Rename folder
    await fs.rename(oldPath, newPath);
    
    res.json({ 
      success: true, 
      message: `Folder renamed from "${folderName}" to "${newName.trim()}"`,
      oldName: folderName,
      newName: newName.trim()
    });
    
  } catch (error) {
    console.error('Folder rename error: - admin-import-backend.js:545', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
});

app.delete('/api/admin/portfolios/:type/folders/:folderName', requireAuth, async (req, res) => {
  try {
    const { portfolioType, folderName } = req.params;
    const { confirm } = req.body;
    
    if (!CONFIG.portfolioTypes[portfolioType]) {
      return res.status(400).json({ error: 'Invalid portfolio type' });
    }
    
    if (!confirm) {
      return res.status(400).json({ error: 'Confirmation required for deletion' });
    }
    
    const portfolioPath = path.join(CONFIG.portfolioBasePath, portfolioType);
    const folderPath = path.join(portfolioPath, folderName);
    
    // Check if folder exists
    try {
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Path is not a directory' });
      }
    } catch {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Delete folder recursively
    await fs.rmdir(folderPath, { recursive: true });
    
    res.json({ 
      success: true, 
      message: `Folder "${folderName}" deleted successfully`
    });
    
  } catch (error) {
    console.error('Folder delete error: - admin-import-backend.js:585', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Get server info for remote access
app.get('/api/admin/server/info', requireAuth, async (req, res) => {
  try {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    
    // Get local IP addresses
    const localIPs = [];
    Object.keys(networkInterfaces).forEach(interface => {
      networkInterfaces[interface].forEach(address => {
        if (address.family === 'IPv4' && !address.internal) {
          localIPs.push(address.address);
        }
      });
    });
    
    res.json({
      success: true,
      server: {
        port: PORT,
        localIPs: localIPs,
        hostname: os.hostname(),
        platform: os.platform(),
        uptime: process.uptime()
      },
      access: {
        local: `http://localhost:${PORT}`,
        network: localIPs.map(ip => `http://${ip}:${PORT}`)
      }
    });
    
  } catch (error) {
    console.error('Server info error: - admin-import-backend.js:622', error);
    res.status(500).json({ error: 'Failed to get server info' });
  }
});

// Error handling middleware
app.use((error, req, res) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 50MB)' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files (max 100)' });
    }
  }
  
  console.error('Server error: - admin-import-backend.js:638', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔧 Admin Portfolio Import Backend running on http://localhost:${PORT} - admin-import-backend.js:644`);
  console.log(`📁 Portfolio base path: ${CONFIG.portfolioBasePath} - admin-import-backend.js:645`);
  console.log(`🔐 Admin password required for all operations - admin-import-backend.js:646`);
  console.log(`📝 Available endpoints: - admin-import-backend.js:647`);
  console.log(`GET  /health  Health check - admin-import-backend.js:648`);
  console.log(`POST /api/admin/import/preview  Preview import - admin-import-backend.js:649`);
  console.log(`POST /api/admin/import/execute  Execute import - admin-import-backend.js:650`);
  console.log(`GET  /api/admin/portfolios/:type/status  Portfolio status with folder details - admin-import-backend.js:651`);
  console.log(`POST /api/admin/portfolios/:type/folders/:name/rename  Rename folder - admin-import-backend.js:652`);
  console.log(`DELETE /api/admin/portfolios/:type/folders/:name  Delete folder - admin-import-backend.js:653`);
  console.log(`GET  /api/admin/server/info  Server info for remote access - admin-import-backend.js:654`);
});

module.exports = app;
