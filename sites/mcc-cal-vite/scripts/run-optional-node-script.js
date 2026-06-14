import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [scriptPath, ...scriptArgs] = process.argv.slice(2);
const timeoutMs = Number.parseInt(process.env.OPTIONAL_SCRIPT_TIMEOUT_MS || '15000', 10);

if (!scriptPath) {
  console.error('Usage: node scripts/run-optional-node-script.js <script> [...args]');
  process.exit(2);
}

const absoluteScriptPath = path.resolve(__dirname, '..', scriptPath);
const result = spawnSync(process.execPath, [absoluteScriptPath, ...scriptArgs], {
  stdio: 'inherit',
  timeout: Number.isFinite(timeoutMs) ? timeoutMs : 15000,
});

if (result.error?.code === 'ETIMEDOUT') {
  console.warn(`Optional script timed out and was skipped: ${scriptPath}`);
  process.exit(0);
}

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
