### The Sitemap Generator Is Back And The Performance Budget Stops Failing On CDN Throttling

- The sitemap script was deleted as dead code because only a path string in sync-manifests.js referenced it, so every build logged "Cannot find module" and the sitemap stopped updating. Regenerating it now adds 9 blog posts (24 to 33 URLs). The script is restored and registered as a knip entry so it is not deleted again.
- The performance budget failed on a 403 from cdn.jsdelivr.net for a gallery image that returns 200 when requested directly. It now ignores jsDelivr 403 and 429 responses (rate limiting of shared CI IPs); other CDN failures still fail it.
