/**
 * Universal Caption System for McCal Media Portfolio Widgets
 * Author: Caleb McCartney / McCal-Codes
 * Version: 1.0
 * 
 * Provides consistent caption handling across all portfolio types:
 * - EXIF/IPTC metadata extraction (journalism standard)
 * - manifest.json support for custom captions
 * - Smart fallback system
 * - Performance optimized with caching
 */

window.UniversalCaptionSystem = (function() {
  'use strict';

  // Cache system for performance
  const cache = new Map();
  
  // Cache with TTL
  function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) { 
      cache.delete(key); 
      return null; 
    }
    return entry.data;
  }

  function setCache(key, data, ttl = 10 * 60 * 1000) {
    cache.set(key, { data, expires: Date.now() + ttl });
  }

  /**
   * Enhanced EXIF/IPTC parser for professional photography metadata
   */
  async function extractImageMetadata(imageUrl) {
    const cacheKey = `metadata:${imageUrl}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(imageUrl, {
        headers: { 'Range': 'bytes=0-65535' },
        mode: 'cors'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const buffer = await response.arrayBuffer();
      const metadata = parseImageMetadata(buffer);
      
      setCache(cacheKey, metadata, 60 * 60 * 1000); // 1 hour cache
      return metadata;
    } catch (error) {
      console.warn(`Metadata extraction failed for ${imageUrl}:`, error);
      return { date: null, caption: null, description: null, keywords: [], location: null };
    }
  }

  function parseImageMetadata(buffer) {
    const view = new DataView(buffer);
    let result = { date: null, caption: null, description: null, keywords: [], location: null };

    // Check if it's a JPEG
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xFFD8) {
      return result;
    }
    
    let offset = 2;
    
    while (offset < view.byteLength - 1) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (offset >= view.byteLength - 1) break;
      
      const size = view.getUint16(offset, false);
      offset += 2;
      
      // EXIF data (APP1 segment)
      if (marker === 0xFFE1) {
        const start = offset;
        if (getString(view, start, 4) === 'Exif') {
          const tiff = start + 6;
          const little = getString(view, tiff, 2) === 'II';
          const ifd0 = tiff + view.getUint32(tiff + 4, little);
          const tags0 = readIFD(view, ifd0, little, tiff);
          const exifOffset = tags0[0x8769];
          
          // Extract date (priority: DateTimeOriginal > DateTimeDigitized > DateTime)
          let dateStr = tags0[0x0132]; // DateTime
          if (exifOffset) {
            const exifTags = readIFD(view, tiff + exifOffset, little, tiff);
            dateStr = exifTags[0x9003] || exifTags[0x9004] || dateStr;
          }
          
          if (dateStr && /\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/.test(dateStr)) {
            result.date = dateStr.replace(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2}).*/, '$1-$2-$3T$4:$5:$6Z');
          }
          
          // Extract caption/description fields
          result.caption = tags0[0x010E] || tags0[0x9C9C] || null; // ImageDescription or XPTitle
          result.description = tags0[0x010F] || tags0[0x9C9D] || null; // Make or XPComment
          
          // Extract GPS location if available
          const gpsOffset = tags0[0x8825];
          if (gpsOffset) {
            const gpsTags = readIFD(view, tiff + gpsOffset, little, tiff);
            const lat = parseGPSCoordinate(gpsTags[0x0002], gpsTags[0x0001]);
            const lon = parseGPSCoordinate(gpsTags[0x0004], gpsTags[0x0003]);
            if (lat && lon) {
              result.location = { latitude: lat, longitude: lon };
            }
          }
        }
      }
      
      // IPTC data (APP13 segment) - Common in journalism
      if (marker === 0xFFED) {
        const iptcData = parseIPTCData(view, offset, size - 2);
        if (iptcData.caption) result.caption = result.caption || iptcData.caption;
        if (iptcData.keywords) result.keywords = iptcData.keywords;
        if (iptcData.location) result.location = result.location || iptcData.location;
      }
      
      offset += (size - 2);
    }
    
    return result;
  }

  // Parse IPTC metadata (journalism standard)
  function parseIPTCData(view, offset, length) {
    const result = { caption: null, keywords: [], location: null };
    
    try {
      for (let i = 0; i < length - 5; i++) {
        if (view.getUint8(offset + i) === 0x1C && // IPTC marker
            view.getUint8(offset + i + 1) === 0x02) { // Record 2
          
          const dataset = view.getUint8(offset + i + 2);
          const dataLength = view.getUint16(offset + i + 3, false);
          
          if (dataLength > 0 && dataLength < 2000 && offset + i + 5 + dataLength <= view.byteLength) {
            const data = getString(view, offset + i + 5, dataLength);
            
            switch (dataset) {
              case 0x78: // Caption (dataset 120)
                result.caption = data;
                break;
              case 0x19: // Keywords (dataset 25)
                result.keywords.push(data);
                break;
              case 0x5A: // City (dataset 90)
                result.location = result.location || {};
                result.location.city = data;
                break;
              case 0x5F: // State (dataset 95)
                result.location = result.location || {};
                result.location.state = data;
                break;
              case 0x65: // Country (dataset 101)
                result.location = result.location || {};
                result.location.country = data;
                break;
            }
          }
        }
      }
    } catch (error) {
      console.warn('IPTC parsing error:', error);
    }
    
    return result;
  }

  // Helper functions
  function getString(view, offset, length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      if (offset + i >= view.byteLength) break;
      const code = view.getUint8(offset + i);
      if (code === 0) break; // Null terminator
      result += String.fromCharCode(code);
    }
    return result;
  }

  function readIFD(view, offset, little, tiffStart) {
    if (offset + 2 > view.byteLength) return {};
    const entries = view.getUint16(offset, little);
    const tags = {};
    
    for (let i = 0; i < entries && offset + 2 + (i + 1) * 12 <= view.byteLength; i++) {
      const entry = offset + 2 + i * 12;
      const tag = view.getUint16(entry, little);
      const type = view.getUint16(entry + 2, little);
      const count = view.getUint32(entry + 4, little);
      
      if (type === 2 && count < 500) { // ASCII strings
        const valueOffset = count <= 4 ? entry + 8 : (tiffStart + view.getUint32(entry + 8, little));
        if (valueOffset + count <= view.byteLength) {
          tags[tag] = getString(view, valueOffset, count - 1);
        }
      } else if (type === 4 && count === 1) { // LONG
        tags[tag] = view.getUint32(entry + 8, little);
      } else if (type === 5 && count <= 10) { // RATIONAL
        const valueOffset = tiffStart + view.getUint32(entry + 8, little);
        if (valueOffset + count * 8 <= view.byteLength) {
          const rationals = [];
          for (let j = 0; j < count; j++) {
            const num = view.getUint32(valueOffset + j * 8, little);
            const den = view.getUint32(valueOffset + j * 8 + 4, little);
            rationals.push(den !== 0 ? num / den : 0);
          }
          tags[tag] = rationals;
        }
      }
    }
    return tags;
  }

  function parseGPSCoordinate(coordArray, ref) {
    if (!coordArray || coordArray.length < 3) return null;
    const degrees = coordArray[0] + coordArray[1] / 60 + coordArray[2] / 3600;
    return (ref === 'S' || ref === 'W') ? -degrees : degrees;
  }

  /**
   * Load manifest file for custom metadata
   */
  async function loadManifest(manifestUrl) {
    const cacheKey = `manifest:${manifestUrl}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(manifestUrl, { mode: 'cors' });
      if (!response.ok) return null;
      
      const manifest = await response.json();
      setCache(cacheKey, manifest, 5 * 60 * 1000); // 5 min cache
      return manifest;
    } catch (error) {
      console.warn(`Manifest loading failed for ${manifestUrl}:`, error);
      return null;
    }
  }

  /**
   * Get comprehensive image metadata with priority system
   */
  async function getImageCaption(imageUrl, filename, manifestData = null) {
    let result = {
      title: generateTitleFromFilename(filename),
      caption: null,
      description: null,
      date: null,
      location: null,
      keywords: [],
      source: 'generated' // 'manifest', 'exif', 'iptc', or 'generated'
    };

    // Priority 1: Check manifest data
    if (manifestData && manifestData[filename]) {
      const fileData = manifestData[filename];
      result.caption = fileData.caption || result.caption;
      result.description = fileData.description || result.description;
      result.date = fileData.date || result.date;
      result.location = fileData.location || result.location;
      result.title = fileData.title || result.title;
      if (result.caption) result.source = 'manifest';
    }

    // Priority 2: Extract from image metadata (EXIF/IPTC)
    if (!result.caption) {
      try {
        const metadata = await extractImageMetadata(imageUrl);
        result.date = result.date || metadata.date;
        result.location = result.location || metadata.location;
        result.keywords = metadata.keywords || [];
        
        if (metadata.caption) {
          result.caption = metadata.caption;
          result.source = 'iptc';
        } else if (metadata.description) {
          result.caption = metadata.description;
          result.source = 'exif';
        }
      } catch (error) {
        console.warn('Metadata extraction failed:', error);
      }
    }

    // Priority 3: Generate fallback caption
    if (!result.caption) {
      result.caption = `${result.title} - Professional photography`;
      result.source = 'generated';
    }

    return result;
  }

  /**
   * Generate clean title from filename
   */
  function generateTitleFromFilename(filename) {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/^\d+[-_]/, '') // Remove date prefix
      .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Format date for display
   */
  function formatDate(isoDate, format = 'shortMonthYear') {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    
    switch (format) {
      case 'shortMonthYear':
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
      case 'fullDate':
        return date.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'year':
        return String(date.getFullYear());
      default:
        return date.toLocaleDateString();
    }
  }

  /**
   * Public API
   */
  return {
    // Main functions
    getImageCaption,
    loadManifest,
    extractImageMetadata,
    
    // Utility functions
    generateTitleFromFilename,
    formatDate,
    
    // Cache management
    clearCache: () => cache.clear(),
    getCacheSize: () => cache.size,
    
    // Version info
    version: '1.0',
    name: 'Universal Caption System'
  };

})();