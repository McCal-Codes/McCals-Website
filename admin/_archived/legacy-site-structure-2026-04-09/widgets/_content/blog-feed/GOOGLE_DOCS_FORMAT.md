# Google Docs Blog Formatting Guide

This guide shows you how to format your Google Doc so the blog ingestion script can parse it correctly.

## 📝 Document Structure

### Basic Format

```
POST: Your Post Title Here
   date: 01-10-25
   category: Technology
   tags: Web Development, JavaScript, Tutorial
   excerpt: A brief summary of your post (optional)
   image: https://example.com/cover-image.jpg (optional)

Your blog post content starts here. Write naturally - paragraphs, lists, links, etc.

You can have multiple paragraphs, and the parser will capture all of them.

Sources
https://example.com/source1
https://example.com/source2
```

## 🎯 Key Rules

### 1. **Post Marker** (Required)

- Start each new post with `POST:` followed by the title
- Example: `POST: Building a Minimal Blog System`
- This tells the parser where a new post begins

### 2. **Metadata Fields** (All Optional)

Add these immediately after the post title (one per line):

- **date:** Date in various formats
  - `date: 01-10-25` (MM-DD-YY)
  - `date: 01/10/2025` (MM/DD/YYYY)
  - `date: 10 January 2025` (natural language)
  - `date: January 10, 2025`

- **category:** Single category
  - `category: Technology`
  - `category: Personal`

- **tags:** Comma-separated list
  - `tags: JavaScript, Tutorial, Web Development`

- **excerpt:** Custom summary (if omitted, auto-generated from content)
  - `excerpt: A brief description that appears in the card`

- **image:** Cover image URL (for card display)
  - **Option 1:** Unsplash URL (search for relevant stock image)
    - `image: https://images.unsplash.com/photo-1499750310159-53f0f6145f4b?auto=format&fit=crop&w=1200&q=80`
  - **Option 2:** Your own image from GitHub repo
    - `image: https://raw.githubusercontent.com/yourusername/McCals-Website/main/src/images/my-photo.jpg`
  - **Note:** Use direct image URLs, not Google Drive or Dropbox links

### 3. **Content**

- Write normally after metadata
- Paragraphs, lists, links, formatting all work
- **The first paragraph with > 30 characters triggers content collection**

### 4. **Sources Section** (Optional)

- Add a line with just the word `Sources`
- List URLs below it (the parser will extract them)
- Everything after "Sources" is excluded from the post body

## 📋 Complete Example

```
POST: The Capitalist Contradiction
   date: 01-10-25
   category: Politics
   tags: Politics, Capitalism, Economics
   excerpt: An exploration of inherent contradictions in modern capitalism
   image: https://images.unsplash.com/photo-economy

Modernist styles then become stamped with bureaucratic connotation, so that to
break with it radically produces some feeling of renewal and vitality.

This is another paragraph explaining more details about the topic.

You can include:
- Bullet lists
- Links to external resources
- Bold and italic text
- Multiple paragraphs

Sources
https://en.wikipedia.org/wiki/Capital_in_the_Twenty-First_Century
https://www.gutenberg.org/ebooks/3300
```

## ✅ Multiple Posts in One Doc

```
POST: First Post Title
   date: 01-10-25
   category: Tech

Content for first post...

Sources
https://example.com/source1

POST: Second Post Title
   date: 12-15-24
   category: Personal
   tags: Reflection, Growth

Content for second post...
```

## 🚫 Common Mistakes

### ❌ Don't Do This

```
# My Post Title  <-- Using heading instead of POST:
Date: 01-10-25  <-- Capital D instead of lowercase
```

### ✅ Do This

```
POST: My Post Title  <-- Correct
   date: 01-10-25    <-- Lowercase 'd'
```

## 🔄 Running the Parser

After updating your Google Doc:

1. Make sure the doc is **published to web**:
   - File → Share → Publish to web
   - Choose "Web page" format
   - Click "Publish"

2. Run the ingestion script:

   ```bash
   node scripts/blog/fetch-from-docs.js
   ```

3. The script will:
   - Fetch your doc
   - Parse all posts with metadata
   - Generate `blog.manifest.json`
   - Output summary of what it found

4. Refresh your blog widget page to see the changes!

## 💡 Tips

- **Dates:** Use consistent format (MM-DD-YY recommended)
- **Excerpts:** If omitted, first 160 characters of content are used
- **Sources:** List one URL per line for best results
- **Order:** Posts are automatically sorted by date (newest first)

### Finding Good Cover Images

**Unsplash:**

1. Go to [unsplash.com](https://unsplash.com)
2. Search for keywords related to your post (e.g., "economy", "grief", "technology")
3. Find an image you like
4. Right-click → "Copy image address"
5. Add query parameters for optimization: `?auto=format&fit=crop&w=1200&q=80`
6. Use in your doc: `image: https://images.unsplash.com/photo-...?auto=format&fit=crop&w=1200&q=80`

**Your Own Images:**

1. Add image to `src/images/` in your repo
2. Commit and push to GitHub
3. Get the raw URL: `https://raw.githubusercontent.com/YOUR-USERNAME/McCals-Website/main/src/images/YOUR-IMAGE.jpg`
4. Use directly in your doc

**Recommended sizes:** Width 1200px minimum for best quality on all devices

## 🐛 Troubleshooting

**"Found 0 posts"**

- Make sure you have `POST:` at the start of each post title
- Check that the doc is published to web

**"No date"**

- Check date format matches one of the supported formats
- Ensure it's on a line starting with `date:`

**Missing content**

- Ensure first paragraph is longer than 30 characters
- Check that you're not using reserved keywords (author:, bio:, etc.)

---

## 📚 Author Configuration

In `src/data/blog/authors.json`, add your Google Doc URL:

```json
{
  "authors": [
    {
      "id": "your-id",
      "name": "Your Name",
      "avatar": "https://github.com/yourname.png",
      "bio": "Your bio here",
      "sourceDoc": {
        "publishedUrl": "https://docs.google.com/document/d/e/YOUR-DOC-ID/pub"
      }
    }
  ]
}
```

Now you're ready to maintain your blog entirely in Google Docs! ✨
