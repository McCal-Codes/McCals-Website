# Vercel KV Setup Guide for Scheduling System

## What is Vercel KV?

Vercel KV is a serverless Redis solution that provides persistent storage for your bookings. Unlike the previous in-memory storage, bookings will now persist across deployments and server restarts.

## Setup Steps

### 1. Install Vercel KV (Already Done)

```bash
cd sites/mcc-cal-vite
npm install @vercel/kv
```

### 2. Create KV Store on Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Choose **KV**
6. Select your region (pick one close to your users)
7. Name it: `schedule-bookings`
8. Connect it to your project

### 3. Environment Variables (Auto-configured)

When you connect KV to your project, Vercel automatically adds these environment variables:

```bash
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

**No manual configuration needed!**

### 4. Test Locally (Optional)

If you want to test KV locally, you need to pull env vars:

```bash
vercel env pull .env.local
```

Then run the local Vercel environment so `/api/schedule/*` functions execute:
```bash
npm run dev:vercel
```

Use plain `npm run dev` only for frontend-only work that does not depend on local API routes.

### 5. Deploy

```bash
vercel --prod
```

## How It Works

Your API routes now use these KV helper functions:

```javascript
// Get all bookings (used by both availability and book endpoints)
async function getBookingsFromKV() {
  const bookings = await kv.get('schedule:bookings');
  return Array.isArray(bookings) ? bookings : [];
}

// Save a new booking
async function saveBookingToKV(booking) {
  const existing = await getBookingsFromKV();
  await kv.set('schedule:bookings', [...existing, booking]);
}
```

## Benefits

- ✅ **Persistent storage** - Bookings survive deployments
- ✅ **Serverless** - No database server to manage
- ✅ **Fast** - Redis performance
- ✅ **Free tier** - 256 MB storage, 60k commands/day
- ✅ **Simple** - No complex setup

## Monitoring

Check your KV usage in Vercel dashboard:
- Go to **Storage** → **schedule-bookings**
- View: Command count, storage size, latency

## Troubleshooting

**"KV read error" in logs?**
- Check if KV is connected to your project
- Verify environment variables are set

**Bookings not persisting?**
- Ensure you're using the production URL (not localhost)
- Check Vercel dashboard → Storage → KV for data

## Migration from In-Memory

Your bookings were previously stored in memory and reset on each deploy. With KV:
- New bookings persist forever (or until you delete them)
- No migration needed - just deploy and it works

## Limitations

- **256 MB** on free tier (thousands of bookings)
- **60k commands/day** on free tier (plenty for personal site)
- Data is stored as JSON (not relational queries)

For admin features (viewing all bookings, canceling, etc.), you can add more KV keys:
```javascript
await kv.set('schedule:stats', { totalBookings: 42 });
await kv.set('schedule:bookings:by-email', { 'user@example.com': ['book_123', 'book_456'] });
```

## Next Steps

1. ✅ KV is installed
2. ✅ API routes updated
3. ⏭️ Create KV database in Vercel dashboard
4. ⏭️ Deploy to production
5. ⏭️ (Optional) Add email notifications with Resend
