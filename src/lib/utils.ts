import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDate = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
  return new Date(date.getTime() - offsetMs);
};

export const undoConversion = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
  return new Date(date.getTime() + offsetMs);
};

export function getLocalISOString(date = new Date()) {
  return getDate(date).toISOString().split('T')[0].trim(); //only get the month-day-year
}

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

export const convertTo24HourSleepEntry = (timeStr: string) => {
  const [time, period] = timeStr.split(' ');
  const [hoursStr, minutes] = time.split(':').map(Number);

  let hours = hoursStr;

  if (period === 'PM' && hours < 12) hours += 12;
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

export const getBarColour = (duration: number): string => {
  if (duration < 6) {
    return '#d9d9d9';
  } else if (duration >= 6 && duration <= 8) {
    return '#83e3c6';
  } else {
    return '#2ebb61';
  }
};

export const getTimeAMPM = (time: string) => {
  const [hour, minute] = time.split(':');
  const isPM = parseInt(hour) >= 12;
  const formattedHour = parseInt(hour) % 12 || 12;
  return `${formattedHour}:${minute} ${isPM ? 'PM' : 'AM'}`;
};

export function getGreetingText(): string {
  const currentTime = getDate().getHours();
  let greetingText = '';

  if (currentTime < 12) {
    greetingText = 'Good Morning';
  } else if (currentTime < 18) {
    greetingText = 'Good Afternoon';
  } else {
    greetingText = 'Good Evening';
  }

  return greetingText;
}

export function getTimeElapsed(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 1000);
}

export const getTimeDifference = (start: string, end: string): number => {
  const startTime = convertTo24Hour(start);
  const endTime = convertTo24Hour(end);

  let duration = endTime - startTime;
  if (duration < 0) duration += 24; // Handle overnight durations

  return duration;
};

export const getAverageTimeElapsed = (times: number[]): number => {
  if (times.length === 0) return 0;

  const total = times.reduce((sum, time) => sum + time, 0);
  return total / times.length;
};
