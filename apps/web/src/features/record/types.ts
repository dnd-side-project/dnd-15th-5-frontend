import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';

/** 가게 변경 화면을 오갈 때 보존할 수기 기록 초안입니다. */
export type ManualRecordDraft = {
  visitDateTime: VisitDateTimeValue;
  amount: string;
  category: RecordCategory;
};

export type ShopSearchLocationState = {
  /** 기존 수기 기록에서 가게만 변경하러 진입했는지 나타냅니다. */
  isChangingManualRecordShop?: boolean;
  /** 가게 변경 전 수기 기록 폼에서 선택한 방문 일시입니다. */
  manualRecordVisitDateTime?: VisitDateTimeValue;
  /** 가게 변경 전 수기 기록 폼에 입력해둔 금액입니다. */
  manualRecordAmount?: string;
  /** 가게 변경 전 수기 기록 폼에서 선택한 카테고리입니다. */
  manualRecordCategory?: RecordCategory;
  /**
   * 가게 미선택 상태의 수기 입력 화면에서 검색으로 교체 이동(`replace`)했을 때만 `true`로
   * 전달합니다. 이 경우 브라우저 히스토리에 돌아갈 곳이 없어, 뒤로 가기를 기록 방법 선택
   * 화면으로 명시적으로 보내야 합니다. 그 외 경로(방법 선택 → 검색, 가게 변경 → 검색)는
   * 전부 일반 이동이라 `navigate(-1)`이 항상 올바른 위치로 돌아갑니다.
   */
  replacedManualRecord?: boolean;
};
