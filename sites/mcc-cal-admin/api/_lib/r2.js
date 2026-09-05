import crypto from 'node:crypto';

const EMPTY_PAYLOAD_HASH = crypto.createHash('sha256').update('').digest('hex');

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function signingKey(secret, dateStamp) {
  return hmac(hmac(hmac(hmac('AWS4' + secret, dateStamp), 'auto'), 's3'), 'aws4_request');
}

function amzDateNow() {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}

function r2ConfigError() {
  const error = new Error('R2 storage is not configured');
  error.statusCode = 503;
  error.code = 'r2_not_configured';
  return error;
}

function getR2Config() {
  const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID ?? '').trim();
  const accessKeyId = String(process.env.R2_ACCESS_KEY_ID ?? '').trim();
  const secretAccessKey = String(process.env.R2_SECRET_ACCESS_KEY ?? '').trim();
  const bucket = String(process.env.R2_BUCKET ?? '').trim() || 'portfolio-images';

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw r2ConfigError();
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    host: `${accountId}.r2.cloudflarestorage.com`,
  };
}

function encodeStoragePath(storagePath) {
  return storagePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/**
 * Presigned PUT URL for a direct browser -> R2 upload. SignedHeaders is
 * intentionally `host` only — signing `content-type` breaks the browser PUT
 * because R2 rejects a presigned request whose signed headers don't exactly
 * match what the client sends, and browsers don't give reliable control over
 * exact header serialization. Content-type is instead re-checked server-side
 * via headR2Object() after upload, not enforced through the signature.
 */
export function createPresignedPutUrl({ storagePath, expiresInSeconds = 600 }) {
  const config = getR2Config();
  const { amzDate, dateStamp } = amzDateNow();
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const encodedKey = encodeStoragePath(storagePath);

  const queryParams = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${config.accessKeyId}/${credentialScope}`],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(expiresInSeconds)],
    ['X-Amz-SignedHeaders', 'host'],
  ].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const canonicalQuery = queryParams
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const canonicalRequest = [
    'PUT',
    `/${config.bucket}/${encodedKey}`,
    canonicalQuery,
    `host:${config.host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signature = crypto
    .createHmac('sha256', signingKey(config.secretAccessKey, dateStamp))
    .update(stringToSign)
    .digest('hex');

  return `https://${config.host}/${config.bucket}/${encodedKey}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/**
 * Header-signed HEAD request, used server-side after the client reports an
 * upload as complete, to confirm the object actually exists in R2 before
 * trusting it enough to write a Supabase row for it.
 */
export async function headR2Object(storagePath) {
  const config = getR2Config();
  const { amzDate, dateStamp } = amzDateNow();
  const encodedKey = encodeStoragePath(storagePath);
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;

  const headers = {
    host: config.host,
    'x-amz-content-sha256': EMPTY_PAYLOAD_HASH,
    'x-amz-date': amzDate,
  };
  const sortedKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedKeys.map((key) => `${key}:${headers[key]}`).join('\n') + '\n';
  const signedHeaders = sortedKeys.join(';');
  const canonicalRequest = [
    'HEAD',
    `/${config.bucket}/${encodedKey}`,
    '',
    canonicalHeaders,
    signedHeaders,
    EMPTY_PAYLOAD_HASH,
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signature = crypto
    .createHmac('sha256', signingKey(config.secretAccessKey, dateStamp))
    .update(stringToSign)
    .digest('hex');

  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${config.host}/${config.bucket}/${encodedKey}`, {
    method: 'HEAD',
    headers: { ...headers, Authorization: authorization },
  });

  if (!response.ok) {
    return null;
  }

  return {
    contentType: response.headers.get('content-type'),
    contentLength: Number(response.headers.get('content-length')) || null,
  };
}

export function getR2PublicUrl(storagePath) {
  const base = String(process.env.VITE_R2_PUBLIC_URL ?? '').replace(/\/$/, '');
  return `${base}/${storagePath}`;
}
