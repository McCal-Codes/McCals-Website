# 🔐 GitHub Actions Security Checklist

This document provides a security checklist specifically for GitHub Actions workflows to ensure secure CI/CD practices in the McCals-Website repository.

---

## Table of Contents

1. [Secrets Management](#secrets-management)
2. [Permissions & Access](#permissions--access)
3. [Action Versions & Supply Chain](#action-versions--supply-chain)
4. [Input Validation & Injection Prevention](#input-validation--injection-prevention)
5. [Workflow Triggers](#workflow-triggers)
6. [Artifact & Cache Security](#artifact--cache-security)
7. [Environment Configuration](#environment-configuration)
8. [Monitoring & Auditing](#monitoring--auditing)

---

## Secrets Management

### ✅ Required Practices

- [ ] **Use GitHub Secrets for sensitive data**
  ```yaml
  # ✅ CORRECT
  apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  
  # ❌ WRONG
  apiToken: bZ9xgH9Qu4FiuMq3tjn4GvtfpPk3D3yqcjMDQRpF
  ```

- [ ] **Never log secrets**
  ```yaml
  # ✅ CORRECT
  - name: Deploy
    run: echo "Deploying to production..."
    env:
      API_TOKEN: ${{ secrets.API_TOKEN }}
  
  # ❌ WRONG
  - name: Deploy
    run: echo "Using token $API_TOKEN"
    env:
      API_TOKEN: ${{ secrets.API_TOKEN }}
  ```

- [ ] **Use environment-specific secrets**
  - Production secrets: `PROD_*`
  - Staging secrets: `STAGING_*`
  - Development secrets: `DEV_*`

- [ ] **Rotate secrets regularly**
  - API tokens: Every 90 days
  - Deployment keys: Every 6 months
  - Webhook secrets: When team members leave

### 🔍 Current Status

✅ **Properly Configured:**
- `CLOUDFLARE_API_TOKEN` - Used correctly in deploy-worker.yml
- `GITHUB_TOKEN` - Automatically provided by GitHub
- `CF_WEBHOOK_SECRET` - Used for webhook validation

---

## Permissions & Access

### ✅ Required Practices

- [ ] **Use minimal permissions**
  ```yaml
  # ✅ CORRECT - Minimal permissions
  permissions:
    contents: read
    packages: write
  
  # ❌ WRONG - Overly permissive
  permissions: write-all
  ```

- [ ] **Specify permissions per job**
  ```yaml
  jobs:
    build:
      permissions:
        contents: read  # Only what this job needs
    
    deploy:
      permissions:
        contents: read
        deployments: write
  ```

- [ ] **Default to read-only**
  ```yaml
  # Top-level default
  permissions:
    contents: read
  
  jobs:
    # Override only where needed
    publish:
      permissions:
        contents: write
  ```

### 🔍 Current Repository Status

✅ **Following best practices:**
- Most workflows use `permissions: contents: read`
- No workflows use `permissions: write-all`

⚠️ **Review needed:**
- Check workflows that write to repository
- Ensure deploy workflows use minimal permissions

---

## Action Versions & Supply Chain

### ✅ Required Practices

- [ ] **Pin actions to specific versions**
  ```yaml
  # ✅ GOOD - Major version pinning
  uses: actions/checkout@v4
  
  # ✅ BETTER - Full version pinning
  uses: actions/checkout@v4.1.1
  
  # ✅ BEST - SHA pinning (critical workflows)
  uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
  
  # ❌ WRONG - Floating tag
  uses: actions/checkout@main
  ```

- [ ] **Use official GitHub actions when possible**
  - `actions/*` - Official GitHub actions
  - `github/*` - GitHub-maintained actions
  - Verified publishers with blue checkmark

- [ ] **Review third-party actions**
  - Check action source code
  - Review permissions required
  - Check maintainer reputation
  - Prefer actions from official organizations

- [ ] **Enable Dependabot for Actions**
  ```yaml
  # .github/dependabot.yml
  version: 2
  updates:
    - package-ecosystem: "github-actions"
      directory: "/"
      schedule:
        interval: "weekly"
      open-pull-requests-limit: 5
  ```

### 🔍 Current Repository Status

✅ **Good practices:**
- Using versioned actions: `actions/checkout@v4`
- Using specific versions: `cloudflare/wrangler-action@2.3.0`

🎯 **Recommended improvements:**
1. Add Dependabot configuration
2. Consider SHA pinning for deploy workflows
3. Document action version policy

---

## Input Validation & Injection Prevention

### ✅ Required Practices

- [ ] **Validate workflow inputs**
  ```yaml
  # ✅ CORRECT
  on:
    workflow_dispatch:
      inputs:
        environment:
          type: choice
          options:
            - development
            - staging
            - production
  
  # ❌ WRONG - No validation
  on:
    workflow_dispatch:
      inputs:
        command:
          description: 'Command to run'
          type: string
  ```

- [ ] **Sanitize user inputs**
  ```yaml
  # ✅ CORRECT - Input validation
  - name: Validate input
    run: |
      if [[ ! "${{ inputs.version }}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Invalid version format"
        exit 1
      fi
  
  # ❌ WRONG - Direct usage without validation
  - run: npm version ${{ inputs.version }}
  ```

- [ ] **Avoid command injection**
  ```yaml
  # ✅ CORRECT - Use environment variable
  - name: Run command
    run: |
      echo "Building version $VERSION"
    env:
      VERSION: ${{ inputs.version }}
  
  # ❌ WRONG - Command injection risk
  - name: Run command
    run: echo "Building version ${{ inputs.version }}"
  ```

- [ ] **Quote variables in shell scripts**
  ```bash
  # ✅ CORRECT
  file_name="${{ inputs.filename }}"
  if [ -f "$file_name" ]; then
  
  # ❌ WRONG
  if [ -f ${{ inputs.filename }} ]; then
  ```

### 🚨 High-Risk Patterns to Avoid

```yaml
# ❌ DANGEROUS - eval with user input
- run: eval "${{ inputs.command }}"

# ❌ DANGEROUS - Script injection
- run: |
    curl https://example.com/script.sh | bash

# ❌ DANGEROUS - Unvalidated PR content
- run: |
    gh pr comment ${{ github.event.number }} --body "${{ github.event.pull_request.body }}"
```

---

## Workflow Triggers

### ✅ Required Practices

- [ ] **Be cautious with pull_request_target**
  ```yaml
  # ⚠️ CAREFUL - Runs in context of base branch with secrets
  on:
    pull_request_target:
      types: [opened, synchronize]
  
  # Only use when you need access to secrets
  # ALWAYS checkout the PR code explicitly
  # NEVER run untrusted code from the PR
  ```

- [ ] **Validate external triggers**
  ```yaml
  # ✅ CORRECT - Validate webhook
  - name: Validate webhook
    run: |
      if [ "${{ secrets.WEBHOOK_SECRET }}" != "${{ github.event.client_payload.secret }}" ]; then
        echo "Invalid webhook secret"
        exit 1
      fi
  ```

- [ ] **Restrict workflow_dispatch access**
  ```yaml
  # Use GitHub's environment protection rules
  # Require reviewers for production deployments
  jobs:
    deploy:
      environment:
        name: production
        url: https://mcc-cal.com
  ```

- [ ] **Limit repository_dispatch events**
  ```yaml
  on:
    repository_dispatch:
      types:
        - deploy-production  # Specific event type
        # Not: types: ['*']
  ```

### 🔍 Current Repository Status

✅ **Safe trigger patterns:**
- Most workflows use `push` and `pull_request`
- `workflow_dispatch` used appropriately
- No dangerous `pull_request_target` usage detected

---

## Artifact & Cache Security

### ✅ Required Practices

- [ ] **Set artifact retention**
  ```yaml
  - uses: actions/upload-artifact@v4
    with:
      name: build-output
      path: dist/
      retention-days: 7  # Don't keep forever
  ```

- [ ] **Exclude sensitive files from artifacts**
  ```yaml
  - uses: actions/upload-artifact@v4
    with:
      name: logs
      path: |
        logs/**
        !logs/**/*.secret
        !logs/**/credentials*
  ```

- [ ] **Use cache keys wisely**
  ```yaml
  # ✅ CORRECT - Include file hash
  - uses: actions/cache@v4
    with:
      path: ~/.npm
      key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
  
  # ❌ WRONG - No invalidation
  - uses: actions/cache@v4
    with:
      path: ~/.npm
      key: npm-cache
  ```

- [ ] **Don't cache secrets**
  ```yaml
  # ❌ WRONG - Never cache credentials
  - uses: actions/cache@v4
    with:
      path: ~/.aws/credentials
      key: aws-creds
  ```

---

## Environment Configuration

### ✅ Required Practices

- [ ] **Use environment protection rules**
  ```yaml
  jobs:
    deploy-production:
      environment:
        name: production
        url: https://mcc-cal.com
      # Requires manual approval before running
  ```

- [ ] **Set environment-specific secrets**
  - Go to: Settings → Environments → [environment] → Add secret
  - Use for: `PROD_API_TOKEN`, `STAGING_DB_URL`, etc.

- [ ] **Use if conditions for sensitive jobs**
  ```yaml
  jobs:
    deploy:
      if: github.ref == 'refs/heads/main' && github.repository == 'McCal-Codes/McCals-Website'
  ```

---

## Monitoring & Auditing

### ✅ Required Practices

- [ ] **Enable workflow logs**
  - Settings → Actions → General → Workflow permissions
  - Keep workflow run logs for at least 90 days

- [ ] **Monitor workflow failures**
  ```yaml
  - name: Notify on failure
    if: failure()
    run: |
      echo "::error::Workflow failed - review logs"
      # Send notification (email, Slack, etc.)
  ```

- [ ] **Review workflow runs regularly**
  - Check Actions tab weekly
  - Review failed runs immediately
  - Look for unusual patterns

- [ ] **Audit secret usage**
  - Settings → Secrets and variables → Actions
  - Review secret names and access
  - Remove unused secrets

- [ ] **Enable security alerts**
  - Settings → Code security and analysis
  - Enable Dependabot alerts
  - Enable Secret scanning
  - Enable Code scanning (if available)

---

## Security Checklist Summary

Use this quick checklist before deploying new workflows:

### Pre-Deployment Checklist

- [ ] No hardcoded secrets in workflow files
- [ ] Secrets accessed via `${{ secrets.SECRET_NAME }}`
- [ ] Minimal permissions set (`permissions:`)
- [ ] Actions pinned to specific versions
- [ ] User inputs validated (if using `workflow_dispatch`)
- [ ] No `eval` or command injection risks
- [ ] Sensitive jobs protected with `if` conditions
- [ ] Artifacts don't contain secrets
- [ ] Cache keys include hash for invalidation
- [ ] Environment protection rules configured (for production)

### Post-Deployment Checklist

- [ ] Test workflow with realistic data
- [ ] Verify secrets are masked in logs
- [ ] Check workflow runs complete successfully
- [ ] Review generated artifacts/caches
- [ ] Monitor for unexpected behaviors
- [ ] Document workflow purpose and triggers

---

## Quick Reference

### Security Commands

```bash
# Generate secure random secrets
openssl rand -base64 32    # For tokens
openssl rand -hex 32       # For hex secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check for hardcoded secrets in workflows
grep -r "token.*=.*[a-zA-Z0-9]\{30,\}" .github/workflows/

# Validate workflow syntax
gh workflow view <workflow-name>

# List repository secrets (requires admin)
gh secret list

# Rotate a secret
gh secret set SECRET_NAME < secret.txt
```

### Security Resources

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [OWASP CI/CD Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html)
- [Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

## Contact & Reporting

For security concerns related to GitHub Actions:

1. **Internal Issues:** Open an issue with `security` label
2. **Security Vulnerabilities:** Follow process in [SECURITY.md](../../SECURITY.md)
3. **Questions:** Contact repository maintainers

---

**Last Updated:** January 2026  
**Next Review:** July 2026  
**Maintained By:** McCal Media Security Team
