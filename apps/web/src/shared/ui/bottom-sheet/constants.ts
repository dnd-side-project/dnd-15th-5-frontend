/**
 * 스냅 포인트별 뷰포트 높이 비율입니다.
 * 지도 포커스 오프셋처럼 바텀시트 높이와 동기화해야 하는 코드에서도 같은 값을 사용합니다.
 */
export const BOTTOM_SHEET_HEIGHT_RATIO: Record<'full' | 'large' | 'medium', number> = {
  full: 0.92,
  large: 0.7,
  medium: 0.45,
};

/**
 * 바텀시트 전환 시간입니다.
 * 닫힘 이후 콜백을 실행하는 훅과 실제 CSS transition이 같은 시점을 사용하도록 공유합니다.
 */
export const BOTTOM_SHEET_TRANSITION_MS = 300;
