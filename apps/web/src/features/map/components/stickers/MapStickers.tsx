import { MOCK_MAP_STICKERS } from '../../mockData';

import MapSticker from './MapSticker';

// TODO: 백엔드 API(`useVisitedPlacesQuery`, features/map/api) 연동 시 목업 대신 실제 쿼리로 교체한다.
/** 지도 위 스티커 전체를 렌더링한다. 현재는 목업 데이터를 그대로 표시한다. */
export default function MapStickers() {
  return (
    <>
      {MOCK_MAP_STICKERS.map((sticker) => (
        <MapSticker key={sticker.id} sticker={sticker} />
      ))}
    </>
  );
}
