#!/usr/bin/env node

// Google Vision API Backend Proxy
// Handles service account authentication for secure API calls

const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Google Vision client with service account
let visionClient;
try {
    const keyFilename = path.join(__dirname, 'google-service-account.json');
    visionClient = new ImageAnnotatorClient({ keyFilename });
    console.log('✅ Google Vision client initialized');
} catch (error) {
    console.error('❌ Failed to initialize Google Vision client:', error.message);
    console.log('Make sure google-service-account.json exists and is valid');
    process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'google-vision-proxy' });
});

// Vision analysis endpoint
app.post('/analyze', async (req, res) => {
    try {
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'Missing imageData' });
        }

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(imageData, 'base64');

        // Perform analysis
        const [result] = await visionClient.annotateImage({
            image: { content: imageBuffer },
            features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                { type: 'TEXT_DETECTION' },
                { type: 'IMAGE_PROPERTIES' }
            ],
        });

        // Format response
        const response = {
            labels: result.labelAnnotations?.map(label => ({
                description: label.description,
                confidence: label.score
            })) || [],
            objects: result.localizedObjectAnnotations?.map(obj => ({
                name: obj.name,
                confidence: obj.score
            })) || [],
            text: result.textAnnotations?.[0]?.description || null,
            colors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
                color: rgbToColorName(color.color),
                percentage: Math.round(color.pixelFraction * 100)
            })) || []
        };

        res.json(response);

    } catch (error) {
        console.error('Vision API error:', error);
        res.status(500).json({
            error: 'Analysis failed',
            details: error.message
        });
    }
});

// Helper function to convert RGB to color name
function rgbToColorName(color) {
    const r = Math.round((color.red || 0) / 255 * 100);
    const g = Math.round((color.green || 0) / 255 * 100);
    const b = Math.round((color.blue || 0) / 255 * 100);

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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Google Vision API Proxy running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Analysis endpoint: POST http://localhost:${PORT}/analyze`);
});

module.exports = app;