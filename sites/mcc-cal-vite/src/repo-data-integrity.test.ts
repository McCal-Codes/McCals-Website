import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '..', '..', '..');

describe('repository data integrity', () => {
  it('keeps MCP memory data as a single JSON object', () => {
    const memoryPath = resolve(repoRoot, 'src', 'data', 'memory.json');
    const memory = JSON.parse(readFileSync(memoryPath, 'utf8')) as {
      entities?: Record<string, unknown>;
      relations?: unknown[];
    };

    expect(memory.entities).toBeTruthy();
    expect(Array.isArray(memory.relations)).toBe(true);
  });
});
