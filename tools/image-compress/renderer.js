  // Settings persistence
  async function loadSettings() {
    const settings = await ipcRenderer.invoke('get-settings');
    if (settings) {
      if (settings.format) document.getElementById('format').value = settings.format;
      if (settings.quality) document.getElementById('quality').value = settings.quality;
      // Add more fields as needed
    }
  }

  async function saveSettings() {
    const settings = {
      format: document.getElementById('format').value,
      quality: document.getElementById('quality').value,
      // Add more fields as needed
    };
    await ipcRenderer.invoke('save-settings', settings);
  }

  // Load settings on startup
  window.addEventListener('DOMContentLoaded', loadSettings);

  // Save settings when changed
  document.getElementById('format').addEventListener('change', saveSettings);
  document.getElementById('quality').addEventListener('change', saveSettings);

const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');



const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('quality-value');
const formatSelect = document.getElementById('format');
const portfolioInput = document.getElementById('portfolio');
const dropArea = document.getElementById('drop-area');
const statusDiv = document.getElementById('status');
const platformToggle = document.getElementById('platform-toggle');
const natureFields = document.getElementById('nature-fields');
const animalFields = document.getElementById('animal-fields');
const animalTypeInput = document.getElementById('animal-type');
const animalNameInput = document.getElementById('animal-name');
const landscapeFields = document.getElementById('landscape-fields');
const landscapeLocationInput = document.getElementById('landscape-location');
const landscapeNameInput = document.getElementById('landscape-name');

function detectNatureCategory(portfolio) {
  // Normalize and check for Animal/ or Landscape/ or 'nature' keyword
  const val = portfolio.trim().toLowerCase();
  if (val.startsWith('animal/')) return 'animal';
  if (val.startsWith('landscape/')) return 'landscape';
  if (val === 'nature') return 'prompt';
  return null;
}

function updateNatureFields() {
  const portfolio = portfolioInput.value.trim();
  const detected = detectNatureCategory(portfolio);
  if (detected === 'animal') {
    natureFields.style.display = 'flex';
    animalFields.style.display = '';
    landscapeFields.style.display = 'none';
  } else if (detected === 'landscape') {
    natureFields.style.display = 'flex';
    animalFields.style.display = 'none';
    landscapeFields.style.display = '';
  } else if (detected === 'prompt') {
    natureFields.style.display = 'flex';
    animalFields.style.display = '';
    landscapeFields.style.display = '';
  } else {
    natureFields.style.display = 'none';
    animalFields.style.display = 'none';
    landscapeFields.style.display = 'none';
  }
}

portfolioInput.addEventListener('input', updateNatureFields);
window.addEventListener('DOMContentLoaded', updateNatureFields);

// Auto-detect platform and set default
const detectedPlatform = process.platform; // 'win32', 'darwin', etc.
if (platformToggle) {
  if (detectedPlatform === 'win32') platformToggle.value = 'win32';
  else if (detectedPlatform === 'darwin') platformToggle.value = 'darwin';
  else platformToggle.value = 'auto';
}

function getSelectedPlatform() {
  if (!platformToggle) return detectedPlatform;
  const val = platformToggle.value;
  if (val === 'auto') return detectedPlatform;
  return val;
}

// Update quality value display
qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = qualitySlider.value;
});
// Recursively collect image files from a directory
function collectImagesFromDir(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectImagesFromDir(fullPath));
    } else if (/\.(jpe?g|png|webp|bmp|tiff)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('dragover');
});
dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('dragover');
});
dropArea.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropArea.classList.remove('dragover');
  let files = [];
  // Try to use webkitGetAsEntry for folders (works in Electron)
  for (const item of e.dataTransfer.items) {
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
    if (entry && entry.isDirectory) {
      // Folder dropped
      const dirPath = item.getAsFile().path;
      files = files.concat(collectImagesFromDir(dirPath));
    } else {
      // File dropped
      const file = item.getAsFile();
      if (file && /\.(jpe?g|png|webp|bmp|tiff)$/i.test(file.name)) {
        files.push(file.path);
      }
    }
  }
  // Fallback for browsers that don't support webkitGetAsEntry
  if (!files.length) {
    files = Array.from(e.dataTransfer.files)
      .filter(f => /\.(jpe?g|png|webp|bmp|tiff)$/i.test(f.name))
      .map(f => f.path);
  }
  if (!files.length) {
    statusDiv.textContent = 'No valid images dropped.';
    return;
  }
  if (files.length > 50) {
    statusDiv.textContent = 'Please drop no more than 50 images at a time.';
    return;
  }
  // Portfolio/category should match manifest folder structure, e.g. Events/EventName, Concert/Band/Month Year, etc.
  const portfolio = portfolioInput.value.trim();
  if (!portfolio) {
    statusDiv.textContent = 'Please enter a portfolio/category name.';
    portfolioInput.focus();
    return;
  }
  const format = formatSelect.value;
  const quality = parseInt(qualitySlider.value, 10);
  // Gather nature/animal/landscape fields if present
  let categoryInfo = null;
  const detected = detectNatureCategory(portfolio);
  if (detected === 'animal') {
    categoryInfo = {
      category: 'Animal',
      animalType: animalTypeInput.value.trim(),
      animalName: animalNameInput.value.trim()
    };
  } else if (detected === 'landscape') {
    categoryInfo = {
      category: 'Landscape',
      location: landscapeLocationInput.value.trim(),
      placeName: landscapeNameInput.value.trim()
    };
  } else if (detected === 'prompt') {
    // Prompt user to select one
    if (animalTypeInput.value || animalNameInput.value) {
      categoryInfo = {
        category: 'Animal',
        animalType: animalTypeInput.value.trim(),
        animalName: animalNameInput.value.trim()
      };
    } else if (landscapeLocationInput.value || landscapeNameInput.value) {
      categoryInfo = {
        category: 'Landscape',
        location: landscapeLocationInput.value.trim(),
        placeName: landscapeNameInput.value.trim()
      };
    }
  }
  statusDiv.textContent = 'Compressing...';
  // Progress bar setup
  const progressBarContainer = document.getElementById('progress-bar-container');
  const progressBar = document.getElementById('progress-bar');
  if (progressBarContainer && progressBar) {
    progressBarContainer.style.display = 'block';
    progressBar.style.width = '0%';
  }
    // Call compress-images and show progress and handle summary
  const total = files.length;
  let completed = 0;
  let lastPercent = 0;
  // Wrap invoke in a Promise to allow per-image progress simulation
  const resultPromise = ipcRenderer.invoke('compress-images', {
    files,
    portfolio,
    format,
    quality,
    categoryInfo
  });
  // Simulate progress (since we can't get per-image progress from main.js directly)
  // We'll poll every 200ms and update the bar based on completed images in the output folder
  let progressInterval = setInterval(() => {
    // Try to estimate progress by counting files in the output folder (not perfect, but gives feedback)
    // For now, just increment progress smoothly
    if (completed < total) {
      completed++;
      let percent = Math.round((completed / total) * 100);
      if (percent > 100) percent = 100;
      if (progressBar) progressBar.style.width = percent + '%';
      lastPercent = percent;
    }
  }, Math.max(100, 2000 / total));
  const result = await resultPromise;
  clearInterval(progressInterval);
  if (progressBar) progressBar.style.width = '100%';
  setTimeout(() => { if (progressBarContainer) progressBarContainer.style.display = 'none'; }, 1200);
  if (result.error) {
    statusDiv.textContent = result.error;
    if (window.outputPathDiv) window.outputPathDiv.textContent = '';
  } else {
    statusDiv.textContent = 'Done! ' + result.results.length + ' images processed.';
    if (result.outputPath) {
      if (!window.outputPathDiv) {
        window.outputPathDiv = document.getElementById('output-path');
      }
      if (window.outputPathDiv) {
        window.outputPathDiv.innerHTML = 'Output folder: <span style="color:#6fcf97">' + result.outputPath + '</span>';
      }
    }
  }
  });

  // Show summary of errors/skips
  ipcRenderer.on('compression-complete', (event, { outputDir, outputNames, results, manifestError }) => {
    progressBar.value = 100;
    progressBar.classList.add('done');
    showOutputFolder(outputDir);
    let summary = '';
    if (manifestError) {
      summary += `<div class="error-summary"><b>Manifest Error:</b> ${manifestError}</div>`;
    }
    let errors = results.filter(r => r.status === 'error');
    let skipped = results.filter(r => r.status === 'skipped');
    if (errors.length > 0) {
      summary += `<div class="error-summary"><b>Errors:</b><ul>`;
      errors.forEach(e => summary += `<li>${e.file}: ${e.error}</li>`);
      summary += '</ul></div>';
      // Show modal for copy-paste
      showErrorModal(errors.map(e => `${e.file}: ${e.error}`).join('\n'));
    }
// Show a modal with selectable/copyable error text
function showErrorModal(errorText) {
  const modal = document.getElementById('error-modal');
  const textarea = document.getElementById('error-modal-text');
  const closeBtn = document.getElementById('error-modal-close');
  textarea.value = errorText;
  modal.style.display = 'flex';
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };
}
    if (skipped.length > 0) {
      summary += `<div class="skip-summary"><b>Skipped:</b><ul>`;
      skipped.forEach(s => summary += `<li>${s.file}: ${s.reason}</li>`);
      summary += '</ul></div>';
    }
    document.getElementById('summary-panel').innerHTML = summary;
    document.getElementById('summary-panel').style.display = summary ? 'block' : 'none';
  });

  // Input/file validation before sending to main process
  function validateFiles(files) {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    let valid = [], invalid = [];
    for (let f of files) {
      let ext = f.name ? f.name : f;
      ext = ext.toLowerCase();
      let dot = ext.lastIndexOf('.');
      if (dot === -1 || !allowed.includes(ext.slice(dot))) {
        invalid.push(f.name || f);
      } else {
        valid.push(f);
      }
    }
    return { valid, invalid };
  }

  // Example usage: when user selects files/folder
  // let { valid, invalid } = validateFiles(selectedFiles);
  // If invalid.length > 0, show error and do not proceed
