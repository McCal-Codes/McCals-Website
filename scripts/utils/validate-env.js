#!/usr/bin/env node

/**
 * Environment Variable Validator
 * Checks for required environment variables and validates their format
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Required environment variables for different environments
const requiredVars = {
  development: ['NODE_ENV', 'PORT', 'API_PORT'],
  staging: ['NODE_ENV', 'PORT', 'API_PORT', 'MANIFEST_BASE_URL', 'ALLOWED_ORIGINS'],
  production: [
    'NODE_ENV',
    'PORT',
    'API_PORT',
    'MANIFEST_BASE_URL',
    'ALLOWED_ORIGINS',
    'BLOG_JWT_SECRET',
    'WEBHOOK_SECRET',
  ],
};

// Variables that should NOT be default/weak values in production
const securityVars = {
  BLOG_JWT_SECRET: 'dev-jwt-secret-change-in-production',
  WEBHOOK_SECRET: 'dev-webhook-secret-change-in-production',
  SESSION_SECRET: 'dev-session-secret-change-in-production',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredVars[env] || requiredVars.development;

  log('\n🔍 Environment Variable Validation', 'cyan');
  log('='.repeat(50), 'cyan');
  log(`Environment: ${env}`, 'blue');
  log('');

  let missing = [];
  let warnings = [];
  let valid = [];

  // Check required variables
  required.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      valid.push(varName);
    }
  });

  // Check for weak/default secrets in production
  if (env === 'production') {
    Object.entries(securityVars).forEach(([varName, weakValue]) => {
      if (process.env[varName] === weakValue) {
        warnings.push(`${varName} is using default/weak value`);
      }
    });
  }

  // Check for .env file existence
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envPath)) {
    log('⚠️  No .env file found', 'yellow');
    if (fs.existsSync(envExamplePath)) {
      log('💡 Tip: Copy .env.example to .env and configure your values', 'yellow');
    }
    log('');
  }

  // Display results
  if (valid.length > 0) {
    log('✅ Valid Variables:', 'green');
    valid.forEach((v) => log(`   ${v} = ${process.env[v]}`, 'green'));
    log('');
  }

  if (missing.length > 0) {
    log('❌ Missing Required Variables:', 'red');
    missing.forEach((v) => log(`   ${v}`, 'red'));
    log('');
  }

  if (warnings.length > 0) {
    log('⚠️  Security Warnings:', 'yellow');
    warnings.forEach((w) => log(`   ${w}`, 'yellow'));
    log('');
  }

  // Display helpful information
  log('📝 Helpful Commands:', 'cyan');
  log('   npm run env:check      - Check Node.js and environment', 'cyan');
  log('   npm run api:health     - Check API health status', 'cyan');
  log(
    '   node -e "require(\'dotenv\').config(); console.log(process.env)" - View all env vars',
    'cyan'
  );
  log('');

  // Exit with error if critical issues
  if (missing.length > 0) {
    log('❌ Validation failed: Missing required environment variables', 'red');
    process.exit(1);
  }

  if (env === 'production' && warnings.length > 0) {
    log('❌ Validation failed: Security issues in production environment', 'red');
    process.exit(1);
  }

  log('✅ Environment validation passed!', 'green');
  log('');
}

// Run validation
try {
  // Try to load .env file if it exists
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not installed, continue without it
  }

  validateEnv();
} catch (error) {
  log(`❌ Error during validation: ${error.message}`, 'red');
  process.exit(1);
}
