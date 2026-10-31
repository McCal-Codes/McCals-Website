/**
 * Conventional Commits, enforced.
 *
 * 44 of the 60 commits before this landed already used the format, so this
 * records a habit rather than imposing one. The value is not tidiness: a
 * machine-readable history is what lets release notes be generated from it
 * later, and it makes `git log --grep '^fix'` answer a real question.
 *
 * The ignores below are the commits nobody hand-writes. Without them this would
 * fail on traffic the repository generates itself, and a check that fails on
 * its own automation gets bypassed until it means nothing.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    // GitHub writes these; their format is not ours to choose.
    (message) => /^Merge (branch|pull request|remote-tracking branch)/.test(message),
    (message) => /^Revert "/.test(message),
    // The SEO workflow and the manifest jobs commit under their own wording.
    (message) => /\[automated\]/.test(message),
    (message) => /^(chore: )?🔄 /.test(message),
    // Dependabot's configured prefixes are `deps` and `deps-dev`. The hyphen in
    // the second one is not a valid Conventional Commits type character, so the
    // parser rejects the header outright rather than reporting an unknown type.
    // Verified: `deps(scope): x` passes and `deps-dev(scope): x` does not.
    // Its messages are machine-written, so they are ignored for the same reason
    // the automated commits above are.
    (message) => /^deps(-dev)?[(:]/.test(message),
  ],
  rules: {
    // Squash merges take the pull request title, which reads as a sentence and
    // is often longer than 72 characters. Raised rather than removed so a
    // genuinely runaway subject still fails.
    'header-max-length': [2, 'always', 120],
    // This repository writes subjects as sentences and capitalises proper nouns
    // ("WebGL slide dissolve..."), which the default rule rejects as
    // sentence-case. Enforcing lower-case here would mean rewriting a house
    // style that reads perfectly well, so the rule is off rather than fought.
    'subject-case': [0],
    // The default list plus the scopes this repository actually uses.
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'deps',
        'security',
        'seo',
        'a11y',
      ],
    ],
  },
};
