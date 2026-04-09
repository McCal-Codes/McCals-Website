# Admin Portfolio Importer - Changelog

All notable changes to the Admin Portfolio Importer widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Future Considerations
- Portfolio management interface for viewing and managing existing folders
- Bulk operations: rename, move, or delete multiple folders
- Advanced filtering and search capabilities
- Direct manifest regeneration triggers
- Enhanced preview with detailed validation warnings

## [1.1.0] - 2025-10-05

### Enhanced - Smart Folder Detection
- **Fixed folder mapping logic** to properly handle single-level folder uploads
- **Improved band name detection** from various folder structures
- **Consistent folder detection** between preview and execute operations
- **Enhanced debugging** with console logging of folder mapping data

### Fixed
- Folder mapping consistency between preview and execute endpoints
- Band name extraction now finds first non-empty folder name correctly
- Edge case handling for nested folder structures and empty folders

### Technical Details
- Updated folder detection logic to use `pathParts.find()` for better accuracy
- Added missing folder mapping to execute endpoint
- Enhanced debug logging for troubleshooting folder structure issues

## [1.0.0] - 2025-10-05

### Added
- Initial widget structure and authentication system
- Multi-portfolio support (Concert, Events, Journalism)
- Basic file upload interface with security validation
- Date extraction from filenames and EXIF data
- Folder organization following existing conventions
- Integration hooks for manifest generation pipeline
- Comprehensive security measures for admin-only access
- Preview mode for validating changes before applying
- Error handling and user feedback system
- Responsive design following widget standardization patterns

### Security
- Password-based authentication system
- Input validation and sanitization
- File system protection against directory traversal
- MIME type and extension validation
- Session management and timeout handling
- Admin-only deployment restrictions

### Documentation
- Comprehensive README with usage instructions
- Security considerations and best practices
- Integration guide for existing manifest pipeline
- Development status tracking and roadmap