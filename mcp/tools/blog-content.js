import fs from 'fs/promises';
import path from 'path';
import { REPO_ROOT } from '../utils/paths.js';

export const contentListPostsTool = {
  name: 'content_list_posts',
  description: 'List all blog posts with metadata',
  inputSchema: {
    type: 'object',
    properties: {
      draftsOnly: {
        type: 'boolean',
        default: false,
        description: 'Show only draft posts',
      },
    },
  },
};

export const contentEditPostTool = {
  name: 'content_edit_post',
  description: 'Edit an existing blog post',
  inputSchema: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        description: 'Post slug to edit',
      },
      title: {
        type: 'string',
        description: 'New title (optional)',
      },
      excerpt: {
        type: 'string',
        description: 'New excerpt (optional)',
      },
      body: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['text', 'quote', 'image', 'code'] },
            content: { type: 'string' },
          },
        },
        description: 'Post body blocks (optional)',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'New tags (optional)',
      },
      draft: {
        type: 'boolean',
        description: 'Draft status (optional)',
      },
    },
    required: ['slug'],
  },
};

export async function handleContentListPosts(args = {}) {
  const { draftsOnly = false } = args;

  try {
    const postsDir = path.join(REPO_ROOT, 'src', 'content', 'blog', 'posts');
    const entries = await fs.readdir(postsDir, { withFileTypes: true });
    const posts = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      try {
        const postJsonPath = path.join(postsDir, entry.name, 'post.json');
        const content = await fs.readFile(postJsonPath, 'utf-8');
        const post = JSON.parse(content);

        if (draftsOnly && !post.draft) continue;

        posts.push({
          slug: entry.name,
          title: post.title,
          date: post.date,
          category: post.category,
          draft: post.draft,
          excerpt: post.excerpt?.slice(0, 100) + (post.excerpt?.length > 100 ? '...' : ''),
        });
      } catch {
        // Skip posts without valid post.json
      }
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ count: posts.length, posts }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

export async function handleContentEditPost(args) {
  const { slug, ...updates } = args;

  try {
    const postDir = path.join(REPO_ROOT, 'src', 'content', 'blog', 'posts', slug);
    const postJsonPath = path.join(postDir, 'post.json');

    // Read existing post
    const content = await fs.readFile(postJsonPath, 'utf-8');
    const post = JSON.parse(content);

    // Apply updates
    if (updates.title !== undefined) post.title = updates.title;
    if (updates.excerpt !== undefined) post.excerpt = updates.excerpt;
    if (updates.body !== undefined) post.body = updates.body;
    if (updates.tags !== undefined) post.tags = updates.tags;
    if (updates.draft !== undefined) post.draft = updates.draft;

    // Save updated post
    await fs.writeFile(postJsonPath, JSON.stringify(post, null, 2), 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Updated post "${post.title}"`,
              slug,
              updated: Object.keys(updates),
              path: `src/content/blog/posts/${slug}/post.json`,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
