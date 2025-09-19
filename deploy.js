#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 McCal Media Website Deployment\n');

// Check if we have command line arguments
const platform = process.argv[2];

if (platform) {
  deploy(platform);
} else {
  // Interactive mode
  console.log('Select deployment platform:');
  console.log('1. Netlify (recommended for static sites)');
  console.log('2. Vercel (great for performance)');
  console.log('3. Surge (simple and fast)');
  console.log('4. All platforms\n');

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
      console.log('❌ Invalid choice. Please run again.');
      process.exit(1);
    }
    rl.close();
  });
}

function deploy(platform) {
  console.log(`\n🔧 Building website...`);
  
  try {
    // Run build first
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build complete!\n');
    
    if (platform === 'all') {
      deployToAll();
    } else {
      deployToPlatform(platform);
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
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
    console.error(`❌ Unknown platform: ${platform}`);
    process.exit(1);
  }
  
  console.log(`🚀 Deploying to ${platform}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`\n✅ Successfully deployed to ${platform}!`);
  } catch (error) {
    console.error(`❌ Deployment to ${platform} failed:`, error.message);
    process.exit(1);
  }
}

function deployToAll() {
  const platforms = ['netlify', 'vercel', 'surge'];
  console.log('🚀 Deploying to all platforms...\n');
  
  for (const platform of platforms) {
    try {
      console.log(`📤 Deploying to ${platform}...`);
      execSync(`npm run deploy:${platform}`, { stdio: 'inherit' });
      console.log(`✅ ${platform} deployment complete!\n`);
    } catch (error) {
      console.error(`❌ ${platform} deployment failed:`, error.message);
      console.log(`⚠️  Continuing with other platforms...\n`);
    }
  }
  
  console.log('🎉 Multi-platform deployment complete!');
}