# Security Checklist & Hardening Guide

This document provides a comprehensive security checklist for the McCal Media Website repository. Use this as a recurring audit tool and onboarding reference.

## 🎯 Security Posture: Current Status

**Last Updated:** 2026-01-24  
**Overall Risk Level:** Low to Moderate

### What's Done Well ✅
- GitHub secrets properly configured and used in workflows
- `.env.example` documents all required environment variables
- `.gitignore` properly excludes sensitive files (`.env`, credentials files)
- Security policy (`SECURITY.md`) with responsible disclosure process
- Path traversal protection in dev server
- Dependency vulnerability monitoring via npm audit

### Areas Requiring Attention ⚠️
- Production security headers should be enforced
- Rate limiting is documented but not implemented in dev server
- CSP headers need refinement based on actual resource usage
- No automated dependency scanning in CI/CD

---

## 🔐 1. Secrets & Sensitive Data

### ✅ Implemented
- [x] No hardcoded API keys, tokens, or passwords in source code
- [x] `.env` files excluded via `.gitignore`
- [x] `.env.example` documents required variables without sensitive values
- [x] GitHub Actions use `secrets.*` context for credentials
- [x] Service account JSON files excluded via `.gitignore`

### 📋 Checklist
- [ ] **Regular Audit**: Run `grep -r "password\|api[_-]key\|secret\|token" --include="*.js" --exclude-dir=node_modules .` quarterly
- [ ] **Secret Rotation**: Rotate `BLOG_JWT_SECRET`, `WEBHOOK_SECRET`, and `SESSION_SECRET` annually
- [ ] **Cloudflare Tokens**: Ensure `CLOUDFLARE_API_TOKEN` has minimal required permissions
- [ ] **AWS Credentials**: If using S3, use IAM roles instead of access keys when possible

### 🔧 Best Practices
```javascript
// ✅ GOOD: Use environment variables
const secret = process.env.JWT_SECRET;

// ❌ BAD: Hardcoded secrets
const secret = 'my-secret-key-123';
```

---

## 📦 2. Dependency & Supply Chain Security

### ✅ Implemented
- [x] `package-lock.json` committed for reproducible builds
- [x] npm audit run during development
- [x] Dependencies reviewed before adding

### 📋 Checklist
- [ ] **Monthly Audit**: Run `npm audit` and fix high/critical vulnerabilities
- [ ] **Dependabot**: Enable GitHub Dependabot for automated vulnerability alerts
- [ ] **Package Review**: Before adding new packages, check:
  - Package download count (>100k/week preferred)
  - Last publish date (< 1 year ago preferred)
  - GitHub stars and maintenance status
  - Known vulnerabilities via `npm audit`
- [ ] **Version Pinning**: Use exact versions for production dependencies

### 🔧 Commands
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (use with caution)
npm audit fix

# Check for outdated packages
npm outdated
```

---

## 🌐 3. Frontend Security

### ✅ Implemented
- [x] Security headers added to dev-server.js:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` to disable unnecessary features
- [x] Content Security Policy (CSP) configured for production mode
- [x] CORS properly configured (permissive in dev, restrictive in prod)

### 📋 Checklist
- [ ] **DOM Manipulation**: Review all uses of `innerHTML`, `outerHTML` for XSS risks
- [ ] **User Input**: Sanitize and validate all user-provided data
- [ ] **React Security**: Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- [ ] **CSP Refinement**: Test and refine CSP headers based on actual resource usage
- [ ] **Subresource Integrity**: Add SRI hashes for external scripts (CDN resources)

### 🔧 CSP Configuration
Current CSP (Production mode in `dev-server.js`):
```javascript
"default-src 'self'; " +
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
"font-src 'self' https://fonts.gstatic.com data:; " +
"img-src 'self' data: https: blob:; " +
"connect-src 'self' https://api.mcc-cal.com; " +
"frame-ancestors 'none'"
```

**TODO**: Remove `'unsafe-inline'` and `'unsafe-eval'` by:
1. Moving inline scripts to external files
2. Using CSP nonces or hashes for required inline scripts
3. Avoiding `eval()` in production code

---

## 🔒 4. Backend / API Security

### ✅ Implemented
- [x] Authentication for blog endpoints (JWT-based)
- [x] Webhook secret validation for cache invalidation
- [x] CORS configuration supports wildcard subdomains

### 📋 Checklist
- [ ] **Input Validation**: Validate all API inputs (type, length, format)
- [ ] **Rate Limiting**: Implement rate limiting for API endpoints
  - Cloudflare Worker has basic rate limiting
  - Dev server lacks rate limiting (by design, for local use)
- [ ] **Authentication**: Review JWT token expiration (currently in Cloudflare Worker)
- [ ] **Authorization**: Ensure proper permission checks for all protected endpoints
- [ ] **Error Handling**: Don't leak sensitive information in error messages
- [ ] **SQL Injection**: Use parameterized queries if database is added

### 🔧 Rate Limiting Configuration
For production (Cloudflare Worker):
- **Max Requests**: 100 per minute (configurable via `RATE_LIMIT_MAX`)
- **Window**: 60 seconds (configurable via `RATE_LIMIT_WINDOW`)

---

## ⚙️ 5. Configuration & Infrastructure

### ✅ Implemented
- [x] `.env` files not committed
- [x] Minimal permissions in GitHub Actions workflows
- [x] Separate dev/production environments
- [x] GitHub Actions uses `contents: read` by default

### 📋 Checklist
- [ ] **Production Flags**: Ensure `DEBUG=false` in production
- [ ] **GitHub Actions**: Review workflow permissions (use least privilege)
- [ ] **Environment Variables**: Document all env vars in `.env.example`
- [ ] **Secure Defaults**: Default to secure settings (e.g., `FORCE_HTTPS=true` in production)
- [ ] **Error Logging**: Configure logging to exclude sensitive data

### 🔧 Environment Variables Security
**Critical Variables** (Must be set in production):
- `BLOG_JWT_SECRET` - Strong random string (32+ chars)
- `WEBHOOK_SECRET` - Strong random string (32+ chars)
- `SESSION_SECRET` - Strong random string (32+ chars)

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 6. Error Handling & Logging

### ✅ Implemented
- [x] Graceful error handling in dev server
- [x] Security warnings logged for suspicious requests

### 📋 Checklist
- [ ] **Stack Traces**: Don't expose stack traces in production
- [ ] **Sensitive Data**: Redact passwords, tokens, API keys from logs
- [ ] **Log Rotation**: Implement log rotation for long-running services
- [ ] **Monitoring**: Set up error monitoring (e.g., Sentry if configured)

### 🔧 Safe Logging Example
```javascript
// ✅ GOOD: Sanitized logging
console.log('User login attempt:', { username: user.username });

// ❌ BAD: Logs password
console.log('Login data:', req.body); // may contain password
```

---

## 📚 7. Repository Hygiene

### ✅ Implemented
- [x] `SECURITY.md` with responsible disclosure guidelines
- [x] `.gitignore` properly configured
- [x] `CHANGELOG.md` maintained

### 📋 Checklist
- [ ] **Security Policy**: Review and update `SECURITY.md` annually
- [ ] **Vulnerability Disclosure**: Test the disclosure process
- [ ] **Changelog**: Document security fixes in `CHANGELOG.md`
- [ ] **Access Control**: Review GitHub repository collaborators quarterly
- [ ] **Branch Protection**: Enable branch protection on `main` branch
  - Require pull request reviews
  - Require status checks to pass
  - Restrict force pushes

---

## 🛡️ 8. Development Workflow Security

### 📋 Checklist
- [ ] **Code Review**: All PRs should be reviewed by at least one person
- [ ] **Pre-commit Hooks**: Use Husky hooks to prevent committing secrets
- [ ] **Linting**: Run ESLint with security rules
- [ ] **Automated Tests**: Include security-focused tests
- [ ] **CI/CD**: Run security checks in GitHub Actions

### 🔧 Recommended GitHub Actions
Add these workflows:
1. **CodeQL Analysis** - Automated security scanning
2. **npm audit** - Dependency vulnerability scanning
3. **Secret Scanning** - Detect committed secrets (enable in GitHub settings)

---

## 🚨 Critical Security Configurations

### Development Server Security (`dev-server.js`)

**CRITICAL**: The `__start_next` endpoint can spawn processes:
- **Default**: DISABLED (requires `DEV_SERVER_ALLOW_START=true`)
- **Risk**: Remote Code Execution if exposed to untrusted networks
- **Mitigation**: Only enable in local development, never in production
- **Recommendation**: Bind dev server to `127.0.0.1` (localhost only) by default

```bash
# Safe development (localhost only)
HOST=127.0.0.1 npm run dev

# UNSAFE: Binding to all interfaces
HOST=0.0.0.0 npm run dev  # ⚠️ Only on trusted networks!
```

### Cloudflare Worker Security

The Cloudflare Worker (`tools/cloudflare/worker.js`) includes:
- JWT authentication for blog endpoints
- HMAC webhook verification
- Rate limiting per IP
- CORS validation

**Regular Maintenance**:
- Review and update `ALLOWED_ORIGINS` as domains change
- Rotate `JWT_SECRET` and `WEBHOOK_SECRET` annually
- Monitor rate limit effectiveness

---

## 🔄 Security Audit Schedule

| Frequency | Task |
|-----------|------|
| **Daily** | Automated CI/CD security checks |
| **Weekly** | Review GitHub security alerts |
| **Monthly** | Run `npm audit` and update dependencies |
| **Quarterly** | Full security audit using this checklist |
| **Annually** | Rotate all secrets and tokens |
| **Annually** | Review and update SECURITY.md |

---

## 🆘 Security Incident Response

If a security vulnerability is discovered:

1. **Contain**: Immediately rotate any compromised credentials
2. **Assess**: Determine scope and impact
3. **Fix**: Develop and test a fix
4. **Deploy**: Roll out fix to production
5. **Disclose**: Follow responsible disclosure in SECURITY.md
6. **Document**: Update CHANGELOG.md with security advisory

---

## 📖 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [npm Security Best Practices](https://docs.npmjs.com/about-security-best-practices)

---

## 🔍 Quick Security Audit Commands

Run these commands periodically to check for issues:

```bash
# Check for hardcoded secrets
grep -r "password\|api[_-]key\|secret\|token" --include="*.js" --exclude-dir=node_modules . | grep -v "process.env" | grep -v ".env.example"

# Check for vulnerable dependencies
npm audit

# Check for outdated dependencies
npm outdated

# Check for large files that shouldn't be committed
find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.git/*"

# Verify .gitignore is working
git status --ignored

# Check for files with overly permissive permissions (Unix/Linux)
find . -type f -perm -o+w -not -path "*/node_modules/*" -not -path "*/.git/*"
```

---

**Maintained by:** McCal Media Security Team  
**Last Security Audit:** 2026-01-24  
**Next Scheduled Audit:** 2026-04-24
