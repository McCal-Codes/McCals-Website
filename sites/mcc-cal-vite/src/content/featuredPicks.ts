// Which Portraits albums and Nature collections appear on the Featured page, by name.
// The first frame of each is its cover (the same keep-list order the work pages use).
// A name that no longer exists is skipped. Empty a list to drop that category from Featured.
export const featuredPicks: { Portraits: readonly string[]; Nature: readonly string[] } = {
  Portraits: ['Annie Victoria', 'Sam Rose'],
  Nature: ['Downtown Pittsburgh, Fireworks', 'Flowers & Plants'],
};
