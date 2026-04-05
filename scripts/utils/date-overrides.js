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
  } catch {
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
          iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        };
      }
    }
  }

  const year = Number(raw.year);
  const month = Number(raw.month);
  const day = raw.day !== undefined ? Number(raw.day) : 1;
  if (Number.isFinite(year) && Number.isFinite(month) && isValidDate(day, month, year)) {
    return {
      year,
      month,
      day,
      monthName: MONTHS[month - 1],
      iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  }

  return null;
}

function formatOverride(raw) {
  if (!raw) return null;

  const normalizedDate = normalizeIso(raw);
  if (!normalizedDate) {
    return null;
  }

  const dateDisplay =
    raw.dateDisplay || raw.display || `${normalizedDate.monthName} ${normalizedDate.year}`;
  const dateSource = raw.dateSource || raw.source || 'manual:override';
  const dateConfidence = raw.dateConfidence || raw.confidence || 'high';

  return {
    date: {
      ...normalizedDate,
      display: dateDisplay,
      source: dateSource,
      confidence: dateConfidence,
      description: raw.description || raw.note || raw.notes || undefined,
    },
    dateDisplay,
    dateSource,
    dateConfidence,
    notes: raw.notes || raw.note || undefined,
  };
}

function resolveDateOverride(possibleKeys) {
  const overrides = loadOverrides();
  if (!overrides || typeof overrides !== 'object') {
    return null;
  }

  if (!Array.isArray(possibleKeys)) {
    possibleKeys = [possibleKeys];
  }

  for (const k of possibleKeys) {
    if (!k) continue;
    const normalizedKey = String(k).replace(/\\+/g, '/');
    const raw = overrides[normalizedKey] || overrides[k];
    const formatted = formatOverride(raw);
    if (formatted) {
      return formatted;
    }
  }

  // Try suffix matches (folder-only keys)
  const overrideKeys = Object.keys(overrides);
  for (const keyCandidate of possibleKeys) {
    if (!keyCandidate) continue;
    for (const candidate of overrideKeys) {
      if (String(keyCandidate).endsWith(candidate)) {
        const formatted = formatOverride(overrides[candidate]);
        if (formatted) {
          return formatted;
        }
      }
    }
  }

  return null;
}

module.exports = {
  loadOverrides,
  resolveDateOverride,
};
