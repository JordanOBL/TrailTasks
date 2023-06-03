// export function formatDateTime(date: Date): string {
//   const year: number = date.getFullYear();
//   const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
//   const day: string = date.getDate().toString().padStart(2, '0');
//   const hour: string = date.getHours().toString().padStart(2, '0');
//   const minute: string = date.getMinutes().toString().padStart(2, '0');
//   const second: string = date.getSeconds().toString().padStart(2, '0');
//   const formattedDateTime: string = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
//   return formattedDateTime;
// }
function getTimeDifference(dateString1: string, dateString2: string): string {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  const diffInSecs = Math.floor(diffInMs / 1000);

  const hours = Math.floor(diffInSecs / 3600);
  const minutes = Math.floor((diffInSecs % 3600) / 60);
  const seconds = diffInSecs % 60;

  const diffString = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return diffString;
}
// const secondDate = formatDateTime(new Date());
// console.log(new Date().getTime())
// console.log(getTimeDifference(secondDate, '2023-05-26 15:36:50' ));

export default getTimeDifference;
