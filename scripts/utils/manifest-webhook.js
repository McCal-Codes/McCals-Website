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

  const base = process.env.MANIFEST_WEBHOOK_BASE || 'http://localhost:3001/api/v1/webhooks';
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

  const payload = { type, source: 'manifest-generator', timestamp: new Date().toISOString(), ...details };

  const headers = { 'Content-Type': 'application/json' };
  if (secret) headers['x-webhook-secret'] = secret;

  try {
    console.log(`🔔 Notifying manifest webhook: ${url} - manifest-webhook.js`);
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload), timeout: 8000 });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '(no body)');
      console.warn(`⚠️  Webhook responded ${resp.status}: ${text}`);
      return false;
    }

    console.log(`✅ Webhook notified (${type}): ${resp.status}`);
    return true;
  } catch (err) {
    console.warn(`⚠️  Failed to notify webhook for ${type}: ${err.message}`);
    return false;
  }
}

module.exports = { notify };
