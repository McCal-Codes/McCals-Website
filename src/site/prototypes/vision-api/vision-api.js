/* eslint-env browser */
// Vision API Prototype - McCal Media
// Simple, isolated integration for testing computer vision capabilities

class VisionAPIPrototype {
    constructor() {
        this.selectedFile = null;
        this.selectedImagePath = null;
        this.currentAPI = 'mock';
        this.currentMode = 'upload';
        this.currentPath = ['Portfolios'];
        this.isAnalyzing = false;
        this.batchMode = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAPIConfig();
        this.loadDirectoryContents();
    }

    setupEventListeners() {
        // Mode switching
        const modeRadios = document.querySelectorAll('input[name="input-mode"]');
        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentMode = e.target.value;
                this.switchMode();
            });
        });

        // Upload mode events
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        const analyzeBtn = document.getElementById('analyze-btn');
        const batchAnalyzeBtn = document.getElementById('batch-analyze-btn');

        // File selection
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // API selection
        const apiSelect = document.getElementById('api-select');
        apiSelect.addEventListener('change', (e) => {
            this.currentAPI = e.target.value;
            this.updateAPIConfig();
        });

        // Analyze buttons
        analyzeBtn.addEventListener('click', () => this.analyzeImage());
        batchAnalyzeBtn.addEventListener('click', () => this.batchAnalyzeFolder());

        // File browser events
        const backBtn = document.getElementById('back-btn');
        backBtn.addEventListener('click', () => this.navigateBack());
    }

    switchMode() {
        const uploadMode = document.getElementById('upload-mode');
        const browseMode = document.getElementById('browse-mode');
        const analyzeBtn = document.getElementById('analyze-btn');
        const batchAnalyzeBtn = document.getElementById('batch-analyze-btn');

        if (this.currentMode === 'upload') {
            uploadMode.style.display = 'block';
            browseMode.style.display = 'none';
            analyzeBtn.style.display = 'inline-block';
            batchAnalyzeBtn.style.display = 'none';
            this.selectedImagePath = null;
            this.batchMode = false;
        } else {
            uploadMode.style.display = 'none';
            browseMode.style.display = 'block';
            analyzeBtn.style.display = 'inline-block';
            batchAnalyzeBtn.style.display = 'inline-block';
            this.selectedFile = null;
            this.batchMode = false;
        }

        this.updateAnalyzeButton();
        this.updateBatchButton();
    }

    async loadDirectoryContents() {
        if (this.currentMode !== 'browse') return;

        const path = this.currentPath.join('/');
        const fileList = document.getElementById('file-list');
        const currentPathDisplay = document.getElementById('current-path');

        currentPathDisplay.textContent = path + '/';
        fileList.innerHTML = '<div style="text-align: center; padding: 20px;">Loading...</div>';

        try {
            let items = [];

            if (this.currentPath.length === 1) {
                // Root level - show main portfolio categories
                items = [
                    { name: 'Concert', type: 'folder', path: 'Portfolios/Concert' },
                    { name: 'Events', type: 'folder', path: 'Portfolios/Events' },
                    { name: 'Journalism', type: 'folder', path: 'Portfolios/Journalism' },
                    { name: 'Nature', type: 'folder', path: 'Portfolios/Nature' }
                ];
            } else if (this.currentPath.length === 2) {
                // Portfolio type level - load from manifest
                const portfolioType = this.currentPath[1];
                const manifestPath = `../../../images/Portfolios/${portfolioType === 'Concert' ? 'concert' : portfolioType.toLowerCase()}-manifest.json`;

                try {
                    const response = await fetch(manifestPath);
                    if (response.ok) {
                        const manifest = await response.json();
                        if (portfolioType === 'Concert' && manifest.bands) {
                            items = manifest.bands.map(band => ({
                                name: band.name,
                                type: 'folder',
                                path: `Portfolios/${portfolioType}/${band.name}`,
                                imageCount: band.totalImages
                            }));
                        } else if (manifest[portfolioType.toLowerCase()]) {
                            // Handle other portfolio types
                            const entries = manifest[portfolioType.toLowerCase()];
                            items = entries.map(entry => ({
                                name: entry.title || entry.name,
                                type: 'folder',
                                path: `Portfolios/${portfolioType}/${entry.title || entry.name}`,
                                imageCount: entry.imageCount || entry.totalImages
                            }));
                        }
                    }
                } catch (error) {
                    console.log('Manifest not found, trying direct folder listing - vision-api.js:153');
                }
            } else if (this.currentPath.length === 3) {
                // Artist/Band level - show date folders
                const portfolioType = this.currentPath[1];
                const artistName = this.currentPath[2];
                const manifestPath = `../../../images/Portfolios/${portfolioType}/${artistName}/manifest.json`;

                try {
                    const response = await fetch(manifestPath);
                    if (response.ok) {
                        const manifest = await response.json();
                        if (manifest.folders) {
                            items = manifest.folders.map(folder => ({
                                name: folder.name,
                                type: 'folder',
                                path: `Portfolios/${portfolioType}/${artistName}/${folder.name}`,
                                imageCount: folder.imageCount
                            }));
                        }
                    }
                } catch (error) {
                    console.log('Artist manifest not found - vision-api.js:175');
                }
            } else if (this.currentPath.length === 4) {
                // Date folder level - show individual images
                const portfolioType = this.currentPath[1];
                const artistName = this.currentPath[2];
                const dateFolder = this.currentPath[3];
                const manifestPath = `../../../images/Portfolios/${portfolioType}/${artistName}/${dateFolder}/manifest.json`;

                try {
                    const response = await fetch(manifestPath);
                    if (response.ok) {
                        const manifest = await response.json();
                        items = manifest.images.map(image => ({
                            name: image,
                            type: 'file',
                            path: `Portfolios/${portfolioType}/${artistName}/${dateFolder}/${image}`,
                            fullPath: `../../../images/Portfolios/${portfolioType}/${artistName}/${dateFolder}/${image}`
                        }));
                    }
                } catch (error) {
                    console.log('Date folder manifest not found - vision-api.js:196');
                }
            }

            this.renderFileList(items);
        } catch (error) {
            console.error('Error loading directory: - vision-api.js:202', error);
            fileList.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">Error loading directory contents</div>';
        }
    }

    renderFileList(items) {
        const fileList = document.getElementById('file-list');
        const backBtn = document.getElementById('back-btn');

        backBtn.style.display = this.currentPath.length > 1 ? 'inline-block' : 'none';

        if (!items || items.length === 0) {
            fileList.innerHTML = '<div style="text-align: center; padding: 20px;">No items found</div>';
            return;
        }

        fileList.innerHTML = items.map(item => `
            <div class="file-item ${item.type} ${this.selectedImagePath === item.path ? 'selected' : ''}"
                 data-path="${item.path}"
                 data-type="${item.type}"
                 data-full-path="${item.fullPath || ''}">
                <div class="file-name">${item.name}</div>
                <div class="file-info">${item.imageCount ? `${item.imageCount} images` : ''}</div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const path = e.currentTarget.dataset.path;
                const type = e.currentTarget.dataset.type;
                const fullPath = e.currentTarget.dataset.fullPath;

                if (type === 'folder') {
                    this.navigateToFolder(path);
                } else {
                    this.selectImage(path, fullPath);
                }
            });
        });
    }

    navigateToFolder(path) {
        this.currentPath = path.split('/');
        this.selectedImagePath = null;
        this.batchMode = false;
        this.loadDirectoryContents();
        this.updateAnalyzeButton();
        this.updateBatchButton();
    }

    navigateBack() {
        if (this.currentPath.length > 1) {
            this.currentPath.pop();
            this.selectedImagePath = null;
            this.batchMode = false;
            this.loadDirectoryContents();
            this.updateAnalyzeButton();
            this.updateBatchButton();
        }
    }

    selectImage(path, fullPath) {
        this.selectedImagePath = path;
        this.selectedFile = null; // Clear uploaded file

        // Update selection UI
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-path="${path}"]`).classList.add('selected');

        // Load image preview
        this.loadImagePreview(fullPath);
        this.updateAnalyzeButton();
        this.updateBatchButton();
    }

    async loadImagePreview(imagePath) {
        const preview = document.getElementById('image-preview');
        try {
            preview.src = imagePath;
            preview.style.display = 'block';
        } catch (error) {
            console.error('Error loading image preview: - vision-api.js:286', error);
            preview.style.display = 'none';
        }
    }

    handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        this.selectedFile = file;
        this.selectedImagePath = null; // Clear selected filesystem image
        this.displayImagePreview(file);
        this.updateAnalyzeButton();
        this.updateBatchButton();
    }

    displayImagePreview(file) {
        const reader = new FileReader();
        const preview = document.getElementById('image-preview');

        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };

        reader.readAsDataURL(file);
    }

    updateAnalyzeButton() {
        const analyzeBtn = document.getElementById('analyze-btn');
        const hasSelection = (this.currentMode === 'upload' && this.selectedFile) ||
                           (this.currentMode === 'browse' && this.selectedImagePath);
        analyzeBtn.disabled = !hasSelection || this.isAnalyzing;
    }

    updateBatchButton() {
        const batchBtn = document.getElementById('batch-analyze-btn');
        // Show batch button only when browsing folders with images
        const canBatch = this.currentMode === 'browse' &&
                        this.currentPath.length >= 4 && // In a date folder with images
                        !this.selectedImagePath; // No single image selected
        batchBtn.style.display = canBatch ? 'inline-block' : 'none';
        batchBtn.disabled = this.isAnalyzing;
    }

    updateAPIConfig() {
        // Update UI based on selected API
        const apiNotes = {
            mock: 'Demo mode - shows sample results',
            google: 'Requires Google Vision API key',
            azure: 'Requires Azure Computer Vision key',
            openai: 'Requires OpenAI API key'
        };

        // You can add API-specific configuration here
        console.log(`Switched to ${this.currentAPI} API: ${apiNotes[this.currentAPI]} - vision-api.js:343`);
    }

    async analyzeImage() {
        if (this.isAnalyzing) return;

        this.isAnalyzing = true;
        this.showLoading();

        try {
            let imageData;
            let results;

            if (this.currentMode === 'upload' && this.selectedFile) {
                // Handle uploaded file
                imageData = await this.fileToBase64(this.selectedFile);
            } else if (this.currentMode === 'browse' && this.selectedImagePath) {
                // Handle filesystem image
                const imagePath = `../../../images/${this.selectedImagePath}`;
                imageData = await this.imagePathToBase64(imagePath);
            } else {
                throw new Error('No image selected');
            }

            // Analyze with selected API
            switch (this.currentAPI) {
                case 'mock':
                    results = await this.mockAnalysis();
                    break;
                case 'google':
                    results = await this.googleVisionAnalysis(imageData);
                    break;
                case 'azure':
                    results = await this.azureVisionAnalysis(imageData);
                    break;
                case 'openai':
                    results = await this.openAIVisionAnalysis(imageData);
                    break;
                default:
                    throw new Error('Unknown API selected');
            }

            this.displayResults(results);
        } catch (error) {
            this.showError(`Analysis failed: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
            this.updateAnalyzeButton();
            this.updateBatchButton();
        }
    }

    async batchAnalyzeFolder() {
        if (this.isAnalyzing || this.currentPath.length < 4) return;

        this.isAnalyzing = true;
        this.batchMode = true;

        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Batch analyzing images...</p></div>';

        try {
            const portfolioType = this.currentPath[1];
            const artistName = this.currentPath[2];
            const dateFolder = this.currentPath[3];
            const manifestPath = `../../../images/Portfolios/${portfolioType}/${artistName}/${dateFolder}/manifest.json`;

            const response = await fetch(manifestPath);
            if (!response.ok) throw new Error('Could not load image manifest');

            const manifest = await response.json();
            const images = manifest.images || [];

            if (images.length === 0) {
                throw new Error('No images found in this folder');
            }

            const batchResults = [];
            let processed = 0;

            for (const imageName of images.slice(0, 10)) { // Limit to first 10 for demo
                try {
                    const imagePath = `../../../images/Portfolios/${portfolioType}/${artistName}/${dateFolder}/${imageName}`;
                    const imageData = await this.imagePathToBase64(imagePath);

                    let result;
                    switch (this.currentAPI) {
                        case 'mock':
                            result = await this.mockAnalysis();
                            break;
                        case 'google':
                            result = await this.googleVisionAnalysis(imageData);
                            break;
                        case 'azure':
                            result = await this.azureVisionAnalysis(imageData);
                            break;
                        case 'openai':
                            result = await this.openAIVisionAnalysis(imageData);
                            break;
                        default:
                            result = { error: 'Unknown API' };
                    }

                    batchResults.push({
                        imageName,
                        result,
                        success: !result.error
                    });

                    processed++;
                    resultsDiv.innerHTML = `<div class="loading"><div class="spinner"></div><p>Analyzed ${processed}/${Math.min(images.length, 10)} images...</p></div>`;

                } catch (error) {
                    batchResults.push({
                        imageName,
                        result: { error: error.message },
                        success: false
                    });
                }
            }

            this.displayBatchResults(batchResults);

        } catch (error) {
            this.showError(`Batch analysis failed: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
            this.batchMode = false;
            this.updateAnalyzeButton();
            this.updateBatchButton();
        }
    }

    displayBatchResults(batchResults) {
        const resultsDiv = document.getElementById('results');
        let html = `<h3>Batch Analysis Complete</h3>`;
        html += `<p>Processed ${batchResults.length} images</p>`;

        const successful = batchResults.filter(r => r.success).length;
        const failed = batchResults.filter(r => !r.success).length;

        html += `<p style="margin-bottom: 20px;"><strong>${successful} successful</strong>, <strong style="color: red;">${failed} failed</strong></p>`;

        batchResults.forEach(item => {
            html += `
                <div class="result-item" style="margin-bottom: 15px; border: 1px solid #ddd; padding: 10px;">
                    <h4 style="margin: 0 0 10px 0; color: ${item.success ? '#007acc' : '#d32f2f'};">${item.imageName}</h4>
            `;

            if (item.success) {
                const result = item.result;
                if (result.labels && result.labels.length > 0) {
                    html += '<div><strong>Labels:</strong> ' + result.labels.slice(0, 3).map(l => l.description).join(', ') + '</div>';
                }
                if (result.objects && result.objects.length > 0) {
                    html += '<div><strong>Objects:</strong> ' + result.objects.slice(0, 3).map(o => o.name).join(', ') + '</div>';
                }
            } else {
                html += `<div style="color: red;"><strong>Error:</strong> ${item.result.error}</div>`;
            }

            html += '</div>';
        });

        resultsDiv.innerHTML = html;
    }

    // Convert file to base64
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Convert image path to base64
    async imagePathToBase64(imagePath) {
        try {
            const response = await fetch(imagePath);
            if (!response.ok) throw new Error('Failed to load image');

            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            throw new Error(`Could not load image: ${error.message}`);
        }
    }

    // Mock analysis for demonstration
    async mockAnalysis() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            labels: [
                { description: 'Photography', confidence: 0.95 },
                { description: 'Concert', confidence: 0.87 },
                { description: 'Music', confidence: 0.82 },
                { description: 'Performance', confidence: 0.76 },
                { description: 'Stage', confidence: 0.71 }
            ],
            objects: [
                { name: 'Person', confidence: 0.89 },
                { name: 'Musical instrument', confidence: 0.78 },
                { name: 'Microphone', confidence: 0.65 }
            ],
            text: 'Sample detected text from image analysis',
            colors: [
                { color: 'Black', percentage: 45 },
                { color: 'White', percentage: 30 },
                { color: 'Red', percentage: 15 },
                { color: 'Blue', percentage: 10 }
            ]
        };
    }

    // Google Vision API implementation using backend proxy
    async googleVisionAnalysis(imageData) {
        const PROXY_URL = 'http://localhost:3003/analyze';

        try {
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: imageData
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Proxy error: ${error.error || response.statusText}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error('Cannot connect to vision API proxy. Make sure the proxy server is running: node vision-api-proxy.js');
            }
            throw error;
        }
    }

    // Parse Google Vision API response
    parseGoogleVisionResponse(data) {
        const response = data.responses[0];

        if (response.error) {
            throw new Error(`Google Vision API error: ${response.error.message}`);
        }

        return {
            labels: response.labelAnnotations?.map(label => ({
                description: label.description,
                confidence: label.score
            })) || [],
            objects: response.localizedObjectAnnotations?.map(obj => ({
                name: obj.name,
                confidence: obj.score
            })) || [],
            text: response.textAnnotations?.[0]?.description || null,
            colors: response.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
                color: this.rgbToColorName(color.color),
                percentage: Math.round(color.pixelFraction * 100)
            })) || []
        };
    }

    // Convert RGB to color name
    rgbToColorName(color) {
        const r = Math.round((color.red || 0) / 255 * 100);
        const g = Math.round((color.green || 0) / 255 * 100);
        const b = Math.round((color.blue || 0) / 255 * 100);

        // Simple color detection based on RGB values
        if (r > 70 && g < 30 && b < 30) return 'Red';
        if (r < 30 && g > 70 && b < 30) return 'Green';
        if (r < 30 && g < 30 && b > 70) return 'Blue';
        if (r > 70 && g > 70 && b < 30) return 'Yellow';
        if (r > 70 && g < 30 && b > 70) return 'Magenta';
        if (r < 30 && g > 70 && b > 70) return 'Cyan';
        if (r > 80 && g > 80 && b > 80) return 'White';
        if (r < 20 && g < 20 && b < 20) return 'Black';
        if (r > 40 && g > 40 && b > 40 && r < 60 && g < 60 && b < 60) return 'Gray';
        return 'Unknown';
    }

    // Placeholder for Azure Computer Vision
    // eslint-disable-next-line no-unused-vars
    async azureVisionAnalysis(imageData) {
        throw new Error('Azure Computer Vision API integration not yet implemented. Add your API key and implementation here.');
    }

    // Placeholder for OpenAI Vision
    // eslint-disable-next-line no-unused-vars
    async openAIVisionAnalysis(imageData) {
        throw new Error('OpenAI Vision API integration not yet implemented. Add your API key and implementation here.');
    }

    showLoading() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Analyzing image...</p>
            </div>
        `;
    }

    displayResults(results) {
        const resultsDiv = document.getElementById('results');
        let html = '<h3>Analysis Complete</h3>';

        if (results.labels && results.labels.length > 0) {
            html += '<h4>Labels</h4>';
            results.labels.forEach(label => {
                html += `
                    <div class="result-item">
                        <span class="result-label">${label.description}</span>
                        <span class="confidence">${Math.round(label.confidence * 100)}% confidence</span>
                    </div>
                `;
            });
        }

        if (results.objects && results.objects.length > 0) {
            html += '<h4>Objects Detected</h4>';
            results.objects.forEach(obj => {
                html += `
                    <div class="result-item">
                        <span class="result-label">${obj.name}</span>
                        <span class="confidence">${Math.round(obj.confidence * 100)}% confidence</span>
                    </div>
                `;
            });
        }

        if (results.text) {
            html += '<h4>Text Detected</h4>';
            html += `<div class="result-item">${results.text}</div>`;
        }

        if (results.colors && results.colors.length > 0) {
            html += '<h4>Color Analysis</h4>';
            results.colors.forEach(color => {
                html += `
                    <div class="result-item">
                        <span class="result-label">${color.color}</span>
                        <span class="confidence">${color.percentage}% of image</span>
                    </div>
                `;
            });
        }

        resultsDiv.innerHTML = html;
    }

    showError(message) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VisionAPIPrototype();
});
