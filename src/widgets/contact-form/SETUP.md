# Contact Form Widget - Formspree Setup

## Quick Setup (2 minutes)

### Step 1: Create Formspree Account
1. Go to [Formspree.io](https://formspree.io/)
2. Sign up for free (50 submissions/month)
3. Verify your email

### Step 2: Create a Form
1. Click **+ New Form**
2. Give it a name: "McCal Media Contact Form"
3. Click **Create Form**
4. **Copy your Form ID** (e.g., `mbjqnelr`)
   - It's in the URL: `https://formspree.io/forms/mbjqnelr/integration`
   - Or shown as "Form Endpoint"

### Step 3: Configure Widget

Open `v1.0.0-contact-form.html` and find this line at the bottom:

```javascript
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // ← REPLACE YOUR_FORM_ID
```

Replace `YOUR_FORM_ID` with your actual Form ID:

```javascript
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mbjqnelr';
```

### Step 4: Test

1. Save the file
2. Open the widget in a browser
3. Fill out the form
4. Click "Send Message"
5. Check your email inbox - Formspree forwards submissions to your registered email!

## How It Works

1. User submits form
2. Form data sent to Formspree
3. Formspree forwards email to you
4. You receive notification
5. View submissions in Formspree dashboard

## Formspree Dashboard

View all submissions at: https://formspree.io/forms/YOUR_FORM_ID/submissions

Features:
- See all form submissions
- Export to CSV
- Spam filtering (Akismet)
- Email notifications
- Custom reply-to addresses

## Free Tier Limits

Formspree free plan:
- ✅ 50 submissions per month
- ✅ Unlimited forms
- ✅ Email notifications
- ✅ Spam filtering
- ✅ Basic support

For higher volume: $10/month for 1,000 submissions

## Troubleshooting

### "Formspree Not Configured" message appears
- Make sure you replaced `YOUR_FORM_ID` in the endpoint
- Check that there are no typos
- Refresh the page after saving changes

### Form submits but no email received
- Check your Formspree dashboard submissions
- Verify your email address in Formspree account settings
- Check spam folder
- Make sure you confirmed your email address with Formspree

### "Failed to send message" error
- Open browser console (F12) to see detailed error
- Verify your Form ID is correct
- Check you haven't exceeded 50 submissions/month limit
- Try creating a new form in Formspree dashboard

### First submission shows confirmation page
- This is normal! Formspree requires one confirmation
- Click "Confirm your email" in the message
- All future submissions will work normally

## Advanced Configuration

### Custom Email Notifications

In Formspree dashboard:
1. Go to your form settings
2. Under **Notifications** → Add custom email addresses
3. Customize notification templates

### Reply-To Address

Formspree automatically uses the submitter's email as the reply-to address, so you can reply directly to submissions.

### Spam Protection

Formspree includes Akismet spam filtering automatically. You can also:
- Enable reCAPTCHA in form settings
- Use the honeypot field (already included)
- Set submission rate limits

### Export Data

From the dashboard:
1. Go to Submissions
2. Click **Export**
3. Download as CSV

## Alternative: EmailJS

If you prefer EmailJS (100 emails/month free), see the alternative setup below:

<details>
<summary>EmailJS Setup Instructions</summary>

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for free (100 emails/month)

### Step 2: Add Email Service
1. Go to Email Services
2. Add Gmail/Outlook/Custom SMTP
3. Copy Service ID

### Step 3: Create Template
1. Go to Email Templates  
2. Create new template with these variables:
   - `{{name}}`, `{{email}}`, `{{subject}}`, `{{message}}`
3. Copy Template ID

### Step 4: Get Public Key
1. Go to Account Settings
2. Copy Public Key

### Step 5: Update Widget
You'll need to replace the Formspree code with EmailJS code. See the original EmailJS version for reference.

</details>

## Security Notes

- ✅ Form ID is safe to expose (it's public)
- ✅ Honeypot field prevents basic spam
- ✅ Formspree Akismet filtering
- ✅ Rate limiting included
- ⚠️ For high-traffic sites, enable reCAPTCHA in Formspree settings

## Support

- Formspree Docs: https://help.formspree.io/
- Formspree Dashboard: https://formspree.io/forms
- McCal Media: contact@mccal.media
