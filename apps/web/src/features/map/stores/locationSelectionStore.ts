import { create } from 'zustand';

import type { MapPosition } from '../types';

type LocationSelectionStore = {
  confirmedPosition: MapPosition | null;
  selectedPosition: MapPosition | null;
  confirmSelectedPosition: () => void;
  setSelectedPosition: (position: MapPosition) => void;
  clearSelectedPosition: () => void;
  resetSelection: () => void;
};

/** 위치 선택 화면에서 지도 탭으로 고른 좌표를 보관합니다. */
export const useLocationSelectionStore = create<LocationSelectionStore>((set) => ({
  confirmedPosition: null,
  selectedPosition: null,
  confirmSelectedPosition: () =>
    set((state) =>
      state.selectedPosition ? { confirmedPosition: state.selectedPosition } : state
    ),
  setSelectedPosition: (selectedPosition) => set({ selectedPosition }),
  clearSelectedPosition: () => set({ selectedPosition: null }),
  resetSelection: () => set({ confirmedPosition: null, selectedPosition: null }),
}));
