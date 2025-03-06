import { clsx, type ClassValue } from 'clsx';
import { get } from 'http';
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
