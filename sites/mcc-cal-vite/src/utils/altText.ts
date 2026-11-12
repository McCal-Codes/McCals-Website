import { featuredNames } from '@/content/featuredNames';

interface AltTextInput {
  /** Shoot, band, event, or collection name. */
  title: string;
  /** What kind of photography it is, lowercase: "concert", "event", "portrait", and so on. */
  kind: string;
  /** Zero-based position of the photo in its set. */
  index: number;
  /** Photos in the set. Omit when unknown. */
  total?: number;
  /** Human-readable date, such as "December 2025". */
  date?: string;
}

// Fallback alt text for a photo with no written description. It says what the photo is and who
// took it, names any people listed in featuredNames, and numbers the photo so screen readers do
// not read the same line for every image in a set.
export function describeImage({ title, kind, index, total, date }: AltTextInput): string {
  const names = featuredNames[title];
  const subject = names ? `${title} (${names})` : title;
  const position = total && total > 1 ? ` ${index + 1} of ${total}` : '';
  const when = date ? `, ${date}` : '';
  return `${subject}, ${kind} photo${position} by Caleb McCartney${when}`;
}
