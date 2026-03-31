import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.resolve(__dirname, '..', '..', '..', 'src', 'images', 'Portfolios');
const DEST = path.resolve(__dirname, '..', 'api', 'manifests', 'data');
const PUBLIC_DEST = path.resolve(__dirname, '..', 'public-vite', 'manifests');
const BLOG_SRC = path.resolve(__dirname, '..', '..', '..', 'src', 'content', 'blog');
const BLOG_DEST = path.resolve(__dirname, '..', 'public-vite', 'content', 'blog-static');
const BLOG_COMPILE_SCRIPT = path.resolve(__dirname, '..', '..', '..', 'scripts', 'blog', 'compile-post-sources.js');
const BLOG_VALIDATE_SCRIPT = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'scripts',
  'blog',
  'validate-blog-content.js',
);
const BLOG_MANIFEST_SCRIPT = path.resolve(__dirname, '..', '..', '..', 'scripts', 'manifest', 'generate-blog-manifest.js');
const BLOG_FEED_SCRIPT = path.resolve(__dirname, '..', '..', '..', 'scripts', 'blog', 'generate-blog-feed.js');
const SITEMAP_SCRIPT = path.resolve(__dirname, 'generate-sitemap.js');

const FILES = [
  ['Concert/concert-manifest.json', 'concert-manifest.json'],
  ['Events/events-manifest.json', 'events-manifest.json'],
  ['Journalism/journalism-manifest.json', 'journalism-manifest.json'],
  ['Nature/nature-manifest.json', 'nature-manifest.json'],
  ['Portrait/portrait-manifest.json', 'portrait-manifest.json'],
  ['portfolio-manifest.json', 'portfolio-manifest.json'],
  ['featured-manifest.json', 'featured-manifest.json'],
];

fs.mkdirSync(DEST, { recursive: true });
fs.mkdirSync(PUBLIC_DEST, { recursive: true });

function runNodeScript(scriptPath, args = []) {
  execFileSync(process.execPath, [scriptPath, ...args], { stdio: 'inherit' });
}

for (const [src, dest] of FILES) {
  const srcPath = path.join(SRC, src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`Warning: manifest not found: ${srcPath}`);
    continue;
  }

  for (const targetDir of [DEST, PUBLIC_DEST]) {
    const destPath = path.join(targetDir, dest);
    fs.copyFileSync(srcPath, destPath);
  }

  console.log(`Synced: ${dest}`);
}

if (!fs.existsSync(BLOG_SRC)) {
  console.warn(`Warning: blog content not found: ${BLOG_SRC}`);
} else {
  runNodeScript(BLOG_COMPILE_SCRIPT);
  runNodeScript(BLOG_VALIDATE_SCRIPT);
  runNodeScript(BLOG_MANIFEST_SCRIPT, ['--skip-notify']);
  runNodeScript(BLOG_FEED_SCRIPT);
  runNodeScript(SITEMAP_SCRIPT);

  fs.mkdirSync(path.dirname(BLOG_DEST), { recursive: true });
  fs.mkdirSync(BLOG_DEST, { recursive: true });
  fs.cpSync(BLOG_SRC, BLOG_DEST, { recursive: true, force: true });
  console.log('Synced: content/blog-static');
}
