import { isConsumptionRelatedQuery } from './isConsumptionRelatedQuery';

describe('isConsumptionRelatedQuery', () => {
  it.each([
    ['/v1/consumptions', true],
    ['/v1/consumptions/places/rank', true],
    ['/v1/reports/current', true],
    ['/v1/reports/monthly', false],
    ['/v1/reports/share/token', false],
    ['/v1/accounts/me', false],
    [undefined, false],
  ])('%p 경로의 소비 관련 여부를 판별한다', (key, expected) => {
    expect(isConsumptionRelatedQuery({ queryKey: [key] })).toBe(expected);
  });
});
