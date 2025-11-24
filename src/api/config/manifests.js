/**
 * Centralized manifest configuration
 *
 * Export the manifest file mappings and convenience helpers so manifest
 * paths are defined in one place instead of duplicated across routes.
 */

const MANIFEST_CONFIG = {
  concert: 'Concert/concert-manifest.json',
  events: 'Events/events-manifest.json',
  journalism: 'Journalism/journalism-manifest.json',
  nature: 'Nature/nature-manifest.json',
  portrait: 'Portrait/portrait-manifest.json',
  featured: 'featured-manifest.json',
  universal: 'portfolio-manifest.json',
};

const MANIFEST_TYPES = Object.keys(MANIFEST_CONFIG);

module.exports = { MANIFEST_CONFIG, MANIFEST_TYPES };
