import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.resolve(__dirname, '..', '..', '..', 'src', 'images', 'Portfolios');
const DEST = path.resolve(__dirname, '..', 'api', 'manifests', 'data');
const PUBLIC_DEST = path.resolve(__dirname, '..', 'public-vite', 'manifests');
const BLOG_SRC = path.resolve(__dirname, '..', '..', '..', 'src', 'content', 'blog');
const BLOG_POSTS_DIR = path.join(BLOG_SRC, 'posts');
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
const BLOG_GENERATED_FILES = [
  path.join(BLOG_SRC, 'blog-manifest.json'),
  path.join(BLOG_SRC, 'feed.json'),
  path.join(BLOG_SRC, 'feed.xml'),
];
const COPY_TIMEOUT_MS = Number.parseInt(
  process.env.SYNC_COPY_TIMEOUT_MS || process.env.BLOG_COPY_TIMEOUT_MS || '120000',
  10,
);
const SCRIPT_TIMEOUT_MS = Number.parseInt(process.env.SYNC_SCRIPT_TIMEOUT_MS || '120000', 10);
const SKIP_BLOG = String(process.env.SYNC_SKIP_BLOG || '').toLowerCase() === 'true';
const FORCE_BLOG_COMPILE = String(process.env.SYNC_FORCE_BLOG_COMPILE || '').toLowerCase() === 'true';
const FORCE_BLOG_SCRIPTS = String(process.env.SYNC_FORCE_BLOG_SCRIPTS || '').toLowerCase() === 'true';

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
  execFileSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    timeout: Number.isFinite(SCRIPT_TIMEOUT_MS) && SCRIPT_TIMEOUT_MS > 0 ? SCRIPT_TIMEOUT_MS : 120000,
  });
}

function hasCurrentCompiledBlogSources() {
  if (!fs.existsSync(BLOG_POSTS_DIR)) {
    return false;
  }

  const postDirs = fs
    .readdirSync(BLOG_POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(BLOG_POSTS_DIR, entry.name));

  if (postDirs.length === 0) {
    return false;
  }

  return postDirs.every((postDir) => {
    const markdownPath = path.join(postDir, 'post.md');
    const jsonPath = path.join(postDir, 'post.json');

    if (!fs.existsSync(markdownPath)) {
      return true;
    }

    if (!fs.existsSync(jsonPath)) {
      return false;
    }

    const markdownStat = fs.statSync(markdownPath);
    const jsonStat = fs.statSync(jsonPath);
    return jsonStat.mtimeMs >= markdownStat.mtimeMs - 1000;
  });
}

function getBlogSourceMtimeMs() {
  const sourcePaths = [path.join(BLOG_SRC, 'authors.json')];

  if (fs.existsSync(BLOG_POSTS_DIR)) {
    for (const entry of fs.readdirSync(BLOG_POSTS_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      sourcePaths.push(path.join(BLOG_POSTS_DIR, entry.name, 'post.md'));
      sourcePaths.push(path.join(BLOG_POSTS_DIR, entry.name, 'post.json'));
    }
  }

  return sourcePaths.reduce((latestMtime, sourcePath) => {
    if (!fs.existsSync(sourcePath)) {
      return latestMtime;
    }

    return Math.max(latestMtime, fs.statSync(sourcePath).mtimeMs);
  }, 0);
}

function hasCurrentGeneratedBlogFiles() {
  if (!hasCurrentCompiledBlogSources()) {
    return false;
  }

  const latestSourceMtime = getBlogSourceMtimeMs();
  return BLOG_GENERATED_FILES.every((generatedPath) => {
    if (!fs.existsSync(generatedPath)) {
      return false;
    }

    return fs.statSync(generatedPath).mtimeMs >= latestSourceMtime - 1000;
  });
}

function isCurrentCopy(srcStat, destPath) {
  if (!fs.existsSync(destPath)) return false;

  const destStat = fs.statSync(destPath);
  return destStat.isFile() && destStat.size === srcStat.size && destStat.mtimeMs >= srcStat.mtimeMs - 1000;
}

function copyFileWithTimeout(srcPath, destPath, { rootPath, label }) {
  const srcStat = fs.statSync(srcPath);
  if (!srcStat.isFile()) {
    return 'skipped';
  }

  if (isCurrentCopy(srcStat, destPath)) {
    return 'skipped';
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const tmpPath = `${destPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    execFileSync('cp', ['-p', srcPath, tmpPath], {
      stdio: 'pipe',
      timeout: Number.isFinite(COPY_TIMEOUT_MS) ? COPY_TIMEOUT_MS : 15000,
    });

    const tmpStat = fs.statSync(tmpPath);
    if (tmpStat.size !== srcStat.size) {
      throw new Error(`copy size mismatch (${tmpStat.size} != ${srcStat.size})`);
    }

    fs.renameSync(tmpPath, destPath);
    return 'copied';
  } catch (error) {
    fs.rmSync(tmpPath, { force: true });
    if (fs.existsSync(destPath) && fs.statSync(destPath).size === 0) {
      fs.rmSync(destPath, { force: true });
    }
    const relativePath = path.relative(rootPath, srcPath);
    console.warn(`Warning: skipped ${label} after copy timeout/failure: ${relativePath}`);
    console.warn(`  ${error.message}`);
    return 'failed';
  }
}

function syncDirectory(srcRoot, destRoot, label) {
  const totals = { copied: 0, skipped: 0, failed: 0 };

  function syncEntry(srcPath, destPath) {
    const entryStat = fs.statSync(srcPath);
    if (entryStat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      for (const entry of fs.readdirSync(srcPath)) {
        if (entry === '.DS_Store') continue;
        syncEntry(path.join(srcPath, entry), path.join(destPath, entry));
      }
      return;
    }

    const result = copyFileWithTimeout(srcPath, destPath, {
      rootPath: srcRoot,
      label,
    });
    totals[result] += 1;
  }

  syncEntry(srcRoot, destRoot);
  return totals;
}

for (const [src, dest] of FILES) {
  const srcPath = path.join(SRC, src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`Warning: manifest not found: ${srcPath}`);
    continue;
  }

  for (const targetDir of [DEST, PUBLIC_DEST]) {
    const destPath = path.join(targetDir, dest);
    copyFileWithTimeout(srcPath, destPath, {
      rootPath: SRC,
      label: 'manifest',
    });
  }

  console.log(`Synced: ${dest}`);
}

if (SKIP_BLOG) {
  console.log('Skipped: blog sync (SYNC_SKIP_BLOG=true)');
} else if (!fs.existsSync(BLOG_SRC)) {
  console.warn(`Warning: blog content not found: ${BLOG_SRC}`);
} else {
  if (FORCE_BLOG_SCRIPTS || !hasCurrentGeneratedBlogFiles()) {
    if (FORCE_BLOG_COMPILE || !hasCurrentCompiledBlogSources()) {
      runNodeScript(BLOG_COMPILE_SCRIPT);
    } else {
      console.log('Skipped: blog source compile (compiled sources are current)');
    }

    runNodeScript(BLOG_VALIDATE_SCRIPT);
    runNodeScript(BLOG_MANIFEST_SCRIPT, ['--skip-notify']);
    runNodeScript(BLOG_FEED_SCRIPT);
  } else {
    console.log('Skipped: blog source scripts (generated blog files are current)');
  }

  fs.mkdirSync(path.dirname(BLOG_DEST), { recursive: true });
  const totals = syncDirectory(BLOG_SRC, BLOG_DEST, 'blog asset');
  console.log(
    `Synced: content/blog-static (${totals.copied} copied, ${totals.skipped} skipped, ${totals.failed} failed)`,
  );

  runNodeScript(SITEMAP_SCRIPT);
}
