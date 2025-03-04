import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDate = () => {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
  return new Date(date.getTime() - offsetMs);
};

export const undoConversion = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
  return new Date(date.getTime() + offsetMs);
};

export function getLocalISOString() {
  return getDate().toISOString().split('T')[0]; //only get the month-day-year
}

export function getGreetingText(): string {
  const currentTime = new Date().getHours();
  let greetingText = "";

  if (currentTime < 12) {
    greetingText = "Good Morning";
  } else if (currentTime < 18) {
    greetingText = "Good Afternoon";
  } else {
    greetingText = "Good Evening";
  }

  return greetingText;
}