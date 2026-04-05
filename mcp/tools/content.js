import fs from 'fs/promises';
import path from 'path';
import { REPO_ROOT } from '../utils/paths.js';

export const contentCreatePostTool = {
  name: 'content_create_post',
  description: 'Create a new blog post with markdown template',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Post title',
      },
      slug: {
        type: 'string',
        description: 'URL-friendly slug (e.g., "my-post-title")',
      },
      excerpt: {
        type: 'string',
        description: 'Short summary for the post',
      },
      category: {
        type: 'string',
        enum: ['photo', 'tech', 'workflow', 'essay'],
        default: 'essay',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for the post',
      },
      draft: {
        type: 'boolean',
        default: true,
        description: 'Start as draft',
      },
    },
    required: ['title', 'slug'],
  },
};

export async function handleContentCreatePost(args) {
  const { title, slug, excerpt = '', category = 'essay', tags = [], draft = true } = args;

  try {
    const postsDir = path.join(REPO_ROOT, 'src', 'content', 'blog', 'posts');
    const postDir = path.join(postsDir, slug);

    // Check if post already exists
    try {
      await fs.access(postDir);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Post "${slug}" already exists` }, null, 2),
          },
        ],
        isError: true,
      };
    } catch {
      // Directory doesn't exist, good to proceed
    }

    // Create post directory
    await fs.mkdir(postDir, { recursive: true });

    const today = new Date().toISOString().split('T')[0];

    // Create post.json
    const postData = {
      title,
      slug,
      excerpt,
      date: today,
      category,
      tags,
      draft,
      authorId: 'mccal',
      authorName: 'Caleb McCartney',
      body: [
        {
          type: 'text',
          content: 'Start writing your post here...',
        },
      ],
    };

    await fs.writeFile(
      path.join(postDir, 'post.json'),
      JSON.stringify(postData, null, 2),
      'utf-8'
    );

    // Create markdown file for editing
    const markdownTemplate = `---
title: ${title}
slug: ${slug}
date: ${today}
category: ${category}
tags: ${JSON.stringify(tags)}
excerpt: ${excerpt}
draft: ${draft}
---

# ${title}

Start writing your post here...

## Next Steps

1. Edit this file: src/content/blog/posts/${slug}/post.md
2. Or edit post.json for structured content
3. Run 'npm run manifest:blog' to update the blog manifest
4. Commit and push to publish
`;

    await fs.writeFile(
      path.join(postDir, 'post.md'),
      markdownTemplate,
      'utf-8'
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Created post "${title}"`,
              slug,
              path: `src/content/blog/posts/${slug}/`,
              files: ['post.json', 'post.md'],
              nextSteps: [
                `Edit: src/content/blog/posts/${slug}/post.md`,
                'Run: npm run manifest:blog',
                'Commit and push',
              ],
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
