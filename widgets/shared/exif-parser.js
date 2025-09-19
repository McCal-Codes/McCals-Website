/**
 * EXIF Parser for McCal Media Portfolio System
 * 
 * High-performance EXIF date extraction from JPEG, TIFF, and WebP images.
 * Optimized for partial file reads to minimize bandwidth usage.
 * 
 * @version 1.0.0
 * @author Caleb McCartney / McCal-Codes
 */

class EXIFParser {
  constructor() {
    // EXIF tag constants
    this.TAGS = {
      DateTime: 0x0132,
      DateTimeOriginal: 0x9003,
      DateTimeDigitized: 0x9004,
      ExifIFDPointer: 0x8769,
      GPSIFDPointer: 0x8825
    };

    // Data type sizes
    this.TYPE_SIZES = {
      1: 1, // BYTE
      2: 1, // ASCII  
      3: 2, // SHORT
      4: 4, // LONG
      5: 8, // RATIONAL
      7: 1, // UNDEFINED
      9: 4, // SLONG
      10: 8 // SRATIONAL
    };
  }

  /**
   * Extract date from image buffer (JPEG, TIFF, WebP)
   */
  extractDate(buffer, filename = '') {
    try {
      const view = new DataView(buffer);
      const ext = filename.split('.').pop()?.toLowerCase();
      
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          return this._parseJPEGDate(view);
        case 'tiff':
        case 'tif':
          return this._parseTIFFDate(view);
        case 'webp':
          return this._parseWebPDate(view);
        default:
          // Try JPEG format as fallback
          return this._parseJPEGDate(view);
      }
    } catch (error) {
      console.warn(`EXIF parsing failed for ${filename}:`, error);
      return null;
    }
  }

  /**
   * Parse JPEG EXIF data
   */
  _parseJPEGDate(view) {
    if (view.byteLength < 4) return null;
    
    // Check JPEG signature
    if (view.getUint16(0, false) !== 0xFFD8) return null;
    
    let offset = 2;
    
    // Scan for APP1 segment (EXIF data)
    while (offset < view.byteLength - 1) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      
      if (offset >= view.byteLength - 1) break;
      
      const segmentLength = view.getUint16(offset, false);
      offset += 2;
      
      // APP1 segment contains EXIF data
      if (marker === 0xFFE1) {
        const segmentEnd = offset + segmentLength - 2;
        
        // Check for EXIF identifier
        if (this._getString(view, offset, 4) === 'Exif' && 
            view.getUint16(offset + 4, false) === 0x0000) {
          
          const tiffOffset = offset + 6;
          return this._parseTIFFHeader(view, tiffOffset, segmentEnd);
        }
      }
      
      // Skip to next segment
      offset += segmentLength - 2;
      
      // Stop at image data
      if (marker === 0xFFDA) break;
    }
    
    return null;
  }

  /**
   * Parse TIFF EXIF data
   */
  _parseTIFFDate(view) {
    return this._parseTIFFHeader(view, 0, view.byteLength);
  }

  /**
   * Parse WebP EXIF data
   */
  _parseWebPDate(view) {
    if (view.byteLength < 12) return null;
    
    // Check WebP signature
    if (this._getString(view, 0, 4) !== 'RIFF' || 
        this._getString(view, 8, 4) !== 'WEBP') {
      return null;
    }
    
    let offset = 12;
    
    // Scan WebP chunks
    while (offset + 8 <= view.byteLength) {
      const fourCC = this._getString(view, offset, 4);
      offset += 4;
      
      const chunkSize = view.getUint32(offset, true); // WebP uses little-endian
      offset += 4;
      
      if (fourCC === 'EXIF') {
        const exifEnd = Math.min(offset + chunkSize, view.byteLength);
        return this._parseTIFFHeader(view, offset, exifEnd);
      }
      
      // Move to next chunk (aligned to 2 bytes)
      offset += (chunkSize + 1) & ~1;
    }
    
    return null;
  }

  /**
   * Parse TIFF header and IFD structure
   */
  _parseTIFFHeader(view, startOffset, endOffset) {
    if (startOffset + 8 > endOffset) return null;
    
    // Read byte order
    const byteOrder = this._getString(view, startOffset, 2);
    const littleEndian = byteOrder === 'II';
    
    if (byteOrder !== 'II' && byteOrder !== 'MM') return null;
    
    // Verify TIFF magic number
    const magic = view.getUint16(startOffset + 2, littleEndian);
    if (magic !== 42) return null;
    
    // Get first IFD offset
    const firstIFDOffset = view.getUint32(startOffset + 4, littleEndian);
    
    if (startOffset + firstIFDOffset >= endOffset) return null;
    
    // Parse IFD chain
    return this._parseIFDChain(view, startOffset, endOffset, littleEndian, firstIFDOffset);
  }

  /**
   * Parse IFD (Image File Directory) chain
   */
  _parseIFDChain(view, tiffStart, endOffset, littleEndian, ifdOffset) {
    let bestDate = null;
    let currentOffset = ifdOffset;
    const visitedOffsets = new Set();
    
    // Parse main IFD
    const ifd0Tags = this._parseIFD(view, tiffStart, endOffset, littleEndian, currentOffset);
    if (ifd0Tags) {
      bestDate = this._extractBestDate(ifd0Tags) || bestDate;
      
      // Parse EXIF sub-IFD if present
      const exifOffset = ifd0Tags[this.TAGS.ExifIFDPointer];
      if (exifOffset && !visitedOffsets.has(exifOffset)) {
        visitedOffsets.add(exifOffset);
        const exifTags = this._parseIFD(view, tiffStart, endOffset, littleEndian, exifOffset);
        if (exifTags) {
          bestDate = this._extractBestDate(exifTags) || bestDate;
        }
      }
    }
    
    return bestDate ? this._formatEXIFDate(bestDate) : null;
  }

  /**
   * Parse single IFD
   */
  _parseIFD(view, tiffStart, endOffset, littleEndian, ifdOffset) {
    const absoluteOffset = tiffStart + ifdOffset;
    
    if (absoluteOffset + 2 > endOffset) return null;
    
    const entryCount = view.getUint16(absoluteOffset, littleEndian);
    const tags = {};
    
    if (absoluteOffset + 2 + entryCount * 12 > endOffset) return null;
    
    // Parse each directory entry
    for (let i = 0; i < entryCount; i++) {
      const entryOffset = absoluteOffset + 2 + i * 12;
      const tag = this._parseDirectoryEntry(view, tiffStart, endOffset, littleEndian, entryOffset);
      
      if (tag && tag.value !== null) {
        tags[tag.id] = tag.value;
      }
    }
    
    return tags;
  }

  /**
   * Parse single directory entry
   */
  _parseDirectoryEntry(view, tiffStart, endOffset, littleEndian, entryOffset) {
    if (entryOffset + 12 > endOffset) return null;
    
    const tagId = view.getUint16(entryOffset, littleEndian);
    const dataType = view.getUint16(entryOffset + 2, littleEndian);
    const dataCount = view.getUint32(entryOffset + 4, littleEndian);
    
    const typeSize = this.TYPE_SIZES[dataType];
    if (!typeSize) return null;
    
    const totalBytes = dataCount * typeSize;
    let valueOffset;
    
    if (totalBytes <= 4) {
      // Value fits in the entry
      valueOffset = entryOffset + 8;
    } else {
      // Value is stored elsewhere
      const pointer = view.getUint32(entryOffset + 8, littleEndian);
      valueOffset = tiffStart + pointer;
      
      if (valueOffset + totalBytes > endOffset) return null;
    }
    
    const value = this._readTagValue(view, valueOffset, dataType, dataCount, littleEndian);
    
    return { id: tagId, value };
  }

  /**
   * Read tag value based on data type
   */
  _readTagValue(view, offset, dataType, count, littleEndian) {
    try {
      switch (dataType) {
        case 1: // BYTE
          return count === 1 ? view.getUint8(offset) : 
                 Array.from(new Uint8Array(view.buffer, offset, count));
        
        case 2: // ASCII
          return this._getString(view, offset, count - 1); // Exclude null terminator
        
        case 3: // SHORT
          return count === 1 ? view.getUint16(offset, littleEndian) :
                 Array.from({ length: count }, (_, i) => 
                   view.getUint16(offset + i * 2, littleEndian));
        
        case 4: // LONG
          return count === 1 ? view.getUint32(offset, littleEndian) :
                 Array.from({ length: count }, (_, i) => 
                   view.getUint32(offset + i * 4, littleEndian));
        
        case 5: // RATIONAL
          if (count === 1) {
            const numerator = view.getUint32(offset, littleEndian);
            const denominator = view.getUint32(offset + 4, littleEndian);
            return denominator !== 0 ? numerator / denominator : 0;
          }
          return Array.from({ length: count }, (_, i) => {
            const num = view.getUint32(offset + i * 8, littleEndian);
            const den = view.getUint32(offset + i * 8 + 4, littleEndian);
            return den !== 0 ? num / den : 0;
          });
        
        case 7: // UNDEFINED
          return new Uint8Array(view.buffer, offset, count);
        
        case 9: // SLONG
          return count === 1 ? view.getInt32(offset, littleEndian) :
                 Array.from({ length: count }, (_, i) => 
                   view.getInt32(offset + i * 4, littleEndian));
        
        case 10: // SRATIONAL
          if (count === 1) {
            const numerator = view.getInt32(offset, littleEndian);
            const denominator = view.getInt32(offset + 4, littleEndian);
            return denominator !== 0 ? numerator / denominator : 0;
          }
          return Array.from({ length: count }, (_, i) => {
            const num = view.getInt32(offset + i * 8, littleEndian);
            const den = view.getInt32(offset + i * 8 + 4, littleEndian);
            return den !== 0 ? num / den : 0;
          });
        
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract best available date from tags
   */
  _extractBestDate(tags) {
    // Priority order: DateTimeOriginal > DateTimeDigitized > DateTime
    return tags[this.TAGS.DateTimeOriginal] ||
           tags[this.TAGS.DateTimeDigitized] ||
           tags[this.TAGS.DateTime] ||
           null;
  }

  /**
   * Format EXIF date string to ISO format
   */
  _formatEXIFDate(exifDateStr) {
    if (!exifDateStr || typeof exifDateStr !== 'string') return null;
    
    // EXIF date format: "YYYY:MM:DD HH:MM:SS"
    const match = exifDateStr.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
    
    if (!match) return null;
    
    const [, year, month, day, hour, minute, second] = match;
    
    // Convert to ISO format
    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  }

  /**
   * Helper method to extract string from DataView
   */
  _getString(view, offset, length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      if (offset + i >= view.byteLength) break;
      result += String.fromCharCode(view.getUint8(offset + i));
    }
    return result;
  }
}

// Export for use in portfolio system
window.EXIFParser = EXIFParser;