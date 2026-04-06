import { handleCallback } from '../_lib/auth.js';

export default async function handler(req, res) {
  await handleCallback(req, res);
}
