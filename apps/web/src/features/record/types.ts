export type ShopSearchLocationState = {
  /**
   * 가게 미선택 상태의 수기 입력 화면에서 검색으로 교체 이동(`replace`)했을 때만 `true`로
   * 전달합니다. 이 경우 브라우저 히스토리에 돌아갈 곳이 없어, 뒤로 가기를 기록 방법 선택
   * 화면으로 명시적으로 보내야 합니다. 그 외 경로(방법 선택 → 검색, 가게 변경 → 검색)는
   * 전부 일반 이동이라 `navigate(-1)`이 항상 올바른 위치로 돌아갑니다.
   */
  replacedManualRecord?: boolean;
};
