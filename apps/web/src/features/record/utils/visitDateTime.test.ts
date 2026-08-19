import { getVisitPeriodForHour } from './visitDateTime';

describe('getVisitPeriodForHour', () => {
  it.each([
    [4, 'night'],
    [5, 'morning'],
    [10, 'morning'],
    [11, 'afternoon'],
    [16, 'afternoon'],
    [17, 'evening'],
    [20, 'evening'],
    [21, 'night'],
  ] as const)('%i시는 %s 시간대로 분류한다', (hour, expectedPeriod) => {
    expect(getVisitPeriodForHour(hour)).toBe(expectedPeriod);
  });
});
