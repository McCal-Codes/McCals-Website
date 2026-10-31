import { describe, expect, it } from 'vitest';
import { variantsForViewport } from '../HeroCarousel.lazy';
import { HERO_IMAGE_VARIANTS, type HeroSlideVariant } from '../heroSlides';

const variant = (image: string, viewport?: 'mobile' | 'desktop'): HeroSlideVariant => ({
  image,
  alt: image,
  ...(viewport ? { viewport } : {}),
});

describe('variantsForViewport', () => {
  it('keeps untagged frames, which suit either hero shape', () => {
    const options = [variant('a'), variant('b')];

    expect(variantsForViewport(options, 'desktop')).toEqual(options);
    expect(variantsForViewport(options, 'mobile')).toEqual(options);
  });

  it('drops frames composed for the other breakpoint', () => {
    const options = [variant('wide', 'desktop'), variant('tall', 'mobile'), variant('either')];

    expect(variantsForViewport(options, 'desktop').map((o) => o.image)).toEqual(['wide', 'either']);
    expect(variantsForViewport(options, 'mobile').map((o) => o.image)).toEqual(['tall', 'either']);
  });

  it('falls back to the whole pool rather than returning nothing', () => {
    // A slide whose frames are all tagged for the other breakpoint must still
    // show a photograph.
    const options = [variant('wide', 'desktop')];

    expect(variantsForViewport(options, 'mobile')).toEqual(options);
  });

  it('leaves every real slide pool with something to show at both breakpoints', () => {
    for (const [cta, options] of Object.entries(HERO_IMAGE_VARIANTS)) {
      expect(variantsForViewport(options, 'desktop').length, cta).toBeGreaterThan(0);
      expect(variantsForViewport(options, 'mobile').length, cta).toBeGreaterThan(0);
    }
  });

  it('art-directs the Portraits pool for both breakpoints', () => {
    const portraits = HERO_IMAGE_VARIANTS.Portraits ?? [];

    // Every Portraits frame is tagged, so the two pools must be disjoint.
    const desktop = variantsForViewport(portraits, 'desktop').map((o) => o.image);
    const mobile = variantsForViewport(portraits, 'mobile').map((o) => o.image);

    expect(desktop.length).toBeGreaterThan(0);
    expect(mobile.length).toBeGreaterThan(0);
    expect(desktop.filter((image) => mobile.includes(image))).toEqual([]);
  });
});
