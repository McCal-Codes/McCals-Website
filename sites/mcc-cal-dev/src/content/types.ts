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
  | 'beta'
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
  /** Shipped to real testers, not yet publicly listed. */
  beta: { glyph: '◐', label: 'In beta' },
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
  /** Present when the project is testable before public release. */
  beta?: BetaProgram;
  sections: CaseStudySection[];
}

/* -- Beta programme ------------------------------------------------------ */

/**
 * An invitation to test a project before it is publicly available.
 *
 * One shape, two states, decided by whether `testFlightUrl` is set. With a link
 * it is an enrolment call to action; without one it reads as coming soon. There
 * is deliberately no third state where a button exists but goes nowhere, because
 * a dead beta link costs more trust than saying "not yet".
 */
export interface BetaProgram {
  /** Public TestFlight link. Absent means enrolment is not open. */
  testFlightUrl?: string;
  /** What a tester gets, in one line. */
  blurb: string;
  /** What testing actually involves. Sets expectations before someone signs up. */
  note?: string;
  /**
   * How full the beta is.
   *
   * Apple publishes no public endpoint for this, so `taken` is maintained by
   * hand from App Store Connect. It is a real count or it is absent; there is no
   * estimate. `cap` is whatever limit Caleb has set for himself, which is not
   * Apple's: a public link would allow 10,000.
   */
  testers?: { taken: number; cap: number };
  /**
   * Where someone goes once `testers.taken` reaches `cap`.
   *
   * A mailto is deliberate: it needs no third-party form service, collects
   * nothing on our side, and works the day it is set. Swap in a hosted form URL
   * later if the volume ever justifies one. Absent means a full beta simply says
   * it is full.
   */
  waitlist?: { href: string; label: string };
}

/* -- Websites ------------------------------------------------------------ */

/**
 * A site built for someone else.
 *
 * Deliberately not a `Project`. A product is proved by its repository: source,
 * releases, license. A website is proved by being live and looking right, and
 * several of these have no repository at all because they were built on hosted
 * platforms. Different evidence, so a different type.
 *
 * Everything observable (title, description, preview image, whether it still
 * resolves) is pulled by `scripts/sync-sites.js`. Only role and the one-line
 * description of the work are written by hand, because no crawler can infer them.
 */
export interface Website {
  /** Two-digit index within the websites list. */
  index: string;
  slug: string;
  /** Display name. The live <title> is usually too long to use directly. */
  name: string;
  url: string;
  /** What the site is for, in plain language. One sentence. */
  purpose: string;
  /**
   * What you actually did. Required, and never guessed: an unverifiable claim of
   * credit is the one thing a portfolio cannot afford to get wrong.
   */
  role: string;
  /** How it is built. For hosted platforms this is the platform name. */
  platform: string;
  /** Optional repository slug, keyed into github.json. Absent for hosted sites. */
  repoSlug?: string;
  year: string;
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

