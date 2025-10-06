#!/usr/bin/env node

/**
 * Shared Date Parsing Utilities for Portfolio Manifests
 * 
 * This module provides consistent date parsing across all portfolio generators
 * to ensure dates are interpreted the same way in all manifests.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Shared date detection patterns (ordered by priority)
const DATE_PATTERNS = {
  // YYYYMMDD format: 20241213, 2024-12-13 (highest priority)
  yyyymmdd_dash: { 
    pattern: /(\d{4})[\-_](\d{2})[\-_](\d{2})/, 
    parse: (m) => ({ year: +m[1], month: +m[2], day: +m[3] }),
    description: 'YYYY-MM-DD or YYYY_MM_DD'
  },
  yyyymmdd_solid: { 
    pattern: /(\d{4})(\d{2})(\d{2})(?![\d])/, 
    parse: (m) => ({ year: +m[1], month: +m[2], day: +m[3] }),
    description: 'YYYYMMDD'
  },
  
  // YYMMDD format: 250829, 25-08-29 (our main format - high priority)
  yymmdd_dash: { 
    pattern: /(\d{2})[\-_](\d{2})[\-_](\d{2})/, 
    parse: (m) => ({ year: 2000 + (+m[1]), month: +m[2], day: +m[3] }),
    description: 'YY-MM-DD or YY_MM_DD'
  },
  yymmdd_solid: { 
    pattern: /^(\d{2})(\d{2})(\d{2})(?![\d])/, 
    parse: (m) => ({ year: 2000 + (+m[1]), month: +m[2], day: +m[3] }),
    description: 'YYMMDD (from start of filename)'
  },
  
  // DDMMYY format: 13-01-24, 13_01_24, 130124 (lower priority)
  ddmmyy_dash: { 
    pattern: /(\d{2})[\-_](\d{2})[\-_](\d{2})/, 
    parse: (m) => ({ day: +m[1], month: +m[2], year: 2000 + (+m[3]) }),
    description: 'DD-MM-YY or DD_MM_YY'
  },
  ddmmyy_solid: { 
    pattern: /(\d{2})(\d{2})(\d{2})(?![\d])/, 
    parse: (m) => ({ day: +m[1], month: +m[2], year: 2000 + (+m[3]) }),
    description: 'DDMMYY'
  },
  
  // DDMMYYYY format: 13122024, 13-12-2024
  ddmmyyyy_dash: { 
    pattern: /(\d{2})[\-_](\d{2})[\-_](\d{4})/, 
    parse: (m) => ({ day: +m[1], month: +m[2], year: +m[3] }),
    description: 'DD-MM-YYYY or DD_MM_YYYY'
  },
  ddmmyyyy_solid: { 
    pattern: /(\d{2})(\d{2})(\d{4})(?![\d])/, 
    parse: (m) => ({ day: +m[1], month: +m[2], year: +m[3] }),
    description: 'DDMMYYYY'
  }
};

function isValidDate(day, month, year) {
  if (year < 1990 || year > 2030) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Check if the date actually exists
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}

/**
 * Extract date information from filename using standardized patterns
 * @param {string} filename - The filename to parse
 * @returns {Object|null} - Date object with year, month, day, iso, monthName, source
 */
function detectDateFromFilename(filename) {
  // Ensure filename is a string
  if (!filename || typeof filename !== 'string') {
    return null;
  }
  
  for (const [patternName, { pattern, parse, description }] of Object.entries(DATE_PATTERNS)) {
    const match = filename.match(pattern);
    if (match) {
      const dateInfo = parse(match);
      
      if (isValidDate(dateInfo.day, dateInfo.month, dateInfo.year)) {
        return {
          ...dateInfo,
          monthName: MONTHS[dateInfo.month - 1],
          iso: `${dateInfo.year}-${String(dateInfo.month).padStart(2, '0')}-${String(dateInfo.day).padStart(2, '0')}`,
          source: patternName,
          description: description
        };
      }
    }
  }
  return null;
}

/**
 * Extract date from an array of image filenames (returns first match)
 * @param {string[]} imageFiles - Array of filenames
 * @returns {Object|null} - Date object or null
 */
function detectDateFromImages(imageFiles) {
  // Ensure imageFiles is an array
  if (!Array.isArray(imageFiles)) {
    return null;
  }
  
  for (const filename of imageFiles) {
    // Ensure each filename is a string
    if (typeof filename === 'string') {
      const date = detectDateFromFilename(filename);
      if (date) {
        return date;
      }
    }
  }
  return null;
}

/**
 * Generate display date string from date object
 * @param {Object} dateObj - Date object with year, month, monthName
 * @returns {string} - Display string like "August 2025"
 */
function formatDisplayDate(dateObj) {
  return `${dateObj.monthName} ${dateObj.year}`;
}

/**
 * Create a fallback date object for current year
 * @returns {Object} - Date object for January 1st of current year
 */
function createFallbackDate() {
  const currentYear = new Date().getFullYear();
  return {
    year: currentYear,
    month: 1,
    day: 1,
    monthName: 'January',
    iso: `${currentYear}-01-01`,
    source: 'fallback_current_year',
    description: 'Fallback to current year'
  };
}

module.exports = {
  DATE_PATTERNS,
  MONTHS,
  detectDateFromFilename,
  detectDateFromImages,
  formatDisplayDate,
  createFallbackDate,
  isValidDate
};