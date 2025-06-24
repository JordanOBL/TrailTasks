import isYesterday from './isYesterday';

describe('isYesterday', () => {
  it('should return true if date is yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isYesterday(yesterday)).toBe(true);
  });

  it('should return false if date is not yesterday', () => {
    const today = new Date();
    expect(isYesterday(today)).toBe(false);
  });
});
