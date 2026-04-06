import { handleLogout } from '../_lib/auth.js';

export default async function handler(req, res) {
  handleLogout(req, res);
}
