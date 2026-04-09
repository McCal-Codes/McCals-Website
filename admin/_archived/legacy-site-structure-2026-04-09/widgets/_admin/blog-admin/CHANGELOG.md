# Blog Admin Widget — Changelog

All notable changes to the Blog Admin Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-12-06

### Added
- **Authentication System**
  - Login interface with username/password
  - Registration UI (backend integration pending)
  - JWT token-based authentication
  - Persistent session via LocalStorage
  - Secure logout functionality

- **Blog Post Editor**
  - Rich text content blocks system
  - Title and excerpt fields
  - Dynamic content block management
  - Add/remove block functionality
  - Clear editor button

- **Post Management Dashboard**
  - View all published posts
  - Post cards with title, author, date, excerpt
  - Edit post buttons (functionality pending)
  - Delete post buttons (functionality pending)

- **Profile Settings**
  - Display name management
  - Password change interface (backend pending)
  - Profile update form

- **UI/UX Features**
  - Modern, responsive design
  - Tab-based navigation (Posts, New Post, Profile)
  - Loading states with spinners
  - Success/error alerts
  - Mobile-responsive layout
  - Smooth transitions and hover effects

- **Security Features**
  - Bearer token authorization
  - LocalStorage token management
  - Secure logout with cleanup
  - Input sanitization

### Technical Details
- Self-contained single-file widget
- No external dependencies
- Vanilla JavaScript (no frameworks)
- CSS custom properties for theming
- LocalStorage for session persistence
- RESTful API integration

### API Endpoints
- `POST /api/v1/blog/auth/login` - User authentication
- `GET /api/v1/blog/posts` - Retrieve all posts
- `POST /api/v1/blog/posts` - Create new post (auth required)

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- Initial load: ~15KB
- No external HTTP requests (except API calls)
- Lazy loading for posts
- Efficient DOM manipulation

### Accessibility
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- WCAG AA color contrast

---

## [Unreleased]

### Planned
- Registration API integration
- Post editing functionality
- Post deletion with confirmation
- Draft/publish status toggle
- Image upload support
- Markdown editor support
- Post preview mode
- Auto-save drafts
- Post scheduling
- Tags and categories system
- Bulk actions for posts
- Search and filter posts
- Export posts as JSON/Markdown
- Profile picture upload
- User role management

### Known Issues
- Registration shows "coming soon" message (backend not implemented)
- Edit/Delete post buttons show placeholder alerts
- Profile update shows "coming soon" message

---

## Version Numbering

This widget follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes to API or widget structure
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, minor improvements

---

**Admin Use Only** — Not for public deployment
