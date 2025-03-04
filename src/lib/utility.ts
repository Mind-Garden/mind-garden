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
