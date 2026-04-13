import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  consent: z.literal(true),
  contact_loaded_at: z.union([z.string(), z.number()]),
  cf_website_url: z.string().optional(),
});

export const quoteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  service_type: z.string().min(1),
  project_date: z.string().min(1),
  intended_use: z.string().min(1),
  duration: z.string().min(1),
  geographic: z.string().min(1),
  budget: z.string().min(1),
  // Optional fields and honeypots
  mcc_valid_field: z.string().optional(),
  deliverable: z.union([z.array(z.string()), z.string()]).optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  setting: z.string().optional(),
  attendees: z.string().optional(),
  other_deliverables: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  eventTypeId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  requester: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    notes: z.string().optional(),
    timezone: z.string().optional(),
  }),
  // Honeypot field - should never be filled by legitimate users
  hp_field: z.string().optional(),
});

export function safeParseBody(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    return {
      ok: false,
      error: {
        message: 'Invalid request body',
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    };
  }

  return { ok: true, data: result.data };
}

