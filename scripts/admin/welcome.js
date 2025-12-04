#!/usr/bin/env node

/**
 * Welcome Dashboard & TODO Auto-Checker
 *
 * Enhancements:
 * - Supports keyword-based and file-diff-based auto-checking of TODOs.
 * - To add a new keyword or file pattern, update the `AUTO_CHECK_MAP` below.
 * - If a commit message contains a keyword, or a changed file matches a pattern, the corresponding TODO is checked off.
 *
 * Example:
 *   'Close Button Optimization' keyword in commit message will check off any TODO containing that phrase.
 *   'src/widgets/site-navigation/' in changed files will check off TODOs mentioning 'Navigation Hiding pattern'.
 */
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
// Map of keywords and file patterns to TODO substring triggers
const AUTO_CHECK_MAP = [
  // Keyword-based
  { keyword: 'Close Button Optimization', todoMatch: 'Close Button Optimization' },
  { keyword: 'Navigation Hiding pattern', todoMatch: 'Navigation Hiding pattern' },
  { keyword: 'Filter Layout Fix', todoMatch: 'Filter Layout Fix' },
  { keyword: 'Minimal Status Indicators', todoMatch: 'Minimal Status Indicators' },
  { keyword: 'Version Indicator', todoMatch: 'Version Indicator' },
  // File-diff-based
  { file: 'src/widgets/site-navigation/', todoMatch: 'Navigation Hiding pattern' },
  { file: 'src/widgets/photojournalism-portfolio/', todoMatch: 'Close Button Optimization' },
  { file: 'src/widgets/podcast-feed/', todoMatch: 'version indicator pattern' },
  { file: 'src/widgets/site-footer/', todoMatch: 'version indicator' },
  // Add more as needed
];

const ROOT = process.cwd();
const TODO = path.join(ROOT, 'updates', 'todo.md');
const WELCOME = path.join(ROOT, 'updates', 'welcome.md');
const STATE = path.join(ROOT, 'scripts', '.welcome-state.json');

function sh(cmd) {
  return cp.execSync(cmd, { encoding: 'utf8' }).trim();
}

function safeRead(p, fallback = '') {
  try { return fs.readFileSync(p, 'utf8'); } catch { return fallback; }
}

function write(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
}

function parseChecklist(md) {
  const lines = md.split(/\r?\n/);
  const items = [];
  for (const line of lines) {
    const m = line.match(/^\s*[-*]\s*\[( |x|X)\]\s*(.+)$/);
    if (m) {
      items.push({ raw: line, done: m[1].toLowerCase() === 'x', text: m[2] });
    }
  }
  return items;
}


function autoCheck(todoText, commitMsg, changedFiles = []) {
  // Flip to done if a todo line ends with "(done)" or mentions the short hash in parentheses
  // or if its leading phrase is contained in the last commit message.
  const lines = todoText.split(/\r?\n/);
  let changed = false;

  const simplified = (s) => s.replace(/[`*_\[\]\(\)#:-]/g, '').toLowerCase().slice(0, 60);

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*[-*]\s*)\[( |x|X)\](\s*)(.+)$/);
    if (!m) continue;
    const prefix = m[1], mark = m[2], gap = m[3], body = m[4];

    if (/\(done( in [0-9a-f]{7,12})?\)$/i.test(body)) {
      if (mark !== 'x' && mark !== 'X') {
        lines[i] = `${prefix}[x]${gap}${body}`;
        changed = true;
      }
      continue;
    }

    // Heuristic: first 40 chars must appear in the commit message to auto-check
    const key = simplified(body).slice(0, 40);
    let shouldCheck = key.length >= 10 && simplified(commitMsg).includes(key);

    // Keyword-based auto-check
    for (const rule of AUTO_CHECK_MAP) {
      if (rule.keyword && commitMsg.toLowerCase().includes(rule.keyword.toLowerCase()) && body.toLowerCase().includes(rule.todoMatch.toLowerCase())) {
        shouldCheck = true;
      }
    }

    // File-diff-based auto-check
    for (const rule of AUTO_CHECK_MAP) {
      if (rule.file && changedFiles.some(f => f.includes(rule.file)) && body.toLowerCase().includes(rule.todoMatch.toLowerCase())) {
        shouldCheck = true;
      }
    }

    if (shouldCheck && mark !== 'x' && mark !== 'X') {
      lines[i] = `${prefix}[x]${gap}${body} (done)`;
      changed = true;
    }
  }
  return { text: lines.join('\n'), changed };
}


function main() {
  // Git data
  let lastHash = '';
  try { lastHash = sh('git rev-parse --short HEAD'); } catch { /* not a git repo */ }

  const lastMessage = lastHash ? sh('git log -1 --pretty=%B') : 'No VCS detected';
  const when = lastHash ? sh('git log -1 --date=relative --pretty=%cd') : new Date().toDateString();
  const files = lastHash ? sh('git show --name-only --pretty="" HEAD').split(/\r?\n/).filter(Boolean) : [];

  // Load todo and optionally auto-check
  let todo = safeRead(TODO, '');
  if (!todo) {
    todo = '# TODO\n\n- [ ] Start adding tasks here.\n';
  }

  const { text: maybeChecked, changed } = autoCheck(todo, lastMessage, files);
  if (changed) write(TODO, maybeChecked);
  const items = parseChecklist(maybeChecked);
  const open = items.filter(i => !i.done).length;
  const done = items.filter(i => i.done).length;

  // Cozy welcome (markdown)
  const header = [
    '# 👋 Welcome back, McCal!',
    '',
    `**Last commit**: \`${lastHash || '—'}\` — ${when}`,
    lastMessage ? `> ${lastMessage.split('\n').map(s => s.trim()).filter(Boolean)[0]}` : '',
    '',
    '## 🔄 Changes in last commit',
    files.length ? files.slice(0, 12).map(f => `- ${f}`).join('\n') : '- No file changes detected.',
    files.length > 12 ? `- …and ${files.length - 12} more` : '',
    '',
    '## 📋 Your checklist status',
    `- Open: **${open}** | Done: **${done}**`,
    '',
    '## 🎯 Today’s focus (from `updates/todo.md`)',
  ].filter(Boolean).join('\n');

  // Pull the “Priority 1…4” sections for quick agenda
  const agenda = maybeChecked
    .split(/\n(?=## )/g)
    .filter(s => /^## Priority [1-4]/.test(s))
    .map(s => s.split('\n').slice(0, 6).join('\n')) // header + first ~4 lines
    .join('\n\n');

  const footer = [
    '',
    '—',
    '_Tip: mark a line as done by adding `(done)` or `(done in <hash>)` at the end. The next open will auto-check it._',
    '_Tip: To pin this file in VS Code, right-click the tab and select "Pin". It will always be visible when you return!_',
    '_Tip: Run `npm run welcome:open` to quickly open this dashboard in your editor._',
    ''
  ].join('\n');

  write(WELCOME, `${header}\n\n${agenda}${footer}`);

  // Terminal summary (concise, readable)
  const termHeader = `\n👋 Welcome back, McCal!\nLast commit: ${lastHash || '—'} — ${when}`;
  const termMsg = lastMessage ? `> ${lastMessage.split('\n').map(s => s.trim()).filter(Boolean)[0]}` : '';
  const termFiles = files.length ? files.slice(0, 6).map(f => `- ${f}`).join('\n') : '- No file changes detected.';
  const termFilesMore = files.length > 6 ? `- …and ${files.length - 6} more` : '';
  const termChecklist = `Checklist: Open ${open} | Done ${done}`;
  // Only show first 3 priorities for brevity
  const termAgenda = maybeChecked
    .split(/\n(?=## )/g)
    .filter(s => /^## Priority [1-3]/.test(s))
    .map(s => {
      const lines = s.split('\n');
      return `${lines[0]}\n  ${lines.slice(1, 5).map(l => l.replace(/^- \[.\] /, '').replace(/^\s+/, '')).join('\n  ')}`;
    })
    .join('\n\n');
  const termFooter = '\n—\n💡 Tip: Run `npm run welcome:open` to view full dashboard in editor\n📌 Tip: Pin updates/welcome.md in VS Code for quick access\n🔧 Tip: Run `npm run setup` to configure git hooks\n';
  console.log([termHeader, termMsg, '', 'Files changed:', termFiles, termFilesMore, '', termChecklist, '', 'Today’s focus:', termAgenda, termFooter].filter(Boolean).join('\n'));

  // Save state
  write(STATE, JSON.stringify({ lastHash, lastMessage }, null, 2));
}

main();
