import { achievementManagerInstance } from './AchievementManager';

describe('AchievementManager total-mile achievements', () => {
  it('uses derived session mileage instead of cached user.totalMiles', async () => {
    const user = {
      id: 'user-1',
      totalMiles: '0.00',
      calculateTotalMiles: jest.fn(async () => 75),
      unlockAchievements: jest.fn(async (_userId, achievements) => achievements),
    };

    const achievements = [
      {
        id: 'achievement-75',
        achievement_name: '75 Mile Hiker',
        achievement_type: 'Total Miles',
        achievement_condition: '75',
        completed: false,
      },
    ];

    await expect(
      achievementManagerInstance.checkTotalMilesAchievements(user as any, achievements as any),
    ).resolves.toEqual([
      {
        achievementName: '75 Mile Hiker',
        achievementId: 'achievement-75',
      },
    ]);

    expect(user.calculateTotalMiles).toHaveBeenCalled();
    expect(user.unlockAchievements).toHaveBeenCalledWith('user-1', [
      {
        achievementName: '75 Mile Hiker',
        achievementId: 'achievement-75',
      },
    ]);
    expect(achievements[0].completed).toBe(true);
  });
});
