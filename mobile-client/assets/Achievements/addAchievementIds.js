import achievements from './masterAchievementList.js';

function achievementsWithIds(achievementsArray) {
  const updated = [];
  for (let i = 1; i < achievementsArray.length; i++) {
    updated.push({id: `${i}`, ...achievementsArray[i]});
  }
  return updated
}

achievementsWithIds(achievements)

export default achievementsWithIds
