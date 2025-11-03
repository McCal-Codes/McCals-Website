# Hire to Unlock Résumé Widget v1.0.0

An interactive résumé widget that reveals redacted professional sections through LinkedIn authentication, critiquing entry-level gatekeeping while collecting genuine hiring leads.

## Overview

This widget transforms the traditional résumé into an engaging, interactive experience. Professional experience, skills, and projects remain hidden behind blur overlays until visitors authenticate with LinkedIn, creating authentic connections and filtering out unqualified opportunities.

## Features

- **Redacted Content**: Professional experience, skills, and projects hidden behind blur overlays
- **LinkedIn Authentication**: OAuth integration for genuine professional verification
- **Intent Collection**: Checkbox form to understand visitor's purpose (recruiter, collaborator, etc.)
- **Smooth Animations**: Progressive reveal animations when sections unlock
- **Analytics Tracking**: Comprehensive event tracking for engagement metrics
- **Accessibility**: Full WCAG compliance with screen reader support and keyboard navigation
- **Mobile Responsive**: Optimized for all device sizes
- **Privacy Focused**: Minimal data collection with clear consent

## Mission Statement

*"Qualified but gatekept — authentic connections over artificial barriers"*

This feature serves dual purposes:
1. **Critique Gatekeeping**: Demonstrates the absurdity of entry-level hiring barriers
2. **Quality Leads**: Filters for genuine professional opportunities through authentic verification

## Quick Setup

1. **Get LinkedIn Credentials**:
   - Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
   - Create an app and note your Client ID
   - Add your website domain to authorized redirect URIs

2. **Configure Widget**:
   - Open `v1.0.0-hire-to-unlock-resume.html`
   - Find the `HireToUnlockResume` class constructor
   - Replace `'YOUR_LINKEDIN_CLIENT_ID'` with your actual Client ID

3. **Deploy**:
   - Ensure your site uses HTTPS
   - Copy the widget HTML into Squarespace Code Block
   - Test the authentication flow

## Usage

### Basic Implementation

```html
<!-- Include the widget HTML -->
<div class="hire-to-unlock-resume" data-widget-version="1.0.0">
  <!-- Widget content loads automatically -->
</div>
```

### Squarespace Integration

1. Copy the complete widget HTML from `v1.0.0-hire-to-unlock-resume.html`
2. Paste into a Code Block in Squarespace
3. The widget will automatically initialize when the page loads

### Customization Options

#### Content Modification

To update the résumé content:

1. Edit the HTML structure within the widget
2. Replace text in the `.resume-item` sections
3. Update metrics and achievements as needed
4. Modify the mission statement in `.resume-mission`

#### Styling Customization

The widget uses CSS custom properties for easy theming:

```css
.hire-to-unlock-resume {
  --mc-bg: #050506;           /* Background color */
  --mc-text: #f3f5f8;         /* Primary text color */
  --mc-accent: #5fd4f0;       /* Accent color */
  --mc-line: #272423;         /* Border colors */
  --mc-success: #00d4aa;      /* Success states */
}
```

#### Authentication Configuration

For production deployment, configure LinkedIn OAuth:

1. Register application at [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Set OAuth redirect URI to your domain
3. Update client credentials in the widget code:
   ```javascript
   // In the HireToUnlockResume class constructor
   this.clientId = 'YOUR_LINKEDIN_CLIENT_ID';
   this.clientSecret = 'YOUR_LINKEDIN_CLIENT_SECRET'; // For client-side, consider backend proxy
   ```
4. Implement the OAuth callback endpoints (or use client-side flow)

### Client-Side OAuth Setup

For client-side implementation:

1. Set your LinkedIn app's redirect URI to your website URL
2. Update the `clientId` in the widget code
3. For production, consider moving token exchange to your backend for security

## Technical Architecture

### File Structure

```
hire-to-unlock-resume/
├── versions/
│   └── v1.0.0-hire-to-unlock-resume.html    # Complete widget implementation
├── README.md                               # This documentation
└── CHANGELOG.md                           # Version history
```

### JavaScript Classes

- `HireToUnlockResume`: Main widget controller
  - Handles authentication flow and state management
  - Manages section unlocking and animations
  - Tracks analytics events and user interactions
  - Provides accessibility announcements

### Authentication Flow

1. **Trigger**: User clicks unlock button on redacted section
2. **Modal**: Authentication modal displays with LinkedIn option
3. **OAuth**: Redirect to LinkedIn for authentication with PKCE
4. **Callback**: Return with authorization code to current page
5. **Token Exchange**: Exchange code for access token (client-side or backend)
6. **Profile Fetch**: Retrieve basic profile data from LinkedIn API
7. **Intent**: Collect user's purpose for visiting
8. **Unlock**: Reveal content with smooth animations

### Analytics Events

The widget tracks these key interactions:

- `resume_view`: Initial page load
- `unlock_attempt`: Click on unlock button
- `unlock_complete`: Successful section reveal
- `ats_download_click`: Accessibility download request

## Backend Requirements

For production deployment with enhanced security, implement these endpoints. For basic functionality, the widget can work client-side.

### Authentication Endpoints (Recommended for Production)
- `POST /api/auth/linkedin/token` - Exchange authorization code for access token
- `GET /api/auth/linkedin/profile` - Fetch LinkedIn profile data server-side
- `POST /api/unlock/complete` - Finalize unlock with intent data

### Client-Side Implementation (Basic Setup)
The widget includes client-side OAuth implementation that works without backend services:
- Direct LinkedIn OAuth flow
- Client-side token exchange
- Basic profile data retrieval

### Data Storage
- **Session Management**: Store temporary auth state (client-side uses sessionStorage)
- **Lead Collection**: Record contact info and intent
- **Analytics**: Log interaction events

### Security Considerations
- **HTTPS Only**: OAuth requires secure connections
- **CSRF Protection**: State parameter validation with PKCE
- **Client-Side Tokens**: Access tokens stored temporarily in memory only
- **Data Minimization**: Collect only necessary LinkedIn profile information
- **Consent**: Clear privacy policy and data usage
- **Production Note**: For enhanced security, move token exchange to backend

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **JavaScript**: ES6+ features required
- **CSS**: CSS Grid, Flexbox, and Custom Properties support

## Accessibility Features

- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Screen Reader**: Dynamic content announcements
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Focus Management**: Proper focus indicators and tab order
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast**: Sufficient color contrast ratios

## SEO Considerations

- **Content Visibility**: Redacted content remains in HTML for crawlers
- **Meta Tags**: Include relevant schema markup
- **Performance**: Optimized loading and rendering
- **Mobile First**: Responsive design for all devices

## Privacy & Compliance

### Data Collection
- **Minimal Data**: Only name, email, LinkedIn profile URL
- **Purpose Limitation**: Data used only for lead qualification
- **Consent**: Clear opt-in before data collection
- **Retention**: Data retained only as needed for business purposes

### Compliance
- **GDPR**: Compliant with EU data protection regulations
- **CCPA**: California privacy law compliance
- **LinkedIn API**: Follows LinkedIn's API terms of service

## Performance Optimization

- **Inline Assets**: CSS and JS embedded to reduce HTTP requests
- **Lazy Loading**: Content loads only when needed
- **Efficient Animations**: GPU-accelerated CSS transitions
- **Minimal Bundle**: Optimized code size and dependencies

## Development & Testing

### Local Testing
1. Open the HTML file directly in a browser (requires HTTPS for OAuth)
2. Configure your LinkedIn app credentials in the widget code
3. Test the complete OAuth flow end-to-end
4. Verify animations and accessibility
5. Check console for analytics events and OAuth responses

### Integration Testing
1. Deploy to staging environment with HTTPS
2. Test OAuth flow with real LinkedIn accounts
3. Verify data collection and storage
4. Validate analytics integration
5. Test error handling for OAuth failures

## Future Enhancements

### Planned Features
- **A/B Testing**: Multiple CTA variations
- **Progress Tracking**: Unlock progress indicators
- **Social Proof**: Show anonymized unlock statistics
- **Custom Questions**: Dynamic intent forms based on visitor type

### Integration Options
- **CRM Integration**: Automatic lead routing
- **Email Automation**: Follow-up sequences
- **Analytics Dashboard**: Detailed engagement metrics
- **Multi-Platform**: Support for other OAuth providers

## Support & Maintenance

### Troubleshooting
- **OAuth Issues**: Check LinkedIn app configuration and redirect URIs
- **HTTPS Required**: OAuth only works on secure connections
- **CORS Errors**: Ensure your domain is whitelisted in LinkedIn app settings
- **Token Exchange**: For client-side issues, consider backend implementation
- **Display Problems**: Verify CSS custom property support
- **Analytics**: Confirm tracking code implementation

### Updates
- **Version Control**: Maintain backward compatibility
- **Security**: Regular dependency and OAuth updates
- **Performance**: Monitor and optimize loading times

## Related Documentation

- [Widget Standards](../standards/widget-standards.md)
- [Widget Development Guide](../standards/widget-development.md)
- [Authentication Best Practices](../standards/authentication-patterns.md)

---

**Version**: 1.0.0
**Compatibility**: Squarespace 7.1+, Modern Browsers
**Last Updated**: November 3, 2025