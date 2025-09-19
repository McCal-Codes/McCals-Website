#!/usr/bin/env node
/**
 * Auto Manifest Updater - Scheduled Concert Manifest Generator
 * 
 * This script runs the enhanced manifest generator automatically
 * and can be scheduled to run periodically (e.g., via cron)
 * 
 * Features:
 * - Automated manifest generation
 * - Logging with timestamps
 * - Error handling and recovery
 * - Summary reporting
 * - Git integration (optional)
 * 
 * Usage:
 *   node scripts/auto-manifest-updater.js
 *   npm run manifest:auto-update
 * 
 * Author: McCal-Codes
 * Version: 1.0
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const SCRIPT_PATH = path.resolve(__dirname, 'enhanced-manifest-generator.js');
const LOG_DIR = path.resolve(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'manifest-updates.log');
const SUMMARY_FILE = path.join(LOG_DIR, 'last-update-summary.json');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Enhanced logging with timestamps
 */
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logEntry);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
    
    // Append to log file
    const fileEntry = data 
        ? `${logEntry}\n${JSON.stringify(data, null, 2)}\n\n`
        : `${logEntry}\n\n`;
        
    fs.appendFileSync(LOG_FILE, fileEntry);
}

/**
 * Run the enhanced manifest generator
 */
function runManifestGenerator(options = {}) {
    return new Promise((resolve, reject) => {
        const args = ['--auto'];
        if (options.verbose) args.push('--verbose');
        if (options.dryRun) args.push('--dry');
        
        log('info', `Starting manifest generation with args: ${args.join(' ')}`);
        
        const child = spawn('node', [SCRIPT_PATH, ...args], {
            stdio: 'pipe',
            cwd: path.dirname(SCRIPT_PATH)
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            // Log significant output in real-time
            if (output.includes('Processing:') || output.includes('✅') || output.includes('📊')) {
                process.stdout.write(output);
            }
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                log('info', 'Manifest generation completed successfully');
                resolve({ stdout, stderr, code });
            } else {
                log('error', `Manifest generation failed with exit code ${code}`, { stderr });
                reject(new Error(`Process exited with code ${code}: ${stderr}`));
            }
        });
        
        child.on('error', (error) => {
            log('error', 'Failed to start manifest generator', error.message);
            reject(error);
        });
    });
}

/**
 * Parse output to extract summary information
 */
function parseOutput(stdout) {
    const summary = {
        processedCount: 0,
        totalCount: 0,
        enhancedCount: 0,
        directories: [],
        timestamp: new Date().toISOString()
    };
    
    // Extract processed count
    const processedMatch = stdout.match(/📊 Processed (\d+)\/(\d+) directories successfully/);
    if (processedMatch) {
        summary.processedCount = parseInt(processedMatch[1]);
        summary.totalCount = parseInt(processedMatch[2]);
    }
    
    // Extract directory information
    const directoryMatches = stdout.matchAll(/📁 Processing: (.+)/g);
    for (const match of directoryMatches) {
        summary.directories.push(match[1]);
    }
    
    // Extract enhanced manifest count
    const enhancedMatches = stdout.matchAll(/📅 Date detected:/g);
    summary.enhancedCount = Array.from(enhancedMatches).length;
    
    return summary;
}

/**
 * Check if git is available and repo has changes
 */
async function checkGitStatus() {
    return new Promise((resolve) => {
        const child = spawn('git', ['status', '--porcelain'], {
            stdio: 'pipe',
            cwd: path.dirname(__dirname)
        });
        
        let stdout = '';
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                const changes = stdout.trim().split('\n').filter(line => line.includes('manifest.json'));
                resolve({ hasGit: true, manifestChanges: changes });
            } else {
                resolve({ hasGit: false, manifestChanges: [] });
            }
        });
        
        child.on('error', () => {
            resolve({ hasGit: false, manifestChanges: [] });
        });
    });
}

/**
 * Optional: Commit manifest changes to git
 */
async function commitChanges(summary) {
    const gitStatus = await checkGitStatus();
    
    if (!gitStatus.hasGit) {
        log('warn', 'Git not available, skipping commit');
        return false;
    }
    
    if (gitStatus.manifestChanges.length === 0) {
        log('info', 'No manifest changes to commit');
        return false;
    }
    
    log('info', `Found ${gitStatus.manifestChanges.length} manifest changes`, gitStatus.manifestChanges);
    
    // For safety, we'll just log what would be committed rather than auto-commit
    // Uncomment the following lines if you want automatic commits
    /*
    return new Promise((resolve, reject) => {
        const commitMessage = `Auto-update concert manifests (${summary.processedCount} directories, ${summary.enhancedCount} enhanced)`;
        
        const child = spawn('git', ['commit', '-am', commitMessage], {
            stdio: 'pipe',
            cwd: path.dirname(__dirname)
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                log('info', 'Successfully committed manifest changes');
                resolve(true);
            } else {
                log('warn', 'Failed to commit changes');
                resolve(false);
            }
        });
        
        child.on('error', (error) => {
            log('error', 'Git commit error', error.message);
            resolve(false);
        });
    });
    */
    
    log('info', 'Would commit changes (auto-commit disabled for safety)');
    return false;
}

/**
 * Main execution function
 */
async function main() {
    const startTime = performance.now();
    log('info', '🚀 Starting automated manifest update');
    
    try {
        // Run manifest generation
        const result = await runManifestGenerator({ verbose: false });
        
        // Parse results
        const summary = parseOutput(result.stdout);
        log('info', '📊 Manifest update summary', summary);
        
        // Save summary to file
        fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
        log('info', `💾 Summary saved to ${SUMMARY_FILE}`);
        
        // Optional: Check for git changes
        await commitChanges(summary);
        
        const duration = Math.round(performance.now() - startTime);
        log('info', `✅ Automated manifest update completed in ${duration}ms`);
        
        // Exit with success
        process.exit(0);
        
    } catch (error) {
        log('error', '❌ Automated manifest update failed', {
            error: error.message,
            stack: error.stack
        });
        
        // Exit with error
        process.exit(1);
    }
}

/**
 * Handle CLI arguments
 */
function handleArgs() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Auto Manifest Updater for Concert Portfolio

Usage:
  node auto-manifest-updater.js                 Run automatic manifest update
  node auto-manifest-updater.js --help          Show this help
  
Features:
- Automatically discovers and processes all concert directories
- Extracts dates from image filenames and EXIF data
- Generates enhanced manifests with metadata
- Logs all operations with timestamps
- Provides summary reports

Logs are saved to: ${LOG_FILE}
Last update summary: ${SUMMARY_FILE}

For manual control, use:
  npm run manifest:dry-run     Preview changes without writing
  npm run manifest:generate    Generate manifests
        `);
        process.exit(0);
    }
}

// Execute if run directly
if (require.main === module) {
    handleArgs();
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    runManifestGenerator,
    parseOutput,
    checkGitStatus,
    log
};