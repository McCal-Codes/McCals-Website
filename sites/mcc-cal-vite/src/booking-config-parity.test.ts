import { describe, expect, it } from 'vitest';
import { BOOKING_CONFIGS } from '../api/_lib/booking-config.js';
import { BOOKING_TYPES } from '@/components/scheduling/config/bookingTypes';

/**
 * The client and the server each carry their own booking configuration, and
 * nothing at runtime reconciles them. When they drifted apart — the client
 * offering 60-minute podcast recordings while the server demanded at least
 * 90 — every submission to /api/schedule/book returned a 400 and the booking
 * page was silently dead.
 *
 * These assertions are the reconciliation. They follow the same config-parity
 * pattern as vercel-config.test.ts and seo.static.test.ts: cheap checks that
 * fail loudly the moment two sources of truth disagree.
 */
describe('booking config parity between client and server', () => {
  const clientTypes = Object.values(BOOKING_TYPES);

  // BOOKING_CONFIGS comes from an untyped .js module, so TypeScript infers a
  // literal object whose keys can't be indexed by an arbitrary string. Going
  // through a Map keeps the lookup type-safe without casting.
  const serverConfigs = new Map(Object.entries(BOOKING_CONFIGS));

  it('exposes at least one bookable type', () => {
    expect(clientTypes.length).toBeGreaterThan(0);
  });

  it.each(clientTypes.map((type) => [type.id, type] as const))(
    'server accepts the duration the client sends for %s',
    (id, type) => {
      const serverConfig = serverConfigs.get(id);

      // A client type with no server counterpart is an unknown event type,
      // which the handler rejects with a 400 before it looks at duration.
      if (!serverConfig) {
        throw new Error(`No server BOOKING_CONFIGS entry for client booking type "${id}"`);
      }

      // Mirrors the range check in api/schedule/book.js. Note the server's
      // durationMinutes is a *minimum*, so a client value below it is rejected
      // — that is the exact failure this test exists to prevent.
      expect(
        type.durationMinutes,
        `Client sends ${type.durationMinutes}min for "${id}" but the server ` +
          `only accepts ${serverConfig.durationMinutes}-${serverConfig.maxDurationMinutes}min`
      ).toBeGreaterThanOrEqual(serverConfig.durationMinutes);

      expect(type.durationMinutes).toBeLessThanOrEqual(serverConfig.maxDurationMinutes);
    }
  );

  it.each(clientTypes.map((type) => [type.id, type] as const))(
    'server range is internally coherent for %s',
    (id) => {
      const serverConfig = serverConfigs.get(id);
      if (!serverConfig) {
        throw new Error(`No server BOOKING_CONFIGS entry for client booking type "${id}"`);
      }
      expect(serverConfig.durationMinutes).toBeLessThanOrEqual(serverConfig.maxDurationMinutes);
    }
  );

  it('does not define server booking types the client cannot reach', () => {
    const clientIds = new Set(clientTypes.map((type) => type.id));
    const orphaned = Object.keys(BOOKING_CONFIGS).filter((id) => !clientIds.has(id));
    expect(orphaned).toEqual([]);
  });
});
