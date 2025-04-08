import { getLocalISOString } from '@/lib//utils';
export type TimeRange = 'week' | 'month' | '3months' | 'year';

/**
 * Converts "HH:mm:ss" from a given timezone to UTC.
 * @param localTime - Time in "HH:mm:ss" format in the given timezone.
 * @returns Time string in "HH:mm:ss" UTC.
 */
export function convertToUtcTime(localTime: string): string {
  const [hour, minute, second] = localTime.split(':').map(Number);

  const now = new Date(); // Get current date for context (so we don't lose the date part)
  const localDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    second ?? 0,
  );

  // Use `toISOString()` which always gives UTC time in YYYY-MM-DDTHH:mm:ss.sssZ format.
  const utcString = localDate.toISOString();

  // Extract just the time portion (HH:mm:ss) from the ISO string.
  return utcString.substring(11, 19);
}

/**
 * Converts "HH:mm:ss" from UTC to a given timezone.
 * @param utcTime - Time in "HH:mm:ss" UTC.
 * @returns Time string in "HH:mm:ss" local time.
 */
export function convertToLocalTime(utcTime: string): string {
  const [hour, minute, second] = utcTime.split(':').map(Number);

  const now = new Date(); // Get current date (for year, month, day)
  const utcDate = new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      second ?? 0,
    ),
  );

  // JavaScript automatically interprets .getHours() as local time
  const localHours = utcDate.getHours().toString().padStart(2, '0');
  const localMinutes = utcDate.getMinutes().toString().padStart(2, '0');
  const localSeconds = utcDate.getSeconds().toString().padStart(2, '0');

  return `${localHours}:${localMinutes}:${localSeconds}`;
}

export function daysAgo(dateString: string): number {
  const inputDate = new Date(`${dateString}T00:00:00.000Z`); // Ensure input is treated as UTC midnight
  const now = new Date();

  // Get today's date in UTC (set time to midnight UTC)
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  // Calculate the difference in milliseconds
  const diffMs = todayUTC.getTime() - inputDate.getTime();

  // Convert milliseconds to days
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getLatestDate(
  date1: string | null,
  date2: string | null,
): string | null {
  if (date1 && !date2) return date1;
  else if (!date1 && date2) return date2;
  else if (!date1 && !date2) return null;

  // Parse the date strings into Date objects
  const parsedDate1 = new Date(date1!);
  const parsedDate2 = new Date(date2!);

  // Compare the two dates
  if (parsedDate1 > parsedDate2) {
    return date1;
  } else {
    return date2;
  }
}

export const getStartDate = (timeRange: TimeRange): string => {
  const today = new Date();
  switch (timeRange) {
    case 'week':
      return getLocalISOString(new Date(today.setDate(today.getDate() - 7)));
    case 'month':
      return getLocalISOString(new Date(today.setMonth(today.getMonth() - 1)));
    case '3months':
      return getLocalISOString(new Date(today.setMonth(today.getMonth() - 3)));
    case 'year':
      return getLocalISOString(
        new Date(today.setFullYear(today.getFullYear() - 1)),
      );
    default:
      return getLocalISOString(new Date(today.setMonth(today.getMonth() - 1)));
  }
};

// Format date for display on chart
export const formatDate = (dateString: string): string => {
  const date = new Date(`${dateString}T00:00:00Z`);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};
