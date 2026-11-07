/** 서버 ID로 사용할 수 있는 양의 안전한 정수인지 확인합니다. */
export const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
