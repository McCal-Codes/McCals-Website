import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { adaptEvents, type EventsManifest } from './events-adapter';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEventsManifest(): EventsManifest {
  const fixturePath = resolve(
    __dirname,
    '..',
    '..',
    'public-vite',
    'manifests',
    'events-manifest.json',
  );

  return JSON.parse(readFileSync(fixturePath, 'utf8')) as EventsManifest;
}

describe('events page manifest adapter', () => {
  it('adapts the real events manifest array into portfolio groups', () => {
    const manifest = loadEventsManifest();

    expect(Array.isArray(manifest.events)).toBe(true);
    expect(manifest.events.length).toBeGreaterThan(0);

    const groups = adaptEvents(manifest);
    const firstEvent = manifest.events[0];
    const firstImage = firstEvent.images[0];

    expect(groups).toHaveLength(manifest.events.length);
    expect(groups[0]).toMatchObject({
      title: firstEvent.title ?? firstEvent.eventName,
      dateDisplay: firstEvent.dateDisplay,
      dateISO: firstEvent.dateISO,
      category: firstEvent.category,
    });
    expect(groups[0].coverImage.url).toBe(`/${firstImage.path}`);
  });
});
