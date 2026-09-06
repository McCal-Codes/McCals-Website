import { useEffect, useMemo, useState } from 'react';
import SectionCard from '@/components/SectionCard';
import { useAvailability, useSaveAvailability } from '@/hooks/useAvailability';
import {
  BOOKING_TYPE_LABELS,
  NOTICE_PRESETS,
  WEEKDAYS,
  describeNotice,
  describeWindow,
  minutesToTimeInput,
  timeInputToMinutes,
  type AvailabilityRule,
  type BookingTypeId,
} from '@/lib/availability';

const BOOKING_TYPES: BookingTypeId[] = ['grab-coffee', 'book-podcast'];

/**
 * A day holds any number of windows. A day-job shift in the middle of the day
 * leaves a morning window and an evening one, so a single open/close pair per
 * day cannot describe a real schedule.
 */
interface WindowDraft {
  key: string;
  start: string;
  end: string;
  minNoticeHours: number;
  label: string;
}

type Drafts = Record<number, WindowDraft[]>;

let keySeq = 0;
const nextKey = () => `w${(keySeq += 1)}`;

function toDrafts(rules: AvailabilityRule[], bookingType: BookingTypeId): Drafts {
  const drafts: Drafts = {};
  for (const { value } of WEEKDAYS) drafts[value] = [];

  for (const rule of rules) {
    if (rule.bookingType !== bookingType || !rule.isActive) continue;
    drafts[rule.weekday].push({
      key: nextKey(),
      start: minutesToTimeInput(rule.startMinute),
      end: minutesToTimeInput(rule.endMinute),
      minNoticeHours: rule.minNoticeHours,
      label: rule.label ?? '',
    });
  }

  for (const weekday of Object.keys(drafts)) {
    drafts[Number(weekday)].sort((a, b) => a.start.localeCompare(b.start));
  }

  return drafts;
}

/** Overlap detection mirrors the availability_rules_no_overlap constraint. */
function findOverlaps(windows: WindowDraft[]): Set<string> {
  const overlapping = new Set<string>();
  const ranges = windows
    .map((window) => ({
      key: window.key,
      start: timeInputToMinutes(window.start),
      end: timeInputToMinutes(window.end),
    }))
    .filter((range): range is { key: string; start: number; end: number } =>
      range.start !== null && range.end !== null && range.end > range.start
    )
    .sort((a, b) => a.start - b.start);

  for (let i = 1; i < ranges.length; i += 1) {
    // Half-open ranges: a window ending at 10:00 may abut one starting at 10:00.
    if (ranges[i].start < ranges[i - 1].end) {
      overlapping.add(ranges[i].key);
      overlapping.add(ranges[i - 1].key);
    }
  }

  return overlapping;
}

export default function AvailabilityPage() {
  const { data, isLoading, error } = useAvailability();
  const save = useSaveAvailability();

  const [bookingType, setBookingType] = useState<BookingTypeId>('grab-coffee');
  const [drafts, setDrafts] = useState<Drafts>({});

  // Reset whenever the loaded data or selected type changes, so switching tabs
  // never carries unsaved edits from another booking type.
  useEffect(() => {
    if (data) setDrafts(toDrafts(data.rules, bookingType));
  }, [data, bookingType]);

  const problems = useMemo(() => {
    const found: string[] = [];

    for (const { value, label } of WEEKDAYS) {
      const windows = drafts[value] ?? [];

      for (const window of windows) {
        const start = timeInputToMinutes(window.start);
        const end = timeInputToMinutes(window.end);

        if (start === null || end === null) {
          found.push(`${label}: enter times as HH:MM`);
        } else if (end <= start) {
          found.push(`${label}: ${window.start}–${window.end} ends before it starts`);
        }
      }

      if (findOverlaps(windows).size > 0) {
        found.push(`${label}: windows overlap`);
      }
    }

    return found;
  }, [drafts]);

  function updateWindow(weekday: number, key: string, patch: Partial<WindowDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [weekday]: prev[weekday].map((window) =>
        window.key === key ? { ...window, ...patch } : window
      ),
    }));
  }

  function addWindow(weekday: number) {
    setDrafts((prev) => ({
      ...prev,
      [weekday]: [
        ...prev[weekday],
        { key: nextKey(), start: '09:00', end: '17:00', minNoticeHours: 24, label: '' },
      ],
    }));
  }

  function removeWindow(weekday: number, key: string) {
    setDrafts((prev) => ({
      ...prev,
      [weekday]: prev[weekday].filter((window) => window.key !== key),
    }));
  }

  function handleSave() {
    if (problems.length) return;

    const rules: AvailabilityRule[] = WEEKDAYS.flatMap(({ value }) =>
      (drafts[value] ?? []).flatMap((window) => {
        const startMinute = timeInputToMinutes(window.start);
        const endMinute = timeInputToMinutes(window.end);
        if (startMinute === null || endMinute === null) return [];

        return [
          {
            bookingType,
            weekday: value,
            startMinute,
            endMinute,
            minNoticeHours: window.minNoticeHours,
            label: window.label.trim() || null,
            isActive: true,
          },
        ];
      })
    );

    save.mutate({ bookingType, rules });
  }

  if (isLoading) {
    return (
      <SectionCard title="Availability" subtitle="Loading your booking hours…">
        <p className="muted">Loading…</p>
      </SectionCard>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <SectionCard title="Availability" subtitle="Could not load booking hours">
        <p className="muted">
          {message === 'supabase_not_configured'
            ? 'Supabase is not configured for this environment, so the booking pages are falling back to the built-in default hours.'
            : message}
        </p>
      </SectionCard>
    );
  }

  const openWindowCount = WEEKDAYS.reduce(
    (total, { value }) => total + (drafts[value]?.length ?? 0),
    0
  );

  return (
    <div className="page-stack">
      <SectionCard
        title="Availability"
        subtitle="When people can book you. Saved changes apply immediately — no deploy needed."
      >
        <div className="availability-types" role="tablist" aria-label="Booking type">
          {BOOKING_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={bookingType === type}
              className={`availability-type${bookingType === type ? ' is-active' : ''}`}
              onClick={() => setBookingType(type)}
            >
              {BOOKING_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <p className="muted availability-hint">
          Add a window for each stretch you can be booked. Hours you are at your day job can stay
          open with a 14-day notice, which gives you time to swap the shift.
        </p>

        <ul className="availability-days">
          {WEEKDAYS.map(({ value, label }) => {
            const windows = drafts[value] ?? [];
            const overlapping = findOverlaps(windows);

            return (
              <li key={value} className="availability-day">
                <div className="availability-day__header">
                  <span className="availability-day__name">{label}</span>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => addWindow(value)}
                  >
                    Add window
                  </button>
                </div>

                {windows.length === 0 ? (
                  <p className="availability-day__closed muted">Closed — no bookings offered.</p>
                ) : (
                  <ul className="availability-windows">
                    {windows.map((window) => {
                      const start = timeInputToMinutes(window.start);
                      const end = timeInputToMinutes(window.end);
                      const invalid = start === null || end === null || end <= start;

                      return (
                        <li
                          key={window.key}
                          className={`availability-window${
                            invalid || overlapping.has(window.key) ? ' is-invalid' : ''
                          }`}
                        >
                          <label>
                            <span className="visually-hidden">{label} window start</span>
                            <input
                              type="time"
                              value={window.start}
                              step={900}
                              onChange={(event) =>
                                updateWindow(value, window.key, { start: event.target.value })
                              }
                            />
                          </label>
                          <span aria-hidden="true">to</span>
                          <label>
                            <span className="visually-hidden">{label} window end</span>
                            <input
                              type="time"
                              value={window.end}
                              step={900}
                              onChange={(event) =>
                                updateWindow(value, window.key, { end: event.target.value })
                              }
                            />
                          </label>

                          <label>
                            <span className="visually-hidden">{label} notice period</span>
                            <select
                              value={window.minNoticeHours}
                              onChange={(event) =>
                                updateWindow(value, window.key, {
                                  minNoticeHours: Number(event.target.value),
                                })
                              }
                            >
                              {NOTICE_PRESETS.map((option) => (
                                <option key={option.hours} value={option.hours}>
                                  {option.label}
                                </option>
                              ))}
                              {!NOTICE_PRESETS.some(
                                (option) => option.hours === window.minNoticeHours
                              ) && (
                                <option value={window.minNoticeHours}>
                                  {describeNotice(window.minNoticeHours)}
                                </option>
                              )}
                            </select>
                          </label>

                          <label className="availability-window__label">
                            <span className="visually-hidden">{label} window note</span>
                            <input
                              type="text"
                              placeholder="Note (optional)"
                              value={window.label}
                              maxLength={60}
                              onChange={(event) =>
                                updateWindow(value, window.key, { label: event.target.value })
                              }
                            />
                          </label>

                          <span className="availability-window__summary muted">
                            {!invalid ? describeWindow(start, end) : 'Invalid range'}
                          </span>

                          <button
                            type="button"
                            className="button button--ghost"
                            onClick={() => removeWindow(value, window.key)}
                            aria-label={`Remove ${label} ${window.start} to ${window.end} window`}
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {problems.length > 0 && (
          <ul className="availability-errors" role="alert">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        )}

        <div className="availability-actions">
          <button
            type="button"
            className="button button--primary"
            onClick={handleSave}
            disabled={save.isPending || problems.length > 0}
          >
            {save.isPending ? 'Saving…' : `Save ${BOOKING_TYPE_LABELS[bookingType]} hours`}
          </button>

          <p className="availability-status" role="status">
            {save.isError
              ? `Could not save: ${save.error instanceof Error ? save.error.message : 'unknown error'}`
              : save.isSuccess
                ? 'Saved.'
                : `${openWindowCount} window${openWindowCount === 1 ? '' : 's'} across the week.`}
          </p>
        </div>
      </SectionCard>

      {data && data.blackouts.length > 0 && (
        <SectionCard title="Blackout dates" subtitle="Dates blocked regardless of weekly hours">
          <ul className="stack-list">
            {data.blackouts.map((blackout) => (
              <li key={blackout.id} className="stack-list__item">
                <strong>
                  {blackout.startsOn}
                  {blackout.endsOn !== blackout.startsOn ? ` → ${blackout.endsOn}` : ''}
                </strong>
                <span className="muted">
                  {blackout.bookingType
                    ? BOOKING_TYPE_LABELS[blackout.bookingType]
                    : 'All booking types'}
                  {blackout.reason ? ` — ${blackout.reason}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
