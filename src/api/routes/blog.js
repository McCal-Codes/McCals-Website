/**
 * Blog Routes (v1)
 *
 * Provides minimal endpoints for blog posts and author login.
 * Storage: JSON file at src/images/blog/blog-posts.json
 * Auth: JWT via Authorization: Bearer <token>
 */

const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const jwt = require("jsonwebtoken");

const router = express.Router();

const BLOG_JWT_SECRET =
  process.env.BLOG_JWT_SECRET ||
  process.env.WEBHOOK_SECRET ||
  "change-me-blog-secret";
const POSTS_PATH = path.join(
  process.cwd(),
  "src",
  "images",
  "blog",
  "blog-posts.json"
);
const AUTHORS_PATH = path.join(
  process.cwd(),
  "src",
  "api",
  "config",
  "blog-authors.json"
);

async function readJson(filePath, fallback) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (_) {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, json, "utf8");
}

function signToken(payload) {
  return jwt.sign(payload, BLOG_JWT_SECRET, { expiresIn: "1d" });
}

function authMiddleware(req, res, next) {
  const header = req.headers["authorization"] || "";
  const parts = header.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    const token = parts[1];
    try {
      const decoded = jwt.verify(token, BLOG_JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Invalid token" });
    }
  }
  return res
    .status(401)
    .json({ error: "Unauthorized", message: "Missing token" });
}

// POST /api/v1/blog/auth/login
router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "BadRequest", message: "username and password required" });
  }
  const authors = (await readJson(AUTHORS_PATH, { authors: [] })).authors;
  const author = authors.find((a) => a.username === username);
  if (!author) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid credentials" });
  }
  // NOTE: For development only: plaintext password check. Replace with bcrypt in production.
  if (author.password !== password) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid credentials" });
  }
  const token = signToken({
    sub: author.id,
    username: author.username,
    name: author.name,
  });
  return res.json({
    token,
    author: { id: author.id, username: author.username, name: author.name },
  });
});

// GET /api/v1/blog/posts
router.get("/posts", async (req, res) => {
  const data = await readJson(POSTS_PATH, { posts: [] });
  return res.json(data);
});

// POST /api/v1/blog/posts (auth required)
router.post("/posts", authMiddleware, async (req, res) => {
  const body = req.body || {};
  const { title, excerpt, content, images } = body;
  if (!title || !excerpt || !Array.isArray(content)) {
    return res.status(400).json({
      error: "BadRequest",
      message: "title, excerpt, and content[] required",
    });
  }

  const now = new Date();
  const post = {
    title: String(title),
    author: req.user?.name || req.user?.username || "Unknown",
    date: now.toISOString().split("T")[0],
    excerpt: String(excerpt),
    body: content.map(String),
    ...(Array.isArray(images) && images.length > 0
      ? {
          images: images.map((img) => ({
            src: String(img.src || ""),
            alt: String(img.alt || ""),
            caption: img.caption ? String(img.caption) : undefined,
          })),
        }
      : {}),
  };

  const data = await readJson(POSTS_PATH, { posts: [] });
  data.posts.unshift(post); // prepend newest
  await writeJson(POSTS_PATH, data);
  return res.status(201).json({ success: true, post });
});

module.exports = router;
