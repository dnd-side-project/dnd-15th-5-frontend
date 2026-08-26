import type { MapSticker } from '@/features/map/types';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

// 약 10m 안의 같은 이름 장소를 소비 기록 생성 직후 다시 조회한 마커로 판단합니다.
const COORDINATE_EPSILON = 1e-4;

/** 방금 생성한 소비 기록의 장소 정보와 일치하는 방문 장소 스티커를 찾습니다. */
export const findCreatedConsumptionSticker = (
  stickers: readonly MapSticker[],
  createdPlace: CreatedConsumptionPlace
): MapSticker | undefined =>
  stickers.find(
    (sticker) =>
      sticker.place.name.trim() === createdPlace.placeName.trim() &&
      Math.abs(sticker.position.lat - createdPlace.latitude) <= COORDINATE_EPSILON &&
      Math.abs(sticker.position.lng - createdPlace.longitude) <= COORDINATE_EPSILON
  );
