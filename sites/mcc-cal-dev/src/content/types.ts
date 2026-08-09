/**
 * The content schema for dev.mcc-cal.com.
 *
 * Every project page renders through `Project`. Adding a project means adding one
 * entry to `projects.ts`: the index row, the route, the metadata table, and the
 * sticky section nav all derive from it.
 */

/* -- Status -------------------------------------------------------------- */

/**
 * Status is carried by shape and text. The glyph is decoration; the label is the
 * information. Never communicate status by color alone.
 */
export type ProjectStatus =
  | 'active-alpha'
  | 'active-development'
  | 'prototype'
  | 'research'
  | 'archived';

export interface StatusPresentation {
  /** Rendered aria-hidden. Shape, not color, distinguishes the states. */
  glyph: string;
  label: string;
}

export const STATUS_PRESENTATION: Record<ProjectStatus, StatusPresentation> = {
  'active-alpha': { glyph: '●', label: 'Active alpha' },
  'active-development': { glyph: '●', label: 'Active development' },
  prototype: { glyph: '○', label: 'Prototype' },
  research: { glyph: '□', label: 'Research' },
  archived: { glyph: '×', label: 'Archived' },
};

/* -- Project metadata ---------------------------------------------------- */

/**
 * Hand-written project facts only.
 *
 * Anything GitHub can measure is deliberately absent: license, current version,
 * release history, languages, last push, and whether the source is public all come
 * from `github.json` via `github.ts`. If a field could be looked up, it does not
 * belong here.
 */
export interface ProjectMeta {
  type: string;
  role: string;
  platform: string[];
  started: string;
  /**
   * Frameworks and runtimes the language stats cannot see (Tauri, Expo, and the
   * like). Rendered after the measured languages, never instead of them.
   */
  frameworks?: string[];
}

/* -- Section content types ----------------------------------------------- */

export interface DiagramNode {
  id: string;
  label: string;
  /** Optional one-line clarifier rendered under the label. */
  note?: string;
}

/**
 * A vertical flow diagram. Deliberately limited: nodes in order, each flowing to
 * the next, with optional labeled branches. Diagrams explain systems. They are not
 * decoration, so the shape stays simple enough to stay honest.
 */
export interface DiagramSpec {
  /** Read by screen readers in place of the SVG. Must describe the actual flow. */
  description: string;
  nodes: DiagramNode[];
  /** Rendered beside the arrow between node i and node i + 1. */
  edgeLabels?: (string | null)[];
}

export interface ShotCallout {
  /** Two-digit index, e.g. '01'. */
  index: string;
  label: string;
  /** Percentage position of the marker over the image, 0-100. */
  x: number;
  y: number;
}

export interface AnnotatedShot {
  /** Omit while a real capture does not exist. The frame reserves the ratio. */
  src?: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  callouts: ShotCallout[];
}

export interface TimelineEntry {
  /** e.g. 'Alpha 3', 'v0.4.1'. */
  marker: string;
  date: string;
  title: string;
  detail?: string;
  current?: boolean;
}


/* -- Sections ------------------------------------------------------------ */

export type SectionKind = 'prose' | 'diagram' | 'shots' | 'timeline' | 'releases' | 'list';

export interface CaseStudySection {
  /** Anchor id. Drives the sticky command bar. */
  id: string;
  /** Nav label. Kept short enough for the horizontal mobile scroller. */
  label: string;
  /** Section heading. Falls back to `label`. */
  heading?: string;
  kind: SectionKind;
  body?: string[];
  items?: string[];
  diagram?: DiagramSpec;
  shots?: AnnotatedShot[];
  timeline?: TimelineEntry[];
}

/* -- Project ------------------------------------------------------------- */

export interface Project {
  /** Two-digit index, e.g. '01'. Ordering is the array order in projects.ts. */
  index: string;
  slug: string;
  title: string;
  /** One sentence, plain language. What the thing is. */
  purpose: string;
  /**
   * What it does for the person using it, in their terms rather than the
   * implementation's. This leads on the homepage; the stack and status sit under it.
   */
  pitch?: string;
  /** Who it is for. Short. */
  audience?: string;
  status: ProjectStatus;
  meta: ProjectMeta;
  preview?: AnnotatedShot;
  sections: CaseStudySection[];
}

/* -- Other content ------------------------------------------------------- */

export interface BuildNote {
  slug: string;
  title: string;
  date: string;
  /** One line. Renders in the homepage notes list. */
  hook: string;
  project?: string;
  body?: string[];
}

export interface ActivityEntry {
  project: string;
  slug: string;
  detail: string;
}

