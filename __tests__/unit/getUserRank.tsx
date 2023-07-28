import getUserRank from "../../helpers/Ranks/getUserRank";
import Ranks from "../../helpers/Ranks/ranksData";

test('get userRanks FUnction, gets level 91 from ranks', () => {
  expect(getUserRank(Ranks, 392.6)).toEqual({
    level: '91',
    group: 'Legendary',
    image: require('../../assets/RankBadges/legendary.png'),
    range: [392.5, 401.49],
    title: 'Grand Trailblazer',
  });
});