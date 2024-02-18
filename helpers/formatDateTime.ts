export default function formatDateTime(date: any): string {
  const year: number = date.getFullYear();
  const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
  const day: string = date.getDate().toString().padStart(2, '0');
  const hour: string = date.getHours().toString().padStart(2, '0');
  const minute: string = date.getMinutes().toString().padStart(2, '0');
  const second: string = date.getSeconds().toString().padStart(2, '0');
  const formattedDateTime: string = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  return formattedDateTime;
}



// Example usage:
// const now: Date = new Date();
// const formattedDateTime: string = formatDateTime(now);
// console.log(formattedDateTime); // Example output: "2023-04-22 15:30:45"
