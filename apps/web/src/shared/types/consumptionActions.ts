/** 페이지에서 기록 목록에 연결하는 수정·삭제 동작입니다. */
export type ConsumptionActions = {
  onEditRecord?: (consumptionId: number, purchaseDate?: string) => void;
  onDeleteRecord?: (consumptionId: number) => void;
};
