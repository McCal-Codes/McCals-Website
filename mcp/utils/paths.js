import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate to repo root (mcp/..)
export const REPO_ROOT = path.resolve(__dirname, '..', '..');

export const PATHS = {
  widgets: path.join(REPO_ROOT, 'src', 'widgets'),
  data: path.join(REPO_ROOT, 'src', 'data'),
  content: path.join(REPO_ROOT, 'src', 'content'),
  images: path.join(REPO_ROOT, 'src', 'images', 'Portfolios'),
  scripts: path.join(REPO_ROOT, 'scripts'),
};

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
