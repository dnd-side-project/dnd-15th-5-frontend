import { create } from 'zustand';

type MapPlaceStampStore = {
  stampRequest: { placeId: string; sequence: number } | null;
  stampSequence: number;
  requestPlaceStamp: (placeId: string) => void;
  consumePlaceStamp: (sequence: number) => void;
};

/** 기록 등록 후 해당 장소의 핀에 한 번 전달할 스탬프 재생 요청을 관리합니다. */
export const useMapPlaceStampStore = create<MapPlaceStampStore>((set) => ({
  stampRequest: null,
  stampSequence: 0,
  requestPlaceStamp: (placeId) =>
    set((state) => {
      const sequence = state.stampSequence + 1;
      return { stampSequence: sequence, stampRequest: { placeId, sequence } };
    }),
  consumePlaceStamp: (sequence) =>
    set((state) => (state.stampRequest?.sequence === sequence ? { stampRequest: null } : state)),
}));
