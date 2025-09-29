# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.1] - 2024-12-19

### Changed
- **Navigation Widget**: Improved gradient spread for better text contrast with background
  - Extended gradient coverage from 50% to 85% with improved opacity stops
  - Enhanced readability of navigation text over varied background content
  - Gradient now transitions: `rgba(0, 0, 0, 0.55) 0%` → `rgba(0, 0, 0, 0.35) 60%` → `rgba(0, 0, 0, 0.15) 85%` → `transparent 100%`

## [1.6.0] - Previous Release
- Initial navigation widget implementation with responsive design
- Fixed positioning and mobile menu functionality
- Scroll-based styling transitions
