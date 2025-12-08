#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { MONTHS, isValidDate } = require('./shared-date-parsing');

const OVERRIDES_FILE = path.join(
  process.cwd(),
  'src',
  'images',
  'Portfolios',
  'date-overrides.json',
);
let overridesCache = null;

function loadOverrides() {
  if (overridesCache !== null) {
    return overridesCache;
  }

  try {
    const raw = fs.readFileSync(OVERRIDES_FILE, 'utf8');
    overridesCache = JSON.parse(raw);
  } catch (error) {
    overridesCache = {};
  }

  return overridesCache;
}

function normalizeIso(raw) {
  if (!raw) return null;

  const iso = raw.dateISO || raw.iso || null;
  if (typeof iso === 'string') {
    const cleaned = iso.trim();
    const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      if (isValidDate(day, month, year)) {
        return {
          year,
          month,
          day,
          monthName: MONTHS[month - 1],
          iso: cleaned,
        };
      }
    }
  }
  return null;
}

function resolveDateOverride(possibleKeys) {
  const overrides = loadOverrides();
  if (!overrides) return null;
  if (!Array.isArray(possibleKeys)) possibleKeys = [possibleKeys];
  // Try each key for exact match
  for (const k of possibleKeys) {
    if (typeof k === 'string' && overrides[k]) {
      return normalizeIso(overrides[k]);
    }
  }
  // Try partial match for each key
  const overrideKeys = Object.keys(overrides);
  for (const k of possibleKeys) {
    if (typeof k === 'string') {
      for (const key of overrideKeys) {
        if (k.endsWith(key)) {
          return normalizeIso(overrides[key]);
        }
      }
    }
  }
  return null;
}

module.exports = {
  resolveDateOverride,
};
