import {
  format,
  formatDistance,
  formatRelative,
  isAfter,
  isBefore,
  isWithinInterval,
  differenceInDays,
  addDays,
  addMonths,
  startOfDay,
  endOfDay,
  parseISO,
  isValid
} from 'date-fns';

/**
 * Date utility functions using date-fns
 * Centralized date formatting and manipulation for the PEVI platform
 */

/**
 * Format a date to a readable string
 * @param date - Date to format (Date object or ISO string)
 * @param formatStr - Format string (default: 'MMM dd, yyyy')
 * @example formatDate(new Date()) => "Jan 15, 2024"
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, formatStr);
}

/**
 * Format a date with time
 * @example formatDateTime(new Date()) => "Jan 15, 2024 at 3:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, "MMM dd, yyyy 'at' h:mm a");
}

/**
 * Format date in ISO format (for API requests)
 * @example formatISODate(new Date()) => "2024-01-15"
 */
export function formatISODate(date: Date | string): string {
  return formatDate(date, 'yyyy-MM-dd');
}

/**
 * Format date in ISO datetime format (for API requests)
 * @example formatISODateTime(new Date()) => "2024-01-15T15:30:00"
 */
export function formatISODateTime(date: Date | string): string {
  return formatDate(date, "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Get relative time from now
 * @example getRelativeTime(yesterday) => "1 day ago"
 * @example getRelativeTime(tomorrow) => "in 1 day"
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Get relative time with context
 * @example getRelativeTimeWithContext(yesterday) => "yesterday at 3:30 PM"
 */
export function getRelativeTimeWithContext(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatRelative(dateObj, new Date());
}

/**
 * Check if a campaign is active
 * @param startDate - Campaign start date
 * @param endDate - Campaign end date
 */
export function isCampaignActive(startDate: Date | string, endDate: Date | string): boolean {
  const now = new Date();
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  return isWithinInterval(now, { start, end });
}

/**
 * Check if a campaign has ended
 */
export function isCampaignEnded(endDate: Date | string): boolean {
  const now = new Date();
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return isBefore(end, now);
}

/**
 * Get days remaining in a campaign
 * @returns Number of days remaining (negative if ended)
 */
export function getDaysRemaining(endDate: Date | string): number {
  const now = startOfDay(new Date());
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(startOfDay(end), now);
}

/**
 * Get campaign status text
 * @returns "Ended", "Active", or "Starts in X days"
 */
export function getCampaignStatusText(startDate: Date | string, endDate: Date | string): string {
  const now = new Date();
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (isBefore(end, now)) {
    return 'Ended';
  }

  if (isAfter(start, now)) {
    const daysUntilStart = differenceInDays(startOfDay(start), startOfDay(now));
    return `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`;
  }

  const daysRemaining = getDaysRemaining(end);
  return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
}

/**
 * Parse a date string safely
 * @returns Date object or null if invalid
 */
export function parseDate(dateStr: string): Date | null {
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : null;
}

/**
 * Get start of day for a date
 */
export function getStartOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(dateObj);
}

/**
 * Get end of day for a date
 */
export function getEndOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(dateObj);
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
}

/**
 * Add months to a date
 */
export function addMonthsToDate(date: Date | string, months: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addMonths(dateObj, months);
}
