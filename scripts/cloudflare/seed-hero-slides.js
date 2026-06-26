#!/usr/bin/env node
/**
 * One-time seed: migrate all hardcoded heroSlides.ts slides into Supabase.
 * Safe to re-run — uses upsert (conflict on cta).
 *
 *   node scripts/cloudflare/seed-hero-slides.js
 *   node scripts/cloudflare/seed-hero-slides.js --dry-run
 */

'use strict';

const path = require('path');
const { createRequire } = require('module');

const REPO_ROOT = path.join(__dirname, '..', '..');
const VITE_DIR = path.join(REPO_ROOT, 'sites', 'mcc-cal-vite');

const viteRequire = createRequire(path.join(VITE_DIR, 'package.json'));
const { createClient } = viteRequire('@supabase/supabase-js');
const ws = viteRequire('ws');
const dotenv = viteRequire('dotenv');

dotenv.config({ path: path.join(VITE_DIR, '.env.local') });
dotenv.config({ path: path.join(VITE_DIR, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const R2_BASE = (process.env.VITE_R2_PUBLIC_URL || '').replace(/\/$/, '');

const DRY_RUN = process.argv.includes('--dry-run');

// --- Replicates imageUrl.* from useManifest.ts (production = jsDelivr CDN) ---

const CDN = 'https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main';
const PORTFOLIOS = 'src/images/Portfolios';

function enc(seg) { return seg.split('/').map(encodeURIComponent).join('/'); }
const img = {
  journalism: (folder, file) => `${CDN}/${enc(`${PORTFOLIOS}/Journalism/${folder}/${file}`)}`,
  concert:    (folder, file) => `${CDN}/${enc(`${PORTFOLIOS}/${folder}/${file}`)}`,
  event:      (fullPath)     => `${CDN}/${enc(fullPath)}`,
  portrait:   (folder, file) => `${CDN}/${enc(`${PORTFOLIOS}/Portrait/${folder}/${file}`)}`,
  nature:     (folder, file) => `${CDN}/${enc(`${PORTFOLIOS}/Nature/${folder}/${file}`)}`,
  // R2-hosted image (if storage_path is set, image_url is still the full URL for fallback)
  r2:         (storagePath)  => R2_BASE ? `${R2_BASE}/${storagePath}` : null,
};

// --- All slide data, mirroring heroSlides.ts exactly ---

const MAIN_SLIDES = [
  {
    title: 'Pittsburgh',
    meta: 'Pittsburgh',
    href: '/nature',
    cta: 'Pittsburgh',
    sort_order: 0,
    links: [{ url: '/nature', label: 'Nature' }, { url: '/featured-work', label: 'Featured Work' }],
    image_url: img.nature('Landscapes/Downtown Pittsburgh', 'IMGP7209.jpg'),
    alt_text: 'A large, steel truss bridge spans over a body of water at sunset, with trees and buildings visible below and in the background.',
    focal_point_mobile_x: 0.618, focal_point_mobile_y: 0.464,
    focal_point_desktop_x: 0.5,  focal_point_desktop_y: 0.5,
  },
  {
    title: 'Politics',
    meta: 'Politics',
    href: '/journalism',
    cta: 'Politics',
    sort_order: 1,
    links: [{ url: '/journalism', label: 'Journalism' }, { url: '/featured-work', label: 'Featured Work' }],
    image_url: img.journalism('Politics/obama-speaks-pitt', '101024_Obama Speaks at Pittsburgh_CAL3364.jpg'),
    alt_text: 'Former President Barack Obama speaks to supporters at a campaign rally in Pittsburgh.',
    focal_point_mobile_x: 0.5,   focal_point_mobile_y: 0.42,
    focal_point_desktop_x: 0.5,  focal_point_desktop_y: 0.44,
  },
  {
    title: 'Journalism',
    meta: 'Journalism',
    href: '/journalism',
    cta: 'Journalism',
    sort_order: 2,
    links: [{ url: '/journalism', label: 'Journalism' }, { url: '/events', label: 'Event Coverage' }],
    image_url: img.journalism('Documentary/Boyd Station', '6-10-25_Caleb McCartney_320-min.jpg'),
    alt_text: 'A farmer works in a garden during a Boyd Station photojournalism assignment.',
    focal_point_mobile_x: 0.54,  focal_point_mobile_y: 0.38,
    focal_point_desktop_x: 0.46, focal_point_desktop_y: 0.5,
  },
  {
    title: 'Portraits',
    meta: 'Portraits',
    href: '/portraits',
    cta: 'Portraits',
    sort_order: 3,
    links: [{ url: '/portraits', label: 'Portraits' }, { url: '/portraits', label: 'Portrait Gallery' }],
    image_url: img.portrait('Studio/Logan Spiker', 'Studio with logan0066.jpg'),
    alt_text: 'Studio portrait of Logan Spiker.',
    focal_point_mobile_x: 0.52,  focal_point_mobile_y: 0.42,
    focal_point_desktop_x: 0.5,  focal_point_desktop_y: 0.5,
  },
  {
    title: 'Corporate',
    meta: 'Corporate',
    href: '/events',
    cta: 'Corporate',
    sort_order: 4,
    links: [{ url: '/events', label: 'Events' }, { url: '/events', label: 'Corporate Work' }],
    image_url: img.event('src/images/Portfolios/Events/bond-party-2023/230411_Cock Tail Hour - James Bond Event_876_Published.webp'),
    alt_text: 'Group of people at a professional networking event, talking and laughing, with a woman preparing drinks on a table.',
    focal_point_mobile_x: 0.814, focal_point_mobile_y: 0.528,
    focal_point_desktop_x: 0.5,  focal_point_desktop_y: 0.5,
  },
  {
    title: 'Event',
    meta: 'Event',
    href: '/events',
    cta: 'Event',
    sort_order: 5,
    links: [{ url: '/events', label: 'Events' }, { url: '/events', label: 'Event Gallery' }],
    image_url: img.event('src/images/Portfolios/Events/Howl at the Moon/251024 Howl at the Moon _CAL7841_webuse.webp'),
    alt_text: 'Guests sing along under bright club lights during a Howl at the Moon event.',
    focal_point_mobile_x: 0.44,  focal_point_mobile_y: 0.4,
    focal_point_desktop_x: 0.5,  focal_point_desktop_y: 0.46,
  },
  {
    title: 'Concert',
    meta: 'Concert',
    href: '/concerts',
    cta: 'Concert',
    sort_order: 6,
    links: [{ url: '/concerts', label: 'Concerts' }, { url: '/concerts', label: 'Concert Gallery' }],
    image_url: '/images/homepage/concert/heading-north-bottle-rocket-cal11.webp',
    alt_text: 'A Heading North vocalist sings into a microphone under red and blue lights at Bottle Rocket.',
    focal_point_mobile_x: 0.52,  focal_point_mobile_y: 0.36,
    focal_point_desktop_x: 0.48, focal_point_desktop_y: 0.38,
  },
  {
    title: 'Theatre',
    meta: 'Theatre',
    href: '/events',
    cta: 'Theatre',
    sort_order: 7,
    links: [{ url: '/events', label: 'Events' }, { url: '/events', label: 'Theatre Gallery' }],
    image_url: img.event('src/images/Portfolios/Events/Growing Up/_CAL5543.jpg'),
    alt_text: 'Performers stand in line under saturated stage lighting during Growing Up.',
    focal_point_mobile_x: 0.6,   focal_point_mobile_y: 0.4,
    focal_point_desktop_x: 0.6,  focal_point_desktop_y: 0.44,
  },
  {
    title: 'Nature',
    meta: 'Nature',
    href: '/nature',
    cta: 'Nature',
    sort_order: 8,
    links: [{ url: '/nature', label: 'Nature' }, { url: '/nature', label: 'Nature Gallery' }],
    image_url: img.nature('Flowers & Plants', 'IMGP8504.jpg'),
    alt_text: 'Close-up of a pink flower with a dark green background.',
    focal_point_mobile_x: 0.5,   focal_point_mobile_y: 0.5,
    focal_point_desktop_x: 0.5,  focal_point_desktop_y: 0.5,
  },
];

// Variant pool — mirrors HERO_IMAGE_VARIANTS in heroSlides.ts
const VARIANTS_BY_CTA = {
  Politics: [
    { image_url: img.journalism('Politics/clinton-pitt-greensburgh', '241029_clinton-pitt_CAL3063.jpg'), alt_text: 'Former President Bill Clinton greets supporters at a campaign event in Greensburg, Pennsylvania.', focal_point_mobile_x: 0.48, focal_point_mobile_y: 0.34, focal_point_desktop_x: 0.46, focal_point_desktop_y: 0.42 },
    { image_url: img.journalism('Politics/kamala-pittsburgh', '241104_kamala-pgh-eve_CAL4102.jpg'), alt_text: 'Kamala Harris speaks at a campaign event in Pittsburgh.', focal_point_mobile_x: 0.5, focal_point_mobile_y: 0.54, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
    { image_url: img.journalism('Politics/kamala-speaks-erie', '141024_Kamala Speaks at Erie_CAL4115.jpg'), alt_text: 'Kamala Harris speaks at a campaign event in Erie, Pennsylvania.', focal_point_mobile_x: 0.54, focal_point_mobile_y: 0.52, focal_point_desktop_x: 0.68, focal_point_desktop_y: 0.5 },
    { image_url: img.journalism('Politics/trump-returns-butler', '051024 Caleb McCartney_Trump Returns to Butler PA_CAL2649.webp'), alt_text: 'Donald Trump returns to Butler, Pennsylvania for a campaign rally.', focal_point_mobile_x: 0.48, focal_point_mobile_y: 0.66, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.56 },
    { image_url: img.journalism('Politics/jdvance-johnstown', '241012_JD Vance in Johnstown_CAL3636.webp'), alt_text: 'Supporters raise their hands as JD Vance speaks at a campaign event in Johnstown, Pennsylvania.', focal_point_mobile_x: 0.52, focal_point_mobile_y: 0.42, focal_point_desktop_x: 0.54, focal_point_desktop_y: 0.44 },
  ],
  Journalism: [
    { image_url: img.journalism('Documentary/Boyd Station', '6-10-25_Caleb McCartney_320-min.jpg'), alt_text: 'A farmer works in a garden during a Boyd Station photojournalism assignment.', focal_point_mobile_x: 0.54, focal_point_mobile_y: 0.38, focal_point_desktop_x: 0.46, focal_point_desktop_y: 0.5 },
    { image_url: '/images/homepage/journalism/cmu-trump-protest-cal1489.webp', alt_text: 'Pittsburgh police officers stand near demonstrators and an Indivisible Pittsburgh banner during a CMU Trump protest.', focal_point_mobile_x: 0.7, focal_point_mobile_y: 0.46, focal_point_desktop_x: 0.66, focal_point_desktop_y: 0.48 },
    { image_url: '/images/homepage/journalism/cmu-trump-protest-cal1573.webp', alt_text: 'A masked demonstrator stands in front of Pittsburgh police officers in riot helmets during a CMU Trump protest.', focal_point_mobile_x: 0.72, focal_point_mobile_y: 0.42, focal_point_desktop_x: 0.7, focal_point_desktop_y: 0.44 },
    { image_url: '/images/homepage/journalism/cmu-trump-protest-cal1448.webp', alt_text: 'A demonstrator stands in the street as Pittsburgh police officers move toward protesters during a CMU Trump protest.', focal_point_mobile_x: 0.4, focal_point_mobile_y: 0.5, focal_point_desktop_x: 0.48, focal_point_desktop_y: 0.5 },
    { image_url: '/images/homepage/journalism/cmu-trump-protest-cal1498.webp', alt_text: 'A Pittsburgh police officer in riot gear holds a baton under a bright sky during a CMU Trump protest.', focal_point_mobile_x: 0.47, focal_point_mobile_y: 0.36, focal_point_desktop_x: 0.48, focal_point_desktop_y: 0.42 },
    { image_url: img.journalism('Events/Pro Palestine Protest at Pitt', '240430_Pro Palestine Protest at Pitt_CAL1489_webuse.jpg'), alt_text: 'A demonstrator sits wrapped in a Palestinian flag during a Pitt protest.', focal_point_mobile_x: 0.58, focal_point_mobile_y: 0.42, focal_point_desktop_x: 0.58, focal_point_desktop_y: 0.5 },
    { image_url: img.journalism('Events/Pro Palestine Protest at Pitt', '240430_Pro Palestine Protest at Pitt_CAL1501_webuse.jpg'), alt_text: 'Demonstrators gather during a pro-Palestine protest at Pitt.', focal_point_mobile_x: 0.68, focal_point_mobile_y: 0.42, focal_point_desktop_x: 0.58, focal_point_desktop_y: 0.5 },
  ],
  Pittsburgh: [
    { image_url: img.nature('Landscapes/Downtown Pittsburgh', '211028_Pittsburgh_Sunset_IMGP7702_webuse.webp'), alt_text: "Clouds gather over Pittsburgh's riverfront at sunset.", focal_point_mobile_x: 0.5, focal_point_mobile_y: 0.58, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.62 },
    { image_url: img.nature('Landscapes/Downtown Pittsburgh', '211028_Downtown_Fire_Escape_IMGP7594_webuse.webp'), alt_text: 'A fire escape climbs a weathered brick building in Downtown Pittsburgh.', focal_point_mobile_x: 0.54, focal_point_mobile_y: 0.58, focal_point_desktop_x: 0.58, focal_point_desktop_y: 0.56 },
    { image_url: img.nature('Landscapes/Downtown Pittsburgh', '200805_Riverfront_Golden_Hour_DSC02724_1_webuse.webp'), alt_text: 'Backlit grass glows in evening light in Pittsburgh.', focal_point_mobile_x: 0.6, focal_point_mobile_y: 0.48, focal_point_desktop_x: 0.56, focal_point_desktop_y: 0.44 },
    { image_url: '/images/homepage/pittsburgh/downtown-sunset-imgp8595.webp', alt_text: 'Downtown Pittsburgh buildings frame an orange sunset over Wood Street.', focal_point_mobile_x: 0.5, focal_point_mobile_y: 0.5, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.36 },
    { image_url: img.nature('Landscapes/Downtown Pittsburgh', '230509_untitled__CAL4122.jpg'), alt_text: 'A downtown Pittsburgh cityscape at dusk.', focal_point_mobile_x: 0.5, focal_point_mobile_y: 0.52, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
    { image_url: img.nature('Landscapes/Downtown Pittsburgh', '230505_untitled__CAL4020-Edit.jpg'), alt_text: 'Downtown Pittsburgh architecture and city lights.', focal_point_mobile_x: 0.5, focal_point_mobile_y: 0.5, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
  ],
  Portraits: [
    { image_url: img.portrait('Studio/Logan Spiker', 'Studio with logan0066.jpg'), alt_text: 'Studio portrait of Logan Spiker.', focal_point_mobile_x: 0.52, focal_point_mobile_y: 0.42, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
    { image_url: img.portrait('Studio/Liam Sulivan', '250425_Excused Chao\'s with Liam _CAL3563-min.jpg'), alt_text: 'Studio portrait of Liam Sulivan.', focal_point_mobile_x: 0.52, focal_point_mobile_y: 0.38, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
    { image_url: img.portrait('Studio/Helen Wise', '240528_Helen Wise_1639_CAL_Compressed.jpg'), alt_text: 'Studio portrait of Helen Wise.', focal_point_mobile_x: 0.48, focal_point_mobile_y: 0.36, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
  ],
  Corporate: [
    { image_url: img.event('src/images/Portfolios/Events/The Rooney Rule/250417 The Rooney Rule_CAL2761.jpg'), alt_text: 'Professionals speak during a Rooney Rule event.', focal_point_mobile_x: 0.45, focal_point_mobile_y: 0.44, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
    { image_url: img.event('src/images/Portfolios/Events/Inclusivity Event - PRSSA/251025 PRSSA Workplace Inclusivity_CAL7937_webuse.jpg'), alt_text: 'A speaker presents during the PRSSA workplace inclusivity event.', focal_point_mobile_x: 0.64, focal_point_mobile_y: 0.44, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
    { image_url: img.event('src/images/Portfolios/Events/Inclusivity Event - PRSSA/251025 PRSSA Workplace Inclusivity_CAL7956_webuse.jpg'), alt_text: 'Panelists speak during the PRSSA workplace inclusivity event.', focal_point_mobile_x: 0.5, focal_point_mobile_y: 0.46, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
  ],
  Event: [
    { image_url: img.event('src/images/Portfolios/Events/Myron Cope Awards 2024/240602_Point Park Cope Awards 2024 _1657_CAL_2048px.jpg'), alt_text: 'Audience members laugh together during the Myron Cope Awards 2024.', focal_point_mobile_x: 0.56, focal_point_mobile_y: 0.42, focal_point_desktop_x: 0.58, focal_point_desktop_y: 0.45 },
    { image_url: img.event('src/images/Portfolios/Events/pitt-winter-grad-2024/241218_pitt-grad-w24_CAL7317.jpg'), alt_text: 'A Pitt graduate smiles during winter commencement.', focal_point_mobile_x: 0.52, focal_point_mobile_y: 0.4, focal_point_desktop_x: 0.54, focal_point_desktop_y: 0.44 },
  ],
  Concert: [
    { image_url: '/images/homepage/concert/haven-block-party-cal3301.webp', alt_text: 'A Casino Six vocalist wearing sunglasses stands at a microphone under warm lights during Haven Block Party.', focal_point_mobile_x: 0.52, focal_point_mobile_y: 0.34, focal_point_desktop_x: 0.52, focal_point_desktop_y: 0.36 },
    { image_url: '/images/homepage/concert/bellevue-music-festival-cal6319.webp', alt_text: 'Brahctopus performs on an outdoor stage for a crowd at Bellevue Music Festival.', focal_point_mobile_x: 0.52, focal_point_mobile_y: 0.5, focal_point_desktop_x: 0.54, focal_point_desktop_y: 0.5 },
    { image_url: '/images/homepage/concert/when-we-were-dead-cal8515.webp', alt_text: 'A Dream The Heavy guitarist plays through pink stage smoke during When We Were Dead.', focal_point_mobile_x: 0.48, focal_point_mobile_y: 0.36, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.38 },
    { image_url: img.concert('Concert/Heading North/November 2025', '251101 Headed North - Bottle Rocket_CAL21_webuse.jpg'), alt_text: 'Heading North performs with the full band under magenta and blue lights.', focal_point_mobile_x: 0.56, focal_point_mobile_y: 0.34, focal_point_desktop_x: 0.52, focal_point_desktop_y: 0.42 },
    { image_url: img.concert('Concert/Heading North/November 2025', '251101 Headed North - Bottle Rocket_CAL9618_webuse.jpg'), alt_text: 'The Heading North vocalist sings into the mic during a black-and-white close-up.', focal_point_mobile_x: 0.58, focal_point_mobile_y: 0.32, focal_point_desktop_x: 0.54, focal_point_desktop_y: 0.4 },
    { image_url: img.concert('Concert/Heading North/November 2025', '251101 Headed North - Bottle Rocket_CAL9742_webuse.jpg'), alt_text: 'The Heading North vocalist sings in a close-up washed in red and blue light.', focal_point_mobile_x: 0.58, focal_point_mobile_y: 0.34, focal_point_desktop_x: 0.56, focal_point_desktop_y: 0.4 },
  ],
  Theatre: [
    { image_url: img.event('src/images/Portfolios/Events/Growing Up/_CAL5514.jpg'), alt_text: 'A glowing lamp and teddy bear sit on the Growing Up stage set.', focal_point_mobile_x: 0.5, focal_point_mobile_y: 0.42, focal_point_desktop_x: 0.42, focal_point_desktop_y: 0.46 },
  ],
  Nature: [
    { image_url: img.nature('Wildlife/Birds/Blue-bellied roller', '230727_Blue-bellied Roller__CAL4526.jpg'), alt_text: 'A blue-bellied roller perched on a branch.', focal_point_mobile_x: 0.54, focal_point_mobile_y: 0.42, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
    { image_url: img.nature('Landscapes/West Virginia', 'seneca-rocks-night.jpg'), alt_text: 'Seneca Rocks under a night sky.', focal_point_mobile_x: 0.52, focal_point_mobile_y: 0.46, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
    { image_url: img.nature('Landscapes/West Virginia', 'barn.jpg'), alt_text: 'A rural West Virginia barn in a mountain landscape.', focal_point_mobile_x: 0.48, focal_point_mobile_y: 0.5, focal_point_desktop_x: 0.5, focal_point_desktop_y: 0.5 },
  ],
};

async function main() {
  if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  console.log(`\nSeeding ${MAIN_SLIDES.length} hero slides + variants into Supabase\n`);

  if (DRY_RUN) {
    MAIN_SLIDES.forEach((s, i) => {
      const variants = VARIANTS_BY_CTA[s.cta] ?? [];
      console.log(`[${i + 1}] ${s.cta.padEnd(12)} — ${s.image_url.slice(0, 80)}`);
      variants.forEach((v, vi) => console.log(`     variant ${vi + 1}: ${v.image_url.slice(0, 80)}`));
    });
    console.log('\nDry run complete.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { realtime: { transport: ws } });

  // Upsert main slides
  const { error: slideError } = await supabase
    .from('hero_slides')
    .upsert(MAIN_SLIDES, { onConflict: 'cta' });

  if (slideError) {
    console.error('Failed to upsert hero_slides:', slideError.message);
    process.exit(1);
  }
  console.log(`✓ Upserted ${MAIN_SLIDES.length} slides`);

  // Insert variants — delete existing first so re-seeding is clean
  const allCtas = MAIN_SLIDES.map(s => s.cta);
  await supabase.from('hero_slide_variants').delete().in('slide_cta', allCtas);

  const variantRows = Object.entries(VARIANTS_BY_CTA).flatMap(([cta, variants]) =>
    variants.map((v, i) => ({ ...v, slide_cta: cta, sort_order: i }))
  );

  const { error: variantError } = await supabase
    .from('hero_slide_variants')
    .insert(variantRows);

  if (variantError) {
    console.error('Failed to insert hero_slide_variants:', variantError.message);
    process.exit(1);
  }
  console.log(`✓ Inserted ${variantRows.length} variants`);
  console.log('\nDone! Manage slides in Supabase dashboard → Table Editor → hero_slides');
  console.log('Toggle is_active, change sort_order, or update image_url/storage_path to swap slides.');
}

main().catch(err => { console.error(err.message); process.exit(1); });
