import { useMap } from '@vis.gl/react-google-maps';

import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { SELECTED_PLACE_MAP_ZOOM } from '@/features/map/constants';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '@/features/map/stores/mapCategoryFilterStore';
import type { MapSticker as MapStickerData } from '@/features/map/types';
import { focusMapOnPosition } from '@/features/map/utils/focusMapOnPosition';

import MapSticker from './MapSticker';

/** 소비 기록이 있는 방문 장소를 지도 스티커로 렌더링합니다. */
export default function MapStickers() {
  const map = useMap();
  const { stickers } = useVisitedPlaceStickersQuery();
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showSelectedPlace = useHomeBottomSheetStore((state) => state.showSelectedPlace);
  const selectedCategory = useMapCategoryFilterStore((state) => state.selectedCategory);
  const selectedStickerId = activeSheet.type === 'selectedPlace' ? activeSheet.stickerId : null;
  const visibleStickers = selectedCategory
    ? stickers.filter(({ place }) => place.category === selectedCategory)
    : stickers;

  const handleStickerSelect = (sticker: MapStickerData) => {
    showSelectedPlace(sticker.id);
    if (map) {
      focusMapOnPosition(map, sticker.position, SELECTED_PLACE_MAP_ZOOM);
    }
  };

  return (
    <>
      {visibleStickers.map((sticker) => (
        <MapSticker
          key={sticker.id}
          sticker={sticker}
          isSelected={sticker.id === selectedStickerId}
          onSelect={() => handleStickerSelect(sticker)}
        />
      ))}
    </>
  );
}
