import { isConsumptionRelatedQuery } from './isConsumptionRelatedQuery';

describe('isConsumptionRelatedQuery', () => {
  it.each([
    ['/v1/consumptions', true],
    ['/v1/consumptions/places/rank', true],
    ['/v1/consumptions/visited-places', true],
    ['/v1/consumptions/places/101', true],
    ['/v1/consumptions/places/101/visits', true],
    ['/v1/recommendations/places/101', false],
    ['/v1/recommendations/nearby-places', false],
    ['/v1/reports/current', true],
    ['/v1/reports/monthly', false],
    ['/v1/reports/share/token', false],
    ['/v1/accounts/me', false],
    ['/v1/places/visited/search', true],
    ['/v1/places/likes', true],
    ['/v1/recommendations/nearby-places', true],
    [undefined, false],
  ])('%p 경로의 소비 관련 여부를 판별한다', (key, expected) => {
    expect(isConsumptionRelatedQuery({ queryKey: [key] })).toBe(expected);
  });
});
