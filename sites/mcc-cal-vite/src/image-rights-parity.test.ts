import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  IMAGE_RIGHTS,
  generateImageObjectSchema,
  imageRightsProperties,
} from '@/utils/jsonLd';
import type { PortfolioImage } from '@/components/portfolio/types';

/**
 * Rights for a photograph are asserted in two places: the JSON-LD on the page, and
 * the IPTC/XMP fields embedded in the image file. If they disagree, the page and the
 * photograph make different claims about who owns the work and how to license it.
 *
 * These tests pin both to the same values, and check the field Google actually
 * requires is present — `license` gates the Licensable badge, and omitting it fails
 * silently: attribution still renders, the badge just never appears.
 */

const repoRoot = resolve(__dirname, '..', '..', '..');
const embedConfig = readFileSync(
  resolve(repoRoot, 'scripts', 'metadata', 'image-rights-config.js'),
  'utf8',
);

/** Reads an exported string constant out of the embedding script's config. */
function embedConstant(name: string): string {
  const literal = new RegExp(`export const ${name} = '([^']+)'`).exec(embedConfig);
  if (literal) return literal[1];

  // Template literals composed from the constants above it, e.g. `${SITE_URL}/…`.
  const template = new RegExp(`export const ${name} = \`([^\`]+)\``).exec(embedConfig);
  if (!template) throw new Error(`Could not read ${name} from image-rights-config.js`);

  return template[1]
    .replace('${SITE_URL}', embedConstant('SITE_URL'))
    .replace('${CREATOR}', embedConstant('CREATOR'))
    .replace('${ORGANISATION}', embedConstant('ORGANISATION'));
}

const sampleImage = {
  url: 'https://mcc-cal.com/images/portfolio/example.jpg',
  alt: 'An example photograph',
  caption: 'An example caption.',
} as unknown as PortfolioImage;

describe('image rights parity between page and file', () => {
  it('credits the same photographer in both', () => {
    expect(IMAGE_RIGHTS.creator).toBe(embedConstant('CREATOR'));
  });

  it('uses the same AP-form credit line in both', () => {
    expect(IMAGE_RIGHTS.creditText).toBe(embedConstant('CREDIT_LINE'));
  });

  it('asserts the same copyright notice in both', () => {
    expect(IMAGE_RIGHTS.copyrightNotice).toBe(embedConstant('COPYRIGHT_NOTICE'));
  });

  it('points at the same rights statement in both', () => {
    // XMP calls this Web Statement of Rights; schema.org calls it license.
    expect(IMAGE_RIGHTS.license).toBe(embedConstant('WEB_STATEMENT'));
  });

  it('points at the same licensing page in both', () => {
    expect(IMAGE_RIGHTS.acquireLicensePage).toBe(embedConstant('LICENSOR_URL'));
  });
});

describe('ImageObject structured data', () => {
  const schema = generateImageObjectSchema(sampleImage, 'Example', 'https://mcc-cal.com/nature') as Record<
    string,
    unknown
  >;

  it('carries contentUrl, which tells Google which image the rights apply to', () => {
    expect(schema.contentUrl).toBe(sampleImage.url);
  });

  it('carries license, which Google requires for the Licensable badge', () => {
    // The failure this guards is silent: drop this field and attribution still
    // renders, but the badge never appears and nothing reports an error.
    expect(schema.license, 'ImageObject must include license to be badge-eligible').toBe(
      IMAGE_RIGHTS.license,
    );
  });

  it('carries the recommended licensing and attribution fields', () => {
    expect(schema.acquireLicensePage).toBe(IMAGE_RIGHTS.acquireLicensePage);
    expect(schema.creditText).toBe(IMAGE_RIGHTS.creditText);
    expect(schema.copyrightNotice).toBe(IMAGE_RIGHTS.copyrightNotice);
    expect(schema.creator).toMatchObject({ '@type': 'Person', name: IMAGE_RIGHTS.creator });
  });

  it('uses absolute URLs for both rights links', () => {
    // Google discards relative URLs here, another silent failure.
    for (const url of [IMAGE_RIGHTS.license, IMAGE_RIGHTS.acquireLicensePage]) {
      expect(url, `${url} must be absolute`).toMatch(/^https:\/\//);
    }
  });

  it('exposes the rights block on its own for reuse by other generators', () => {
    expect(Object.keys(imageRightsProperties()).sort()).toEqual(
      ['acquireLicensePage', 'copyrightNotice', 'creditText', 'creator', 'license'].sort(),
    );
  });
});

describe('IPTC provenance', () => {
  it('declares images as original digital captures, not generated', () => {
    // Marking real photography with the IPTC digitalSourceType vocabulary is how a
    // photojournalist distinguishes their work from generated imagery. It must never
    // be applied to composited or synthetic images.
    expect(embedConfig).toContain('cv.iptc.org/newscodes/digitalsourcetype/digitalCapture');
  });
});
