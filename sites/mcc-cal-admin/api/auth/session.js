import { handleSession } from '../_lib/auth.js';

export default async function handler(req, res) {
  handleSession(req, res);
}
