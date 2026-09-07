import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * Tailwind was configured and never ran. `postcss.config.js` loaded only
 * autoprefixer, so `@tailwind base; @tailwind components; @tailwind utilities;`
 * shipped verbatim into the production stylesheet, where a browser skips an
 * at-rule it does not recognise. The installed tailwindcss was v4, whose entry
 * point is `@import "tailwindcss"`, so even with the plugin loaded those v3
 * directives would have produced nothing.
 *
 * The cost was not the dead config. It was that class names like `mt-8`,
 * `text-sm` and `opacity-70` sat on live pages doing nothing, so a spacing or
 * type choice written in a component was silently discarded, and nothing in the
 * build said so.
 *
 * Turning Tailwind on was the wrong repair. `@tailwind base` is preflight, a
 * global reset that would have restyled every page on the site at once. This
 * codebase styles itself with CSS modules and hand written stylesheets, so the
 * fix was to finish removing a tool that was never wired up.
 */

const siteRoot = resolve(__dirname, '..');

/**
 * Whole tokens only. An earlier pass at this used a substring match and flagged
 * hand written names like `scheduling-calendar-grid` for containing "grid".
 */
const TAILWIND_UTILITY =
  /^(flex|grid|block|hidden|container|relative|absolute|(?:p|m|px|py|mx|my|mt|mb|ml|mr|pt|pb|pl|pr|w|h|gap|space)-(?:[0-9]+|px|full|auto|screen)|text-(?:xs|sm|base|lg|xl|[2-9]xl|left|center|right|white|black|gray-[0-9]+)|bg-(?:white|black|gray-[0-9]+|transparent)|opacity-[0-9]+|font-(?:bold|semibold|medium|light)|rounded(?:-(?:sm|md|lg|xl|full))?|items-(?:center|start|end)|justify-(?:center|between|start|end)|border(?:-[0-9]+)?|shadow(?:-(?:sm|md|lg|xl))?)$/;

function walk(dir: string, match: RegExp): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full, match);
    return match.test(entry) ? [full] : [];
  });
}

describe('no half-wired Tailwind', () => {
  it('no stylesheet carries a @tailwind directive', () => {
    const offenders = walk(resolve(siteRoot, 'src'), /\.css$/)
      .filter((file) => readFileSync(file, 'utf8').includes('@tailwind'))
      .map((file) => relative(siteRoot, file));

    expect(offenders).toEqual([]);
  });

  it('no component uses a Tailwind utility class', () => {
    const offenders: string[] = [];

    for (const file of walk(resolve(siteRoot, 'src'), /\.tsx$/)) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/className="([^"{}]*)"/g)) {
        const dead = match[1].split(/\s+/).filter((token) => TAILWIND_UTILITY.test(token));
        if (dead.length > 0) offenders.push(`${relative(siteRoot, file)}: ${dead.join(' ')}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('finds files to check, so an empty walk cannot pass vacuously', () => {
    expect(walk(resolve(siteRoot, 'src'), /\.tsx$/).length).toBeGreaterThan(20);
    expect(walk(resolve(siteRoot, 'src'), /\.css$/).length).toBeGreaterThan(0);
  });

  it('tailwindcss is not a dependency of either package', () => {
    for (const manifest of ['package.json', '../../package.json']) {
      const pkg = JSON.parse(readFileSync(resolve(siteRoot, manifest), 'utf8'));
      expect({ ...pkg.dependencies, ...pkg.devDependencies }).not.toHaveProperty('tailwindcss');
    }
  });
});
