import { useMap } from '@vis.gl/react-google-maps';

import { SELECTED_PLACE_MAP_ZOOM } from '../../constants';
import { MOCK_MAP_STICKERS } from '../../mockData';
import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { focusMapOnPosition } from '../../utils/focusMapOnPosition';

import MapSticker from './MapSticker';

import type { MapSticker as MapStickerData } from '../../types';

// TODO: 백엔드 API(`useVisitedPlacesQuery`, features/map/api) 연동 시 목업 대신 실제 쿼리로 교체한다.
/** 지도 위 스티커 전체를 렌더링한다. 현재는 목업 데이터를 그대로 표시한다. */
export default function MapStickers() {
  const map = useMap();
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showSelectedPlace = useHomeBottomSheetStore((state) => state.showSelectedPlace);
  const selectedStickerId = activeSheet.type === 'selectedPlace' ? activeSheet.stickerId : null;

  const handleStickerSelect = (sticker: MapStickerData) => {
    showSelectedPlace(sticker.id);
    if (map) {
      focusMapOnPosition(map, sticker.position, SELECTED_PLACE_MAP_ZOOM);
    }
  };

  return (
    <>
      {MOCK_MAP_STICKERS.map((sticker) => (
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
