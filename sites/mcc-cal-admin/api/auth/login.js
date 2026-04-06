import { handleLogin } from '../_lib/auth.js';

export default async function handler(req, res) {
  handleLogin(req, res);
}
