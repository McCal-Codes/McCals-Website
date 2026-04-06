import type { PortfolioGroup } from './types';

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function toUtcTimestamp(year: number, month: number, day: number): number {
  return Date.UTC(year, month, day);
}

function parseIsoLikeDate(value?: string): number | null {
  if (!value) return null;

  const fullDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (fullDateMatch) {
    const [, year, month, day] = fullDateMatch;
    return toUtcTimestamp(Number(year), Number(month) - 1, Number(day));
  }

  const yearMonthMatch = value.match(/^(\d{4})-(\d{2})$/);
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch;
    return toUtcTimestamp(Number(year), Number(month) - 1, 1);
  }

  const yearOnlyMatch = value.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return toUtcTimestamp(Number(yearOnlyMatch[1]), 0, 1);
  }

  return null;
}

function parseDisplayDate(value?: string): number | null {
  if (!value) return null;

  const dayMonthYearMatch = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (dayMonthYearMatch) {
    const [, monthName, day, year] = dayMonthYearMatch;
    const month = MONTHS[monthName.toLowerCase()];
    if (month !== undefined) {
      return toUtcTimestamp(Number(year), month, Number(day));
    }
  }

  const monthYearMatch = value.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, monthName, year] = monthYearMatch;
    const month = MONTHS[monthName.toLowerCase()];
    if (month !== undefined) {
      return toUtcTimestamp(Number(year), month, 1);
    }
  }

  return parseIsoLikeDate(value);
}

function inferTimestampFromFilename(filename?: string): number | null {
  if (!filename) return null;

  const isoMatch = filename.match(/(?:^|[^0-9])(\d{4})-(\d{2})-(\d{2})(?=[^0-9]|$)/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return toUtcTimestamp(Number(year), Number(month) - 1, Number(day));
  }

  const eightDigitMatch = filename.match(/(?:^|[^0-9])(\d{4})(\d{2})(\d{2})(?=[^0-9]|$)/);
  if (eightDigitMatch) {
    const [, year, month, day] = eightDigitMatch;
    return toUtcTimestamp(Number(year), Number(month) - 1, Number(day));
  }

  const sixDigitMatch = filename.match(/(?:^|[^0-9])(\d{2})(\d{2})(\d{2})(?=[^0-9]|$)/);
  if (sixDigitMatch) {
    const [, shortYear, month, day] = sixDigitMatch;
    return toUtcTimestamp(2000 + Number(shortYear), Number(month) - 1, Number(day));
  }

  return null;
}

function inferTimestampFromImages(group: PortfolioGroup): number | null {
  let latest: number | null = null;

  for (const image of group.images) {
    const timestamp = inferTimestampFromFilename(image.filename);
    if (timestamp !== null && (latest === null || timestamp > latest)) {
      latest = timestamp;
    }
  }

  return latest;
}

function getGroupTimestamp(group: PortfolioGroup): number {
  return (
    parseIsoLikeDate(group.dateISO) ??
    parseDisplayDate(group.dateDisplay) ??
    inferTimestampFromImages(group) ??
    0
  );
}

export function comparePortfolioGroupsByDateDesc(a: PortfolioGroup, b: PortfolioGroup): number {
  const timestampDelta = getGroupTimestamp(b) - getGroupTimestamp(a);
  if (timestampDelta !== 0) {
    return timestampDelta;
  }

  return a.title.localeCompare(b.title);
}

export function sortPortfolioGroups(groups: PortfolioGroup[]): PortfolioGroup[] {
  return [...groups].sort(comparePortfolioGroupsByDateDesc);
}
