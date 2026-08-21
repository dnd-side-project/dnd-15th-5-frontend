import { create } from 'zustand';

import type { BottomSheetSnapPoint } from '@/shared/ui/bottom-sheet';

// NOTE: 클릭할 때마다 이 순서대로 순환한다. 마지막(hidden) 다음 클릭은 다시 처음(medium)으로 돌아간다.
export const HOME_BOTTOM_SHEET_SNAP_SEQUENCE: readonly BottomSheetSnapPoint[] = [
  'medium',
  'full',
  'medium',
  'hidden',
];

// NOTE: 드래그로 직접 한 단계에 도착했을 때, 다음 클릭이 이어질 위치를 정하기 위한 매핑이다.
// 드래그로 도착한 medium은 "새로 시작하는 medium"으로 보고, 다음 클릭에 full로 가게 한다.
const SNAP_POINT_TO_STEP_INDEX: Record<BottomSheetSnapPoint, number> = {
  medium: 0,
  large: 0,
  small: 0,
  full: 1,
  hidden: 3,
};

type HomeBottomSheetStore = {
  stepIndex: number;
  advance: () => void;
  setSnapPoint: (snapPoint: BottomSheetSnapPoint) => void;
};

/**
 * 홈 화면 바텀시트의 높이 단계를 관리하는 전역 상태입니다.
 *
 * `features/map` 안에서만 사용합니다(바텀시트 자체와, 하단 탭바 "홈" 클릭을 이 상태에 연결하는
 * `app/layouts/AppMainLayout`). 하단 탭바(`shared/layout/BottomTabBar`)는 `shared`라서 이
 * feature 전용 상태를 직접 import할 수 없으므로 `onHomeClick` 콜백으로만 연결됩니다.
 */
export const useHomeBottomSheetStore = create<HomeBottomSheetStore>((set) => ({
  stepIndex: 0,
  advance: () => set((state) => ({ stepIndex: state.stepIndex + 1 })),
  // NOTE: 드래그로 직접 높이를 바꿨을 때 호출한다. 그 이후 홈 버튼 클릭이 드래그로 도착한
  // 위치를 기준으로 이어지도록 stepIndex를 맞춰준다.
  setSnapPoint: (snapPoint) => set({ stepIndex: SNAP_POINT_TO_STEP_INDEX[snapPoint] }),
}));

/** `stepIndex`를 `HOME_BOTTOM_SHEET_SNAP_SEQUENCE` 길이로 순환시켜 해당하는 높이 단계를 반환합니다. */
export const getHomeBottomSheetSnapPoint = (stepIndex: number): BottomSheetSnapPoint =>
  HOME_BOTTOM_SHEET_SNAP_SEQUENCE[stepIndex % HOME_BOTTOM_SHEET_SNAP_SEQUENCE.length]!;
