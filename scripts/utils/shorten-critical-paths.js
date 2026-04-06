#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = process.cwd();

const FOLDER_RENAMES = [
  {
    from: 'src/images/Portfolios/Events/browns-tailgate',
    to: 'src/images/Portfolios/Events/browns-tailgate',
  },
  {
    from: 'src/images/Portfolios/Events/ravens-tailgate',
    to: 'src/images/Portfolios/Events/ravens-tailgate',
  },
  {
    from: 'src/images/Portfolios/Events/psf-dance-recital',
    to: 'src/images/Portfolios/Events/psf-dance-recital',
  },
  {
    from: 'src/images/Portfolios/Events/pitt-winter-grad-2024',
    to: 'src/images/Portfolios/Events/pitt-winter-grad-2024',
  },
  {
    from: 'src/images/Portfolios/Events/pitt-grad-w24',
    to: 'src/images/Portfolios/Events/pitt-grad-w24',
  },
  {
    from: 'src/images/Portfolios/Events/guy-hates-musicals',
    to: 'src/images/Portfolios/Events/guy-hates-musicals',
  },
  {
    from: 'src/images/Portfolios/Events/pennhills-reunion-5',
    to: 'src/images/Portfolios/Events/pennhills-reunion-5',
  },
  {
    from: 'src/images/Portfolios/Events/union-officers-conf-2025',
    to: 'src/images/Portfolios/Events/union-officers-conf-2025',
  },
  {
    from: 'src/images/Portfolios/Events/bond-party-2023',
    to: 'src/images/Portfolios/Events/bond-party-2023',
  },
  {
    from: 'src/images/Portfolios/Journalism/Events/historic-yard-sale-0825',
    to: 'src/images/Portfolios/Journalism/Events/historic-yard-sale-0825',
  },
  {
    from: 'src/images/Portfolios/Journalism/Events/brentwood-4th-2025',
    to: 'src/images/Portfolios/Journalism/Events/brentwood-4th-2025',
  },
];

const JOURNALISM_ALIAS_REPLACEMENTS = [
  ['Politics/kamala-pittsburgh', 'Politics/kamala-pittsburgh'],
  ['Politics/scarlett-canvas', 'Politics/scarlett-canvas'],
  ['Politics/clinton-pitt-greensburgh', 'Politics/clinton-pitt-greensburgh'],
  ['Politics/jdvance-johnstown', 'Politics/jdvance-johnstown'],
  ['Politics/kamala-arrives-johnstown', 'Politics/kamala-arrives-johnstown'],
  ['Politics/kamala-erie', 'Politics/kamala-erie'],
  ['Politics/kamala-speaks-erie', 'Politics/kamala-speaks-erie'],
  ['Politics/obama-speaks-pitt', 'Politics/obama-speaks-pitt'],
  ['Politics/obama-pittsburgh', 'Politics/obama-pittsburgh'],
  ['Politics/timwaltz-erie', 'Politics/timwaltz-erie'],
  ['Politics/trump-rally-erie', 'Politics/trump-rally-erie'],
  ['Politics/trump-returns-butler', 'Politics/trump-returns-butler'],
  ['Politics/vp-debate-party', 'Politics/vp-debate-party'],
  ['Politics/globe-political-coverage', 'Politics/globe-political-coverage'],
  ['Politics/jdvance-johnstown-2', 'Politics/jdvance-johnstown-2'],
  ['Politics/butler-protest', 'Politics/butler-protest'],
  ['Politics/cmu-trump-protest', 'Politics/cmu-trump-protest'],
  ['Politics/pitt-palestine-protest', 'Politics/pitt-palestine-protest'],
];

const FILE_TRANSFORMS = [
  {
    dir: 'src/images/Portfolios/Events/browns-tailgate',
    rename(filename) {
      return filename.replace(
        /^241208_browns-tailgate_/,
        '241208_browns-tailgate_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Events/ravens-tailgate',
    rename(filename) {
      return filename.replace(
        /^241117_ravens-tailgate_/,
        '241117_ravens-tailgate_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Events/psf-dance-recital',
    rename(filename) {
      return filename.replace(
        /^240722_Penn State Fayette Dance Recital _([0-9]+)_CAL_Compressed\.(jpg|webp)$/i,
        '240722_psf-recital_CAL$1_c.$2',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Events/pitt-winter-grad-2024',
    rename(filename) {
      return filename.replace(
        /^241218_pitt-grad-w24_/,
        '241218_pitt-grad-w24_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Events/pitt-grad-w24',
    rename(filename) {
      return filename.replace(
        /^241218_pitt-grad-w24_/,
        '241218_pitt-grad-w24_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Events/historic-yard-sale-0825',
    rename(filename) {
      return filename.replace(/^250802_yardsale_/, '250802_yardsale_');
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Events/brentwood-4th-2025',
    rename(filename) {
      return filename.replace(/^250704_brentwood4th_/, '250704_brentwood4th_');
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Politics/kamala-pittsburgh',
    rename(filename) {
      return filename.replace(
        /^241104_kamala-pgh-eve_/,
        '241104_kamala-pgh-eve_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Politics/trump-returns-butler',
    rename(filename) {
      return filename.replace(
        /^051024_trump-butler_/,
        '051024_trump-butler_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Politics/kamala-arrives-johnstown',
    rename(filename) {
      return filename.replace(
        /^240915_Kamala Arrival in Johnstown_([0-9]+)_CAL_HighResolution\.(jpg|webp)$/i,
        '240915_kamala-jtown_$1_CAL_hr.$2',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Politics/clinton-pitt-greensburgh',
    rename(filename) {
      return filename.replace(
        /^241029_clinton-pitt_/,
        '241029_clinton-pitt_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Politics/globe-political-coverage',
    rename(filename) {
      return filename.replace(
        /^231107_globe-politics_/,
        '231107_globe-politics_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Politics/timwaltz-erie',
    rename(filename) {
      return filename.replace(
        /^timwaltz-erie_/,
        'timwaltz-erie_',
      );
    },
  },
  {
    dir: 'src/images/Portfolios/Journalism/Politics/scarlett-canvas',
    rename(filename) {
      return filename.replace(
        /^241103_scarlett-canvas_/,
        '241103_scarlett-canvas_',
      );
    },
  },
];

const TEXT_STRING_REPLACEMENTS = [
  ['241208_browns-tailgate_', '241208_browns-tailgate_'],
  ['241117_ravens-tailgate_', '241117_ravens-tailgate_'],
  ['241218_pitt-grad-w24_', '241218_pitt-grad-w24_'],
  ['250802_yardsale_', '250802_yardsale_'],
  ['250704_brentwood4th_', '250704_brentwood4th_'],
  ['241104_kamala-pgh-eve_', '241104_kamala-pgh-eve_'],
  ['051024_trump-butler_', '051024_trump-butler_'],
  ['241029_clinton-pitt_', '241029_clinton-pitt_'],
  ['231107_globe-politics_', '231107_globe-politics_'],
  ['timwaltz-erie_', 'timwaltz-erie_'],
  ['241103_scarlett-canvas_', '241103_scarlett-canvas_'],
];

const TEXT_REGEX_REPLACEMENTS = [
  {
    pattern: /240722_Penn State Fayette Dance Recital _([0-9]+)_CAL_Compressed\.(jpg|webp)/g,
    replace: '240722_psf-recital_CAL$1_c.$2',
  },
  {
    pattern: /240915_Kamala Arrival in Johnstown_([0-9]+)_CAL_HighResolution\.(jpg|webp)/g,
    replace: '240915_kamala-jtown_$1_CAL_hr.$2',
  },
];

const TEXT_ROOTS = [
  'src',
  'sites',
  'scripts',
  'admin',
  'fix-long-paths.ps1',
];

const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.html',
  '.md',
  '.mjs',
  '.cjs',
  '.ps1',
  '.yml',
  '.yaml',
  '.txt',
]);

function repoPath(...parts) {
  return path.join(REPO_ROOT, ...parts);
}

function exists(relPath) {
  return fs.existsSync(repoPath(relPath));
}

function gitMove(from, to) {
  execFileSync('git', ['mv', from, to], { cwd: REPO_ROOT, stdio: 'inherit' });
}

function collectTextFiles(relPath, output) {
  const absPath = repoPath(relPath);
  if (!fs.existsSync(absPath)) {
    return;
  }

  const stats = fs.statSync(absPath);
  if (stats.isFile()) {
    if (TEXT_EXTENSIONS.has(path.extname(relPath).toLowerCase())) {
      output.push(relPath.replace(/\\/g, '/'));
    }
    return;
  }

  for (const entry of fs.readdirSync(absPath, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
      continue;
    }

    const child = path.posix.join(relPath.replace(/\\/g, '/'), entry.name);
    if (entry.isDirectory()) {
      collectTextFiles(child, output);
      continue;
    }

    if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      output.push(child);
    }
  }
}

function applyTextReplacements(replacements, regexReplacements) {
  const files = [];
  for (const root of TEXT_ROOTS) {
    collectTextFiles(root, files);
  }

  let changedFiles = 0;
  for (const relFile of files) {
    const absFile = repoPath(relFile);
    const original = fs.readFileSync(absFile, 'utf8');
    let updated = original;

    for (const [from, to] of replacements) {
      if (!from || from === to) {
        continue;
      }

      updated = updated.split(from).join(to);
    }

    for (const { pattern, replace } of regexReplacements) {
      updated = updated.replace(pattern, replace);
    }

    if (updated !== original) {
      fs.writeFileSync(absFile, updated, 'utf8');
      changedFiles += 1;
    }
  }

  return changedFiles;
}

function addReplacement(replacements, from, to) {
  if (!from || !to || from === to) {
    return;
  }

  replacements.push([from.replace(/\\/g, '/'), to.replace(/\\/g, '/')]);
}

function main() {
  const replacements = [...JOURNALISM_ALIAS_REPLACEMENTS];

  for (const [from, to] of JOURNALISM_ALIAS_REPLACEMENTS) {
    const encodedFrom = from.split('/').map(encodeURIComponent).join('/');
    const encodedTo = to.split('/').map(encodeURIComponent).join('/');
    addReplacement(
      replacements,
      `images/Portfolios/Journalism/${encodedFrom}`,
      `images/Portfolios/Journalism/${encodedTo}`,
    );
  }

  for (const [from, to] of TEXT_STRING_REPLACEMENTS) {
    addReplacement(replacements, from, to);

    if (from.includes(' ')) {
      addReplacement(replacements, encodeURIComponent(from), encodeURIComponent(to));
    }
  }

  for (const { from, to } of FOLDER_RENAMES) {
    if (!exists(from) && exists(to)) {
      addReplacement(replacements, from, to);
      addReplacement(
        replacements,
        from.replace(/^src\/images\/Portfolios\//, ''),
        to.replace(/^src\/images\/Portfolios\//, ''),
      );
      continue;
    }

    if (!exists(from)) {
      continue;
    }

    if (exists(to)) {
      throw new Error(`Destination already exists: ${to}`);
    }

    gitMove(from, to);
    addReplacement(replacements, from, to);
    addReplacement(
      replacements,
      from.replace(/^src\/images\/Portfolios\//, ''),
      to.replace(/^src\/images\/Portfolios\//, ''),
    );
  }

  for (const transform of FILE_TRANSFORMS) {
    const absDir = repoPath(transform.dir);
    if (!fs.existsSync(absDir)) {
      continue;
    }

    const entries = fs
      .readdirSync(absDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.name.endsWith('.tmp'))
      .map((entry) => entry.name)
      .sort();

    for (const filename of entries) {
      const nextName = transform.rename(filename);
      if (!nextName || nextName === filename) {
        continue;
      }

      const from = path.posix.join(transform.dir, filename);
      const to = path.posix.join(transform.dir, nextName);

      if (exists(to)) {
        throw new Error(`Destination already exists: ${to}`);
      }

      gitMove(from, to);
    }
  }

  const changedFiles = applyTextReplacements(replacements, TEXT_REGEX_REPLACEMENTS);

  console.log(`Renamed ${FOLDER_RENAMES.filter(({ to }) => exists(to)).length} folders`);
  console.log(`Updated ${changedFiles} text files`);
}

main();
