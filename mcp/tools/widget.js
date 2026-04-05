import fs from 'fs/promises';
import path from 'path';
import { PATHS, pathExists } from '../utils/paths.js';

export const widgetListTool = {
  name: 'widget_list',
  description: 'List all widgets in src/widgets/ with their versions and metadata',
  inputSchema: {
    type: 'object',
    properties: {
      filter: {
        type: 'string',
        description: 'Filter by widget name pattern (optional)',
        enum: ['all', 'terra', 'nova', 'navigation', 'shared'],
      },
    },
  },
};

export async function handleWidgetList(args = {}) {
  const filter = args.filter || 'all';

  try {
    const widgetsDir = PATHS.widgets;
    const exists = await pathExists(widgetsDir);

    if (!exists) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Widgets directory not found', path: widgetsDir }, null, 2),
          },
        ],
      };
    }

    const entries = await fs.readdir(widgetsDir, { withFileTypes: true });
    const widgets = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('_')) continue; // Skip _shared, _navigation for now
      if (entry.name.startsWith('.')) continue;

      const widgetPath = path.join(widgetsDir, entry.name);
      const widgetInfo = await analyzeWidget(entry.name, widgetPath);

      // Apply filter
      if (filter !== 'all') {
        const nameLower = entry.name.toLowerCase();
        if (filter === 'terra' && !nameLower.includes('terra')) continue;
        if (filter === 'nova' && !nameLower.includes('nova')) continue;
        if (filter === 'navigation' && !nameLower.includes('nav')) continue;
      }

      widgets.push(widgetInfo);
    }

    // Handle special folders
    if (filter === 'all' || filter === 'shared') {
      const sharedPath = path.join(widgetsDir, '_shared');
      if (await pathExists(sharedPath)) {
        widgets.unshift({
          name: '_shared',
          type: 'shared',
          path: 'src/widgets/_shared/',
          description: 'Shared utilities and components',
        });
      }
    }

    if (filter === 'all' || filter === 'navigation') {
      const navPath = path.join(widgetsDir, '_navigation');
      if (await pathExists(navPath)) {
        widgets.unshift({
          name: '_navigation',
          type: 'navigation',
          path: 'src/widgets/_navigation/',
          description: 'Navigation components',
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              count: widgets.length,
              filter: filter,
              widgets: widgets,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

async function analyzeWidget(name, widgetPath) {
  const versions = [];
  let hasReadme = false;
  let description = '';

  try {
    const entries = await fs.readdir(widgetPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.match(/^v\d+$/)) {
        const versionPath = path.join(widgetPath, entry.name);
        const versionFiles = await fs.readdir(versionPath);

        versions.push({
          version: entry.name,
          path: `src/widgets/${name}/${entry.name}/`,
          files: versionFiles.filter((f) => !f.startsWith('.')),
          hasJs: versionFiles.some((f) => f.endsWith('.js')),
          hasCss: versionFiles.some((f) => f.endsWith('.css')),
          hasHtml: versionFiles.some((f) => f.endsWith('.html')),
        });
      }

      if (entry.name.toLowerCase().includes('readme')) {
        hasReadme = true;
        try {
          const readmeContent = await fs.readFile(
            path.join(widgetPath, entry.name),
            'utf-8'
          );
          // Extract first line as description
          description = readmeContent.split('\n')[0].replace(/^#+\s*/, '');
        } catch {
          // Ignore readme read errors
        }
      }
    }

    // Sort versions
    versions.sort((a, b) => {
      const numA = parseInt(a.version.replace('v', ''));
      const numB = parseInt(b.version.replace('v', ''));
      return numB - numA; // Newest first
    });
  } catch {
    // Return basic info on error
  }

  return {
    name,
    path: `src/widgets/${name}/`,
    description,
    hasReadme,
    versions,
    versionCount: versions.length,
    latestVersion: versions[0]?.version || null,
  };
}
