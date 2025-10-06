#!/bin/bash

# McCal Media Website - Test Deployment Script
# This script builds the site and deploys it to a test environment

set -e  # Exit on any error

echo "🔧 McCal Media Website - Test Deployment"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo ""
echo "📋 Pre-deployment checks..."

# Check if dist directory exists and clean it
if [ -d "dist" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf dist/
fi

# Check if site directory exists
if [ ! -d "site" ]; then
    echo "❌ Error: site/ directory not found"
    exit 1
fi

# Check if images directory exists
if [ ! -d "images" ]; then
    echo "⚠️  Warning: images/ directory not found"
fi

echo "✅ Pre-deployment checks passed"
echo ""

echo "🔨 Building site..."
npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Error: Build failed or dist directory is empty"
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Ask user which platform to deploy to
echo "🚀 Choose deployment platform:"
echo "1) Surge (simplest, no setup required)"
echo "2) Netlify (recommended for staging)"
echo "3) Vercel (best for production)"
echo "4) Just build (no deployment)"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Deploying to Surge..."
        if ! command -v surge &> /dev/null; then
            echo "📦 Installing Surge CLI..."
            npm install -g surge
        fi
        
        # Generate a random subdomain for testing
        RANDOM_NAME="mccal-test-$(date +%s)"
        echo "🔗 Deploying to: https://$RANDOM_NAME.surge.sh"
        
        surge dist/ "$RANDOM_NAME.surge.sh"
        ;;
        
    2)
        echo ""
        echo "🌐 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "❌ Error: Netlify CLI not found. Please install it first:"
            echo "   npm install -g netlify-cli"
            echo "   netlify login"
            exit 1
        fi
        
        netlify deploy --dir=dist --message="Test deployment $(date)"
        ;;
        
    3)
        echo ""
        echo "🌐 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "❌ Error: Vercel CLI not found. Please install it first:"
            echo "   npm install -g vercel"
            echo "   vercel login"
            exit 1
        fi
        
        cd dist && vercel --prod
        ;;
        
    4)
        echo ""
        echo "✅ Build complete! Files are ready in dist/ directory"
        echo "💡 You can test locally with: npm run serve"
        ;;
        
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 What's next?"
echo "  • Test your deployed site thoroughly"
echo "  • Check mobile responsiveness"
echo "  • Verify all images load correctly"
echo "  • Test all interactive elements"
echo ""
echo "📚 For more deployment options, see: DEPLOYMENT.md"