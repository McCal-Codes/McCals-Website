# Test Site Deployment Guide

This guide covers how to deploy test versions of your McCal Media website to various hosting platforms for testing and staging purposes.

## 🚀 Quick Deploy (Recommended)

### 1. Build & Test Locally
```bash
# Build the production-ready site
npm run build

# Test locally before deploying
npm run serve
```
Visit http://localhost:8080 to verify everything looks correct.

### 2. One-Command Deployment
```bash
# Deploy to Netlify (recommended for staging)
npm run deploy:netlify

# Or deploy to Vercel
npm run deploy:vercel

# Or deploy to Surge (simplest option)
npm run deploy:surge
```

## 📋 Platform-Specific Instructions

### Netlify (Recommended for Staging)

**Why Netlify?**
- Free tier with custom domains
- Automatic HTTPS
- Easy rollback to previous versions
- Branch previews available

**Setup (One-time):**
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Initialize site: `netlify init`

**Deploy:**
```bash
npm run build
npm run deploy:netlify
```

**Custom Domain (Optional):**
```bash
netlify sites:update --name your-custom-name
# Site will be available at: https://your-custom-name.netlify.app
```

### Vercel (Best for Production)

**Why Vercel?**
- Excellent performance
- Global CDN
- Automatic deployments from Git
- Free tier with custom domains

**Setup (One-time):**
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`

**Deploy:**
```bash
npm run build
npm run deploy:vercel
```

**Git Integration:**
```bash
# Link to Git repository for automatic deployments
vercel --prod
```

### Surge (Simplest Option)

**Why Surge?**
- Fastest setup
- No account required for basic use
- Custom domains on free tier
- Perfect for quick tests

**Setup (One-time):**
```bash
npm install -g surge
```

**Deploy:**
```bash
npm run build
npm run deploy:surge
```

**Custom Domain:**
```bash
surge dist/ your-custom-domain.surge.sh
```

## 🧪 Testing Different Versions

### Deploy Main Site
```bash
# Deploy the main photo gallery site
npm run build
npm run deploy:netlify
```

### Deploy Standalone Version
```bash
# Deploy the alternative standalone version
cd site-workspace/public-site-standalone
surge . your-test-site.surge.sh
```

### Deploy Specific Widgets
```bash
# Test individual widgets
cd widgets/concert-portfolio/versions
surge . concert-test.surge.sh
```

## 🔧 Advanced Deployment Options

### Environment-Specific Builds

**Development Build:**
```bash
npm run dev  # Starts local dev server with hot reload
```

**Production Build:**
```bash
npm run build  # Optimized build for deployment
```

**Testing Build:**
```bash
npm run serve  # Serve production build locally
```

### Multiple Test Environments

**Staging Environment:**
```bash
# Deploy to staging subdomain
npm run build
netlify deploy --alias=staging
# Available at: https://staging--your-site.netlify.app
```

**Feature Testing:**
```bash
# Deploy specific feature branch
git checkout feature-branch
npm run build
netlify deploy --alias=feature-test
# Available at: https://feature-test--your-site.netlify.app
```

### Custom Deployment Script

Create a custom deployment script for your workflow:

```bash
#!/bin/bash
# deploy-test.sh

echo "🔧 Building site..."
npm run build

echo "📋 Running pre-deployment checks..."
# Add any tests or validations here

echo "🚀 Deploying to test environment..."
netlify deploy --dir=dist --message="Test deployment $(date)"

echo "✅ Deployment complete!"
echo "🌐 Visit your test site at the URL shown above"
```

Make it executable and use:
```bash
chmod +x deploy-test.sh
./deploy-test.sh
```

## 🛠️ Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear any cached builds
rm -rf dist/
npm run build
```

**Images Not Loading:**
```bash
# Ensure images directory is properly copied
npm run build  # This copies images/ to dist/images/
```

**Deployment Command Not Found:**
```bash
# Install missing CLI tools
npm install -g netlify-cli vercel surge
```

**Permission Errors:**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

### Platform-Specific Issues

**Netlify:**
- Check build logs in Netlify dashboard
- Verify `dist/` directory contains all files
- Ensure custom domains are properly configured

**Vercel:**
- Check project settings in Vercel dashboard
- Verify build command is set to `npm run build`
- Ensure output directory is set to `dist`

**Surge:**
- Domain conflicts: use unique domain names
- File size limits: optimize large images
- HTTPS: custom domains need HTTPS setup

## 📊 Monitoring Your Test Sites

### Check Site Status
```bash
# Netlify
netlify status

# Vercel
vercel ls

# Surge
surge list
```

### Performance Testing
```bash
# Test site speed locally
npm run serve &
open http://localhost:8080

# Use online tools for deployed sites:
# - Google PageSpeed Insights
# - GTmetrix
# - WebPageTest
```

## 🔄 Deployment Workflows

### Quick Test Workflow
1. Make changes to `site/` files
2. `npm run build`
3. `npm run serve` (test locally)
4. `npm run deploy:surge` (quick online test)

### Staging Workflow
1. Make changes and test locally
2. Deploy to staging: `netlify deploy`
3. Review and approve
4. Deploy to production: `netlify deploy --prod`

### Feature Testing Workflow
1. Create feature branch
2. Deploy to feature URL
3. Share with stakeholders
4. Merge and deploy to main

## 📝 Best Practices

### Before Deploying
- [ ] Test locally with `npm run serve`
- [ ] Check all images load correctly
- [ ] Verify responsive design on mobile
- [ ] Test all interactive elements

### Security
- [ ] Never commit API keys or secrets
- [ ] Use environment variables for sensitive data
- [ ] Review deployed files for any sensitive information

### Performance
- [ ] Optimize images before committing
- [ ] Minimize CSS and JavaScript in production builds
- [ ] Test loading speed on slow connections

### Documentation
- [ ] Document any deployment-specific configuration
- [ ] Keep track of deployed URLs
- [ ] Note any platform-specific requirements

## 🆘 Need Help?

### Quick Commands Reference
```bash
npm run build       # Build for production
npm run serve       # Test locally
npm run dev         # Development server
npm run deploy      # Deploy using main deployment script
```

### Support Resources
- **Netlify Docs**: https://docs.netlify.com/
- **Vercel Docs**: https://vercel.com/docs
- **Surge Docs**: https://surge.sh/help/

### Common URLs After Deployment
- **Netlify**: `https://[site-name].netlify.app`
- **Vercel**: `https://[project-name].vercel.app`  
- **Surge**: `https://[domain].surge.sh`

---

**💡 Pro Tip**: Save the URLs of your test deployments in a text file or bookmark them for easy access during development and testing phases.