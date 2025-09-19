# Quick Deployment Cheatsheet

## 🚀 One-Command Deployments

```bash
# Interactive deployment (recommended)
npm run test-deploy

# Quick Surge deployment
npm run build && npm run deploy:surge

# Netlify production
npm run build && npm run deploy:netlify

# Vercel production  
npm run build && npm run deploy:vercel

# Local testing
npm run serve
```

## 📋 Platform Setup (One-time)

### Surge
```bash
npm install -g surge
# No login required for basic use
```

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify init  # In project directory
```

### Vercel
```bash
npm install -g vercel
vercel login
```

## 🔄 Quick Workflows

### Test Locally First
```bash
npm run build    # Build the site
npm run serve    # Test at http://localhost:8080
```

### Deploy Different Versions
```bash
# Main site
npm run build && npm run deploy:surge

# Standalone version
cd site-workspace/public-site-standalone
surge . my-test-site.surge.sh

# Specific widget
cd widgets/concert-portfolio/versions
surge . concert-widget.surge.sh
```

## 🎯 Platform Recommendations

- **Quick Testing**: Surge (fastest setup)
- **Staging/Preview**: Netlify (best features)  
- **Production**: Vercel (best performance)
- **Standalone**: Static files from `site-workspace/public-site-standalone/`

## 📞 URLs After Deployment
- Surge: `https://your-site.surge.sh`
- Netlify: `https://your-site.netlify.app`
- Vercel: `https://your-project.vercel.app`

## 🆘 Common Issues
- Command not found → Install CLI: `npm install -g [platform]-cli`
- Build fails → Clear dist: `rm -rf dist/ && npm run build`
- Images missing → Check images/ directory exists

---
**💡 For detailed instructions, see `DEPLOYMENT.md`**