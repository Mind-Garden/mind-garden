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
