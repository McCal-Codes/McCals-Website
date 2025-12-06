# Contact Form Widget

**Version:** 1.0.0  
**Last Updated:** November 19, 2025  
**Status:** ✅ Production Ready

## Overview

A clean, accessible contact form with Formspree integration for spam-free message delivery. No backend required.

## Features

### Core Functionality
- 📧 Formspree integration (no backend needed)
- 🛡️ Honeypot spam protection
- ✅ Form validation
- 📱 Mobile responsive
- ♿ Full accessibility (WCAG 2.1 AA)
- 🎯 Success/error messaging
- 🔄 Loading states

### Form Fields
- Name (required)
- Email (required)
- Subject dropdown (required)
- Message textarea (required)
- Honeypot (hidden anti-spam)

### Design
- Clean monochrome styling
- Smooth transitions
- Focus states for keyboard navigation
- Loading spinner during submission
- Auto-hiding success/error messages

## Quick Start

### 1. Get Formspree Form ID

See [SETUP.md](./SETUP.md) for detailed step-by-step instructions.

Quick version:
1. Sign up at [Formspree.io](https://formspree.io/) (free - 50 submissions/month)
2. Create a new form
3. Copy your Form ID (e.g., `mbjqnelr`)

### 2. Configure Widget

Open `v1.0.0-contact-form.html` and update this line:

```javascript
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // Replace YOUR_FORM_ID
```

Example:
```javascript
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mbjqnelr';
```

That's it! No email templates or complex setup needed.

### 3. Deploy

#### Squarespace Code Block

```html
<div class="mccal-contact-widget" data-src="https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@contact-form@1.0.0/src/widgets/contact-form/versions/v1.0.0-contact-form.html"></div>
<script>
  (function(){
    var c = document.querySelector('.mccal-contact-widget');
    if(!c) return;
    var s = c.getAttribute('data-src');
    if(!s) return;
    fetch(s, {mode: 'cors'})
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => c.innerHTML = html)
      .catch(() => c.innerHTML = '<p>Failed to load contact form</p>');
  })();
</script>
```

#### Direct Embed

Copy the entire `v1.0.0-contact-form.html` file into your page.

## Customization

### Form Fields

Add/remove fields by editing the form HTML:

```html
<div class="form-group">
  <label for="phone">Phone</label>
  <input type="tel" id="phone" name="phone" placeholder="(555) 123-4567">
</div>
```

Don't forget to update the EmailJS template to include new fields: `{{phone}}`

### Subject Options

Edit the dropdown options:

```html
<select id="subject" name="subject" required>
  <option value="">Select a topic...</option>
  <option value="general">General Inquiry</option>
  <option value="custom">Your Custom Option</option>
</select>
```

### Styling

Key CSS variables you can customize:

```css
/* Colors */
--primary-color: #1a1a1a; /* Buttons, borders */
--text-color: #1a1a1a; /* Main text */
--error-color: #e53e3e; /* Error messages */

/* Layout */
--max-width: 800px; /* Form max width */
--border-radius: 8px; /* Input border radius */
--spacing: 1.5rem; /* Gap between fields */
```

### Success/Error Messages

Edit message text:

```html
<div class="message message-success" id="successMessage">
  <span>✓</span>
  <div>
    <strong>Custom success title!</strong><br>
    Custom success message text.
  </div>
</div>
```

### Styling

Key CSS variables you can customize:

```css
/* Colors */
--primary-color: #1a1a1a; /* Buttons, borders */
--text-color: #1a1a1a; /* Main text */
--error-color: #e53e3e; /* Error messages */

/* Layout */
--max-width: 800px; /* Form max width */
--border-radius: 8px; /* Input border radius */
--spacing: 1.5rem; /* Gap between fields */
```

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

## Performance

- **Load Time**: < 50ms (no external SDKs)
- **First Paint**: Immediate
- **Bundle Size**: ~5KB
- **No backend required**

## Security

- ✅ Honeypot anti-spam field
- ✅ Client-side validation
- ✅ Formspree Akismet spam filtering
- ✅ Rate limiting included
- ⚠️ Enable reCAPTCHA in Formspree settings for high-traffic sites

## Free Tier Limits

Formspree free plan:
- 50 submissions/month
- Unlimited forms
- Email notifications
- Spam filtering

For higher volume, upgrade to paid plan ($10/mo for 1,000 submissions).

## Troubleshooting

### Widget shows "Formspree Not Configured"
- You haven't replaced `YOUR_FORM_ID` in the endpoint
- Update the `FORMSPREE_ENDPOINT` constant

### Form submits but no email
- Check Formspree [dashboard submissions](https://formspree.io/forms)
- Verify your email address in Formspree account
- Check spam folder

### "Failed to send" error
- Open browser console (F12) for details
- Verify Form ID is correct
- Check you haven't exceeded 50 submissions/month limit

### First submission shows confirmation
- This is normal! Formspree requires email confirmation on first submit
- Click the confirmation link
- All future submissions work normally

See [SETUP.md](./SETUP.md) for detailed troubleshooting.

## Alternatives

### EmailJS
Free tier: 100 emails/month  
Requires: Public Key, Service ID, Template ID  
[Setup instructions in SETUP.md](./SETUP.md)

### Netlify Forms
Free with Netlify hosting  
Requires Netlify deployment

### Google Forms
Free but less customizable  
Good for simple use cases

## Version History

### v1.0.0 (November 19, 2025)
- Initial release
- Formspree integration (50 free submissions/month)
- Honeypot spam protection
- Full form validation
- Accessibility support
- Mobile responsive design
- Success/error messaging
- Loading states

## Support

- Formspree Setup: [SETUP.md](./SETUP.md)
- Formspree Docs: https://help.formspree.io/
- McCal Media: contact@mccal.media

## License

Copyright © 2025 McCal Media. All rights reserved.
