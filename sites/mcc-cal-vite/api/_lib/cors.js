const DEFAULT_ALLOWED_ORIGINS = ['https://mcc-cal.com', 'https://www.mcc-cal.com'];

function parseAllowedOrigins() {
  const raw = process.env.API_ALLOWED_ORIGINS || process.env.BOOKING_ALLOWED_ORIGINS || '';
  const parsed = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_ORIGINS;
}

export function getAllowedOrigins() {
  return parseAllowedOrigins();
}

export function applyCors(req, res, { methods = 'GET, OPTIONS', headers = 'Content-Type' } = {}) {
  const origin = req.headers.origin;
  const allowedOrigins = parseAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', headers);

  if (req.method === 'OPTIONS') {
    if (origin && !allowedOrigins.includes(origin)) {
      res.status(403).json({ error: 'Origin not allowed' });
      return true;
    }
    res.status(200).end();
    return true;
  }

  return false;
}
