// Today as "YYYY-MM-DD" in UTC (the same day-boundary the server uses)
export const getTodayString = () => new Date().toISOString().split("T")[0];

// Adds days to a "YYYY-MM-DD" string and returns a "YYYY-MM-DD" string
export const addDays = (dateString, days) => {
  const date = new Date(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
};