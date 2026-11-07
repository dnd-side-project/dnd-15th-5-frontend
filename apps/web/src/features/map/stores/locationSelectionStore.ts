import { create } from 'zustand';

import type { MapPosition } from '../types';

type DraftSelection =
  | { status: 'loading'; position: MapPosition }
  | { status: 'ready'; position: MapPosition; address: string };

type LocationSelectionStore = {
  /** 추천 조회의 기준 좌표입니다. 추천 가게로 지도가 이동해도 이 값은 유지됩니다. */
  confirmedPosition: MapPosition | null;
  /** 지도 이동이 끝났을 때 중앙 핀이 가리키는 좌표와 주소 조회 상태입니다. */
  draftSelection: DraftSelection | null;
  /** 검색 결과 또는 핀 좌표를 추천 기준으로 확정하고 선택 중인 핀을 비웁니다. */
  setConfirmedPosition: (position: MapPosition) => void;
  startDraftSelection: (position: MapPosition) => void;
  resolveDraftAddress: (position: MapPosition, address: string) => void;
  clearDraftSelection: () => void;
  resetSelection: () => void;
};

/** 지도에서 선택 중인 위치와 추천 조회에 확정한 위치를 관리합니다. */
export const useLocationSelectionStore = create<LocationSelectionStore>((set) => ({
  confirmedPosition: null,
  draftSelection: null,
  setConfirmedPosition: (confirmedPosition) => set({ confirmedPosition, draftSelection: null }),
  startDraftSelection: (position) => set({ draftSelection: { status: 'loading', position } }),
  resolveDraftAddress: (position, address) =>
    set((state) => {
      const draft = state.draftSelection;
      // 같은 좌표로 돌아와도 이전 주소 응답을 적용하지 않도록 객체 참조를 비교합니다.
      if (draft?.status !== 'loading' || draft.position !== position) return state;
      return { draftSelection: { status: 'ready', position, address } };
    }),
  clearDraftSelection: () =>
    set((state) => (state.draftSelection ? { draftSelection: null } : state)),
  resetSelection: () => set({ confirmedPosition: null, draftSelection: null }),
}));
