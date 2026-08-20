import { isValidRecordAmount } from './amount';

/** 기록 제출 전에 확인할 최소 필수 입력. */
export type RecordRequiredFields = {
  hasShop: boolean;
  amount: string;
};

/** 필수 입력별 유효 여부와 전체 제출 가능 상태. */
export type RecordRequiredFieldValidation = {
  isShopValid: boolean;
  isAmountValid: boolean;
  canSubmit: boolean;
};

/** 웹 수기 입력과 앱 영수증 입력에서 공통으로 사용하는 필수 항목 검증. */
export const validateRecordRequiredFields = ({
  hasShop,
  amount,
}: RecordRequiredFields): RecordRequiredFieldValidation => {
  const isAmountValid = isValidRecordAmount(amount);

  return {
    isShopValid: hasShop,
    isAmountValid,
    canSubmit: hasShop && isAmountValid,
  };
};
