import { describe, expect, it, vi } from 'vitest';
import { adaptEvents } from './events-adapter';

vi.mock('@/content/eventCuration', () => ({
  eventKeep: {
    'Listed Event': ['b.jpg'],
    'Hidden Event': [],
  },
}));

describe('events curation', () => {
  it('shows only the curated frames of a listed shoot and hides empty shoots', () => {
    const event = (eventName: string, files: string[]) => ({
      eventName,
      images: files.map((file) => ({ path: `src/images/Portfolios/Events/${eventName}/${file}` })),
    });

    const groups = adaptEvents({
      events: [
        event('Listed Event', ['a.jpg', 'b.jpg', 'c.jpg']),
        event('Hidden Event', ['x.jpg']),
        event('New Event', ['n1.jpg', 'n2.jpg']),
      ],
    });

    expect(groups.map((group) => group.title)).toEqual(['Listed Event', 'New Event']);
    expect(groups[0]?.images.map((image) => image.filename)).toEqual(['b.jpg']);
    expect(groups[1]?.images).toHaveLength(2);
  });
});
