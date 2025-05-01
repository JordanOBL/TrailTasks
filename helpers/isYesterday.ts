// Function to check if a date is yesterday
function isYesterday(date: Date | null) {
  if (!date) return false;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1); // Subtract 1 day from today's date
  const checkDate = new Date(date);

  // Check if the given date is equal to yesterday's date
  return (
    checkDate.getFullYear() === yesterday.getFullYear() &&
    checkDate.getMonth() === yesterday.getMonth() &&
    checkDate.getDate() === yesterday.getDate()
  );
}

export default isYesterday;
