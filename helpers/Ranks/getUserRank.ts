import  Ranks from './ranksData'; 
type totalMiles = string | number;
interface Rank {
  level: string;
  group: string;
  range: number[];
  title: string;
}
function getUserRank(totalMiles: totalMiles): Rank | undefined {
  if(typeof totalMiles != 'number') totalMiles = Number(totalMiles);
  let lo: number = 0;
  let end: number = Ranks.length - 1;
  let mid: number = Math.floor(lo + end / 2);

  while (lo <= end) {
    if (totalMiles >= Ranks[mid].range[0] && totalMiles <= Ranks[mid].range[1])
      return Ranks[mid];
    else if (Ranks[mid].range[0] > totalMiles) {
      end = mid - 1;
      mid = Math.floor((lo + end) / 2);
    } else if (Ranks[mid].range[1] < totalMiles) {
      lo = mid + 1;
      mid = Math.floor((lo + end) / 2);
    }
  }
  console.debug('In get user rank, returning undefined')
  return undefined;
}

export default getUserRank
