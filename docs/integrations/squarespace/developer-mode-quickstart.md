# Squarespace Developer Mode Quickstart

Use this checklist to spin up a Squarespace Developer Mode trial and connect it to the widget code that lives in this repository.

## Prerequisites
- Node.js 18+ and npm 9+
- Git 2.30+
- Squarespace account that can create Developer Platform trials (Circle or Developer access)
- GitHub access to `McCal-Codes/McCals-Website`

## 1. Create the Developer Trial Site
1. Visit https://developers.squarespace.com/quick-start and choose **Start Building**.
2. When prompted for a template, scroll to the **Developer Platform** section and start with the blank boilerplate (you get a 14-day trial).
3. Note the site shortname (for example, `mccal-dev`) - you will need it for CLI commands.
4. Do not invest time in site styles yet; turning on Developer Mode in the next step resets any tweaks.

## 2. Enable Developer Mode (do this immediately)
1. In the site editor, open **Settings -> Developer Tools -> Developer Mode**.
2. Review the warnings (enabling Developer Mode resets template styles and built-in layouts) and toggle **Developer Mode** on.
3. Squarespace will show a banner confirming that the site is now using the developer template files.

## 3. Connect the Site to GitHub
1. In the same **Developer Mode** panel, click **Connect to GitHub**.
2. Authorize Squarespace to access your GitHub account if you have not already done so.
3. Create a **new private repository** (for example, `mccal-sqsp-theme`). Squarespace will push the current theme files into that repo.
4. Copy the repository URL; you will clone it into this workspace in the next step.

> Squarespace only creates the new repository; it does not clone existing code. Keep the theme repo separate from `McCals-Website` and treat this repository as the widget source of truth.

## 4. Clone the Theme Repository Locally
```bash
cd sites/squarespace
git clone git@github.com:McCal-Codes/mccal-sqsp-theme.git theme
```
- The `theme/` folder should remain its own Git repository. Do **not** commit it to `McCals-Website`; add it to `.gitignore` (see note below).
- From here on you will edit Squarespace template files in `sites/squarespace/theme` and keep widget code in `src/`.

## 5. Install Squarespace's Local Development Server
Squarespace's CLI is distributed as `@squarespace/server` and exposes the `sqsp` (or `squarespace-server`) command.
```bash
npm install -g @squarespace/server
sqsp --help         # or: squarespace-server --help
```
Login and register your site:
```bash
sqsp login                          # opens a browser window for OAuth
sqsp sites                          # list sites your account can access
sqsp connect <site-shortname> \
  --templates-path sites/squarespace/theme
```
While developing, run the watcher to push file changes up to the live preview:
```bash
sqsp sync --watch
```
> Depending on your platform the binary may be named `sqsp`, `squarespace-server`, or `local-developer`. Use `sqsp --help` to list the available subcommands on your machine.

## 6. First Customization Checklist
- Copy the navigation widget from `src/widgets/site-navigation/versions/v1.1.header-injection.html` (or the latest version you prefer) into the theme repository:
  - Inject the `<style>` block into `sites/squarespace/theme/blocks/header.region` (or use **Settings -> Advanced -> Code Injection -> HEADER** if you prefer to keep it as an injection).
  - Place the `<div class="mcc-nav-widget">...</div>` markup where the built-in header lives.
  - Keep the `<script>` tag at the bottom of the file so the navigation widget mounts automatically.
- Commit the changes inside the theme repo:
```bash
cd sites/squarespace/theme
git status
git add blocks/header.region
git commit -m "Replace template header with McCal navigation widget"
git push origin main
```
- Visit your trial site and refresh. The custom navigation should now replace the default header.

## 7. Recommended Workflow
1. Maintain widgets (HTML/CSS/JS snippets) in `src/widgets/...` in this repository.
2. When a widget is ready for Squarespace, copy the relevant version file into the theme repo (or use code injection for lighter touches).
3. Use `sqsp sync --watch` to see template changes instantly during development.
4. Keep theme commits small and descriptive; Squarespace deploys them each time you push to the theme repo.
5. When the trial is ready for production, upgrade the site plan inside Squarespace.

## 8. Housekeeping
- Add `sites/squarespace/theme/` to `.gitignore` in this repo so you never accidentally commit the template repo.
- Document credentialed commands, site shortnames, and GitHub repo URLs in `docs/development/squarespace/` (this file is a good starting point).
- The Developer Mode trial expires after 14 days unless you upgrade; set a reminder to upgrade or export work before the deadline.

## 9. Follow the Squarespace Beginner Tutorial (Recommended)
Use https://developers.squarespace.com/beginner-tutorial alongside this checklist to get comfortable with the Developer Platform. Key actions to carry over into the McCal workflow:

- **Start with the tutorial template:** Their walkthrough begins by creating a Developer Platform demo site, enabling Developer Mode, and cloning the GitHub repository. The process mirrors Sections 1–4 above; use it if you want a guided tour before customizing our theme.
- **Understand the template anatomy:** Review how `site.region`, `template.conf`, `/blocks`, `/collections`, and `/styles` fit together. Map those concepts to the files in `sites/squarespace/theme/` so you know where to drop our widgets and supporting assets.
- **Make a safe first edit:** Follow the tutorial's “Hello World” change in `site.region`, then push via Git. It is a quick smoke test that your `sqsp` login, Git remote, and watch tasks are wired correctly.
- **Leverage JSON-T navigation blocks:** The tutorial builds a `navigation.block` with Squarespace navigation tags. Compare that baseline to our `mcc-nav` widget—if you ever need a lighter-weight fallback nav, you can adapt the tutorial snippet in `blocks/navigation.block` while keeping the custom widget for production.
- **Explore collections:** Parts 5 and 6 show how to add `collections/blog.conf`, `blog.list`, and `blog.item`. Use that flow when you are ready to host dynamic data (blog, podcast, galleries) directly in the theme instead of via embed widgets.

Bookmark the tutorial for reference; it remains the canonical source for JSON-T directives, Squarespace tags like `<squarespace:navigation>`, and the default file hierarchy.

## Next Steps
- Wire up additional widgets (hero, galleries, podcast feed) by copying the latest version files from `src/widgets/**/versions/` into the theme.
- Use the existing build tooling (`npm run build`, `npm run serve`) if you need to prototype layouts before committing them to Squarespace.
