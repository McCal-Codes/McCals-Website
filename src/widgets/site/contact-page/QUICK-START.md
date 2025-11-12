
# Contact Widget v0.2.0 - Quick Reference

## Preview URLs (Local Dev Server)

- **Main Preview**: http://localhost:3000/src/site/prototypes/contact-widget.html
- **Prototypes Index**: http://localhost:3000/src/site/prototypes/index.html
- **Formspree Example**: http://localhost:3000/src/site/prototypes/contact-widget-formspree.html

## File Locations

```
src/widgets/site/contact-page/
├── README.md                          # Full documentation
├── STATUS.md                          # WIP status marker
├── CHANGELOG.md                       # Version history
├── PROVIDERS.md                       # Provider setup guide ⭐
└── versions/
    ├── v0.1.0-contact-page.html      # Initial version (deprecated)
    └── v0.2.0-contact-page.html      # Current version ⭐
```

## Quick Start Examples

### Test Mode (Mock Provider)
```html
<!-- Copy from versions/v0.2.0-contact-page.html -->
<div class="mcc-contact-widget" data-widget-version="0.2.0">
  <!-- widget content -->
</div>
```

### Formspree (Recommended for Squarespace)
```html
<div class="mcc-contact-widget" 
     data-widget-version="0.2.0"
     data-provider="formspree"
     data-formspree-id="YOUR_FORM_ID">
  <!-- widget content -->
</div>
```

### EmailJS
```html
<div class="mcc-contact-widget"
     data-widget-version="0.2.0"
     data-provider="emailjs"
     data-emailjs-service="YOUR_SERVICE_ID"
     data-emailjs-template="YOUR_TEMPLATE_ID"
     data-emailjs-user="YOUR_PUBLIC_KEY">
  <!-- widget content -->
</div>
```

### Custom API
```html
<div class="mcc-contact-widget"
     data-widget-version="0.2.0"
     data-provider="custom"
     data-api-endpoint="https://your-api.com/contact">
  <!-- widget content -->
</div>
```

## Features

✅ **Accessibility**
- ARIA-compliant form validation
- Per-field error messages with live regions
- Keyboard navigation support
- Screen reader friendly

✅ **Spam Protection**
- Honeypot field (hidden from users)
- Time-to-submit heuristic
- CAPTCHA ready (reCAPTCHA v3 / hCaptcha)

✅ **Theming**
- Container-scoped themes (dark/light)
- "Blinding Mode" toggle
- Safe color tokens
- Optional haze overlay

✅ **Validation**
- Required fields: Name, Email, Message, Consent
- Email format validation
- Minimum message length (10 chars)
- Clear inline + summary errors

✅ **Provider Support**
- Mock (testing)
- Formspree (simple, no backend)
- EmailJS (client-side)
- Custom API (full control)

## Testing

### Enable Debug Mode
Add `?debug=true` to any preview URL:
```
http://localhost:3000/src/site/prototypes/contact-widget.html?debug=true
```

Access debug tools in console:
```javascript
window.mccContactDebug.validate()     // Test validation
window.mccContactDebug.serialize()    // See form data
window.mccContactDebug.getConfig()    // View configuration
window.mccContactDebug.setTheme('light')  // Change theme
```

## Production Checklist

- [ ] Choose provider (Formspree recommended for Squarespace)
- [ ] Configure provider credentials (see PROVIDERS.md)
- [ ] Test form submission end-to-end
- [ ] Verify emails arrive (check spam folder)
- [ ] Enable CAPTCHA if needed
- [ ] Test on mobile devices
- [ ] Review Privacy Policy link
- [ ] Set up email notifications
- [ ] Test error handling scenarios

## Next Steps

1. **Test with Real Provider**
   - Sign up for Formspree free tier
   - Get form ID and configure widget
   - Test submission and email delivery

2. **Optional Enhancements**
   - Add CAPTCHA integration
   - Configure success redirect
   - Customize email templates
   - Add character counter

3. **Production Deployment**
   - Copy v0.2.0 HTML to Squarespace Code Block
   - Update provider configuration
   - Test in Squarespace environment
   - Monitor for spam/issues

## Support

- **Documentation**: See PROVIDERS.md for detailed setup
- **Widget Standards**: docs/standards/widget-standards.md
- **Issues**: Track in updates/todo.md

---

**Version**: 0.2.0  
**Status**: WIP (Internal Testing)  
**Last Updated**: November 12, 2025
