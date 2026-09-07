const fs = require('fs').promises;
const path = require('path');

/**
 * Writes a manifest, but only when something other than its timestamp changed.
 *
 * Every generator stamped `generated: new Date().toISOString()` on each run, so
 * a manifest rebuilt from unchanged photographs still came out different. That
 * had two costs.
 *
 * The build cost: seo-auto-update.yml regenerates the manifests after every
 * merge to main and commits whatever changed. It already checks for changes
 * before committing, but the check always passed, because the timestamp always
 * moved. The resulting commit lands inside sites/mcc-cal-vite/, which is the
 * Vercel root directory, so it satisfied `ignoreCommand` and triggered a second
 * full production build of every project for a diff of one line per file. Every
 * merge cost two production builds instead of one.
 *
 * The SEO cost: generate-sitemap.js reads `generated` and publishes it as the
 * page's <lastmod>. So the sitemap told search engines that every gallery had
 * been modified today, every day, forever. A lastmod that is always current
 * carries no information and is discounted accordingly.
 *
 * Keeping the old timestamp when nothing else changed fixes both. It is also
 * the more truthful value: the manifest describes the same photographs it
 * described before, so the date it was actually assembled is the date to keep.
 *
 * generate-nature-manifest.js already did this for its per-collection
 * `metadata.generated`. This is the same idea, applied everywhere and in one
 * place.
 *
 * @param {string} outputPath Where the manifest belongs.
 * @param {unknown} manifest The freshly built manifest object.
 * @param {object} [options]
 * @param {string[]} [options.timestampFields] Top level fields to treat as
 *   timestamps. Defaults to the two names in use across the generators.
 * @param {(manifest: unknown) => string} [options.serialize] How to render the
 *   file. Each generator passes its own so this change cannot reformat a
 *   manifest, which would defeat the whole point by producing a diff.
 * @param {boolean} [options.atomic] Write to a sibling .tmp file and rename,
 *   for the generators that already did.
 * @param {boolean} [options.force] Write regardless, for the --force flags that
 *   already existed.
 * @returns {Promise<boolean>} true when the file was written.
 */
async function writeManifestIfChanged(outputPath, manifest, options = {}) {
  const timestampFields = options.timestampFields ?? ['generated', 'generatedAt'];
  const serialize = options.serialize ?? ((value) => JSON.stringify(value, null, 2));

  const existing = options.force ? null : await readJson(outputPath);

  if (existing && sameIgnoringTimestamps(existing, manifest, timestampFields)) {
    return false;
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const content = serialize(manifest);

  if (options.atomic) {
    const tmpFile = `${outputPath}.tmp`;
    await fs.writeFile(tmpFile, content, 'utf8');
    await fs.rename(tmpFile, outputPath);
  } else {
    await fs.writeFile(outputPath, content, 'utf8');
  }
  return true;
}

async function readJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    // Missing, unreadable or not valid JSON. Any of those mean write it.
    return null;
  }
}

/**
 * Compares two manifests with the timestamp fields blanked on both sides, so a
 * difference in any other field still counts. Serialised rather than compared
 * key by key because the generators build these objects in a fixed order, which
 * is the same reason the existing nature check uses JSON.stringify.
 */
function sameIgnoringTimestamps(a, b, timestampFields) {
  return JSON.stringify(blank(a, timestampFields)) === JSON.stringify(blank(b, timestampFields));
}

function blank(manifest, timestampFields) {
  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return manifest;
  }
  const copy = { ...manifest };
  for (const field of timestampFields) {
    if (field in copy) copy[field] = null;
  }
  return copy;
}

module.exports = { writeManifestIfChanged };
