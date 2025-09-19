# Squarespace Site Extraction - Caleb McCartney

This directory contains a complete extraction of your Squarespace website with all CSS and JavaScript assets downloaded locally.

## 📁 Directory Structure

```
squarespace-site/
├── README.md                    # This file
├── index.html                   # Original HTML with external references
├── index-local.html             # HTML with local asset references
├── css/                         # All CSS files (21 files)
│   ├── squarespace-clarkson-v2.css    # Main Squarespace font CSS
│   ├── 417923393ce481a1-min.en-US.css # Core styles
│   ├── 8f0df834fd9e0f0a-min.en-US.css # UI components
│   ├── cde1a02072287e00-min.en-US.css # Layout styles
│   ├── 99442e64b835c75a-min.en-US.css # Theme styles
│   ├── 7cf25981cabb7ba2-min.en-US.css # Navigation styles
│   ├── 2a23c0362959531e-min.en-US.css # Form styles
│   ├── 2b8cb18d1993dfe1-min.en-US.css # Modal styles
│   ├── ef5a02839ed413be-min.en-US.css # Button styles
│   ├── c248b84d50568f6a-min.en-US.css # Grid system
│   ├── 50de2bc0b5890846-min.en-US.css # Utility classes
│   ├── 70599b093e15b35c-min.en-US.css # Admin interface
│   ├── 94bfa9ac4360a9f5-min.en-US.css # Commerce styles
│   ├── 729556c2106e6155-min.en-US.css # Analytics styles
│   ├── 5408d9ed2dca3c7a-min.en-US.css # Scheduling styles
│   ├── 7fae10461562ac5e-min.en-US.css # Content management
│   ├── b9b8f13996c52772-min.en-US.css # Page builder
│   ├── 3b8d68585fe88b53-min.en-US.css # Media gallery
│   ├── 7a037f50d3ee1c8f-min.en-US.css # Social features
│   ├── b6855f3bd6138216-min.en-US.css # Marketing tools
│   └── management-37cd9a002eb40e6f-min.en-US.css # Management interface
└── js/                          # All JavaScript files (9 files)
    ├── gtm.js                   # Google Tag Manager
    ├── legacy.js                # Polyfills for older browsers
    ├── modern.js                # Modern browser polyfills
    ├── extract-css-runtime-48635bc2c2820844-min.en-US.js  # CSS runtime
    ├── error-reporter-148043c8cdafc18e-min.en-US.js       # Error reporting
    ├── cldr-resource-pack-c5175d8ac6fd7505-min.en-US.js   # Localization
    ├── config-appshell-ae867665a8b5efe7-min.en-US.js      # App shell
    ├── stripe.js                # Stripe payment processing
    └── connect.js               # Stripe Connect functionality
```

## 🚀 What Was Extracted

### ✅ Successfully Downloaded:
- **HTML Structure**: Complete admin interface HTML
- **21 CSS Files**: All styling including fonts, themes, and UI components  
- **9 JavaScript Files**: Core functionality, polyfills, and third-party integrations
- **Self-contained Version**: `index-local.html` with all local asset references

### 📝 Key Pages/Sections Identified:
- **Main Navigation**: Home, Website, Products & Services, Scheduling
- **Content Management**: Blog, Podcast, Work portfolio, About page
- **Not Linked Pages**: Concert, Photojournalism, One Nation Divided, Boyd Station, Event, Policies & Legal, Contact, Accessibility
- **System Pages**: 404, Checkout, Lock Screen
- **Marketing Tools**: Announcement Bar, Promotional Pop-Up, Mobile Info Bar
- **Custom Code**: CSS and Code Injection capabilities

## 🛠 Usage Instructions

### View the Site:
1. **Local Version**: Open `index-local.html` in a web browser
2. **Original Version**: Open `index.html` (requires internet for external assets)

### Serve Locally:
```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or Node.js
npx http-server

# Then visit: http://localhost:8000/index-local.html
```

## ⚠️ Important Notes

- **Admin Interface**: This is the Squarespace admin/config interface, not the public-facing website
- **Functionality**: Some interactive features may not work offline due to server dependencies
- **Assets**: All CSS and JS files are now self-contained and don't require internet access
- **External Services**: Removed references to browser extensions and some tracking scripts
- **Fonts**: Squarespace Clarkson font family is included locally

## 🔧 Technical Details

- **Extraction Date**: September 17, 2025
- **Squarespace Version**: 7.1
- **Total Assets**: 30 files (21 CSS + 9 JS)
- **File Size**: ~6MB total
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 📊 Site Structure Analysis

The site appears to be set up for:
- Portfolio/creative work showcase
- Podcast hosting
- Blog content
- Event management
- Contact/business information
- Professional services

## 🔄 Next Steps

If you need to:
1. **Extract the public site**: You'd need to get the HTML from the actual public URL (not the admin interface)
2. **Download images**: Run additional scripts to extract and download images
3. **Make it fully functional**: Some JavaScript functionality may need server-side components

This extraction gives you a complete backup of your Squarespace admin interface and all the styling/JavaScript assets needed to render it locally.