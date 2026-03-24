# Debugging Standards — Vite Site (2026+)

This document outlines debugging workflows and best practices for the Vite-based production site.

## Debugging Workflow
- Use browser DevTools for inspecting elements, network, and performance
- Use Vite's built-in error overlays and hot module replacement (HMR)
- Log errors and warnings to the console with clear, actionable messages
- Prefer descriptive error boundaries in React components
- Use source maps for easier debugging

## Common Issues
- Build errors (check terminal and overlay)
- CSS/JS not updating (force refresh, clear cache)
- Accessibility issues (use axe, Lighthouse)

> For legacy widget debugging, see `../legacy/widget-debugging-lessons.md`.
