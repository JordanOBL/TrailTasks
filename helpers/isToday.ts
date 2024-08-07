// Function to check if a date is today
function isToday(date: Date | null)
{
  console.debug('checking isToday with', { date })
console.debug({today: new Date()})
  if(!date) return false
  const today = new Date();

  // Check if the given date is equal to today's date
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default isToday