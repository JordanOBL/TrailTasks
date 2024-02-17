
type totalMiles = string | number;
interface Rank {
  level: string;
  group: string;
  range: number[];
  title: string;
}
function getUserRank(ranks: Rank[], totalMiles: totalMiles): Rank | undefined {
  if(typeof totalMiles != 'number') totalMiles = Number(totalMiles);
  let lo: number = 0;
  let end: number = ranks.length - 1;
  let mid: number = Math.floor(lo + end / 2);

  while (lo <= end) {
    if (totalMiles >= ranks[mid].range[0] && totalMiles <= ranks[mid].range[1])
      return ranks[mid];
    else if (ranks[mid].range[0] > totalMiles) {
      end = mid - 1;
      mid = Math.floor((lo + end) / 2);
    } else if (ranks[mid].range[1] < totalMiles) {
      lo = mid + 1;
      mid = Math.floor((lo + end) / 2);
    }
  }
  return undefined;
}

export default getUserRank