# Vision API Prototype

A simple, isolated prototype for integrating computer vision capabilities into the McCal Media portfolio site.

## Overview

This prototype provides a clean, non-disruptive way to test vision API integrations before incorporating them into the main portfolio system. It currently supports:

- **✅ Google Vision API**: Fully implemented with service account authentication
- **🔄 Mock API**: Demo mode with sample results
- **❌ Azure Computer Vision**: Placeholder for Microsoft Azure
- **❌ OpenAI Vision**: Placeholder for GPT-4 Vision

## Prerequisites

1. **Google Cloud Project**: Create a project at [Google Cloud Console](https://console.cloud.google.com/)
2. **Billing Enabled**: Enable billing on your project (required for Vision API)
3. **Vision API Enabled**: Enable the Google Cloud Vision API
4. **Service Account**: Create a service account with Vision API access
5. **Service Account Key**: Download the JSON key file

## Setup Instructions

1. **Enable Billing**: Visit https://console.developers.google.com/billing and enable billing for your project
2. **Enable Vision API**: Go to APIs & Services > Library, search for "Cloud Vision API", and enable it
3. **Create Service Account**: 
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Grant it the "Cloud Vision API User" role
4. **Download Key**: Create a JSON key for the service account and save it as `google-service-account.json` in this directory
5. **Start Proxy Server**: Run `npm start` in this directory
6. **Access Prototype**: Navigate to: `http://localhost:3002/src/site/prototypes/vision-api/index.html`

## Quick Start

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3002/src/site/prototypes/vision-api/index.html`
3. Choose between **Upload Image** or **Browse Portfolio** modes

## Two Analysis Modes

### Upload Mode
- Drag and drop or click to select image files from your computer
- Works with any image (JPG, PNG, WebP)
- Traditional file upload interface

### Browse Portfolio Mode
- Navigate through your existing portfolio structure
- Browse by category: Concert, Events, Journalism, Nature
- Drill down to specific artists/bands and date folders
- Select individual images or batch analyze entire folders
- Uses your existing manifest files for navigation

## Features

- **Single Image Analysis**: Analyze one image at a time
- **Batch Analysis**: Process multiple images from a folder (limited to 10 for demo)
- **File Browser**: Navigate your portfolio structure like a file explorer
- **Image Preview**: See selected images before analysis
- **Multiple APIs**: Framework ready for different vision services
- **Progress Tracking**: Visual feedback during analysis

## Integration Options

### For Google Vision API

1. Get your API key from Google Cloud Console
2. Enable the Vision API
3. Add your key to environment variables or config
4. Implement the `googleVisionAnalysis()` method

### For Azure Computer Vision

1. Create an Azure Computer Vision resource
2. Get your endpoint and API key
3. Add credentials to config
4. Implement the `azureVisionAnalysis()` method

### For OpenAI Vision

1. Get your OpenAI API key
2. Add it to config
3. Implement the `openAIVisionAnalysis()` method

## Architecture

- **Isolated**: Doesn't affect existing portfolio functionality
- **Modular**: Easy to extend with new vision APIs
- **Testable**: Start with mock data, then add real APIs
- **Integrable**: Can be easily moved to production widgets later

## Future Integration

Once tested and working, this can be integrated into:

- **Portfolio widgets**: Auto-tag images with detected content
- **Search functionality**: Find images by visual content
- **Accessibility**: Generate alt text automatically
- **SEO**: Enhanced image metadata

## File Structure

```
vision-api/
├── index.html          # Main interface with dual modes
├── vision-api.js       # Core functionality and API integration
├── INTEGRATION-GUIDE.md # Detailed setup instructions
└── README.md          # This documentation
```

## Development Notes

- Uses existing manifest.json files for portfolio navigation
- Images are loaded via HTTP requests from the dev server
- Batch analysis limited to 10 images for performance
- All vision API calls are async with proper error handling
- Interface is responsive and works on mobile devices