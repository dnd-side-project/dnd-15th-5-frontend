import { getRelativeBarHeightPercentage, normalizePercentages } from './reportChart';

describe('reportChart', () => {
  it('입력 비율의 합과 관계없이 합계 100인 정수 백분율로 정규화한다', () => {
    const percentages = normalizePercentages([60, 30, 20]);

    expect(percentages).toEqual([55, 27, 18]);
    expect(percentages.reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it('음수 비율은 0으로 처리한다', () => {
    expect(normalizePercentages([70, -10, 30])).toEqual([70, 0, 30]);
  });

  it('소비 금액을 최댓값 기준의 막대 높이로 변환한다', () => {
    expect(getRelativeBarHeightPercentage(50_000, 100_000)).toBe(50);
    expect(getRelativeBarHeightPercentage(1_000, 100_000)).toBe(12);
    expect(getRelativeBarHeightPercentage(0, 100_000)).toBe(0);
  });
});
