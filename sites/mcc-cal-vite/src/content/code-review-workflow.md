# Code Review Workflow

## Overview

This workflow provides a systematic approach to code review for McCal Media Website, focusing on bug detection, performance optimization, security, and adherence to project conventions.

## Quick Start

```bash
# Navigate to Vite app
cd sites/mcc-cal-vite

# Run pre-review checks
npm run build
npm run lint
npm run test:e2e

# Check git state
git status
git diff --cached
```

## Review Process

### Phase 1: Automated Checks

#### Build Verification
```bash
npm run build
```

**Check for:**
- [ ] Build completes without errors
- [ ] TypeScript compilation passes
- [ ] No console warnings or errors
- [ ] Bundle size is reasonable
- [ ] No missing dependencies

#### Code Quality
```bash
npm run lint
```

**Check for:**
- [ ] No lint errors
- [ ] No new warnings introduced
- [ ] Code follows project conventions
- [ ] Proper TypeScript types

#### Testing
```bash
npm run test:e2e
```

**Check for:**
- [ ] All tests pass
- [ ] No skipped tests (unless intentional)
- [ ] Critical user flows covered

### Phase 2: Security Review

#### Authentication & Authorization
- [ ] No hardcoded secrets or API keys
- [ ] Proper JWT handling (if applicable)
- [ ] Environment variables properly configured
- [ ] No sensitive data in client-side code

#### Input Validation
- [ ] User inputs properly sanitized
- [ ] File upload restrictions in place
- [ ] XSS prevention measures
- [ ] CSRF protection where needed

#### API Security
- [ ] Rate limiting implemented
- [ ] Proper error handling (no information leakage)
- [ ] Secure headers configured
- [ ] HTTPS enforced in production

### Phase 3: Performance Review

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze
```

**Check for:**
- [ ] No unnecessary dependencies
- [ ] Tree shaking working correctly
- [ ] Large dependencies properly code-split
- [ ] Images optimized and lazy-loaded

#### Runtime Performance
- [ ] No memory leaks
- [ ] Efficient state management
- [ ] Proper caching strategies
- [ ] Minimal re-renders in React components

#### Loading Performance
- [ ] Critical CSS inlined
- [ ] Images properly optimized
- [ ] Font loading optimized
- [ ] No render-blocking resources

### Phase 4: Code Architecture Review

#### Component Design
- [ ] Single responsibility principle followed
- [ ] Props interface well-defined
- [ ] No prop drilling without reason
- [ ] Proper component composition

#### State Management
- [ ] State lifted appropriately
- [ ] No unnecessary global state
- [ ] Proper use of React hooks
- [ ] No state mutations

#### Error Handling
- [ ] Proper error boundaries
- [ ] Graceful fallbacks
- [ ] User-friendly error messages
- [ ] Error logging implemented

### Phase 5: Accessibility & UX Review

#### Accessibility
- [ ] Semantic HTML used correctly
- [ ] ARIA labels where needed
- [ ] Keyboard navigation supported
- [ ] Color contrast sufficient
- [ ] Screen reader compatibility

#### User Experience
- [ ] Loading states provided
- [ ] Feedback for user actions
- [ ] Consistent interaction patterns
- [ ] Mobile responsiveness maintained

### Phase 6: Content & Assets Review

#### Image Optimization
```bash
# Run image optimization
node scripts/optimize-images.js
```

**Check for:**
- [ ] Images properly compressed
- [ ] Correct formats used (WebP where supported)
- [ ] Responsive images implemented
- [ ] Alt text provided for all images

#### Content Integrity
- [ ] No broken image paths
- [ ] Manifest files updated
- [ ] Sitemap includes new routes
- [ ] Internal links working

### Phase 7: Git Hygiene Review

#### Commit Quality
- [ ] Commit message follows convention (use `/commit-message`)
- [ ] Commits are atomic and scoped
- [ ] No local noise files included
- [ ] Proper branching strategy followed

#### File Organization
- [ ] Files in correct directories
- [ ] No unused files
- [ ] Proper naming conventions
- [ ] No duplicate functionality

## Project-Specific Considerations

### Vite + React Architecture
- [ ] Proper use of Vite features (dynamic imports, etc.)
- [ ] React 19 best practices followed
- [ ] TypeScript properly configured
- [ ] Tailwind CSS used efficiently

### Portfolio System
- [ ] Manifest files correctly formatted
- [ ] Image paths consistent
- [ ] Gallery components optimized
- [ ] No broken portfolio links

### Deployment Readiness
- [ ] Environment variables documented
- [ ] Build artifacts correct
- [ ] No development-only code in production
- [ ] Vercel configuration updated if needed

## Common Issues to Check

### TypeScript Issues
```bash
# Check TypeScript errors
tsc --noEmit

# Verify imports
npm run lint
```

### Performance Issues
```bash
# Check bundle size
npm run build -- --analyze

# Lighthouse audit (if available)
npm run lighthouse
```

### Security Issues
```bash
# Check for secrets
grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/

# Verify environment variables
cat .env.example
```

## Review Checklist Summary

### Critical (Must Pass)
- [ ] Build succeeds
- [ ] Linting passes
- [ ] Tests pass
- [ ] No security vulnerabilities
- [ ] No performance regressions

### Important (Should Pass)
- [ ] Code follows project conventions
- [ ] Accessibility standards met
- [ ] Documentation updated
- [ ] No breaking changes

### Nice to Have
- [ ] Performance improvements
- [ ] Code organization improvements
- [ ] Additional test coverage
- [ ] Enhanced error handling

## Reporting Format

When providing review feedback, structure it as:

### 🐛 Bugs
- **Issue**: Description
- **Location**: File:Line
- **Impact**: Severity/Effect
- **Fix**: Suggested solution

### ⚠️ Issues
- **Concern**: Description
- **Location**: File:Line
- **Risk**: Potential impact
- **Recommendation**: Suggested improvement

### 💡 Suggestions
- **Improvement**: Description
- **Benefit**: Why it matters
- **Implementation**: How to implement

### ✅ Positive Notes
- **Good practice**: What was done well
- **Pattern**: Effective pattern used
- **Appreciation**: Acknowledgment of good work

## Integration with Other Workflows

This workflow integrates with:
- `/pre-commit` - Run before committing changes
- `/pre-deployment` - Run before deploying to production
- `/commit-message` - Ensure proper commit formatting
- `/image-optimization` - Optimize images before review
- Git hygiene guide: `docs/agents/git-hygiene.md`
- CI configuration: `.github/workflows/vercel-deployment-checks.yml`
- Project architecture: `docs/architecture/`
- Image optimization: `scripts/image-compress/`
- Bundle analysis: Available via `npm run build -- --analyze`

## Tools and Commands

```bash
# Full review suite
npm run build && npm run lint && npm run test:e2e

# Check specific files
npm run lint -- src/components/SpecificComponent.tsx

# Type checking
tsc --noEmit

# Bundle analysis
npm run build -- --analyze

# Image optimization
node scripts/optimize-images.js

# Manifest sync
node scripts/sync-manifests.js
```

## Related Documentation

- Pre-commit workflow: `/pre-commit`
- Pre-deployment workflow: `/pre-deployment`
- Commit message workflow: `/commit-message`
- Image optimization: `/image-optimization`
- Git hygiene guide: `docs/agents/git-hygiene.md`
- CI configuration: `.github/workflows/vercel-deployment-checks.yml`
- Project architecture: `docs/architecture/`
- Security best practices: `docs/standards/`
- Performance optimization: `docs/standards/`
- Image optimization: `scripts/image-compress/`
- Bundle analysis: Available via `npm run build -- --analyze`

## Usage Examples

### Quick Review
```bash
# Run pre-review checks and create report
npm run build && npm run lint && npm run test:e2e && node scripts/generate-review-report.js

# Security-focused review
npm run build && npm run lint && node scripts/security-audit.js

# Performance-focused review
npm run build -- --analyze && node scripts/performance-review.js
```

### Custom Review Scripts
You can create custom review scripts in `scripts/review/` directory and reference them in package.json:

```json
{
  "scripts": {
    "review:security": "node scripts/review/security-audit.js",
    "review:performance": "node scripts/performance-review.js",
    "review:accessibility": "node scripts/accessibility-review.js",
    "review:full": "node scripts/generate-review-report.js"
  }
}
```

## Best Practices

### Before Review
1. **Update dependencies** - Ensure all packages are latest
2. **Clean build** - Remove `dist/` and `.next/` before starting
3. **Git status** - Start from clean working directory
4. **Documentation** - Review relevant docs before making changes

### During Review
1. **Focus on one category at a time** - Don't try to review everything at once
2. **Document findings** - Use this workflow's reporting format
3. **Be constructive** - Focus on improvement, not criticism
4. **Test fixes** - Verify changes work as expected

### After Review
1. **Summary report** - Generate final review summary
2. **Action items** - Create specific TODOs for identified issues
3. **Follow up** - Check that fixes are implemented correctly

This workflow ensures consistent, thorough code reviews while maintaining development velocity.
