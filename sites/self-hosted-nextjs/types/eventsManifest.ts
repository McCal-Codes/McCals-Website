export interface EventImageObj {
  path?: string;
  filename?: string;
  description?: string;
  caption?: string;
  tags?: string[];
}

export type EventImage = string | EventImageObj;

export interface EventDate {
  year?: number;
  month?: number;
  day?: number;
  monthName?: string;
  iso?: string;
  display?: string;
}

export interface EventItem {
  eventName?: string;
  title?: string;
  category?: string;
  folderPath: string; // e.g., "Events/CMU-Business-Graduation"
  dateDisplay?: string;
  dateISO?: string;
  date?: EventDate;
  totalImages?: number;
  images: EventImage[];
}

export interface EventsManifest {
  version?: string;
  generated?: string;
  totalEvents?: number;
  events: EventItem[];
}
