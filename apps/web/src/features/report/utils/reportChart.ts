const PERCENTAGE_TOTAL = 100;
const MINIMUM_VISIBLE_BAR_HEIGHT_PERCENTAGE = 12;

/** 소비 금액을 최댓값 기준의 막대 높이 백분율로 변환합니다. */
export const getRelativeBarHeightPercentage = (amount: number, maximumAmount: number) => {
  if (amount <= 0 || maximumAmount <= 0) return 0;

  const relativeHeight = (amount / maximumAmount) * PERCENTAGE_TOTAL;
  return Math.max(relativeHeight, MINIMUM_VISIBLE_BAR_HEIGHT_PERCENTAGE);
};

/** 소비 금액을 한국어 원화 문자열로 표시합니다. */
export const formatWon = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;
