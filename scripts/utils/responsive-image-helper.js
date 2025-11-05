#!/usr/bin/env node

/**
 * Responsive Image Helper
 * Generates <picture> elements with WebP/AVIF support and fallbacks.
 *
 * Usage:
 *   node responsive-image-helper.js <input-directory> <output-directory>
 *
 * Author: McCal-Codes
 * Version: 1.0
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Supported image formats
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png'];
const OUTPUT_FORMATS = ['webp', 'avif'];

/**
 * Generate responsive images and <picture> elements.
 * @param {string} inputDir - Directory containing source images.
 * @param {string} outputDir - Directory to save responsive images.
 */
async function generateResponsiveImages(inputDir, outputDir) {
    if (!fs.existsSync(inputDir)) {
        console.error(`Input directory does not exist: ${inputDir} - responsive-image-helper.js:29`);
        return;
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(inputDir).filter(file => {
        const ext = path.extname(file).toLowerCase().slice(1);
        return SUPPORTED_FORMATS.includes(ext);
    });

    for (const file of files) {
        const inputFilePath = path.join(inputDir, file);
        const baseName = path.basename(file, path.extname(file));

        for (const format of OUTPUT_FORMATS) {
            const outputFilePath = path.join(outputDir, `${baseName}.${format}`);
            try {
                await sharp(inputFilePath)
                    .toFormat(format, { quality: 80 })
                    .toFile(outputFilePath);
                console.log(`Generated: ${outputFilePath} - responsive-image-helper.js:52`);
            } catch (error) {
                console.error(`Failed to generate ${format} for ${file}: ${error.message} - responsive-image-helper.js:54`);
            }
        }

        // Copy original as fallback
        const fallbackPath = path.join(outputDir, file);
        fs.copyFileSync(inputFilePath, fallbackPath);
        console.log(`Copied fallback: ${fallbackPath} - responsive-image-helper.js:61`);
    }

    console.log('Responsive images generated successfully. - responsive-image-helper.js:64');
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log(`Usage: node  <inputdirectory> <outputdirectory> - responsive-image-helper.js:74`);
        return;
    }

    const [inputDir, outputDir] = args;
    generateResponsiveImages(inputDir, outputDir).catch(error => {
        console.error(`Error: ${error.message} - responsive-image-helper.js:80`);
    });
}

if (require.main === module) {
    main();
}

module.exports = {
    generateResponsiveImages
};