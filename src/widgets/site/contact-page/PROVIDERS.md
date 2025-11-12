# Provider Configuration Guide

This document explains how to configure the Contact Widget to work with real email/CRM services.

## Overview

The contact widget supports multiple providers via a flexible adapter pattern:
- **Mock Provider** (default): Simulates submissions for testing
- **Formspree**: Simple form backend (no server required)
- **EmailJS**: Client-side email service
- **Custom API**: Your own backend endpoint

## Security Notes

⚠️ **NEVER commit API keys or secrets to the repository**

- Use Squarespace Code Injection environment variables or site-wide settings
- Keep keys in browser localStorage for prototyping only (not production)
- For custom APIs, implement server-side validation and rate limiting
- Always use HTTPS in production
- Implement CAPTCHA for public forms to prevent abuse

## Configuration Methods

### Method 1: Data Attributes (Recommended for Squarespace)

Add configuration directly to the widget container:

```html
<!-- Formspree Example -->
<div class="mcc-contact-widget" 
     data-provider="formspree"
     data-formspree-id="YOUR_FORM_ID">
  <!-- widget content -->
</div>

<!-- EmailJS Example -->
<div class="mcc-contact-widget"
     data-provider="emailjs"
     data-emailjs-service="YOUR_SERVICE_ID"
     data-emailjs-template="YOUR_TEMPLATE_ID"
     data-emailjs-user="YOUR_PUBLIC_KEY">
  <!-- widget content -->
</div>

<!-- Custom API Example -->
<div class="mcc-contact-widget"
     data-provider="custom"
     data-api-endpoint="https://your-api.com/contact">
  <!-- widget content -->
</div>
```

### Method 2: JavaScript Configuration

For more control, configure via script injection:

```html
<script>
  window.MCC_CONTACT_CONFIG = {
    provider: 'formspree',
    formspree: {
      id: 'YOUR_FORM_ID'
    },
    // OR
    emailjs: {
      serviceId: 'YOUR_SERVICE_ID',
      templateId: 'YOUR_TEMPLATE_ID',
      publicKey: 'YOUR_PUBLIC_KEY'
    },
    // OR
    custom: {
      endpoint: 'https://your-api.com/contact',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  };
</script>
<!-- Then include widget HTML below -->
```

## Provider Setup Guides

### Formspree

**Pros**: No backend needed, free tier available, easy setup  
**Cons**: Emails visible to sender, rate limits on free tier

**Setup Steps**:
1. Sign up at https://formspree.io
2. Create a new form and get your form ID (looks like `xpznxyzw`)
3. Add to widget: `data-provider="formspree"` and `data-formspree-id="xpznxyzw"`

**Example**:
```html
<div class="mcc-contact-widget" 
     data-provider="formspree"
     data-formspree-id="xpznxyzw"
     data-widget-version="0.2.0">
```

**What gets sent**:
- All form fields as JSON
- Formspree formats and forwards to your email

---

### EmailJS

**Pros**: Client-side only, template support, free tier  
**Cons**: Requires template setup, public key in frontend

**Setup Steps**:
1. Sign up at https://www.emailjs.com
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template with placeholders: `{{name}}`, `{{email}}`, `{{message}}`, etc.
4. Get your Service ID, Template ID, and Public Key
5. Add configuration to widget

**Example**:
```html
<div class="mcc-contact-widget"
     data-provider="emailjs"
     data-emailjs-service="service_abc123"
     data-emailjs-template="template_xyz789"
     data-emailjs-user="user_public_key_here"
     data-widget-version="0.2.0">
```

**Template Variables**:
- `{{name}}` - From "name" field
- `{{email}}` - From "email" field  
- `{{subject}}` - From "subject" field
- `{{message}}` - From "message" field
- `{{consent}}` - Consent checkbox state

---

### Custom API

**Pros**: Full control, server-side validation, database storage  
**Cons**: Requires backend development and hosting

**Setup Steps**:
1. Create a serverless function or API endpoint (Netlify, Vercel, AWS Lambda, etc.)
2. Implement POST handler that accepts JSON payload
3. Add server-side validation, spam checks, rate limiting
4. Return JSON response: `{ ok: true }` or `{ ok: false, message: "Error" }`

**Example Endpoint** (Node.js/Express):
```javascript
app.post('/api/contact', async (req, res) => {
  const { name, email, message, consent } = req.body;
  
  // Validate
  if (!name || !email || !message || !consent) {
    return res.status(400).json({ ok: false, message: 'Missing required fields' });
  }
  
  // Rate limit check
  // Spam detection
  // Send email via SendGrid/SES/etc
  
  res.json({ ok: true });
});
```

**Widget Configuration**:
```html
<div class="mcc-contact-widget"
     data-provider="custom"
     data-api-endpoint="https://mcc-cal.com/api/contact"
     data-widget-version="0.2.0">
```

---

## CAPTCHA Integration

### Google reCAPTCHA v3

**Setup**:
1. Get site key and secret key from https://www.google.com/recaptcha/admin
2. Add script to page (before widget):
   ```html
   <script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
   ```
3. Configure widget:
   ```html
   <div class="mcc-contact-widget"
        data-captcha="recaptcha"
        data-recaptcha-key="YOUR_SITE_KEY">
   ```

The widget will automatically request a token before submission.

### hCaptcha

Similar to reCAPTCHA but more privacy-focused.

**Setup**:
1. Get site key from https://www.hcaptcha.com
2. Add script:
   ```html
   <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
   ```
3. Configure: `data-captcha="hcaptcha"` and `data-hcaptcha-key="YOUR_SITE_KEY"`

---

## Testing Configuration

### Local Testing (Mock Provider)

No configuration needed - default mock provider simulates submissions:
```html
<div class="mcc-contact-widget" data-widget-version="0.1.0">
  <!-- Uses mock provider by default -->
</div>
```

### Debug Mode

Add `?debug=true` to URL to enable:
- Console logging of all provider calls
- Debug panel showing configuration and payload
- Mock failure simulation

### Testing Real Providers

1. Use Formspree free tier for initial testing
2. Add `data-provider="formspree"` with your test form ID
3. Submit form and check your email
4. Monitor browser console for errors

---

## Error Handling

The widget gracefully handles:
- **Network errors**: Shows "Connection failed" message
- **Validation errors**: Highlights fields and shows summary
- **Rate limiting**: Displays provider-specific error message
- **CORS issues**: Logs to console, shows generic error to user

---

## Production Checklist

- [ ] Remove or secure any API keys (use environment variables)
- [ ] Enable CAPTCHA for public forms
- [ ] Set up server-side rate limiting (if custom API)
- [ ] Test form on mobile devices
- [ ] Configure email templates (subject, reply-to, etc.)
- [ ] Add success redirect or custom thank-you message
- [ ] Set up email notifications for form owner
- [ ] Test GDPR consent checkbox flow
- [ ] Monitor form submissions for spam
- [ ] Configure backup/fallback email addresses

---

## Troubleshooting

**Form not submitting**:
- Check browser console for errors
- Verify provider configuration (IDs, keys)
- Test with `?debug=true` parameter
- Check CORS settings for custom APIs

**Emails not arriving**:
- Check spam folder
- Verify provider account is active
- Check email service quotas/limits
- Review provider dashboard logs

**CAPTCHA not working**:
- Verify site key is correct (not secret key)
- Check domain whitelist in CAPTCHA admin
- Ensure script is loaded before widget

---

## Migration Guide

### From Mock to Formspree
```html
<!-- Before -->
<div class="mcc-contact-widget" data-widget-version="0.1.0">

<!-- After -->
<div class="mcc-contact-widget" 
     data-widget-version="0.2.0"
     data-provider="formspree"
     data-formspree-id="YOUR_FORM_ID">
```

### From Formspree to Custom API
Update provider and add endpoint:
```html
<div class="mcc-contact-widget"
     data-widget-version="0.2.0"
     data-provider="custom"
     data-api-endpoint="https://your-api.com/contact">
```

---

## Support

For issues with:
- **Widget functionality**: See widget README and CHANGELOG
- **Provider services**: Contact provider support (Formspree, EmailJS, etc.)
- **Custom development**: Review widget source code and standards docs

---

**Last Updated**: November 12, 2025  
**Widget Version**: 0.2.0 (planned)
