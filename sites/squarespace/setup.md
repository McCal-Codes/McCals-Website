# GitHub Portfolio Gallery for Squarespace

This solution fetches images from your GitHub repository at `https://github.com/McCal-Codes/McCals-Website/tree/main/images/Portfolios` and creates a masonry-style portfolio gallery on your Squarespace site.

## Features

✅ **Fetches directly from GitHub** - No need to upload images to Squarespace  
✅ **Responsive masonry grid** - Automatically adapts to different screen sizes  
✅ **Lightbox gallery** - Click to view full-size images  
✅ **Caching** - Caches GitHub API responses for better performance  
✅ **Error handling** - Gracefully handles missing images or API issues  
✅ **Keyboard accessible** - Full keyboard navigation support  
✅ **Loading states** - Shows loading spinners while fetching data  

## Setup Instructions

### Step 1: Prepare Your Squarespace Page

1. **Create a new page** or edit an existing page where you want the gallery
2. **Add a Code Block** (in the content editor, click "+" → "More" → "Code")
3. **Add an HTML container** by pasting this HTML in the code block:

```html
<div class="portfolio-gallery">
  <div class="loading-spinner">Loading portfolio...</div>
</div>
```

### Step 2: Add the JavaScript

1. **Go to Settings** → **Advanced** → **Code Injection**
2. **In the Footer section**, paste the entire contents of `github-portfolio-gallery.js`
3. **Save** your changes

### Step 3: Customize the Container Selector

In the JavaScript code, find this line (around line 17):

```javascript
const GALLERY_CONTAINER = '.portfolio-gallery'; // Change to your container class/ID
```

**Update it to match your HTML container**. Options:
- If using the HTML above: `.portfolio-gallery` (default)
- If you want to use an ID: `#my-gallery-id`  
- If you want to use a different class: `.my-custom-class`

### Step 4: GitHub Repository Structure

Make sure your GitHub repository follows this structure:

```
images/Portfolios/
├── Portfolio-Name-1/
│   ├── image1.jpg
│   ├── image2.png
│   └── image3.webp
├── Portfolio-Name-2/
│   ├── photo1.jpg
│   └── photo2.jpg
└── Portfolio-Name-3/
    └── artwork.png
```

**Requirements:**
- Each portfolio must be in its own folder under `images/Portfolios/`
- Folder names will be used as portfolio titles (with dashes/underscores replaced by spaces)
- Supported image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- The first image in each folder will be used as the thumbnail

## Configuration Options

You can modify these settings at the top of the JavaScript file:

```javascript
// GitHub repository settings
const GITHUB_CONFIG = {
  owner: 'McCal-Codes',        // Your GitHub username
  repo: 'McCals-Website',      // Your repository name  
  path: 'images/Portfolios',   // Path to your portfolio folders
  branch: 'main'               // Git branch to use
};

// Gallery container
const GALLERY_CONTAINER = '.portfolio-gallery'; // Update this to match your HTML

// Cache settings
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
```

## Styling Customization

The gallery comes with built-in responsive CSS, but you can customize it by:

1. **Modifying the CSS** in the `addStyles()` function (around line 150)
2. **Adding custom CSS** in Squarespace's **Design** → **Custom CSS**

### Common Customizations

**Change grid layout:**
```css
.portfolio-grid {
  grid-template-columns: repeat(3, 1fr); /* Fixed 3 columns */
  /* or */
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Larger cards */
}
```

**Customize colors:**
```css
.portfolio-card {
  background: #your-color;
}

.portfolio-overlay {
  background: linear-gradient(transparent, rgba(your-color, 0.8));
}
```

**Adjust card height:**
```css
.portfolio-thumbnail {
  height: 250px; /* Change from default 200px */
}
```

## Troubleshooting

### Gallery not loading
1. **Check the console** (F12 → Console) for error messages
2. **Verify GitHub repository** is public and contains the expected folder structure
3. **Check container selector** matches your HTML element

### Images not displaying
1. **Verify image formats** are supported (jpg, png, gif, webp, svg)
2. **Check file names** don't contain special characters
3. **Ensure repository is public** or images are accessible

### Performance issues
1. **Reduce cache duration** if you're frequently updating images
2. **Optimize image sizes** in your GitHub repository
3. **Consider GitHub's rate limits** (60 requests per hour for unauthenticated requests)

## GitHub API Rate Limits

- **Unauthenticated requests:** 60 per hour per IP
- **Authenticated requests:** 5000 per hour (not implemented in this basic version)

The cache helps reduce API calls, but for high-traffic sites, consider implementing GitHub authentication.

## Browser Support

- **Modern browsers:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Features used:** Fetch API, CSS Grid, ES6+ JavaScript
- **IE11:** Not supported (uses modern JavaScript features)

## Next Steps

1. **Test the gallery** on a staging/preview page first
2. **Optimize your GitHub images** for web (compress, resize)
3. **Monitor performance** and adjust cache duration as needed
4. **Consider CDN** for faster image loading if needed

---

**Need help?** Check the browser console for error messages, and ensure your GitHub repository structure matches the expected format.