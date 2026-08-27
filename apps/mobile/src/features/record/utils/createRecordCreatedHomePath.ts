import { CREATED_CONSUMPTION_QUERY_KEYS } from '@chapchap/shared/record';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

/**
 * 방금 등록한 소비 기록의 장소 정보를 지도 홈 WebView 이동 경로에 실어 보낸다.
 *
 * 네이티브에서 웹으로의 이동은 `window.location.replace`로 문서 전체를 새로 로드하므로
 * JS 상태를 그대로 넘길 수 없다. 쿼리 문자열로 인코딩해 홈 화면이 도착 직후 지도 포커스와
 * 완료 안내에 사용할 수 있게 한다.
 */
export const createRecordCreatedHomePath = ({
  placeName,
  latitude,
  longitude,
}: CreatedConsumptionPlace) => {
  const params = new URLSearchParams({
    [CREATED_CONSUMPTION_QUERY_KEYS.placeName]: placeName,
    [CREATED_CONSUMPTION_QUERY_KEYS.latitude]: String(latitude),
    [CREATED_CONSUMPTION_QUERY_KEYS.longitude]: String(longitude),
  });

  return `/home?${params.toString()}`;
};
