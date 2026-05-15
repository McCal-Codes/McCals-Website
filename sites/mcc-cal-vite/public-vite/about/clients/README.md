# About Client Logo Assets

This folder contains client showcase assets for the About page. Prefer official brand downloads, press kits, or files served from the organization's own site. If a suitable official file is not available, use `logoMode: 'text'` in `aboutData.ts` rather than creating a hand-built approximation.

## Display Guidelines

- Use lowercase, hyphenated filenames.
- Prefer SVG or transparent PNG assets that read clearly at small sizes.
- Do not recolor or redraw official marks.
- Keep text-card fallbacks intentional, accessible, and linked to the same client website or publication URL.
- Use `logoSurface: 'dark'` for official assets with white marks or white lettering so they remain legible in both site themes.

## Institution Sources

- `geneva-college-logo.svg`: Geneva College site graphic, downloaded from `https://www.geneva.edu/_files/sitegraphics/geneva-spade-stacked.svg`. This mark includes white lettering, so it uses a dark logo tile in the About data.
- `duquesne-university-logo.svg`: Duquesne University site logo, downloaded from `https://www.duq.edu/_resources/assets/img/logos/duquesne.svg`.
- `university-of-pittsburgh-official-logo.png`: University of Pittsburgh Institutional Marks ZIP, horizontal digital color mark from `https://www.brand.pitt.edu/sites/default/files/Institutional_Marks.zip`.
- `wvu-flying-wv-logo.svg`: WVU official Flying WV source, downloaded from `https://static.wvu.edu/global/images/logos/wvu/flying-wv-r-small--1.0.0.svg`.
- `ohio-state-university-logo.png`: Ohio State web logo asset, downloaded from `https://www.osu.edu/assets/web/logo-web/1.0/osu-web-header-horiz.png`.
- `iup-logo-official.png`: IUP visual guide logo asset, downloaded from `https://www.iup.edu/marcom/images/visual-guide/logos/iup-logo-737.png`.

## Text Cards

- Carnegie Mellon University uses a text card because a directly downloadable official web mark was not confidently available during implementation.
- Penn State Fayette uses a text card because the verified public asset was a general Penn State mark, not a Fayette-specific official mark.
- TribLIVE uses a text card because no official downloadable logo file was provided or confidently retrievable during implementation.

## Legal Notes

- Client logos remain the property of their respective organizations.
- Use marks only in the context of identifying clients or published work.
- Follow each organization's brand guidance when replacing or adding assets.
