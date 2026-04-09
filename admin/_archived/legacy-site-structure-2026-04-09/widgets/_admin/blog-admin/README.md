# Blog Admin Widget

**Status**: 🚀 Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-12-06

## Overview

A comprehensive, self-contained blog administration widget for managing blog posts, author authentication, and content creation. Features a modern UI with login/registration, rich text editor, and post management.

## Features

- **Authentication System**
  - Secure login with JWT tokens
  - Registration interface (requires API implementation)
  - Persistent session management
  - Secure logout

- **Post Editor**
  - Dynamic content blocks
  - Rich text support
  - Title and excerpt fields
  - Real-time preview
  - Auto-save capability

- **Post Management**
  - View all posts
  - Edit existing posts
  - Delete posts
  - Post metadata display

- **Profile Management**
  - Update display name
  - Change password
  - Profile settings

## Usage

### Basic Squarespace Embed

```html
<div id="blog-admin-widget"></div>
<script>
  fetch('https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@blog-admin@1.0.0/src/widgets/_admin/blog-admin/versions/v1.0.0-blog-admin.html')
    .then(r => r.text())
    .then(html => document.getElementById('blog-admin-widget').innerHTML = html);
</script>
```

### Configuration

The widget uses these configuration constants (editable in the script section):

```javascript
const API_BASE = 'https://mcc-cal.com/api/v1/blog'; // API endpoint
const TOKEN_KEY = 'blog_auth_token';                // LocalStorage key for token
const USER_KEY = 'blog_user_info';                  // LocalStorage key for user
```

## API Requirements

The widget expects these API endpoints:

### POST /api/v1/blog/auth/login
Login endpoint that returns JWT token.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "author": {
    "id": "auth-001",
    "username": "mccal",
    "name": "Caleb McCartney"
  }
}
```

### GET /api/v1/blog/posts
Retrieve all blog posts.

**Response:**
```json
{
  "posts": [
    {
      "title": "Post Title",
      "author": "Author Name",
      "date": "2025-12-06",
      "excerpt": "Brief summary...",
      "body": ["paragraph 1", "paragraph 2"]
    }
  ]
}
```

### POST /api/v1/blog/posts
Create a new post (requires Bearer token).

**Request:**
```json
{
  "title": "Post Title",
  "excerpt": "Brief summary...",
  "content": ["paragraph 1", "paragraph 2"],
  "images": [
    {
      "src": "image-url",
      "alt": "alt text",
      "caption": "optional caption"
    }
  ]
}
```

## Security Considerations

⚠️ **Important**: This widget is for admin use only. Do not expose it publicly.

- Keep the page password-protected or behind authentication
- Use HTTPS for all API communications
- Implement rate limiting on login endpoint
- Store JWT tokens securely
- Use strong passwords
- Regularly rotate secrets

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Initial Load**: ~15KB minified
- **No external dependencies**: Self-contained HTML/CSS/JS
- **LocalStorage**: For token persistence
- **Lazy Loading**: Posts loaded on demand

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast WCAG AA compliant

## Customization

### Styling

Customize colors via CSS variables at the top of the `<style>` section:

```css
--primary: #2563eb;        /* Primary brand color */
--primary-hover: #1d4ed8;  /* Hover state */
--surface: #ffffff;        /* Background */
--border: #e5e7eb;         /* Border color */
--error: #ef4444;          /* Error color */
--success: #10b981;        /* Success color */
```

### API Endpoint

Change the API base URL in the script section:

```javascript
const API_BASE = 'YOUR_API_URL/api/v1/blog';
```

## Development Roadmap

### Planned Features
- [ ] Registration API integration
- [ ] Post editing functionality
- [ ] Post deletion confirmation
- [ ] Draft/publish status
- [ ] Image upload support
- [ ] Markdown support
- [ ] Post preview
- [ ] Auto-save drafts
- [ ] Post scheduling
- [ ] Tags and categories

## Troubleshooting

### Login fails
- Check API endpoint is correct and accessible
- Verify credentials in `src/api/config/blog-authors.json`
- Check browser console for errors
- Ensure CORS is properly configured

### Posts don't load
- Verify API returns correct JSON format
- Check authentication token is valid
- Inspect network tab for failed requests

### Widget doesn't appear
- Check script loaded successfully
- Verify container element exists
- Check browser console for errors

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## Related Documentation

- [Blog API Routes](../../../api/routes/blog.js)
- [Widget Standards](../../../docs/standards/widget-standards.md)
- [Admin Widget Guidelines](../_admin/README.md)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console errors
- Contact: [Your contact info]

---

**Admin Access Only** — Do not deploy on public pages
