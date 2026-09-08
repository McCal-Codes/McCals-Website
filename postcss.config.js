// Tailwind was removed in #291: it was configured and never ran, because no
// PostCSS config ever loaded its plugin, so the directives shipped as literal
// text into the stylesheet. Listing it here after removing the dependency would
// make any PostCSS run at the repo root fail outright with "Cannot find module
// 'tailwindcss'". Nothing runs PostCSS here today, which is the only reason
// that was latent rather than broken.
module.exports = {
  plugins: {
    autoprefixer: {}
  }
};
