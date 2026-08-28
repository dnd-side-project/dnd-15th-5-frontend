import { MAX_RECORD_AMOUNT } from './constants';

/** 입력값에서 숫자 이외의 문자를 제거하고 불필요한 앞자리 0을 정리한다. */
export const sanitizeAmount = (value: string) => value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

/** 정제된 금액 문자열을 정밀도 손실 없이 세 자리 단위로 표시한다. */
export const formatAmount = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** 소비 기록에 저장할 수 있는 1원 이상 `MAX_RECORD_AMOUNT` 이하의 안전한 정수 금액인지 확인한다. */
export const isValidRecordAmount = (value: string) => {
  const amount = Number(sanitizeAmount(value));

  return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_RECORD_AMOUNT;
};
