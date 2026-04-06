#!/usr/bin/env node
/**
 * Caption Audit for Journalism Photos
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function auditCaptions() {
  const manifestPath = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\Journalism\\journalism-manifest.json';
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  console.log('📰 PHOTO CAPTION AUDIT - JOURNALISM');
  console.log('═'.repeat(70));

  let totalImages = 0;
  let withGoodCaptions = 0;
  let withShortCaptions = 0;
  let missingCaptions = 0;
  const needsWork = [];

  manifest.events.forEach(event => {
    event.images.forEach(img => {
      totalImages++;
      const caption = img.caption || '';
      const captionLength = caption.length;
      
      if (captionLength > 50 && caption.includes('-')) {
        withGoodCaptions++;
      } else if (captionLength > 0 && captionLength <= 50) {
        withShortCaptions++;
        needsWork.push({
          event: event.eventName,
          filename: img.filename,
          issue: 'short caption',
          current: caption,
          date: event.eventDate?.iso
        });
      } else {
        missingCaptions++;
        needsWork.push({
          event: event.eventName,
          filename: img.filename,
          issue: 'missing caption',
          current: '',
          date: event.eventDate?.iso
        });
      }
    });
  });

  console.log(`Total images: ${totalImages}`);
  console.log(`Good captions: ${withGoodCaptions}`);
  console.log(`Short captions: ${withShortCaptions}`);
  console.log(`Missing captions: ${missingCaptions}`);
  console.log('');

  // Group by event
  const byEvent = {};
  needsWork.forEach(item => {
    if (!byEvent[item.event]) {
      byEvent[item.event] = [];
    }
    byEvent[item.event].push(item);
  });

  console.log('Events needing captions:');
  Object.entries(byEvent).forEach(([event, items]) => {
    console.log(`\n  📁 ${event} (${items.length} photos)`);
    items.slice(0, 3).forEach(item => {
      console.log(`    • ${item.filename}`);
      if (item.current) {
        console.log(`      Current: "${item.current.substring(0, 60)}..."`);
      } else {
        console.log(`      Current: [none]`);
      }
    });
    if (items.length > 3) {
      console.log(`    ... and ${items.length - 3} more`);
    }
  });

  // Save audit
  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      totalImages,
      withGoodCaptions,
      withShortCaptions,
      missingCaptions
    },
    needsWork: needsWork.slice(0, 100)
  };

  const outputPath = join(__dirname, '..', '..', 'updates', 'journalism-caption-audit.json');
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Saved to: updates/journalism-caption-audit.json`);
}

auditCaptions().catch(console.error);
