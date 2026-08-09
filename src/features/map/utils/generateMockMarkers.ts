import { MAP_DEFAULT_CENTER, MARKER_SPREAD_DEGREE } from '../constants';

import type { MapMarker } from '../types';

/**
 * 지도 성능 확인용 목업 마커를 생성한다. 기본 중심 좌표 주변에 무작위로 흩뿌린다.
 *
 * TODO: 가게 목록 API 연동되면 목업 대신 실제 데이터로 교체
 */
export const generateMockMarkers = (count: number): MapMarker[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `mock-marker-${index}`,
    lat: MAP_DEFAULT_CENTER.lat + (Math.random() - 0.5) * MARKER_SPREAD_DEGREE,
    lng: MAP_DEFAULT_CENTER.lng + (Math.random() - 0.5) * MARKER_SPREAD_DEGREE,
  }));
