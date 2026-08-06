import type { Project } from './types';

/**
 * The project index. Array order is display order.
 *
 * A project with an empty `sections` array renders as an index row with no
 * case-study link. That is the honest state for work that does not yet have a
 * written case study, and it avoids shipping a page of filler.
 */
export const PROJECTS: Project[] = [
  {
    index: '01',
    slug: 'terranova',
    title: 'TerraNova',
    purpose: 'Visual tooling for Hytale world generation.',
    pitch:
      'Build Hytale terrain by connecting nodes instead of editing JSON, and watch the world change as you drag the numbers.',
    audience: 'For Hytale world builders',
    status: 'active-alpha',
    stack: ['TypeScript', 'Tauri', 'Rust'],
    version: 'v0.5',
    build: '2026.08',
    updated: '04 Aug 2026',
    meta: {
      type: 'Desktop application',
      role: 'Contributor (systems, tooling, UI)',
      platform: ['Windows', 'macOS', 'Linux'],
      source: 'open-source',
      started: '2026',
      repo: {
        label: 'HyperSystems-Development/TerraNova',
        href: 'https://github.com/HyperSystems-Development/TerraNova',
      },
    },
    preview: {
      alt: 'TerraNova node graph editor with a live terrain preview.',
      width: 1600,
      height: 1000,
      callouts: [],
    },
    sections: [
      {
        id: 'context',
        label: 'Context',
        heading: 'Context',
        kind: 'prose',
        body: [
          'Hytale world generation is configured through JSON templates. The format is expressive, and it is also unforgiving: a template is a deeply nested description of noise fields, curve transforms, and terrain combinators, and nothing about reading it tells you what the terrain will look like.',
          'The practical workflow before TerraNova was to edit the JSON, restart a server, fly around, and guess at which number to change. Iteration cost was measured in minutes per attempt, which is high enough that most creators stop exploring and settle for whatever they got early.',
          'TerraNova is built inside HyperSystems Development as an open-source desktop application. I contribute on systems, tooling, and interface.',
        ],
      },
      {
        id: 'problem',
        label: 'Problem',
        heading: 'Problem',
        kind: 'list',
        body: [
          'Three things make hand-authored worldgen templates hard, and they compound:',
        ],
        items: [
          'The template is a graph, but JSON presents it as a tree. Nodes that feed several consumers appear once and are referenced by name, so the actual data flow is invisible in the file.',
          'Feedback is detached from the edit. The result of a change appears in a different process, after a restart, at a location you have to navigate to.',
          'Invalid templates fail late. A schema mistake surfaces as a server-side error well after the edit that caused it, with no pointer back to the offending node.',
        ],
      },
      {
        id: 'system',
        label: 'System',
        heading: 'System',
        kind: 'prose',
        body: [
          'TerraNova treats the template as what it already is: a directed graph. Noise generators, curve transforms, and terrain combinators are nodes; the connections between them are the data flow that JSON was hiding.',
          'Editing happens in the graph. The preview renders from the same graph, so the feedback loop closes inside one window. Export writes the JSON, and the Bridge plugin hot-reloads it into a running Hytale server, which removes the restart from the loop entirely.',
          'Validation runs against the Hytale worldgen schema before export rather than after, so schema errors are attributable to a node while you are still looking at it.',
        ],
      },
      {
        id: 'interface',
        label: 'Interface',
        heading: 'Interface',
        kind: 'shots',
        body: [
          'The window is three panes: the graph you are editing, the terrain that graph produces, and the parameters of whatever is selected. Nothing is behind a mode switch, because the point is to see the cause and the effect at the same time.',
        ],
        shots: [
          {
            alt: 'TerraNova editor with the node graph, live terrain preview, and inspector visible at once.',
            width: 1600,
            height: 1000,
            caption: 'The editor. Graph, preview, and inspector share one window.',
            callouts: [
              { index: '01', label: 'Node graph', x: 26, y: 42 },
              { index: '02', label: 'Live preview', x: 66, y: 34 },
              { index: '03', label: 'Inspector', x: 88, y: 56 },
              { index: '04', label: 'Validation strip', x: 50, y: 88 },
            ],
          },
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        heading: 'Architecture',
        kind: 'diagram',
        body: [
          'The editor is TypeScript in a Tauri shell. Generation and preview rendering are Rust, because the preview has to keep up with a parameter being dragged. Export and validation sit between them, and the Bridge plugin carries the result into a live server.',
        ],
        diagram: {
          description:
            'A five-stage pipeline. The node graph editor feeds the generation core, which feeds the preview renderer. The graph also feeds schema validation, which produces the JSON export, which the Bridge plugin hot-reloads into a running Hytale server.',
          nodes: [
            { id: 'graph', label: 'Node graph editor', note: 'TypeScript / Tauri' },
            { id: 'core', label: 'Generation core', note: 'Rust' },
            { id: 'preview', label: 'Preview renderer', note: 'Rust' },
            { id: 'validate', label: 'Schema validation', note: 'Pre-export' },
            { id: 'bridge', label: 'Bridge plugin', note: 'Hot-reload into a live server' },
          ],
          edgeLabels: ['graph state', 'height + density fields', 'export request', 'validated .json'],
        },
      },
      {
        id: 'development',
        label: 'Development',
        heading: 'Development history',
        kind: 'timeline',
        body: [
          'TerraNova is in alpha and shipping on a regular cadence. The entries below are the releases that changed how the tool is used, not every build.',
        ],
        timeline: [
          {
            marker: 'Alpha 3',
            date: '2026',
            title: 'Node graph editor',
            detail: 'Replaced hand-edited JSON with a visual graph as the primary authoring surface.',
          },
          {
            marker: 'Alpha 4',
            date: '2026',
            title: 'Bridge plugin',
            detail: 'Hot-reload into a running Hytale server, removing the restart from the iteration loop.',
          },
          {
            marker: 'Alpha 4.x',
            date: '2026',
            title: 'Pre-export schema validation',
            detail: 'Templates are checked against the Hytale worldgen schema before they leave the editor.',
          },
          {
            marker: 'Alpha 4.x',
            date: '2026',
            title: 'Preview rewrite',
            detail: 'Preview moved onto the generation core so what you see matches what exports.',
          },
          {
            marker: 'Alpha 5',
            date: 'In progress',
            title: 'Preview accuracy and density-field inspection',
            current: true,
          },
        ],
      },
      {
        id: 'limitations',
        label: 'Limitations',
        heading: 'Limitations',
        kind: 'list',
        body: ['Known and accepted, as of the current alpha:'],
        items: [
          'The preview approximates. It is close enough to make decisions from, and it is not a substitute for loading the world.',
          'The Bridge plugin requires a server you control. There is no path for hot-reloading into a server you are only a player on.',
          'Very large graphs slow the editor before they slow generation. The bottleneck is graph layout, not terrain.',
          'Hytale itself is a moving target. Schema changes upstream can invalidate templates that were valid at export time.',
        ],
      },
      {
        id: 'next',
        label: 'Next',
        heading: 'Next milestone',
        kind: 'prose',
        body: [
          'Alpha 5 is about trusting the preview. That means narrowing the gap between the preview renderer and the generation core, and making density fields inspectable so the numbers behind a piece of terrain can be read directly rather than inferred from its shape.',
        ],
      },
    ],
  },

  {
    index: '02',
    slug: 'abridgd',
    title: 'Abridgd',
    purpose: 'Finite local-news reading.',
    pitch:
      'Read your local news and actually reach the end of it. No infinite feed, no national stories crowding out the ones near you.',
    audience: 'For people who want to stay local and stop scrolling',
    status: 'active-development',
    stack: ['React Native', 'Expo'],
    meta: {
      type: 'Mobile application',
      role: 'Developer / Product designer',
      platform: ['iOS', 'Android'],
      source: 'private',
      started: '2026',
    },
    preview: {
      alt: 'Abridgd reading view showing a finite daily set of local stories.',
      width: 1200,
      height: 1500,
      callouts: [],
    },
    sections: [
      {
        id: 'context',
        label: 'Context',
        heading: 'Context',
        kind: 'prose',
        body: [
          'Local news apps inherited the infinite feed from social platforms, where the goal is to never end. Local news has the opposite property: on any given day there is a finite amount of it, and a reader can actually get to the end.',
          'Abridgd is built around that. The day has a bottom, and reaching it is the point.',
        ],
      },
      {
        id: 'problem',
        label: 'Problem',
        heading: 'Problem',
        kind: 'list',
        items: [
          'An infinite feed cannot tell you that you are caught up, so it never lets you stop deliberately.',
          'Ranking by engagement pushes local coverage under national coverage, because national stories always win on volume.',
          'Reading happens in places without a connection. An app that assumes the network fails exactly when it is being used.',
        ],
      },
      {
        id: 'next',
        label: 'Next',
        heading: 'Next milestone',
        kind: 'prose',
        body: [
          'Current work is reworking the information architecture and offline behavior: what gets kept on device, what happens at the boundary between a cached set and a stale one, and how the app says that plainly instead of failing quietly.',
        ],
      },
    ],
  },

  {
    index: '03',
    slug: 'field-kit',
    title: 'Field Kit',
    purpose: 'Local-first ingest and triage for photographic work.',
    pitch:
      'Get cards off a shoot and onto disk without wondering whether everything made it. Nothing leaves the machine.',
    audience: 'For photographers back from a shoot',
    status: 'prototype',
    stack: ['TypeScript', 'Node'],
    meta: {
      type: 'Desktop tooling',
      role: 'Developer',
      platform: ['macOS'],
      source: 'private',
      started: '2026',
    },
    sections: [],
  },

  {
    index: '04',
    slug: 'experiments',
    title: 'Experiments',
    purpose: 'Smaller tools and prototypes that do not warrant a case study.',
    pitch: 'Things I built to answer a question, kept around because they still work.',
    status: 'research',
    stack: ['Various'],
    meta: {
      type: 'Assorted',
      role: 'Developer',
      platform: ['Various'],
      source: 'private',
      started: '2026',
    },
    sections: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

/** Projects with a written case study, and therefore a route. */
export const PROJECTS_WITH_CASE_STUDIES = PROJECTS.filter(
  (project) => project.sections.length > 0,
);
