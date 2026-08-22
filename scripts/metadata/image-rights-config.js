/**
 * Rights and attribution values embedded into every published photograph.
 *
 * Field choices follow the IPTC Photo Metadata Standard and the subset Google
 * documents for Google Images. Google reads five fields: Creator, Credit Line and
 * Copyright Notice for attribution display, plus Web Statement of Rights and
 * Licensor URL to enable the "Licensable" badge and its licensing links.
 *
 * Keeping these in one place means the embedding script and the JSON-LD generator
 * cannot drift apart and claim different rights for the same photograph.
 */

export const SITE_URL = 'https://mcc-cal.com';

/** Photographer, as it should appear in a byline. */
export const CREATOR = 'Caleb McCartney';

/** Business name used in credit and copyright strings. */
export const ORGANISATION = 'McCal Media';

/**
 * AP credit-line form is `Photographer/Organisation`. Note this differs from the
 * parenthetical `(Photo by Caleb McCartney)` used at the end of a printed caption —
 * that belongs in the caption text, not in the Credit field.
 */
export const CREDIT_LINE = `${CREATOR}/${ORGANISATION}`;

export const COPYRIGHT_NOTICE = `Copyright ${CREATOR} / ${ORGANISATION}. All rights reserved.`;

/**
 * Web Statement of Rights. Google requires a resolvable URL here for the Licensable
 * badge, and it must describe the terms rather than sell the image.
 */
export const WEB_STATEMENT = `${SITE_URL}/policies-legal#license`;

/** Where someone goes to actually license a photograph. Drives "Get this image on:". */
export const LICENSOR_URL = `${SITE_URL}/request-a-quote`;

/**
 * IPTC DigitalSourceType. `digitalCapture` asserts an original digital capture of a
 * real scene — the claim that matters most for a photojournalist now that generated
 * imagery is common, and the field answer engines and platforms are starting to read.
 *
 * Only ever apply this to real photography. Applying it to a generated or heavily
 * composited image would be a false provenance claim.
 */
export const DIGITAL_SOURCE_TYPE =
  'http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture';

/** Written to every image regardless of whether caption data exists for it. */
export function baseRightsTags() {
  return {
    'XMP-dc:Creator': CREATOR,
    'XMP-dc:Rights': COPYRIGHT_NOTICE,
    'XMP-photoshop:Credit': CREDIT_LINE,
    'XMP-xmpRights:WebStatement': WEB_STATEMENT,
    'XMP-xmpRights:Marked': 'True',
    'XMP-plus:LicensorURL': LICENSOR_URL,
    'XMP-iptcExt:DigitalSourceType': DIGITAL_SOURCE_TYPE,
    // IIM equivalents, for tools that read the legacy blocks rather than XMP.
    'IPTC:By-line': CREATOR,
    'IPTC:CopyrightNotice': COPYRIGHT_NOTICE,
    'IPTC:Credit': CREDIT_LINE,
    // EXIF equivalents, which is where most desktop software looks first.
    'EXIF:Artist': CREATOR,
    'EXIF:Copyright': COPYRIGHT_NOTICE,
  };
}
