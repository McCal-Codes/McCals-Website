# Event Portfolio Ingest Guide

This workflow ingests a new event into the Event Portfolio widget whenever you receive a folder or ZIP of images. Follow every step so the manifest stays current and Squarespace embeds pick up the new assets.

## Required Inputs

| Key | Description | Example |
| --- | --- | --- |
| EVENT_TITLE | Display name for the event | Pennsylvania Media Awards |
| EVENT_YEAR | Four-digit year of the event | 2024 |
| SOURCE | Absolute or relative path to the source folder or ZIP | C:\\Users\\you\\Downloads\\MyEvent.zip |
| CATEGORY | One of `Corporate`, `Conference`, `Celebration`, `On-Location`; defaults to `Corporate` | Conference |

## Slug Rules

- Start with the EVENT_TITLE in kebab-case.
- If the event recurs, append `-<yy>` from EVENT_YEAR (last two digits).
- Example: "ACME Leadership Summit", 2025 -> `acme-leadership-summit-25`.

## Workflow

1. **Stage the source files**
   - Create `.tmp_ingest/<slug>/`.
   - If SOURCE is a ZIP, run `Expand-Archive` (PowerShell) or `unzip` into that folder.
   - Set `SRC_DIR` to the extracted directory (ZIP) or to SOURCE directly.

2. **Normalize and move images**
   - Accept files ending in `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` only.
   - Rename everything to kebab-case, preserving existing width suffixes like `-320w`.
   - Move files to `src/images/Portfolios/Events/<slug>/`.
   - If a name collision occurs, suffix with `-<counter>`.

3. **Regenerate the manifest**
   - Ensure `scripts/generate-events-manifest.js` exists.
   - Run:
     ```powershell
     & 'C:\Program Files\nodejs\node.exe' scripts/generate-events-manifest.js --root src/images/Portfolios/Events --force
     ```
   - (If Node is already on PATH, you can run `node` instead of the absolute path.)

4. **Confirm the manifest update**
   - Open `src/images/Portfolios/Events/events-manifest.json`.
   - Verify `totalEvents` increased and the new slug appears with the correct `category` and image count.
   - Quick check:
     ```powershell
     $slug = '<slug>'
     $manifest = Get-Content 'src/images/Portfolios/Events/events-manifest.json' -Raw | ConvertFrom-Json
     $event = $manifest.events | Where-Object { $_.eventName -like '*<Event Title>*' -or $_.slug -eq $slug }
     $summary = [pscustomobject]@{
       version = $manifest.version
       generated = $manifest.generated
       totalEvents = $manifest.totalEvents
       slug = $slug
       category = $event.category
       images = $event.images.Count
     }
     $summary | Format-List
     ```

5. **Point widgets at the manifest**
   - In `src/widgets/event-portfolio/versions/v2.5.3-event-portfolio.html`, ensure the `<main>` element has:
     ```html
     data-manifest="https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Events/events-manifest.json"
     ```
   - Update any newer snippet versions the same way.

6. **Clean up staging files**
   - Remove `.tmp_ingest/<slug>/` once assets are copied.

7. **Git workflow**
   - Create a branch: `git checkout -b feat/event-<slug>`.
   - Stage changes: `git add src/images/Portfolios/Events/<slug> src/images/Portfolios/Events/events-manifest.json src/widgets/event-portfolio/versions/*` (whichever files changed).
   - Commit:
     ```powershell
     git commit -m "feat(events): ingest '<EVENT_TITLE>' (<CATEGORY>) -> <slug>"
     ```
   - Push and open a PR:
     ```powershell
     git push --set-upstream origin feat/event-<slug>
     ```
   - PR body template:
     ```markdown
     ## Summary
     - add <EVENT_TITLE> (<CATEGORY>) assets under `<slug>`
     - regenerate events manifest (generated <YYYY-MM-DD>; totalEvents <N>)

     ## Manifest
     - slug: `<slug>`
     - images: <count>

     ## Verification
     - node scripts/generate-events-manifest.js --root src/images/Portfolios/Events --force
     ```

## Troubleshooting

- If `node` is not recognized, call it via the absolute path shown above or add Node.js to your PATH.
- Missing generator? Copy `scripts/generate-events-manifest.js` from main or recreate it from version control (see repo history).
- If the manifest shows `category: Published` for media-centric slugs, override it by editing the manifest entry before committing.
- When SOURCE is invalid, double-check the path; PowerShell accepts both `/` and `\\` separators.

---

Keep this guide handy whenever new event assets arrive so the Event Portfolio stays updated and consistent across deployments.
