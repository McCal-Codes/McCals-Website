#!/usr/bin/env node
// Keyword and diff-based auto-checker for todo.md
// This module is intended to be imported by ai-finalize-session.js or run standalone for testing.
// It will scan commit messages and/or changed files for specific keywords or patterns and mark matching TODOs as done.

const fs = require('fs');
const path = require('path');

const TODO_FILE = path.join(__dirname, '../..', 'updates', 'todo.md');

// Map of keywords/phrases to regexes and the corresponding TODO text to mark as done
const KEYWORD_PATTERNS = [
  { keyword: /close button optimization/i, todo: /Close Button Optimization/ },
  { keyword: /navigation hiding pattern/i, todo: /Navigation Hiding pattern/ },
  { keyword: /filter layout fix/i, todo: /Filter Layout Fix/ },
  { keyword: /minimal status indicators?/i, todo: /Minimal Status Indicators/ },
  { keyword: /version indicator/i, todo: /Version Indicator/ },
  { keyword: /structured data/i, todo: /structured data/ },
  // Add more as needed
];

// Optionally, map file globs or folder names to TODOs for diff-based auto-checking
const FILE_PATTERNS = [
  { pattern: /site-navigation|lightbox/i, todo: /Navigation Hiding pattern/ },
  { pattern: /photojournalism-portfolio/i, todo: /Photojournalism Portfolio/ },
  // Add more as needed
];

function markTodosByKeywords(todoText, commitMsg) {
  let changed = false;
  for (const { keyword, todo } of KEYWORD_PATTERNS) {
    if (keyword.test(commitMsg)) {
      // Find the first unchecked TODO matching this pattern and mark it done
      todoText = todoText.replace(
        new RegExp(`(- \[ \] TODO:.*${todo.source}.*)`, 'i'),
        (m) => m.replace('- [ ]', '- [x]')
      );
      changed = true;
    }
  }
  return { todoText, changed };
}

function markTodosByFiles(todoText, changedFiles) {
  let changed = false;
  for (const { pattern, todo } of FILE_PATTERNS) {
    if (changedFiles.some(f => pattern.test(f))) {
      todoText = todoText.replace(
        new RegExp(`(- \[ \] TODO:.*${todo.source}.*)`, 'i'),
        (m) => m.replace('- [ ]', '- [x]')
      );
      changed = true;
    }
  }
  return { todoText, changed };
}

// Main function: pass commitMsg and/or changedFiles
function autoCheckTodos({ commitMsg = '', changedFiles = [] } = {}) {
  let todoText = fs.readFileSync(TODO_FILE, 'utf8');
  let changed = false;
  if (commitMsg) {
    const res = markTodosByKeywords(todoText, commitMsg);
    todoText = res.todoText;
    changed = changed || res.changed;
  }
  if (changedFiles.length) {
    const res = markTodosByFiles(todoText, changedFiles);
    todoText = res.todoText;
    changed = changed || res.changed;
  }
  if (changed) {
    fs.writeFileSync(TODO_FILE, todoText);
    console.log('✅ Updated todo.md with auto-checked items.');
  } else {
    console.log('No TODOs matched for auto-checking.');
  }
}

// Export for use in ai-finalize-session.js
module.exports = { autoCheckTodos };

// If run directly, allow testing with args
if (require.main === module) {
  const commitMsg = process.argv[2] || '';
  const changedFiles = process.argv[3] ? process.argv[3].split(',') : [];
  autoCheckTodos({ commitMsg, changedFiles });
}
