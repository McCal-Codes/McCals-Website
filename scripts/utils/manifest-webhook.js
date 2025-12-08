#!/usr/bin/env node
/**
 * manifest-webhook.js
 *
 * Small helper used by manifest generators to notify the API webhook
 * that a manifest was created/updated so the API can refresh cache.
 *
 * Environment variables:
 * - MANIFEST_WEBHOOK_URL    (optional) Full URL template, may contain `{type}` placeholder
 * - MANIFEST_WEBHOOK_BASE   (optional) Base URL for webhooks e.g. http://localhost:3001/api/v1/webhooks
 * - WEBHOOK_SECRET          (optional) x-webhook-secret header value
 * - MANIFEST_WEBHOOK_ALWAYS (optional) when 'true', send notification even if manifest not changed
 */

const fetch = global.fetch || require('node-fetch');

function _buildUrl(type) {
  const explicit = process.env.MANIFEST_WEBHOOK_URL;
  if (explicit) {
    if (explicit.includes('{type}')) return explicit.replace('{type}', type);
    // If explicit URL doesn't contain type placeholder and doesn't end with /refresh/<type>, append
    if (!explicit.match(/\/refresh\//)) {
      return explicit.replace(/\/+$/, '') + `/refresh/${type}`;
    }
    return explicit;
  }

  // Allow specifying a Cloudflare Worker URL via CLOUDFLARE_WORKER_URL or subdomain
  const workerUrl =
    process.env.CLOUDFLARE_WORKER_URL ||
    (process.env.CLOUDFLARE_WORKER_SUBDOMAIN
      ? `https://${process.env.CLOUDFLARE_WORKER_SUBDOMAIN}.workers.dev`
      : null);
  const defaultBase = workerUrl
    ? workerUrl + '/api/v1/webhooks'
    : 'http://localhost:3001/api/v1/webhooks';
  const base = process.env.MANIFEST_WEBHOOK_BASE || defaultBase;
  return base.replace(/\/+$/, '') + `/refresh/${type}`;
}

async function notify(type, details = {}) {
  const url = _buildUrl(type);
  const secret = process.env.WEBHOOK_SECRET;
  if (!url) return false;

  // Accept a mode where notifications are disabled explicitly
  if (process.env.MANIFEST_WEBHOOK_DISABLED && process.env.MANIFEST_WEBHOOK_DISABLED !== 'false') {
    console.log(`🔕 Manifest webhook is disabled; skipping notify for ${type}`);
    return false;
  }

  const payload = {
    type,
    source: 'manifest-generator',
    timestamp: new Date().toISOString(),
    ...details,
  };

  const headers = { 'Content-Type': 'application/json' };

  // Support HMAC signing (preferred) and a legacy plain-secret header for compatibility
  // If a secret is present, compute an HMAC signature of the payload and add it as
  // x-signature: sha256=<hex>. Also include the legacy x-webhook-secret header for
  // backwards compatibility with older deployments.
  const bodyStr = JSON.stringify(payload);
  if (secret) {
    try {
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', String(secret)).update(bodyStr).digest('hex');
      headers['x-signature'] = `sha256=${hmac}`;
    } catch (err) {
      // If crypto isn't available for some reason, fall back to legacy header
      headers['x-webhook-secret'] = secret;
    }
    // Keep legacy header for compatibility
    if (!headers['x-webhook-secret']) headers['x-webhook-secret'] = secret;
  }

  // Retry loop with small exponential backoff for transient network issues
  const maxAttempts = parseInt(process.env.MANIFEST_WEBHOOK_RETRIES || '3', 10);
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      console.log(
        `🔔 Notifying manifest webhook (attempt ${attempt}/${maxAttempts}): ${url} - manifest-webhook.js`,
      );
      const resp = await fetch(url, { method: 'POST', headers, body: bodyStr, timeout: 8000 });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '(no body)');
        console.warn(`⚠️  Webhook responded ${resp.status}: ${text}`);
        // If unauthorized, don't retry (likely config/secret mismatch)
        if (resp.status === 401 || resp.status === 403) return false;
      } else {
        console.log(`✅ Webhook notified (${type}): ${resp.status}`);
        return true;
      }
    } catch (err) {
      console.warn(`⚠️  Failed to notify webhook for ${type} (attempt ${attempt}): ${err.message}`);
    }

    // Backoff before retrying
    if (attempt < maxAttempts) {
      const backoffMs = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }

  return false;
}

module.exports = { notify };
