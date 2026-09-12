### Three Published Captions Were Wrong

Checked against the photographs at full size rather than trusted:

- `CAL3763` read "A child sits alone in an upper section". It is a grown man in a white cap, alone in section 211. The frame is 3240 pixels wide and the figure is unambiguous.
- `CAL3804` read "Supporters sit beside a Puerto Rican flag", on four separate entries for what turned out to be two crops of one photograph. The flag draped over the rail is red, white and blue bunting with white stars on blue. A Puerto Rican flag has a single white star on a blue triangle.
- `CAL4655` read "A woman looks toward the stage". It is a young child on an adult's shoulders.

Each was corrected in three places, because `captions.json` is only one of them: the site serves captions from the generated manifest, and Google reads the IPTC embedded in the file. A `git grep` for all three old strings now returns nothing, and every touched image was re-checked for a full decode at unchanged dimensions.

The journalism generator exits 0 while printing "Manifest already exists" unless given `--force`, so the first regeneration looked like a success while the stale captions stayed in the manifest. Caught by grepping the manifest for the old text rather than trusting the exit code.

### /featured-work Is a Page of Selected Photographs

It showed twelve albums, which read as a catalogue of assignments rather than an edit. It is now sixteen hand-picked single photographs in the order `scripts/manifest/featured-curation.json` lists them, each with an authored caption and a link to the gallery it came from.

The curation file had never worked. `selectFeaturedItems` filled all twelve slots in pass 1 with the newest four per category, so pass 2, the only pass that read the file, never ran. Proven before the rewrite: `Cmu Trump Protest` was rank 4 in that file and absent from the emitted manifest.

- The generator reads only the curation file, probes every frame with sharp for intrinsic width and height, and fails the build on a path that does not resolve, reporting every problem in one run rather than stopping at the first. The old code ended its cover lookup with `|| coverImage`, so an unmatched string was emitted verbatim and 404'd in the browser. Four ways of breaking it were confirmed to fail.
- It also retires `dateDisplay: "undefined undefined"`, which appeared on four items because a `{iso, source}` date was fed to a formatter wanting `monthName` and `year`.
- The page lays frames out one full width then two paired, repeating, each with its own `figcaption`. `alt` is empty by default: the caption sits beside the photograph, and the W3C alt decision tree says to use an empty `alt` when the image would only repeat adjacent text. The old code did the opposite, so a screen reader heard the same sentence twice.
- Every frame carries intrinsic dimensions, so a portrait frame paired with a landscape one is not crushed and nothing shifts as images load. No manifest had ever recorded dimensions.
- Captions were researched rather than composed. Four claims changed as a result: the September 29 Trump rally was at the Bayfront Convention Center and not Erie Insurance Arena; the election eve rally was at the Carrie Blast Furnaces in Rankin and not Pittsburgh; the Ghostlight production is "The Guy Who Didn't Like Musicals"; and the Pitt protest frames are from April 28 and not April 30, which both their capture timestamps and the reported Sunday evening police action agree on. The album folder still says `240430`.
- 444 lines of `pfFeatured*` CSS went dead with the old markup and are removed. knip does not detect dead CSS. Verified first that all 27 classes were unreferenced, and after that no class any component still uses had gone with them.

### The Lightbox Counted 1 / 1 on Every Frame

A single-image group opened out of a collection now counts its place in that collection, so the toolbar reads 4 / 16. Confirmed in a browser: opening the second frame shows 2 / 16, advancing shows 3 / 16, and arrow-left returns to 2 / 16. Albums are unaffected.

### The Lead Photograph Is Now Discoverable in the HTML

Nothing in the prerendered page referenced any photograph on it, so the browser had to download and run the app, fetch the manifest, and only then learn the first image's URL.

`generate-route-meta.js` now emits a responsive preload for the lead frame, filling in the half of a feature that only ever had its removal side: `removeManagedImagePreloads` existed and nothing had ever written the link it strips. The widths, sizes and URL builders moved into `src/config/selected-work-image.js` so the component and the prerenderer read one source, because a preload whose candidates differ from the img's makes the browser fetch a second full-size photograph at top priority and never show it. A new test asserts the prerenderer's URLs are byte-identical to `getOptimizedImageUrl`, `getResponsiveImageSrcSet` and `imageUrl.featured`, and five ways of making them drift were confirmed to fail it.

That move exposed a gap in `imageWidths.static.test.ts`: it walked only `.ts` and `.tsx`, so the widths became invisible to the guard that polices them the moment they moved into a `.js` file. It now walks `.js` too, and separately its `optimizedWidth` pattern only matched a bare number, so a width written in a ternary branch passed unchecked. Both were confirmed by planting a 2560 and watching it go red.

### The Page Advertised a Social Image That Did Not Exist

`featured-work.tsx` hardcoded its own title, description and social image, leaving two sources describing one page. The hardcoded image pointed at `/images/Portfolios/Journalism/Politics/scarlett-canvas/...`, and neither that album nor any `/images/Portfolios` path is served: portfolio photographs come from jsDelivr and the app's public directory has no Portfolios tree. Every share of the page had been requesting a 404. It now reads `getPageSeo('featuredWork', SITE_URL)` like its five sibling galleries.

The page also emitted a hand-written `CollectionPage` and no `ImageObject` at all, so none of its photographs were eligible for Google's Licensable badge. Sixteen `ImageObject` entries are now emitted into the served HTML, each with the `contentUrl` and `license` that Google's documentation requires. The same dead `/images/Portfolios` path appears on three entries in `journalism.tsx` and is filed separately.

### Two Production Builds Per Merge, Reduced to One

`seo-auto-update.yml` regenerates manifests after a merge and commits whatever changed, which triggers a second full build of every project. Two things made it change:

- `sync-manifests.js` resolved the sitemap generator beside itself instead of at `scripts/seo/`, so every run died with `MODULE_NOT_FOUND` at its last step. That also killed `npm run dev`, which calls it from a `predev` hook. It had been failing since before this branch: the line is byte-identical in `git show HEAD:sites/mcc-cal-vite/scripts/sync-manifests.js`. The reason it went unnoticed is `prebuild`, which is `node scripts/sync-manifests.js || echo 'Sync skipped'`.
- The universal manifest generator discovers portfolio types with `readdir`, so the new `Selected/` staging folder became a sixth type called "Selected Photography" with one item in it. It is not a gallery: no route, no album structure, no `tags.json`. It is skipped now, so the churn is not generated rather than committed.

Two social images also regenerate differently from what was committed, byte-stable across builds and from source photographs this branch does not touch, so that churn predates it. They are included here so the workflow finds nothing to push.

Verified by running the exact post-merge sequence twice from the repository root: thirty-one changed paths before, thirty-one after, identical.
