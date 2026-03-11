# Contact Form Widget - EmailJS Setup

This widget currently ships with EmailJS integration. The Formspree instructions that used to live
here no longer matched the actual widget code.

## Setup flow

### 1. Create an EmailJS account

1. Go to `https://www.emailjs.com/`
2. Sign in or create an account
3. Verify the inbox you want to use for contact submissions

### 2. Add an email service

1. Open the EmailJS dashboard
2. Go to `Email Services`
3. Add the provider you want to send through
4. Copy the resulting `Service ID`

### 3. Create a template

1. Go to `Email Templates`
2. Create a template for contact submissions
3. Include these variables in the template body or subject:

```text
{{name}}
{{email}}
{{subject}}
{{message}}
{{consent}}
{{timestamp}}
```

4. Copy the resulting `Template ID`

### 4. Copy your public key

1. Open `Account`
2. Copy your `Public Key`

### 5. Update the widget

Open `src/widgets/_content/contact-form/versions/v1.1.0-contact-enhanced.html` and replace the
values in `EMAILJS_CONFIG`:

```javascript
const EMAILJS_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY',
  serviceId: 'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID',
};
```

### 6. Test locally

1. Open the widget HTML file in a browser
2. Fill out every required field
3. Wait a couple of seconds before submitting
4. Confirm the success state appears
5. Verify the message arrives in the configured inbox

## Recommended template example

```text
New contact form submission

Name: {{name}}
Email: {{email}}
Subject: {{subject}}
Consent: {{consent}}
Submitted: {{timestamp}}

Message:
{{message}}
```

## Troubleshooting

### "EmailJS Not Configured" appears

- One or more `EMAILJS_CONFIG` values are still placeholders
- Refresh the page after editing the widget file

### Submission fails immediately

- Check the browser console for the EmailJS error
- Confirm the public key, service ID, and template ID all belong to the same EmailJS account
- Confirm the email service is active in EmailJS

### No email arrives

- Check the EmailJS dashboard activity log
- Verify the destination inbox on the connected email service
- Check spam/junk folders
- Confirm the template still references the expected variables

### A fast test submission is blocked

- The widget now rejects submissions made too quickly after page load
- Wait a moment and submit again

## Security notes

- The widget uses a hidden honeypot field and a minimum submit-time check to reduce obvious bot
  traffic.
- EmailJS public keys are client-side by design, but you should still avoid reusing the same
  service/template pair across unrelated forms.
- For higher-trust lead handling, replace this widget with the native app route and owned backend
  flow planned in `updates/todo.md`.
