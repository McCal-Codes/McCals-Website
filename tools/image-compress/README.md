# McCals Importer

A robust drag-and-drop image/portfolio importer and compressor for McCal Media, with manifest output and widget-ready integration.

## Features
- Drag and drop images or folders (JPG, PNG, WebP, BMP, TIFF)
- Choose output folder (with _web subfolder and manifest.json output)
- Images are compressed and renamed for web, with manifest and changelog/versioning
- No internet required, runs fully offline

## Setup

1. Open a terminal in this folder:
   ```
   cd tools/image-compress
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the app:
   ```
   npm start
   ```

## Usage
- Drag images or folders into the window
- Select an output folder when prompted
- Compressed images and manifest.json will appear in the _web subfolder

## Notes
- You can adjust compression settings in `main.js` (see the `sharp` call)
- Cross-platform: works on Windows, Mac, and Linux

## Packaging as .exe or .dmg

You can build a standalone Windows (.exe) or Mac (.dmg) app using electron-builder:

1. Install dependencies (if not already):
    ```
    npm install
    ```
2. Build for your platform:
    - **Windows:**
       ```
       npm run dist:win
       ```
       Output: `dist/McCals Importer Setup.exe`
    - **Mac:**
       ```
       npm run dist:mac
       ```
       Output: `dist/McCals Importer.dmg`
    - **All platforms (auto-detect):**
       ```
       npm run dist
       ```

> Note: Building for Mac requires a Mac. Building for Windows .exe requires Windows.

You can customize the app icon by replacing `build/icon.png`.
