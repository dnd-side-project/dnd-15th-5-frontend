// NOTE: 뷰포트 높이 비율. 화면 크기가 달라져도 같은 비율을 유지한다.
// 다른 컴포넌트가 바텀시트 위에 자기 위치를 맞춰야 할 때(예: 지도 컨트롤 버튼)
// 이 비율을 그대로 가져다 쓸 수 있도록 export한다.
export const BOTTOM_SHEET_HEIGHT_RATIO: Record<'full' | 'large' | 'medium', number> = {
  full: 0.92,
  large: 0.7,
  medium: 0.45,
};

// NOTE: 바텀시트를 감싸는 다른 컴포넌트(예: 배경 오버레이)가 닫힘 애니메이션이 끝나는
// 시점에 맞춰 콜백을 실행해야 할 때 이 값을 가져다 쓴다. BottomSheet 내부 transition
// duration과 반드시 같은 값을 유지해야 하므로 별도로 하드코딩하지 않는다.
export const BOTTOM_SHEET_TRANSITION_MS = 300;
