# 🎯 Squarespace-Style Hero Implementation Guide

This guide will help you recreate the exact hero section from your Squarespace site on WordPress.

## ✅ What You'll Get

**Exactly like your Squarespace image:**
- Full-screen hero image that extends behind the header
- Transparent header with white navigation (only on hero pages)  
- Photo caption in bottom-left (like "Boyd Station")
- Navigation arrows for multiple images
- Perfect mobile responsiveness
- Normal header on other pages

## 🚀 Step-by-Step Implementation

### Step 1: Add the CSS
1. Go to **WordPress Admin** → **Appearance** → **Customize**
2. Click **Additional CSS**
3. Copy and paste **ALL** the contents from `css/wordpress-hero-header-expansion.css`
4. Click **Publish**

### Step 2: Set Up Your Homepage
1. Go to **Pages** → **All Pages** (or create a new page)
2. Edit your homepage
3. In the **Page Settings** (sidebar) → **Advanced** → **CSS Classes**
4. Add: `has-hero-image`
5. **This is crucial** - this class controls which pages get the transparent header

### Step 3: Add Hero HTML
1. In your page editor, add a **Custom HTML** block at the very top
2. Copy and paste the contents from `html/wordpress-hero-html-structure.html`
3. **Replace the image URL** with your actual image:
   ```html
   src="https://mcc-cal.com/wp-content/uploads/2023/your-hero-photo.jpg"
   ```
4. **Update the caption** (replace "Boyd Station" with your photo location)

### Step 4: Upload Your Hero Image
1. Go to **Media** → **Add New**
2. Upload your hero image (the sparkler/Boyd Station photo or similar)
3. Copy the **File URL** and paste it in the HTML from Step 3

## 🎨 Customization Options

### Multiple Hero Images (Like Squarespace Galleries)
In the HTML file, update the `heroImages` array:
```javascript
const heroImages = [
  {
    src: 'https://mcc-cal.com/wp-content/uploads/hero-1.jpg',
    caption: 'Boyd Station'
  },
  {
    src: 'https://mcc-cal.com/wp-content/uploads/hero-2.jpg', 
    caption: 'Pittsburgh Skyline'
  },
  {
    src: 'https://mcc-cal.com/wp-content/uploads/hero-3.jpg',
    caption: 'Concert Photography'
  }
];
```

### Adjust Navigation Style
Your current nav looks like: **Work | Podcast | Blog | About**

The CSS automatically styles this to match Squarespace with:
- Clean white text with subtle shadows
- Hover underline effect
- Proper spacing (35px gaps)

### Change Hero Height
Default is full viewport (`100vh`). To adjust:
```css
.hero-image-container {
  height: 90vh; /* or 80vh, 85vh, etc. */
}
```

## 📱 Mobile Behavior

The design automatically:
- Maintains full-screen impact on mobile
- Keeps navigation readable
- Adjusts caption positioning
- Preserves touch interactions

## 🔍 Key Differences from Original CSS

### ✅ Fixed Issues:
- **Smart class targeting**: Uses `.has-hero-image` instead of `.home` 
- **Only affects hero pages**: Other pages keep normal header
- **Better navigation**: Matches your current menu structure
- **Squarespace-accurate**: Removes unnecessary elements, focuses on clean hero

### 🎯 Matches Your Design:
- Header positioning and transparency
- Navigation font weights and spacing  
- Photo caption placement (bottom-left)
- Navigation arrows (if you want multiple images)
- Overall layout proportions

## 🚨 Troubleshooting

### Header Not Transparent?
- Make sure you added `has-hero-image` to the CSS Classes
- Check that CSS was pasted correctly in Customize → Additional CSS
- Try adding `!important` to CSS rules if theme conflicts exist

### Image Not Full Screen?
- Ensure Custom HTML block is set to "Full width" alignment
- Check your theme doesn't have container constraints
- Verify image URL is correct and accessible

### Navigation Issues?
- Different themes use different navigation classes
- The CSS targets multiple common navigation selectors
- You may need to inspect your site and adjust selectors

## 🔄 Making Changes Later

### New Hero Image:
1. Upload to Media Library
2. Update the `src` URL in your Custom HTML block
3. Update caption text if needed

### Different Pages with Heroes:
1. Add `has-hero-image` CSS class to any page
2. Add the hero HTML block
3. Change the image URL and caption

### Remove Hero from a Page:
1. Remove `has-hero-image` from CSS Classes
2. Delete the Custom HTML block
3. Header returns to normal automatically

## 🎉 Result

Your WordPress homepage will look exactly like your Squarespace hero section with:
- Professional transparent header overlay
- Full-screen impact image
- Clean navigation with proper styling
- Photo attribution/caption
- Optional image navigation
- Perfect mobile responsiveness

The header will only be transparent on pages with the `has-hero-image` class - all other pages will have your normal header style.