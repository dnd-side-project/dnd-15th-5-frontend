import { isConsumptionRelatedQuery } from './isConsumptionRelatedQuery';

describe('isConsumptionRelatedQuery', () => {
  it.each([
    ['/consumptions', true],
    ['/consumptions/places/rank', true],
    ['/reports/current', true],
    ['/reports/monthly', true],
    ['/accounts/me', false],
    [undefined, false],
  ])('%p 경로의 소비 관련 여부를 판별한다', (key, expected) => {
    expect(isConsumptionRelatedQuery({ queryKey: [key] })).toBe(expected);
  });
});
