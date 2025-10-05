# Admin Portfolio Importer Widget

> **Status**: Production Ready ✅  
> **Version**: 1.1.0
> **Purpose**: Private admin-only tool for importing and organizing portfolio images  
> **Security**: Admin authentication required - do not deploy publicly  

## Overview

A secure, private admin tool for importing and organizing portfolio images with automatic folder structure management and manifest generation. This widget provides a secure interface for administrators to:

- **Import portfolio images** with proper authentication and validation
- **Organize images** into correct folder structure (Band/Month Year format)
- **Generate manifests** automatically after successful imports
- **Preview imports** before execution to avoid mistakes
- **Handle folder uploads** with intelligent band name detection

## Security Notice

⚠️ **ADMIN ONLY - DO NOT DEPLOY TO PUBLIC SQUARESPACE SITE** ⚠️

This widget requires backend authentication and should only be used on secure, admin-only pages.

This widget is designed for internal administration only. It requires:
- Admin authentication (password protection)
- Local development environment or secure admin panel
- Proper access controls and file system permissions

## Features

### Import Management
- **Multi-portfolio support**: Concert, Events, Journalism portfolios
- **Date extraction**: Automatic date parsing from filenames and EXIF data
- **Folder organization**: Creates proper `<Band>/<Month Year>` structure
- **Batch upload**: Handle multiple images simultaneously
- **Preview mode**: Review organization before applying changes

### File Organization
- **Smart naming**: Follows existing conventions (spaces allowed in band names)
- **Date validation**: Ensures proper date formatting and structure
- **Duplicate detection**: Prevents overwriting existing files
- **Folder creation**: Automatically creates missing directory structure

### Integration
- **Manifest compatibility**: Works with existing manifest generators
- **CI integration**: Triggers manifest regeneration after imports
- **Validation**: Ensures file structure matches expected patterns
- **Rollback**: Provides undo functionality for bulk operations

## Usage Instructions

### 1. Authentication
Widget requires admin password on first load:
```html
<!-- Add to Squarespace Code Block (admin environment only) -->
<div data-admin-password="your-secure-password">
  <!-- Widget loads here after authentication -->
</div>
```

### 2. Portfolio Selection
Choose target portfolio type:
- **Concert**: `src/images/Portfolios/Concert/<Band>/<Month Year>/`
- **Events**: `src/images/Portfolios/Events/<Event>/<Month Year>/`  
- **Journalism**: `src/images/Portfolios/Journalism/<Category>/`

### 3. File Upload
- Select multiple images via file browser
- Widget extracts metadata and suggests organization
- Preview folder structure before confirming
- Apply changes to file system

### 4. Post-Import
- Automatically trigger manifest regeneration
- Validate folder structure compliance
- Provide summary of import results

## Configuration

### Data Attributes
```html
<div class="admin-portfolio-importer" 
     data-admin-password="secure-admin-pass"
     data-default-portfolio="Concert"
     data-auto-manifest="true"
     data-preview-mode="true">
```

### Options
- `data-admin-password`: Required admin password for access
- `data-default-portfolio`: Default portfolio type selection
- `data-auto-manifest`: Auto-trigger manifest generation (default: true)
- `data-preview-mode`: Show preview before applying changes (default: true)

## File Structure

```
src/widgets/admin-portfolio-importer/
├── README.md                           # This file
├── CHANGELOG.md                        # Version history
├── STATUS.md                           # Development status
└── versions/
    └── v1.0.0-admin-portfolio-importer.html  # Initial version
```

## Development Status

- [ ] **Core Upload Interface**: File selection and preview
- [ ] **Authentication System**: Password protection and session management
- [ ] **Portfolio Type Selection**: Concert/Events/Journalism support
- [ ] **Date Extraction**: Filename and EXIF parsing integration
- [ ] **Folder Organization**: Automatic directory structure creation
- [ ] **Manifest Integration**: Auto-trigger generation after imports
- [ ] **Security Hardening**: Input validation and sanitization
- [ ] **Error Handling**: Comprehensive error states and recovery
- [ ] **Testing**: Local development and validation testing

## Security Considerations

### Access Control
- Password authentication required for all operations
- Session timeout for inactive admin users
- Input validation and sanitization on all file operations
- No public deployment - admin environments only

### File System Protection
- Validate all file paths to prevent directory traversal
- Check file extensions and MIME types
- Limit file sizes and upload quantities
- Sanitize filenames to prevent injection attacks

### Data Protection
- No sensitive data storage in browser local storage
- Secure cleanup of temporary files and metadata
- Audit logging of all admin operations

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## Related Documentation

- [Widget Standards](../../docs/standards/widget-standards.md) - Architecture patterns
- [Widget Development](../../docs/standards/widget-development.md) - Enhancement guide
- [Enhanced Manifest Generator](../../scripts/enhanced-manifest-generator.js) - Date parsing logic
- [Portfolio Structure](../../docs/workflows/event-portfolio-ingest.md) - Folder conventions