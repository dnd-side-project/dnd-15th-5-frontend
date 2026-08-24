import { getRelativeBarHeightPercentage } from './reportChart';

describe('reportChart', () => {
  it('소비 금액을 최댓값 기준의 막대 높이로 변환한다', () => {
    expect(getRelativeBarHeightPercentage(50_000, 100_000)).toBe(50);
    expect(getRelativeBarHeightPercentage(1_000, 100_000)).toBe(12);
    expect(getRelativeBarHeightPercentage(0, 100_000)).toBe(0);
  });
});
