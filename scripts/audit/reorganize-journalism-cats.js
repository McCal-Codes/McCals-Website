#!/usr/bin/env node
/**
 * Reorganize Journalism Categories
 * - Create Sports category
 * - Move Brentwood vs Springdale to Sports
 * - Rename Events to Documentary
 */

import { promises as fs } from 'fs';

async function reorganizeCategories() {
  const manifestPath = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\Journalism\\journalism-manifest.json';
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  console.log('📰 REORGANIZING JOURNALISM CATEGORIES');
  console.log('═'.repeat(70));
  
  // Current state
  console.log('Current categories:', manifest.categories);
  console.log('Current stats:', manifest.categoryStats);
  console.log('');
  
  // Update categories list
  manifest.categories = ['Politics', 'Sports', 'Documentary'];
  
  // Track counts
  const stats = {
    Politics: 0,
    Sports: 0,
    Documentary: 0
  };
  
  // Update each event
  manifest.events.forEach(event => {
    if (event.eventName === 'Brentwood Vs Springdale') {
      // Move to Sports
      event.category = 'Sports';
      stats.Sports++;
      console.log(`🏈 Moved "${event.eventName}" → Sports (${event.totalImages} photos)`);
    } else if (event.category === 'Events') {
      // Rename Events to Documentary
      event.category = 'Documentary';
      stats.Documentary++;
      console.log(`📷 Changed "${event.eventName}" → Documentary (${event.totalImages} photos)`);
    } else if (event.category === 'Politics') {
      stats.Politics++;
    }
  });
  
  // Update category stats
  manifest.categoryStats = stats;
  
  console.log('');
  console.log('New category breakdown:');
  console.log(`  🏛️  Politics: ${stats.Politics} events`);
  console.log(`  🏈 Sports: ${stats.Sports} events`);
  console.log(`  📷 Documentary: ${stats.Documentary} events`);
  console.log('');
  
  // Update version and timestamp
  manifest.version = '2.2.0';
  manifest.generated = new Date().toISOString();
  
  // Save
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('✅ Updated journalism-manifest.json');
  console.log('   - Sports category created');
  console.log('   - Brentwood vs Springdale moved to Sports');
  console.log('   - Events renamed to Documentary');
}

reorganizeCategories().catch(console.error);
