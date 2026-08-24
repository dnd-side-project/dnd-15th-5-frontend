import { create } from 'zustand';

import { SELECTED_PLACE_MAP_ZOOM } from '../constants';

import type { MapPosition } from '../types';

type MapFocusStore = {
  focusPosition: MapPosition | null;
  focusZoom: number | undefined;
  setFocusPosition: (position: MapPosition) => void;
  setSelectedPlaceFocus: (position: MapPosition) => void;
  clearFocusPosition: () => void;
};

/**
 * 지도 밖(예: 장소 검색 결과 선택)에서 지도 중심을 특정 좌표로 옮기라고 요청할 때 쓴다.
 * 요청하는 쪽과 실제 지도(`MapFocusController`)가 서로 멀리 떨어진 컴포넌트라 zustand로 연결한다.
 */
export const useMapFocusStore = create<MapFocusStore>((set) => ({
  focusPosition: null,
  focusZoom: undefined,
  setFocusPosition: (position) => set({ focusPosition: position, focusZoom: undefined }),
  setSelectedPlaceFocus: (position) =>
    set({ focusPosition: position, focusZoom: SELECTED_PLACE_MAP_ZOOM }),
  clearFocusPosition: () => set({ focusPosition: null, focusZoom: undefined }),
}));
