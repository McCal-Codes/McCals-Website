# Supabase PostgreSQL Integration - Setup Guide

This document details the PostgreSQL integration for the McCal Media website.

## Project Details

- **Supabase Project**: `mccal-media`
- **Project ID**: `lrppdtruasrabctqkzcs`
- **Region**: `us-east-1` (N. Virginia)
- **URL**: `https://lrppdtruasrabctqkzcs.supabase.co`

## Environment Variables

Add these to your `.env` file:

```env
# Supabase (PostgreSQL database)
VITE_SUPABASE_URL=https://lrppdtruasrabctqkzcs.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Important**: Keep actual Supabase keys in local or deployment environment variables. The `SUPABASE_SERVICE_ROLE_KEY` is private and should NEVER be committed to git. Get it from:
Supabase Dashboard → Project Settings → API → service_role key

## Database Schema

### Tables Created

1. **contact_submissions** - Contact form submissions
   - Stores name, email, subject, message, status
   - Auto-timestamps for created/updated

2. **quote_requests** - Quote request forms
   - Stores client info, event details, budget
   - Tracks status: pending → quoted → booked → declined

3. **bookings** - Appointment bookings
   - Client info, service type, date/time, duration
   - Status tracking and payment status

4. **availability_slots** - Real-time availability
   - Date/time slots with availability status
   - Links to booking when slot is taken
   - Supports real-time updates

5. **blog_posts** - Blog content (CMS)
   - Slug, title, content, published status
   - SEO meta fields, tags array

6. **testimonials** - Client testimonials
   - Author info, rating, content
   - Source tracking (google/linkedin/direct)
   - Featured/approved flags

### Row Level Security (RLS)

All tables have RLS enabled with these policies:
- **Public (anon)**: Can INSERT contact/quote submissions, SELECT published blog posts, approved testimonials, available slots
- **Authenticated**: Full CRUD access (for future admin dashboard)

## API Routes Updated

| Route | Changes |
|-------|---------|
| `POST /api/contact` | Saves to `contact_submissions` + sends email |
| `POST /api/quote` | Saves to `quote_requests` + sends email |
| `GET /api/schedule/availability` | Merges Google Calendar + Supabase bookings |
| `POST /api/schedule/book` | Saves to `bookings`, marks slot unavailable |
| `GET /api/testimonials` | Fetches from `testimonials` table |

## Frontend Integration

### Supabase Client
- `src/lib/supabase.ts` - Browser client (anon key)
- `src/lib/database.types.ts` - TypeScript type definitions

### Updated Hooks
- `src/hooks/useGoogleReviews.ts` - Now fetches from Supabase first, falls back to static data

### Real-time Features
The `availability_slots` table supports real-time subscriptions:
```typescript
import { subscribeToAvailability } from '../lib/supabase';

const channel = subscribeToAvailability((payload) => {
  console.log('Slot changed:', payload);
  // Update UI in real-time
});
```

## Seeded Data

### Testimonials (8 records)
- 6 Google reviews from real clients
- 2 LinkedIn recommendations
- All marked as approved and featured where appropriate

### Availability Slots
- 30 days of time slots generated
- 9am-5pm, every 30 minutes
- Sundays excluded
- Some slots marked as unavailable for testing

## Next Steps

1. **Get Service Role Key**: Add to `.env` file (never commit this)
2. **Test Contact Form**: Submit a test message, verify it appears in Supabase
3. **Test Booking**: Book a slot, verify slot becomes unavailable
4. **Admin Dashboard** (optional): Build a `/admin` page with authentication

## Cost

Supabase Free Tier includes:
- 500 MB database storage
- 1 GB bandwidth
- 2M realtime messages
- Unlimited API requests

**Expected usage**: Well within free tier limits.

## Troubleshooting

### "Supabase environment variables not set"
Check your `.env` file has all three variables defined.

### "Database not found" errors
Verify the project URL is correct and the project is active.

### TypeScript errors with Supabase types
Regenerate types if schema changes:
```bash
npx supabase gen types typescript --project-id lrppdtruasrabctqkzcs --schema public > src/lib/database.types.ts
```

## Security Notes

1. **Anon Key** is safe to expose in frontend (has limited permissions via RLS)
2. **Service Role Key** is server-only (has full access)
3. All tables have RLS policies protecting private data
4. Rate limiting is still applied at API level
