import isToday from './isToday';

describe('isToday', () => {
  it('should return true if date is today', () => {
    const date = new Date();
    expect(isToday(date)).toBe(true);
  });

  it('should return false if date is not today', () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    expect(isToday(date)).toBe(false);
  });
});

