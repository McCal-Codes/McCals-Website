/**
 * Manifest validation wrapper
 * Runs parent validation script if available, otherwise skips
 */
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parentScript = join(__dirname, '..', '..', 'scripts', 'validate-manifest-ids.js');

if (existsSync(parentScript)) {
  console.log('🔍 Validating portfolio manifests...');
  try {
    execSync(`node "${parentScript}"`, { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
} else {
  console.log('ℹ️ Skipping manifest validation - parent script not found (production build)');
}
