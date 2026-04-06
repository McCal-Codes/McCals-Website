/**
 * Date helpers for calendar calculations
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return formatDateForInput(new Date());
}

/**
 * Format date as YYYY-MM-DD for input values
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD to Date object
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the start of the month for a given date
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the end of the month for a given date
 */
export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get array of dates for a month view (including padding days)
 */
export function getCalendarDays(viewDate: Date): Date[] {
  const monthStart = getMonthStart(viewDate);
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday
  
  // Start from the Sunday before the 1st of the month
  const calendarStart = addDays(monthStart, -startDayOfWeek);
  
  // Generate 42 days (6 weeks) for the calendar grid
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(calendarStart, i));
  }
  
  return days;
}

/**
 * Check if date is in the past
 */
export function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = parseDateString(dateStr);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Check if date is within range
 */
export function isWithinRange(dateStr: string, maxDays: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = parseDateString(dateStr);
  checkDate.setHours(0, 0, 0, 0);
  const maxDate = addDays(today, maxDays);
  maxDate.setHours(0, 0, 0, 0);
  return checkDate <= maxDate;
}

/**
 * Get month name
 */
export function getMonthName(date: Date, format: 'long' | 'short' = 'long'): string {
  return date.toLocaleDateString('en-US', { month: format });
}

/**
 * Get day of week name
 */
export function getDayName(date: Date, format: 'long' | 'short' = 'short'): string {
  return date.toLocaleDateString('en-US', { weekday: format });
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}
