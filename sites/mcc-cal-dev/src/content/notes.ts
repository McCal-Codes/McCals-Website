import type { BuildNote } from './types';

/**
 * Build notes. Newest first. A note earns its place by explaining a decision,
 * not by announcing that work happened.
 */
export const NOTES: BuildNote[] = [
  // Empty until something is actually written. An entry here is a published
  // note; a title with a date and no body is a claim that one exists.
];

export function getNote(slug: string): BuildNote | undefined {
  return NOTES.find((note) => note.slug === slug);
}
