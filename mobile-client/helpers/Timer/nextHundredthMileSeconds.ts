function NextHundredthMileSeconds(pace: number): number {
  return Number(((0.01 / pace) * 3600).toFixed());
}
export default NextHundredthMileSeconds;
