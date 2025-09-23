#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const IMPORT_DIR = path.join(__dirname, '../src/images/Portfolios/Journalism/_import');
const JOURNALISM_DIR = path.join(__dirname, '../src/images/Portfolios/Journalism');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function isImageFile(filename) {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExts.some(ext => filename.toLowerCase().endsWith(ext));
}

function formatFilename(filename, datePrefix, eventName, photoNumber) {
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  
  // If filename already has the correct format, keep it
  if (baseName.match(/^\d{6}_.*_[A-Z]+\d+$/)) {
    return filename;
  }
  
  // Generate photo code (CAL + number)
  const photoCode = `CAL${photoNumber.toString().padStart(3, '0')}`;
  
  return `${datePrefix}_${eventName}_${photoCode}${ext}`;
}

async function processImports() {
  try {
    // Check if import directory exists and has files
    const importFiles = await fs.readdir(IMPORT_DIR);
    const imageFiles = importFiles.filter(isImageFile);
    
    if (imageFiles.length === 0) {
      console.log('No image files found in import directory.');
      return;
    }
    
    console.log(`Found ${imageFiles.length} image(s) to import:`);
    imageFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    console.log();
    
    // Get event details from user
    const dateInput = await askQuestion('Enter event date (YYMMDD format, e.g., 250923): ');
    const eventName = await askQuestion('Enter event name (e.g., "City Council Meeting"): ');
    const categoryInput = await askQuestion('Enter category subfolder (optional, press Enter to skip): ');
    
    // Validate date format
    if (!/^\d{6}$/.test(dateInput)) {
      console.log('Invalid date format. Please use YYMMDD format.');
      rl.close();
      return;
    }
    
    // Determine target directory
    const targetDir = categoryInput.trim() 
      ? path.join(JOURNALISM_DIR, categoryInput.trim())
      : JOURNALISM_DIR;
    
    // Create target directory if it doesn't exist
    await fs.mkdir(targetDir, { recursive: true });
    
    // Process each file
    let photoNumber = 1;
    const movedFiles = [];
    
    for (const file of imageFiles) {
      const sourcePath = path.join(IMPORT_DIR, file);
      const newFilename = formatFilename(file, dateInput, eventName, photoNumber);
      const targetPath = path.join(targetDir, newFilename);
      
      // Check if target file already exists
      try {
        await fs.access(targetPath);
        console.log(`⚠️  File ${newFilename} already exists, skipping...`);
        continue;
      } catch {
        // File doesn't exist, proceed with move
      }
      
      await fs.rename(sourcePath, targetPath);
      movedFiles.push({
        original: file,
        new: newFilename,
        path: path.relative(path.join(__dirname, '..'), targetPath)
      });
      
      photoNumber++;
    }
    
    if (movedFiles.length > 0) {
      console.log('\n✅ Successfully imported:');
      movedFiles.forEach(file => {
        console.log(`  ${file.original} → ${file.new}`);
        console.log(`    Location: ${file.path}`);
      });
      
      console.log(`\n📝 Next steps:`);
      console.log('1. Run: npm run manifest:journalism');
      console.log('2. Commit and push changes to update the website');
      
      // Ask if user wants to run manifest generation now
      const runManifest = await askQuestion('\nRun manifest generation now? (y/n): ');
      if (runManifest.toLowerCase() === 'y' || runManifest.toLowerCase() === 'yes') {
        rl.close();
        const { spawn } = require('child_process');
        const manifestProcess = spawn('npm', ['run', 'manifest:journalism'], { stdio: 'inherit' });
        manifestProcess.on('close', (code) => {
          console.log(`\n${code === 0 ? '✅' : '❌'} Manifest generation ${code === 0 ? 'completed' : 'failed'}`);
        });
      } else {
        rl.close();
      }
    } else {
      console.log('\n❌ No files were imported.');
      rl.close();
    }
    
  } catch (error) {
    console.error('Error processing imports:', error.message);
    rl.close();
  }
}

// Create a README file in the import directory
async function createImportReadme() {
  const readmePath = path.join(IMPORT_DIR, 'README.md');
  const readmeContent = `# Journalism Photo Import Directory

Drop your journalism photos here and run \`npm run import:journalism\` to process them.

## Usage

1. **Add photos**: Copy your new journalism photos to this folder
2. **Run import**: Execute \`npm run import:journalism\`
3. **Follow prompts**: Enter event date (YYMMDD), event name, and optional category
4. **Generate manifest**: Run \`npm run manifest:journalism\` (or let the import script do it)
5. **Deploy**: Commit and push your changes

## File Naming

The import script will automatically rename your files to follow the format:
\`YYMMDD_EventName_CALxxx.jpg\`

Example: \`250923_City Council Meeting_CAL001.jpg\`

## Categories

You can optionally organize photos into category subfolders like:
- Politics
- Events  
- Portraits
- Sports
- etc.

If no category is specified, photos go directly into the main journalism portfolio folder.
`;

  try {
    await fs.access(readmePath);
  } catch {
    // File doesn't exist, create it
    await fs.writeFile(readmePath, readmeContent);
  }
}

if (require.main === module) {
  createImportReadme().then(() => {
    processImports();
  });
}