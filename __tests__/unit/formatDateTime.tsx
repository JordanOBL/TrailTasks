import { formatDateTime } from "../../helpers/formatDateTime";

test('formatDateTime Function should format new date to mm-dd-yyyy', () =>
{
  const newDate: Date = new Date('Thu Jul 27 2023 21:45:48 GMT-0400');
  expect(formatDateTime(newDate)).toEqual('2023-07-27 21:45:48');
});