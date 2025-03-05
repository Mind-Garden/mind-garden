/**
 * Converts "HH:mm:ss" from a given timezone to UTC.
 * @param localTime - Time in "HH:mm:ss" format in the given timezone.
 * @returns Time string in "HH:mm:ss" UTC.
 */
export function convertToUtcTime(localTime: string): string {
  const [hour, minute, second] = localTime.split(":").map(Number);

  const now = new Date();  // Get current date for context (so we don't lose the date part)
  const localDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    second ?? 0
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
  const [hour, minute, second] = utcTime.split(":").map(Number);

  const now = new Date();  // Get current date (for year, month, day)
  const utcDate = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    second ?? 0
  ));

  // JavaScript automatically interprets .getHours() as local time
  const localHours = utcDate.getHours().toString().padStart(2, '0');
  const localMinutes = utcDate.getMinutes().toString().padStart(2, '0');
  const localSeconds = utcDate.getSeconds().toString().padStart(2, '0');

  return `${localHours}:${localMinutes}:${localSeconds}`;
}
