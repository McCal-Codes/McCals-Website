# Package Deployment Guide

This guide covers different ways to deploy your McCal Media website as a package for distribution and deployment.

## 📦 Available Package Formats

### 1. NPM Tarball Package
Your project is already configured as an npm package.

**Create Package:**
```bash
npm run package
# Creates: mccal-media-website-1.0.0.tgz (~20.8 MB)
```

**Package Contents:**
- Source code (`site/`, `scripts/`, `widgets/`)
- Image assets (`images/`)
- Documentation (`README.md`, `DEPLOYMENT.md`)
- Build tools and configuration
- Dependencies definitions

### 2. Docker Container
**Build Container:**
```bash
npm run docker:build
```

**Run Locally:**
```bash
npm run docker:run
# Website available at http://localhost:8080
```

**Deploy Container:**
```bash
npm run docker:deploy
# Runs container in background
```

## 🚀 Deployment Platforms

### NPM Registry (Private)

**Setup:**
```bash
# Configure private registry
npm config set registry https://your-private-registry.com
npm config set @mccal:registry https://your-private-registry.com

# Login
npm login
```

**Deploy:**
```bash
npm publish
```

### GitHub Packages

**Setup (.npmrc):**
```bash
echo "@mccal:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

**Deploy:**
```bash
npm publish
```

**Install from GitHub:**
```bash
npm install @mccal/mccal-media-website
```

### Docker Hub

**Build & Tag:**
```bash
docker build -t mccal/website:latest .
docker tag mccal/website:latest mccal/website:1.0.0
```

**Push:**
```bash
docker login
docker push mccal/website:latest
docker push mccal/website:1.0.0
```

**Deploy:**
```bash
docker run -d -p 8080:8080 --name mccal-website mccal/website:latest
```

### Cloud Platforms

#### AWS ECS/Fargate
```bash
# Build for AWS
docker build -t mccal-website .

# Tag for ECR
docker tag mccal-website:latest 123456789.dkr.ecr.region.amazonaws.com/mccal-website:latest

# Push to ECR
docker push 123456789.dkr.ecr.region.amazonaws.com/mccal-website:latest
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/mccal-website
gcloud run deploy --image gcr.io/PROJECT_ID/mccal-website --platform managed
```

#### Azure Container Instances
```bash
# Build and push to ACR
az acr build --registry myregistry --image mccal-website .

# Deploy
az container create --resource-group myRG --name mccal-website --image myregistry.azurecr.io/mccal-website
```

## 📁 Package Distribution

### Direct File Distribution

**Create Distribution Archive:**
```bash
# Create optimized distribution
npm run build
tar -czf mccal-website-dist.tar.gz dist/

# Or create full source distribution
tar -czf mccal-website-full.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='site-workspace' \
  .
```

**Extract and Run:**
```bash
tar -xzf mccal-website-dist.tar.gz
cd dist/
python -m http.server 8080  # Or any static server
```

### Standalone Executable (Using pkg)

**Setup:**
```bash
npm install -g pkg
```

**Create Executable:**
```bash
# Add to package.json:
"bin": "./server.js",
"pkg": {
  "targets": ["node14-macos-x64", "node14-linux-x64", "node14-win-x64"],
  "assets": ["dist/**/*"]
}

# Build
pkg package.json
```

## 🔄 Automated Deployment

### GitHub Actions
```yaml
# .github/workflows/deploy-package.yml
name: Deploy Package
on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://npm.pkg.github.com'
      
      - run: npm ci
      - run: npm run build
      - run: npm run package
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

### Docker Build & Deploy
```yaml
# .github/workflows/docker-deploy.yml
name: Docker Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t mccal/website .
        
      - name: Login to Docker Hub
        run: echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        
      - name: Push to Docker Hub
        run: docker push mccal/website
```

## 📋 Package Optimization

### Reduce Package Size

**Update .dockerignore:**
```bash
# Already created - excludes:
# - Development files (site-workspace/)
# - Documentation (optional)
# - Build artifacts (dist/)
# - Git history (.git/)
```

**Update .npmignore (for npm packages):**
```bash
# Create .npmignore
echo "site-workspace/" >> .npmignore
echo "dist/" >> .npmignore
echo ".agent_memory.db" >> .npmignore
echo "scripts/deploy-test.sh" >> .npmignore
```

### Multi-stage Docker Build
```dockerfile
# Optimized Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🎯 Deployment Strategies

### Blue-Green Deployment
```bash
# Deploy new version alongside old
docker run -d -p 8081:8080 --name mccal-website-green mccal/website:new

# Test new version
curl http://localhost:8081

# Switch traffic (update load balancer)
# Remove old version
docker stop mccal-website-blue
docker rm mccal-website-blue
```

### Rolling Updates (Kubernetes)
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mccal-website
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: mccal-website
  template:
    metadata:
      labels:
        app: mccal-website
    spec:
      containers:
      - name: website
        image: mccal/website:latest
        ports:
        - containerPort: 8080
```

## 🛠️ Package Commands Reference

```bash
# NPM Package
npm run package              # Create .tgz package
npm publish                  # Deploy to npm registry

# Docker
npm run docker:build         # Build container
npm run docker:run           # Run locally  
npm run docker:deploy        # Deploy container

# Testing
npm run build               # Build website
npm run serve               # Test locally
npm run test-deploy         # Interactive deployment
```

## 🔍 Package Verification

### Test NPM Package
```bash
# Install locally
npm pack
npm install ./mccal-media-website-1.0.0.tgz

# Test in clean environment
mkdir test-install
cd test-install
npm init -y
npm install ../mccal-media-website-1.0.0.tgz
npx mccal-media-website
```

### Test Docker Container
```bash
# Build and test
docker build -t mccal-test .
docker run -p 8080:8080 mccal-test

# Check health
docker exec mccal-website curl -f http://localhost:8080
```

## 📈 Monitoring Deployed Packages

### Health Checks
- Docker containers include health check endpoint
- Monitor using external tools (Pingdom, UptimeRobot)
- Set up alerts for downtime

### Logging
```bash
# Docker logs
docker logs mccal-website

# Application logs
docker exec mccal-website tail -f /var/log/nginx/access.log
```

---

**💡 Pro Tip**: Choose deployment method based on your needs:
- **NPM Package**: For developers who want to use your site as a template
- **Docker Container**: For production deployments with scaling
- **Tarball Distribution**: For simple file-based hosting
- **Cloud Platforms**: For enterprise-grade hosting with auto-scaling