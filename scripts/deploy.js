#!/usr/bin/env node
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 McCal Media Website Deployment\n - deploy.js:10');

// Check if we have command line arguments
const platform = process.argv[2];

if (platform) {
  deploy(platform);
} else {
  // Interactive mode
  console.log('Select deployment platform: - deploy.js:19');
  console.log('1. Netlify (recommended for static sites) - deploy.js:20');
  console.log('2. Vercel (great for performance) - deploy.js:21');
  console.log('3. Surge (simple and fast) - deploy.js:22');
  console.log('4. All platforms\n - deploy.js:23');

  rl.question('Enter your choice (1-4): ', (answer) => {
    const platforms = {
      '1': 'netlify',
      '2': 'vercel', 
      '3': 'surge',
      '4': 'all'
    };
    
    const choice = platforms[answer];
    if (choice) {
      deploy(choice);
    } else {
      console.log('❌ Invalid choice. Please run again. - deploy.js:37');
      process.exit(1);
    }
    rl.close();
  });
}

function deploy(platform) {
  console.log(`\n🔧 Building website... - deploy.js:45`);
  
  try {
    // Run build first
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build complete!\n - deploy.js:50');
    
    if (platform === 'all') {
      deployToAll();
    } else {
      deployToPlatform(platform);
    }
  } catch (error) {
    console.error('❌ Build failed: - deploy.js:58', error.message);
    process.exit(1);
  }
}

function deployToPlatform(platform) {
  const commands = {
    netlify: 'npm run deploy:netlify',
    vercel: 'npm run deploy:vercel',
    surge: 'npm run deploy:surge'
  };
  
  const command = commands[platform];
  if (!command) {
    console.error(`❌ Unknown platform: ${platform} - deploy.js:72`);
    process.exit(1);
  }
  
  console.log(`🚀 Deploying to ${platform}... - deploy.js:76`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`\n✅ Successfully deployed to ${platform}! - deploy.js:79`);
  } catch (error) {
    console.error(`❌ Deployment to ${platform} failed: - deploy.js:81`, error.message);
    process.exit(1);
  }
}

function deployToAll() {
  const platforms = ['netlify', 'vercel', 'surge'];
  console.log('🚀 Deploying to all platforms...\n - deploy.js:88');
  
  for (const platform of platforms) {
    try {
      console.log(`📤 Deploying to ${platform}... - deploy.js:92`);
      execSync(`npm run deploy:${platform}`, { stdio: 'inherit' });
      console.log(`✅ ${platform} deployment complete!\n - deploy.js:94`);
    } catch (error) {
      console.error(`❌ ${platform} deployment failed: - deploy.js:96`, error.message);
      console.log(`⚠️  Continuing with other platforms...\n - deploy.js:97`);
    }
  }
  
  console.log('🎉 Multiplatform deployment complete! - deploy.js:101');
}