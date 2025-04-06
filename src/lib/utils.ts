import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a new Date object with the local timezone offset subtracted from the given Date
 * @param date the Date object to convert, defaults to new Date()
 * @returns a new Date object with the local timezone offset subtracted
 */
export const getDate = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
  return new Date(date.getTime() - offsetMs);
};

/**
 * Returns a new Date object with the local timezone offset added to the given Date
 * @param date the Date object to convert, defaults to new Date()
 * @returns a new Date object with the local timezone offset added
 */
export const undoConversion = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
  return new Date(date.getTime() + offsetMs);
};

/**
 * Returns the local date in ISO format, trimmed to only include the month, day, and year.
 * @param date the Date object to convert, defaults to new Date()
 * @returns a string in the format 'YYYY-MM-DD'
 */
export function getLocalISOString(date = new Date()) {
  return getDate(date).toISOString().split('T')[0].trim(); //only get the month-day-year
}

/**
 * Converts 12-hour time to 24-hour time in decimal format.
 * @param time a string in the format 'HH:MM AM/PM'
 * @returns the time in decimal format (e.g. 1:30 PM becomes 13.5)
 */
export const convertTo24Hour = (time: string): number => {
  const [hourPart, minutePart] = time.split(':');
  let hour = parseInt(hourPart, 10);
  const minutes = parseInt(minutePart, 10) / 60; // Convert minutes to decimal

  const isPM = time.toUpperCase().includes('PM');
  const isAM = time.toUpperCase().includes('AM');

  if (isPM && hour !== 12) hour += 12; // Convert 1 PM - 11 PM to 13 - 23
  if (isAM && hour === 12) hour = 0;

  let result = hour + minutes;

  if (result < 18) result += 24;

  return result;
};

/**
 * Converts 12-hour time in a sleep entry to 24-hour time in "HH:MM" format.
 * @param timeStr a string in the format 'HH:MM AM/PM'
 * @returns the time in 24-hour format (e.g. 1:30 PM becomes 13:30)
 */
export const convertTo24HourSleepEntry = (timeStr: string) => {
  const [time, period] = timeStr.split(' ');
  const [hoursStr, minutes] = time.split(':').map(Number);
  let hours = hoursStr;

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  // Ensure two-digit format for hours and minutes
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const formatHour = (hour: number) => {
  // Convert back to a normal 12-hour format while accounting for the 6PM–6PM shift
  let adjustedHour = hour;

  if (hour >= 24) adjustedHour -= 24; // Convert hours like 30 → 6 AM, 36 → 12 PM

  const suffix = adjustedHour >= 12 ? 'PM' : 'AM';
  let formattedHour = adjustedHour % 12;
  if (formattedHour === 0) formattedHour = 12; // Handle 12 AM / 12 PM correctly

  return `${formattedHour}${suffix}`;
};

export const getSleepDuration = (start: string, end: string) => {
  return convertTo24Hour(end) - convertTo24Hour(start);
};

/**
 * Returns a colour based on the given sleep duration in hours.
 * Less than 6 hours: #d1d5db
 * 6-8 hours: #83e3c6
 * More than 8 hours: #2ebb61
 * @param duration the sleep duration in hours
 * @returns a hex colour code
 */
export const getBarColour = (duration: number): string => {
  if (duration < 6) {
    return '#d1d5db';
  } else if (duration >= 6 && duration <= 8) {
    return '#83e3c6';
  } else {
    return '#2ebb61';
  }
};

/**
 * Converts a time in 24-hour format to 12-hour format with AM/PM.
 * @param time a string in 24-hour format (e.g. '12:00')
 * @returns a string in 12-hour format (e.g. '12:00 PM')
 */
export const getTimeAMPM = (time: string) => {
  const [hour, minute] = time.split(':');
  const isPM = parseInt(hour) >= 12;
  const formattedHour = parseInt(hour) % 12 || 12;
  return `${formattedHour}:${minute} ${isPM ? 'PM' : 'AM'}`;
};

/**
 * Returns a greeting based on the current time of day.
 * Good Morning: 0h-12h
 * Good Afternoon: 12h-18h
 * Good Evening: 18h-24h
 * @returns a string containing the greeting
 */
export function getGreetingText(): string {
  const currentHour = new Date().getHours();

  let greetingText = '';

  if (currentHour < 12) {
    greetingText = 'Good Morning';
  } else if (currentHour < 18) {
    greetingText = 'Good Afternoon';
  } else {
    greetingText = 'Good Evening';
  }

  return greetingText;
}

/**
 * Calculates the average time elapsed from a list of time values.
 * @param times list of time values in seconds
 * @returns the average time elapsed in seconds
 */
export const getAverageTimeElapsed = (times: number[]): number => {
  if (times.length === 0) return 0;

  const total = times.reduce((sum, time) => sum + time, 0);
  return total / times.length;
};

/**
 * Capitalizes the first letter of each word in a string.
 * @param str the input string to transform
 * @returns the input string with each word's first letter capitalized
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Calculates the duration between a start and end time in hours and minutes.
 * Handles overnight durations (e.g., 10:00 PM to 6:00 AM).
 *
 * @param startTime - A string representing the start time in "HH:MM AM/PM" format.
 * @param endTime - A string representing the end time in "HH:MM AM/PM" format.
 * @returns A string representing the duration in the format "Xh Ym".
 */
export const calculateDuration = (startTime: string, endTime: string) => {
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hoursStr, minutes] = time.split(':').map(Number);

    let hours = hoursStr;

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const start = parseTime(startTime);
  let end = parseTime(endTime);

  // Handle overnight sleep
  if (end < start) end += 24 * 60;

  const durationMinutes = end - start;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours}h ${minutes}m`;
};
