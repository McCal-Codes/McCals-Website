#!/usr/bin/env node
/**
 * Check and fix journalism album ordering
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkJournalismOrder() {
  const manifestPath = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\Journalism\\journalism-manifest.json';
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  console.log('📰 JOURNALISM ALBUMS - DATE ORDER CHECK');
  console.log('═'.repeat(70));

  const events = manifest.events.map((e, i) => ({
    index: i,
    name: e.eventName,
    iso: e.eventDate?.iso || 'unknown',
    display: e.dateDisplay
  }));

  console.log('Current order:');
  events.forEach(e => {
    console.log(`  ${e.index + 1}. ${(e.display || '').padEnd(25)} ${e.name}`);
  });

  // Check if sorted (newest first)
  let isSorted = true;
  const outOfOrder = [];
  
  for (let i = 0; i < events.length - 1; i++) {
    if (events[i].iso && events[i+1].iso && events[i].iso < events[i+1].iso) {
      isSorted = false;
      outOfOrder.push({
        current: events[i],
        next: events[i+1]
      });
    }
  }

  console.log('');
  
  if (isSorted) {
    console.log('✅ Already sorted: Latest first (newest to oldest)');
  } else {
    console.log(`❌ Needs re-sorting: ${outOfOrder.length} out-of-order pairs found`);
    outOfOrder.forEach((pair, i) => {
      if (i < 5) {
        console.log(`   ${pair.current.name} (${pair.current.iso}) should come AFTER ${pair.next.name} (${pair.next.iso})`);
      }
    });
    if (outOfOrder.length > 5) {
      console.log(`   ... and ${outOfOrder.length - 5} more`);
    }
    
    // Sort events by date (newest first)
    manifest.events.sort((a, b) => {
      const dateA = a.eventDate?.iso || '0000-00-00';
      const dateB = b.eventDate?.iso || '0000-00-00';
      return dateB.localeCompare(dateA);
    });
    
    // Save sorted manifest
    manifest.generated = new Date().toISOString();
    manifest.version = '2.0.1';
    
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('');
    console.log('✅ Fixed: Re-sorted events by date (latest first)');
    console.log('💾 Updated journalism-manifest.json');
  }
}

checkJournalismOrder().catch(console.error);
