import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Builds the 1200x630 social preview images, and only when something they are
 * made from has changed.
 *
 * This used to re-encode all six on every `npm run build`, and JPEG encoding is
 * not identical across platforms: journalism-og.jpg and nature-og.jpg come out
 * with different bytes on macOS than on the Linux runners, while the other four
 * match. seo-auto-update.yml builds on Linux after every merge and commits
 * whatever changed under public-vite/images/social, so each time those two files
 * were committed from a Mac the workflow rewrote them straight back, with a
 * second production build of every project. It happened on 5 September
 * (f3d6446b, reverted by the bot in 60da94e1) and 7 September (5a6d72d5, then
 * 78a25a53), and it would have happened again from this branch.
 *
 * So each output is keyed on its inputs: the source photograph's bytes, the page
 * it belongs to, and the transform. social-images.inputs.json records the key
 * that produced each committed image. When the key still matches and the image
 * exists, the image is left exactly as committed, whichever platform made it,
 * and neither a local build nor the workflow produces a diff. A genuine change to
 * a source, a mapping or the transform changes the key and regenerates. Pass
 * --force to regenerate everything regardless.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const pageSeoPath = path.join(appRoot, 'src', 'content', 'pageSeoData.json');
const outputRoot = path.join(appRoot, 'public-vite', 'images', 'social');
const inputsPath = path.join(__dirname, 'social-images.inputs.json');

export const SOCIAL_IMAGE_SOURCES = {
  home: 'src/images/Portfolios/Journalism/Documentary/Boyd Station/6-10-25_Caleb McCartney_320-min.jpg',
  concerts:
    'src/images/Portfolios/Concert/Heading North/November 2025/251101 Headed North - Bottle Rocket_CAL11_webuse.jpg',
  events:
    'src/images/Portfolios/Events/Howl at the Moon/251024 Howl at the Moon _CAL7841_webuse.webp',
  journalism:
    'src/images/Portfolios/Journalism/Politics/obama-speaks-pitt/101024_Obama Speaks at Pittsburgh_CAL3364.jpg',
  nature: 'src/images/Portfolios/Nature/Landscapes/Downtown Pittsburgh/IMGP7209.jpg',
  portraits: 'src/images/Portfolios/Portrait/Studio/Logan Spiker/Studio with logan0066.jpg',
};

/**
 * Everything about how an image is made, other than its source bytes.
 *
 * @typedef {{ width: number, height: number, fit: string, position: string, quality: number, mozjpeg: boolean }} SocialImageTransform
 * @type {Readonly<SocialImageTransform>}
 */
export const TRANSFORM = Object.freeze({
  width: 1200,
  height: 630,
  fit: 'cover',
  position: 'attention',
  quality: 84,
  mozjpeg: true,
});

/**
 * The key for one output. Source bytes rather than a path or mtime, because a
 * checkout does not preserve modification times and a renamed file with the same
 * pixels needs no new image.
 *
 * @param {Uint8Array} sourceBytes
 * @param {{ source: string, imagePath: string }} inputs
 * @param {Readonly<SocialImageTransform>} [transform]
 */
export function fingerprintInputs(sourceBytes, { source, imagePath }, transform = TRANSFORM) {
  return createHash('sha256')
    .update(sourceBytes)
    .update('\0')
    .update(JSON.stringify({ source, imagePath, transform }))
    .digest('hex');
}

/** Regenerate when forced, when the image is missing, or when its inputs changed. */
export function shouldRegenerate({ recorded, fingerprint, outputExists, force = false }) {
  return force || !outputExists || recorded !== fingerprint;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readRecordedInputs() {
  try {
    return JSON.parse(await fs.readFile(inputsPath, 'utf8'));
  } catch {
    return {};
  }
}

async function generateSocialImages({ force = false } = {}) {
  const pageSeo = JSON.parse(await fs.readFile(pageSeoPath, 'utf8'));
  const recordedInputs = await readRecordedInputs();

  await fs.mkdir(outputRoot, { recursive: true });

  // In parallel, as before: the build runs this under a 15 second timeout.
  const results = await Promise.all(
    Object.entries(SOCIAL_IMAGE_SOURCES).map(async ([key, source]) => {
      const entry = pageSeo[key];
      if (!entry) {
        throw new Error(`Missing page SEO entry for "${key}"`);
      }

      const sourcePath = path.join(repoRoot, source);
      const outputPath = path.join(appRoot, 'public-vite', entry.imagePath);
      const fingerprint = fingerprintInputs(await fs.readFile(sourcePath), {
        source,
        imagePath: entry.imagePath,
      });

      const regenerate = shouldRegenerate({
        recorded: recordedInputs[key],
        fingerprint,
        outputExists: await exists(outputPath),
        force,
      });

      if (regenerate) {
        // Loaded only when an image is actually made, so a build with nothing to
        // do never touches the native module.
        const { default: sharp } = await import('sharp');
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await sharp(sourcePath)
          .rotate()
          .resize(TRANSFORM.width, TRANSFORM.height, {
            fit: TRANSFORM.fit,
            position: TRANSFORM.position,
          })
          .jpeg({ quality: TRANSFORM.quality, mozjpeg: TRANSFORM.mozjpeg })
          .toFile(outputPath);
      }

      return { key, fingerprint, regenerate };
    }),
  );

  // Recorded only after every image is written, so an interrupted run leaves the
  // old keys in place and the next build finishes the job.
  const nextInputs = Object.fromEntries(results.map(({ key, fingerprint }) => [key, fingerprint]));
  const generated = results.filter(({ regenerate }) => regenerate).length;

  const serialized = `${JSON.stringify(nextInputs, null, 2)}\n`;
  const previous = await fs.readFile(inputsPath, 'utf8').catch(() => '');
  if (serialized !== previous) {
    await fs.writeFile(inputsPath, serialized, 'utf8');
  }

  const total = Object.keys(SOCIAL_IMAGE_SOURCES).length;
  console.log(
    generated === 0
      ? `Social preview images: all ${total} unchanged, left as committed`
      : `Social preview images: generated ${generated}, left ${total - generated} unchanged`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSocialImages({ force: process.argv.includes('--force') }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
