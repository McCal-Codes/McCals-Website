/**
 * Generate a unique URL-friendly ID from a string.
 * Optionally append a suffix (like a date) to ensure uniqueness.
 */
export function generateId(title: string, suffix?: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (!suffix) return base;
  
  const suffixPart = String(suffix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${base}-${suffixPart}`.replace(/^-|-$/g, '');
}

/**
 * Check for duplicate IDs in an array of items.
 * Returns a map of duplicate IDs and their items.
 */
export function findDuplicates<T extends { id: string }>(
  items: T[]
): Map<string, T[]> {
  const counts = new Map<string, T[]>();
  items.forEach(item => {
    const existing = counts.get(item.id) || [];
    existing.push(item);
    counts.set(item.id, existing);
  });
  
  return new Map(
    [...counts.entries()].filter(([, items]) => items.length > 1)
  );
}
