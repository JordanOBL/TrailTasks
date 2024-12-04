// Function to check if a date is yesterday
function isYesterday(date: Date | null) {
  if (!date) return false;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1); // Subtract 1 day from today's date

  // Check if the given date is equal to yesterday's date
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

export default isYesterday;
