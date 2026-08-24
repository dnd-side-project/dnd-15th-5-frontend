import { useMap } from '@vis.gl/react-google-maps';

import { SELECTED_PLACE_MAP_ZOOM } from '../../constants';
import { MOCK_MAP_STICKERS } from '../../mockData';
import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';
import { focusMapOnPosition } from '../../utils/focusMapOnPosition';

import MapSticker from './MapSticker';

import type { MapSticker as MapStickerData } from '../../types';

// TODO: 방문 장소 조회 API 훅이 생성되면 `MOCK_MAP_STICKERS`를 실제 응답 변환 결과로 교체한다.
/** 지도 위 스티커 전체를 렌더링한다. 현재는 목업 데이터를 그대로 표시한다. */
export default function MapStickers() {
  const map = useMap();
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showSelectedPlace = useHomeBottomSheetStore((state) => state.showSelectedPlace);
  const selectedCategory = useMapCategoryFilterStore((state) => state.selectedCategory);
  const selectedStickerId = activeSheet.type === 'selectedPlace' ? activeSheet.stickerId : null;
  const visibleStickers = selectedCategory
    ? MOCK_MAP_STICKERS.filter(({ place }) => place.category === selectedCategory)
    : MOCK_MAP_STICKERS;

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
