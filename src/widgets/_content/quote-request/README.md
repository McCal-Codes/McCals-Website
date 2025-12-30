# Quote Request Widget

A conversion-focused form for photography project inquiries, including licensing and usage details.

## Features

- **Dynamic Fields**: Shows event-specific fields only when "Event Photography" is selected.
- **Licensing Section**: Collects usage, duration, and geographic scope for accurate pricing.
- **Spam Protection**: Includes a honeypot field.
- **EmailJS Integration**: Sends a detailed project summary to the business email.
- **On-Page Confirmation**: Provides immediate feedback to the user upon successful submission.
- **Responsive Design**: Optimized for all screen sizes with a clean, professional aesthetic.

## Setup Instructions

### 1. EmailJS Configuration

You need an EmailJS account ([https://www.emailjs.com/](https://www.emailjs.com/)) to process form submissions.

1. Create an Email Service (e.g., via Gmail).
2. Create an Email Template with placeholders matching the form fields (see below).
3. Update the `EMAILJS_CONFIG` object in the widget code with your:
   - `publicKey`
   - `serviceId`
   - `templateId`

### 2. Template Placeholders

Ensure your EmailJS template uses the following keys:

- `{{name}}`
- `{{email}}`
- `{{phone}}`
- `{{organization}}`
- `{{service_type}}`
- `{{project_date}}`
- `{{start_time}}`
- `{{end_time}}`
- `{{location}}`
- `{{is_outdoor}}`
- `{{attendees}}`
- `{{deliverables}}` (string)
- `{{intended_use}}`
- `{{duration}}`
- `{{geographic_usage}}`
- `{{budget}}`
- `{{timeline}}`
- `{{notes}}`
- `{{timestamp}}`

### 3. Saving to a Table (Sheets/Airtable)

To save submissions to a structured table:

- **EmailJS Integration**: Use EmailJS's built-in integrations for Airtable or Google Sheets (requires an EmailJS paid plan).
- **Alternative**: You can modify the `submit` handler to `fetch` a webhook URL (e.g., Zapier, Make, or a custom Cloudflare Worker).

## Files

- `versions/v1.0.0-quote-request.html`: The latest production version.
- `CHANGELOG.md`: Version history.
- `README.md`: This file.
