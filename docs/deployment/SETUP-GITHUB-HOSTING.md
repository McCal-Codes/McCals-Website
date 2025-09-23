# GitHub Hosting Setup for McCal Media Website

## 📁 File Structure Created:
```
McCals-Website/
├── assets/
│   ├── downloads/
│   │   ├── README.md
│   │   ├── caleb-mccartney-resume.pdf          # ← Add your resume here
│   │   ├── caleb-mccartney-cv-detailed.pdf     # ← Add detailed CV here
│   │   └── portfolio-highlights.pdf            # ← Add portfolio summary
│   └── images/
│       └── logos/
│           ├── README.md
│           ├── new-york-post-logo.png          # ← Download and add logos
│           ├── pittsburgh-magazine-logo.png
│           ├── point-park-university-logo.png
│           ├── the-globe-logo.png
│           ├── nppa-logo.png
│           ├── pennsylvania-news-media-logo.png
│           └── upward-consulting-logo.png
├── about-page-complete.html                    # ← Your updated about page
├── client-logos-widget-squarespace.html        # ← Widget for Squarespace
└── SETUP-GITHUB-HOSTING.md                     # ← This file
```

## 🔧 Setup Steps:

### 1. **Update GitHub Username**
Replace `YOUR_GITHUB_USERNAME` in the about page with your actual GitHub username:
- Resume download link: Line 74
- All logo URLs: Lines 416, 422, 428, 434, 440, 446, 452, 458

### 2. **Add Your Files**
```bash
# Add your resume PDF to downloads folder
cp /path/to/your-resume.pdf assets/downloads/caleb-mccartney-resume.pdf

# Add logo files to logos folder (after downloading them)
cp /path/to/downloaded-logos/*.png assets/images/logos/
```

### 3. **Download Logos** 
Use the sources in `assets/images/logos/README.md`:

**Priority logos to get:**
- **New York Post**: https://upload.wikimedia.org/wikipedia/commons/4/41/New_York_Post_logo.svg
- **Point Park University**: Right-click logo on pointpark.edu
- **Pittsburgh Magazine**: Right-click logo on pittsburghmagazine.com  
- **The Globe**: Right-click logo on ppuglobe.com

### 4. **Push to GitHub**
```bash
git add .
git commit -m "Add assets structure and updated about page"
git push origin main
```

### 5. **GitHub Raw URLs**
Your files will be accessible at:
- **Resume**: `https://raw.githubusercontent.com/YOUR_USERNAME/McCals-Website/main/assets/downloads/caleb-mccartney-resume.pdf`
- **Logos**: `https://raw.githubusercontent.com/YOUR_USERNAME/McCals-Website/main/assets/images/logos/FILENAME.png`

## 📧 Email Updates Applied:
- Updated all email links to: `contact@mcc-cal.com`
- Contact form: Updated
- Footer email: Updated

## 🎯 Widget Features Added:
- **Fallback system**: If GitHub logos fail, shows colored placeholders
- **Error handling**: Graceful fallback to placeholder images
- **Professional styling**: Organization-appropriate colors for placeholders

## 🚀 Next Steps:

1. **Replace `YOUR_GITHUB_USERNAME`** with your actual GitHub username
2. **Add your resume PDF** to `assets/downloads/caleb-mccartney-resume.pdf`
3. **Download and add logo files** to `assets/images/logos/`
4. **Test the download link** after pushing to GitHub
5. **Use the widget code** in your Squarespace about page

## 📋 Squarespace Implementation:
Copy the widget code from `client-logos-widget-squarespace.html` and paste it into a Squarespace Code Block on your about page.

## 🔄 File Management:
- **Version control**: All files tracked in Git
- **Easy updates**: Just push new files to update website
- **Reliable hosting**: GitHub's CDN ensures fast global access
- **Free hosting**: GitHub raw files are free and reliable

Your professional about page now properly showcases your impressive credentials with reliable file hosting! 🎉