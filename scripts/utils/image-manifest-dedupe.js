const path = require('path');

const IMAGE_EXTENSION_RE = /\.(jpe?g|png|webp|gif)$/i;

const FORMAT_PRIORITY = new Map([
  ['.webp', 0],
  ['.jpg', 1],
  ['.jpeg', 1],
  ['.png', 2],
  ['.gif', 3],
]);

function imageEntryName(entry) {
  if (typeof entry === 'string') return entry;
  return entry?.filename || entry?.path || '';
}

function isUsableImageEntry(entry) {
  const name = imageEntryName(entry);
  const basename = path.basename(name.replace(/\\/g, '/'));
  return IMAGE_EXTENSION_RE.test(name) && !basename.startsWith('.') && !basename.startsWith('._');
}

function baseImageKey(entry) {
  return imageEntryName(entry).replace(/\\/g, '/').replace(IMAGE_EXTENSION_RE, '').toLowerCase();
}

function choosePreferredImage(current, candidate) {
  const currentName = imageEntryName(current);
  const candidateName = imageEntryName(candidate);
  const currentPriority = FORMAT_PRIORITY.get(path.extname(currentName).toLowerCase()) ?? 99;
  const candidatePriority = FORMAT_PRIORITY.get(path.extname(candidateName).toLowerCase()) ?? 99;

  if (candidatePriority !== currentPriority) {
    return candidatePriority < currentPriority ? candidate : current;
  }

  return candidateName.localeCompare(currentName) < 0 ? candidate : current;
}

function dedupeImageEntries(entries) {
  const selected = new Map();

  for (const entry of entries || []) {
    if (!isUsableImageEntry(entry)) continue;

    const key = baseImageKey(entry);
    const existing = selected.get(key);
    selected.set(key, existing ? choosePreferredImage(existing, entry) : entry);
  }

  return Array.from(selected.values()).sort((a, b) =>
    imageEntryName(a).localeCompare(imageEntryName(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
}

module.exports = {
  IMAGE_EXTENSION_RE,
  baseImageKey,
  dedupeImageEntries,
  imageEntryName,
  isUsableImageEntry,
};
