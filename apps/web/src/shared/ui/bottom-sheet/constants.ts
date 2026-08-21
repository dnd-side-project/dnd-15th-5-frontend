// NOTE: 뷰포트 높이 비율. 화면 크기가 달라져도 같은 비율을 유지한다.
// 다른 컴포넌트가 바텀시트 위에 자기 위치를 맞춰야 할 때(예: 지도 컨트롤 버튼)
// 이 비율을 그대로 가져다 쓸 수 있도록 export한다.
export const BOTTOM_SHEET_HEIGHT_RATIO: Record<'full' | 'large' | 'medium' | 'small', number> = {
  full: 0.92,
  large: 0.7,
  medium: 0.45,
  small: 0.4,
};
