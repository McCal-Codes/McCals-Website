# Squarespace Widgets Setup Guide

This folder contains Squarespace-compatible versions of your about page components that can be easily embedded into your Squarespace site.

## Available Widgets

### 1. `about-section-squarespace.html`
Complete about section with bio, photo, and reviews.

### 2. `client-carousel-squarespace.html` 
Standalone client logo carousel with statistics.

## How to Use in Squarespace

### Step 1: Upload Assets to Squarespace
1. **Upload your photo**:
   - Go to Design > Custom CSS > Manage Files
   - Upload `caleb-mccartney-photo.jpg`
   - Copy the generated URL

2. **Upload your resume**:
   - Upload `caleb-mccartney-resume.pdf` 
   - Copy the generated URL

3. **Upload client logos**:
   - Upload all logo files from `assets/images/logos/`
   - Copy each logo URL

### Step 2: Update Widget Code
1. Open the widget HTML file you want to use
2. Replace placeholder URLs with your actual Squarespace URLs:

```html
<!-- Replace this -->
<img src="https://images.squarespace-cdn.com/content/YOUR-SITE-ID/YOUR-IMAGE-ID/caleb-mccartney-photo.jpg">

<!-- With your actual URL -->
<img src="https://images.squarespace-cdn.com/content/v1/abc123/xyz789/caleb-mccartney-photo.jpg">
```

### Step 3: Add to Squarespace Page
1. **Edit your page** in Squarespace
2. **Add a Code Block**:
   - Click the + icon
   - Choose "Code" from the menu
3. **Paste the widget code**:
   - Copy the entire HTML from the widget file
   - Paste into the Code Block
4. **Save and publish**

## Required URL Updates

### For About Section Widget (`about-section-squarespace.html`):
- Line 309: Update photo URL
- Line 332: Update resume download URL

### For Client Carousel Widget (`client-carousel-squarespace.html`):
- Lines 191, 197, 203, 209, etc.: Update all client logo URLs

## Squarespace-Specific Optimizations

### ✅ **What's Included:**
- **Self-contained CSS**: No external dependencies
- **Unique class names**: Prefixed with `ss-` to avoid conflicts
- **Mobile responsive**: Works on all devices
- **Fallback images**: Placeholder images if logos fail to load
- **Dark theme compatible**: Matches professional aesthetics

### ✅ **Squarespace Compatibility:**
- **No external fonts**: Uses system fonts for faster loading
- **Inline styles where needed**: Ensures styling consistency
- **Safe JavaScript**: No conflicts with Squarespace's JavaScript
- **Lazy loading**: Images load only when needed

## Customization Options

### Colors
To match your site's theme, update these CSS variables:
```css
/* Text colors */
color: #f5f5f5; /* Main text */
color: #888;    /* Muted text */

/* Background colors */
background: #111;     /* Card backgrounds */
background: #2a2a2a;  /* Borders */
```

### Sizing
Adjust responsive breakpoints:
```css
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

### Animation Speed
Change carousel speed:
```css
animation: ss-scroll 25s linear infinite; /* 25s = speed */
```

## Testing Checklist

Before publishing:
- [ ] All images load correctly
- [ ] Resume download works
- [ ] Links open in new tabs
- [ ] Mobile responsive design works
- [ ] Client carousel animations smooth
- [ ] No JavaScript errors in browser console

## Support

If you experience any issues:
1. Check browser console for JavaScript errors
2. Verify all URLs are correct and accessible
3. Test on different devices and browsers
4. Ensure code block is in "HTML" mode, not "Markdown"

## File Structure

```
widgets/
├── about-section-squarespace.html      # Complete about section
├── client-carousel-squarespace.html    # Standalone client carousel  
└── README.md                           # This setup guide
```

---

**Version**: 1.1  
**Compatibility**: Squarespace 7.1+  
**Last Updated**: January 2025