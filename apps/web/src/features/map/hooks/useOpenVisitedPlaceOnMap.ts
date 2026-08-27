import { useCallback } from 'react';

import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useMapFocusStore } from '@/features/map/stores/mapFocusStore';

type MapFocusMode = 'preserveZoom' | 'selectedPlaceZoom';

/** 방문 장소 마커를 최신 상태로 확인한 뒤 지도 포커스와 상세 바텀시트를 함께 엽니다. */
export const useOpenVisitedPlaceOnMap = () => {
  const { refetchStickers, stickers } = useVisitedPlaceStickersQuery();
  const showSelectedPlace = useHomeBottomSheetStore((state) => state.showSelectedPlace);
  const setFocusPosition = useMapFocusStore((state) => state.setFocusPosition);
  const setSelectedPlaceFocus = useMapFocusStore((state) => state.setSelectedPlaceFocus);

  const openVisitedPlaceOnMap = useCallback(
    async (placeId: string, focusMode: MapFocusMode = 'selectedPlaceZoom') => {
      let sticker = stickers.find(({ id }) => id === placeId);

      if (!sticker) {
        try {
          sticker = (await refetchStickers()).find(({ id }) => id === placeId);
        } catch {
          // NOTE: 상세 시트는 장소 ID만으로 열 수 있으므로 마커 재조회 실패 시 지도 이동만 생략합니다.
        }
      }

      if (sticker) {
        const focus = focusMode === 'selectedPlaceZoom' ? setSelectedPlaceFocus : setFocusPosition;
        focus(sticker.position);
      }

      showSelectedPlace(placeId);
    },
    [refetchStickers, setFocusPosition, setSelectedPlaceFocus, showSelectedPlace, stickers]
  );

  return { openVisitedPlaceOnMap };
};
