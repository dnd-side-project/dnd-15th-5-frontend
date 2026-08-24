const PERCENTAGE_TOTAL = 100;
const MINIMUM_VISIBLE_BAR_HEIGHT_PERCENTAGE = 12;

/** 비율 목록을 합계 100인 정수 백분율 목록으로 변환합니다. */
export const normalizePercentages = (values: readonly number[]) => {
  const safeValues = values.map((value) => Math.max(0, value));
  const total = safeValues.reduce((sum, value) => sum + value, 0);

  if (total === 0) return safeValues.map(() => 0);

  const scaledValues = safeValues.map((value) => (value / total) * PERCENTAGE_TOTAL);
  const normalizedValues = scaledValues.map(Math.floor);
  const remainingPercentage =
    PERCENTAGE_TOTAL - normalizedValues.reduce((sum, value) => sum + value, 0);
  const fractionalValueIndexes = scaledValues
    .map((value, index) => ({ fraction: value - Math.floor(value), index }))
    .sort((a, b) => b.fraction - a.fraction);

  fractionalValueIndexes.slice(0, remainingPercentage).forEach(({ index }) => {
    normalizedValues[index] += 1;
  });

  return normalizedValues;
};

/** 소비 금액을 최댓값 기준의 막대 높이 백분율로 변환합니다. */
export const getRelativeBarHeightPercentage = (amount: number, maximumAmount: number) => {
  if (amount <= 0 || maximumAmount <= 0) return 0;

  const relativeHeight = (amount / maximumAmount) * PERCENTAGE_TOTAL;
  return Math.max(relativeHeight, MINIMUM_VISIBLE_BAR_HEIGHT_PERCENTAGE);
};

/** 소비 금액을 한국어 원화 문자열로 표시합니다. */
export const formatWon = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;
