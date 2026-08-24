/** 공통 바텀시트가 지원하는 제어 가능한 높이 단계입니다. */
export type BottomSheetSnapPoint = 'full' | 'large' | 'medium' | 'hidden';

/** 드래그 종료 시 이동할 수 있는 하나 이상의 높이 단계입니다. */
export type BottomSheetSnapPoints = readonly [BottomSheetSnapPoint, ...BottomSheetSnapPoint[]];
