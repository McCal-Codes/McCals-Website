export interface JournalismImage {
  filename?: string;
  path?: string;
  description?: string;
  caption?: string;
  tags?: string[];
}

export interface JournalismEvent {
  eventName?: string;
  title?: string;
  category?: string;
  tags?: string[];
  folderPath: string; // e.g., "Politics/CMU Trump Protest"
  eventDate?: { iso?: string; source?: string };
  dateDisplay?: string;
  totalImages?: number;
  images: JournalismImage[];
  published?: boolean;
}

export interface JournalismManifest {
  version?: string;
  generated?: string;
  totalEvents?: number;
  totalImages?: number;
  categories?: string[];
  tags?: string[];
  events: JournalismEvent[];
}
