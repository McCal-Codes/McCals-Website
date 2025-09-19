# WordPress Integration for mcc-cal.com

This folder contains all the files needed to enhance your WordPress site with the hero image expansion and gallery features from your widget system.

## 🎯 Quick Start: Hero Image Expansion

### Step 1: Add Custom CSS
1. Go to WordPress Admin → **Appearance** → **Customize**
2. Click **Additional CSS**
3. Copy and paste the contents of `css/wordpress-hero-header-expansion.css`
4. Click **Publish**

### Step 2: Add Hero HTML Structure
1. Edit your homepage (Pages → Home or customize front page)
2. Add a **Custom HTML** block at the very top
3. Copy and paste the contents of `html/wordpress-hero-html-structure.html`
4. **Important**: Replace the image URL with your actual hero image:
   ```html
   src="https://mcc-cal.com/wp-content/uploads/your-best-photo.jpg"
   ```
5. Update or publish the page

## 📁 Folder Structure

```
wordpress/
├── css/                          # Custom CSS files
│   └── wordpress-hero-header-expansion.css
├── html/                         # HTML snippets for WordPress
│   └── wordpress-hero-html-structure.html
├── plugins/                      # Future custom plugins
└── themes/                       # Theme customizations
    └── (future theme modifications)
```

## 🎨 What This Does

### Hero Image Expansion
- **Full viewport height**: Your hero image fills the entire screen
- **Header overlay**: Navigation sits transparently over the image
- **Responsive**: Works perfectly on mobile and desktop
- **Performance optimized**: Preloads critical images, smooth animations
- **Professional look**: Gradient overlays, text shadows, hover effects

### Key Features
- ✅ Header becomes transparent and overlays the image
- ✅ Navigation text becomes white with shadows for readability
- ✅ Smooth scroll indicator with bounce animation
- ✅ Mobile-responsive with shorter height on phones
- ✅ Content smoothly appears below the hero section
- ✅ Subtle image zoom on hover
- ✅ Performance optimizations built-in

## 🔧 Customization Options

### Change Hero Image
Edit the `src` attribute in the HTML:
```html
<img class="hero-image" src="YOUR_IMAGE_URL_HERE" alt="Caleb McCartney Photography">
```

### Adjust Hero Height
In the CSS file, modify this line:
```css
.hero-image-container {
  height: 100vh; /* Change to 80vh, 90vh, etc. */
}
```

### Change Hero Text
In the HTML file, modify:
```html
<h1 class="hero-title">Your Name Here</h1>
<p class="hero-subtitle">Your Tagline Here</p>
```

### Custom Colors
Edit the CSS variables:
```css
/* Add to the CSS file */
.hero-content {
  color: #your-color-here;
}
```

## 🚀 Next Steps

1. **Test the hero section** - Make sure it looks good on your site
2. **Choose your best photo** - Pick a high-impact image for the hero
3. **Gallery integration** - We can add your advanced gallery widgets next
4. **Performance monitoring** - Add your debug tools for optimization

## 📱 Mobile Considerations

The CSS automatically:
- Reduces hero height to 70vh on mobile
- Adjusts text positioning for smaller screens
- Ensures mobile menus still work properly
- Maintains touch interactions

## ⚡ Performance Features

Built-in optimizations:
- Image preloading for faster initial load
- Intersection Observer for smooth animations
- CSS transforms for GPU acceleration
- Minimal DOM manipulation

## 🆘 Troubleshooting

### Header not transparent?
- Your theme might have conflicting CSS
- Try adding `!important` to more CSS rules
- Check browser developer tools for CSS conflicts

### Image not full width?
- Make sure the HTML block is set to full width
- Check that your theme isn't constraining the container

### Mobile issues?
- Test on actual devices, not just browser resize
- Some themes have mobile-specific CSS that might interfere

## 📧 Implementation Support

If you need help implementing any of these features, the files are ready to copy-paste into your WordPress admin area. Just follow the Quick Start steps above!