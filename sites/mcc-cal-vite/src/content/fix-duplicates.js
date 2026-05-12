const fs = require('fs');
const path = require('path');

// Fix for Windows path escaping in Node.js
function fixWindowsPath(path) {
  if (process.platform === 'win32') {
    return path.replace(/\\/g, '/');
  }
  return path;
}

const contentDir = fixWindowsPath('c:\\Users\\wolft\\Desktop\\Projects\\McCals-Website\\sites\\mcc-cal-vite\\src\\content');

// console.log('Scanning content directory:', contentDir);

// Read all markdown files in content directory
const files = fs.readdirSync(contentDir)
  .filter(file => file.endsWith('.md'))
  .filter(file => !file.startsWith('.') && !file.startsWith('_'));

// console.log('Found markdown files:', files);

// Scan for duplicates and trail notes
const allContent = {};
const duplicates = [];

files.forEach(file => {
  const filePath = path.join(contentDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    allContent[file] = content;
    
    // Look for potential duplicates by checking content similarity
    Object.keys(allContent).forEach(otherFile => {
      if (otherFile !== file) {
        const similarity = calculateSimilarity(content, allContent[otherFile]);
        if (similarity > 0.8) {
          duplicates.push({
            file1: file,
            file2: otherFile,
            similarity: similarity
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
  }
});

// Remove duplicates
// console.log('Found duplicates:', duplicates);
duplicates.forEach(dup => {
  // console.log(`Removing duplicate content from ${dup.file2} (keeping ${dup.file1})`);
  
  try {
    fs.unlinkSync(path.join(contentDir, dup.file2));
  } catch (error) {
    console.error(`Error removing ${dup.file2}:`, error.message);
  }
});

// Simple similarity calculation (word overlap)
function calculateSimilarity(content1, content2) {
  const words1 = new Set(content1.toLowerCase().split(/\s+/));
  const words2 = new Set(content2.toLowerCase().split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  
  return intersection.size / Math.max(words1.size, words2.size);
}

// console.log('Duplicate removal completed');
