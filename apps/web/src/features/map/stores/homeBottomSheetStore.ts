import { create } from 'zustand';

import type { BottomSheetSnapPoint } from '@/shared/ui/bottom-sheet';

// NOTE: 클릭할 때마다 이 순서대로 순환한다. 마지막(hidden) 다음 클릭은 다시 처음(medium)으로 돌아간다.
const HOME_BOTTOM_SHEET_SNAP_SEQUENCE: readonly BottomSheetSnapPoint[] = [
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
  full: 1,
  hidden: 3,
};

export type HomeBottomSheetContent =
  | { type: 'home' }
  | { type: 'recommendation' }
  | { type: 'selectedPlace'; stickerId: string }
  | { type: 'likedRecommendation'; recommendationId: string };

type HomeBottomSheetStore = {
  activeSheet: HomeBottomSheetContent;
  topActionBottomPx: number;
  visibleHeightPx: number;
  stepIndex: number;
  advance: () => void;
  showHome: () => void;
  showLikedRecommendation: (recommendationId: string) => void;
  showRecommendation: () => void;
  showSelectedPlace: (stickerId: string) => void;
  setTopActionBottom: (bottomPx: number) => void;
  setVisibleHeight: (heightPx: number) => void;
  setSnapPoint: (snapPoint: BottomSheetSnapPoint) => void;
};

/**
 * 홈 화면에 표시할 바텀시트 하나와 기본 홈 시트의 높이 단계를 관리합니다.
 *
 * `activeSheet`를 판별 가능한 유니온으로 제한해 홈·추천·선택 장소·좋아요 장소 중 두 종류가
 * 동시에 열릴 수 없도록 합니다. `features/map` 안에서만 사용하며, 하단 탭바 표시 여부는
 * `app/layouts/AppMainLayout`이 이 상태를 구독해 결정합니다.
 *
 * `topActionBottomPx`는 최대 시트의 상단 경계를 계산하고, `visibleHeightPx`는 현재 위치 버튼을
 * 실제 시트 높이에 맞추는 레이아웃 측정값입니다. 두 값은 서버 상태가 아니므로 이 feature
 * 전용 스토어 밖으로 노출하지 않습니다.
 */
export const useHomeBottomSheetStore = create<HomeBottomSheetStore>((set) => ({
  activeSheet: { type: 'home' },
  topActionBottomPx: 0,
  visibleHeightPx: 0,
  stepIndex: 0,
  advance: () =>
    set((state) => ({
      stepIndex: (state.stepIndex + 1) % HOME_BOTTOM_SHEET_SNAP_SEQUENCE.length,
    })),
  showHome: () => set({ activeSheet: { type: 'home' } }),
  showLikedRecommendation: (recommendationId) =>
    set({ activeSheet: { type: 'likedRecommendation', recommendationId } }),
  showRecommendation: () => set({ activeSheet: { type: 'recommendation' } }),
  showSelectedPlace: (stickerId) => set({ activeSheet: { type: 'selectedPlace', stickerId } }),
  setTopActionBottom: (bottomPx) =>
    set((state) =>
      state.topActionBottomPx === bottomPx ? state : { topActionBottomPx: bottomPx }
    ),
  setVisibleHeight: (heightPx) =>
    set((state) => (state.visibleHeightPx === heightPx ? state : { visibleHeightPx: heightPx })),
  // NOTE: 드래그로 직접 높이를 바꿨을 때 호출한다. 그 이후 홈 버튼 클릭이 드래그로 도착한
  // 위치를 기준으로 이어지도록 stepIndex를 맞춰준다.
  setSnapPoint: (snapPoint) => set({ stepIndex: SNAP_POINT_TO_STEP_INDEX[snapPoint] }),
}));

/** `stepIndex`를 `HOME_BOTTOM_SHEET_SNAP_SEQUENCE` 길이로 순환시켜 해당하는 높이 단계를 반환합니다. */
export const getHomeBottomSheetSnapPoint = (stepIndex: number): BottomSheetSnapPoint =>
  HOME_BOTTOM_SHEET_SNAP_SEQUENCE[stepIndex % HOME_BOTTOM_SHEET_SNAP_SEQUENCE.length]!;
