import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const pageSeoPath = path.join(appRoot, 'src', 'content', 'pageSeoData.json');
const outputRoot = path.join(appRoot, 'public-vite', 'images', 'social');

const SOCIAL_IMAGE_SOURCES = {
  home: 'src/images/Portfolios/Journalism/Documentary/Boyd Station/6-10-25_Caleb McCartney_320-min.jpg',
  concerts: 'src/images/Portfolios/Concert/Heading North/November 2025/251101 Headed North - Bottle Rocket_CAL11_webuse.jpg',
  events: 'src/images/Portfolios/Events/Howl at the Moon/251024 Howl at the Moon _CAL7841_webuse.webp',
  journalism: 'src/images/Portfolios/Journalism/Politics/obama-speaks-pitt/101024_Obama Speaks at Pittsburgh_CAL3364.jpg',
  nature: 'src/images/Portfolios/Nature/Landscapes/Downtown Pittsburgh/IMGP7209.jpg',
  portraits: 'src/images/Portfolios/Portrait/Studio/Logan Spiker/Studio with logan0066.jpg',
};

async function generateSocialImages() {
  const pageSeo = JSON.parse(await fs.readFile(pageSeoPath, 'utf8'));
  await fs.mkdir(outputRoot, { recursive: true });

  await Promise.all(
    Object.entries(SOCIAL_IMAGE_SOURCES).map(async ([key, source]) => {
      const entry = pageSeo[key];
      if (!entry) {
        throw new Error(`Missing page SEO entry for "${key}"`);
      }

      const outputPath = path.join(appRoot, 'public-vite', entry.imagePath);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      await sharp(path.join(repoRoot, source))
        .rotate()
        .resize(1200, 630, { fit: 'cover', position: 'attention' })
        .jpeg({ quality: 84, mozjpeg: true })
        .toFile(outputPath);
    }),
  );

  console.log(`Generated ${Object.keys(SOCIAL_IMAGE_SOURCES).length} social preview images`);
}

generateSocialImages().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
