#!/usr/bin/env node
/**
 * Caption Generator for Journalism Photos
 * Creates AP-style captions for photos missing them
 */

import { promises as fs } from 'fs';

// Caption templates by event type
const CAPTION_TEMPLATES = {
  'Brentwood Vs Springdale': (filename, date) => {
    const match = filename.match(/CAL(\d+)/);
    const photoNum = match ? match[1] : '0000';
    return `Brentwood High School football action during the game against Springdale, Brentwood, Pa., ${formatDate(date)}.`;
  },
  
  'Historic Society Yard Sale August 2025': (filename, date) => {
    return `Vendors and shoppers at the Brentwood Area Historical Society annual yard sale, Brentwood, Pa., ${formatDate(date)}.`;
  },
  
  'CMU Trump Protest': (filename, date) => {
    return `Demonstrators protest at Carnegie Mellon University in Pittsburgh, Pa., ${formatDate(date)}.`;
  },
  
  'Butler Democracy Protest': (filename, date) => {
    return `Community members gather for a protest in Butler, Pa., ${formatDate(date)}.`;
  },
  
  'Kamala Harris in Pittsburgh on Election Eve': (filename, date) => {
    return `Vice President Kamala Harris campaigns in Pittsburgh, Pa., ${formatDate(date)}.`;
  },
  
  'Scarlett Johansson GOTV Canvas Launch': (filename, date) => {
    return `Actress Scarlett Johansson rallies supporters at a get-out-the-vote event in Pittsburgh, Pa., ${formatDate(date)}.`;
  },
  
  'Bill Clinton Speaks at Pitt Greensburg': (filename, date) => {
    return `Former President Bill Clinton speaks at a campaign event at Pitt Greensburg in Greensburg, Pa., ${formatDate(date)}.`;
  },
  
  'Kamala Harris Speaks at Erie': (filename, date) => {
    return `Vice President Kamala Harris speaks at a campaign rally in Erie, Pa., ${formatDate(date)}.`;
  },
  
  'Obama Speaks at Pittsburgh': (filename, date) => {
    return `Former President Barack Obama speaks at a campaign event in Pittsburgh, Pa., ${formatDate(date)}.`;
  },
  
  'Trump Returns to Butler': (filename, date) => {
    return `Former President Donald Trump speaks at a campaign rally in Butler, Pa., ${formatDate(date)}.`;
  },
  
  'Tim Waltz Campaign Rally in Erie': (filename, date) => {
    return `Minnesota Gov. Tim Walz speaks at a campaign rally in Erie, Pa., ${formatDate(date)}.`;
  },
  
  'VP Debate Watch Party': (filename, date) => {
    return `Attendees gather for a vice presidential debate watch party, ${formatDate(date)}.`;
  },
  
  'Trump Rally in Erie': (filename, date) => {
    return `Former President Donald Trump speaks at a campaign rally in Erie, Pa., ${formatDate(date)}.`;
  },
  
  'Pitt Palestine Protest': (filename, date) => {
    return `Students demonstrate at a protest on the University of Pittsburgh campus, Pittsburgh, Pa., ${formatDate(date)}.`;
  },
  
  'The Globe - Political Coverage': (filename, date) => {
    return `Point Park University students participate in a student government election event on campus in Pittsburgh, Pa., ${formatDate(date)}.`;
  },
  
  'The Globe - Homeless Tent Coverage': (filename, date) => {
    return `Social documentary coverage of homeless encampment in Pittsburgh, Pa., ${formatDate(date)}.`;
  },
  
  'The Globe - Pizza with President': (filename, date) => {
    return `Student engagement event with university president at Point Park University, Pittsburgh, Pa., ${formatDate(date)}.`;
  },
  
  'The Globe - Journalist Panel': (filename, date) => {
    return `Professional journalist panel discussion at Point Park University, Pittsburgh, Pa., ${formatDate(date)}.`;
  }
};

function formatDate(isoDate) {
  if (!isoDate) return '2024';
  const date = new Date(isoDate);
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

async function generateCaptions() {
  const manifestPath = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\Journalism\\journalism-manifest.json';
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  console.log('📝 GENERATING JOURNALISM CAPTIONS');
  console.log('═'.repeat(70));
  
  let generated = 0;
  let skipped = 0;
  
  manifest.events.forEach(event => {
    const templateFn = CAPTION_TEMPLATES[event.eventName];
    if (!templateFn) {
      console.log(`⚠️  No template for: ${event.eventName}`);
      return;
    }
    
    event.images.forEach(img => {
      if (!img.caption || img.caption.length < 30) {
        img.caption = templateFn(img.filename, event.eventDate?.iso);
        generated++;
      } else {
        skipped++;
      }
    });
  });
  
  console.log(`Generated: ${generated} captions`);
  console.log(`Skipped (already have): ${skipped} captions`);
  console.log('');
  
  // Show samples
  console.log('Sample generated captions:');
  let sampleCount = 0;
  for (const event of manifest.events) {
    for (const img of event.images) {
      if (img.caption && sampleCount < 5) {
        console.log(`\n  📷 ${img.filename}`);
        console.log(`     "${img.caption}"`);
        sampleCount++;
      }
    }
  }
  
  // Save updated manifest
  manifest.version = '2.1.0';
  manifest.generated = new Date().toISOString();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('\n═'.repeat(70));
  console.log('✅ Updated journalism-manifest.json with captions');
}

generateCaptions().catch(console.error);
