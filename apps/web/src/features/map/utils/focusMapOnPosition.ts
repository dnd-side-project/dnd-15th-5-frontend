import type { MapPosition } from '@/features/map/types';
import { BOTTOM_SHEET_HEIGHT_RATIO } from '@/shared/ui/bottom-sheet';

const MARKER_VERTICAL_OFFSET_DIVISOR = 2.4;

/**
 * 핀이 바텀시트 위로 남는 지도 영역의 중앙에 오도록 적용할 세로 오프셋입니다.
 *
 * `sheetHeightPx`를 넘기면 그 값을 기준으로 계산하고, 생략하면 `medium` 스냅 포인트 비율로
 * 추정한다. 시트가 `fitContent`로 콘텐츠 높이에 맞춰지는 경우(예: 가게 추천 캐러셀) 실제 높이가
 * `medium` 비율보다 커서 추정치만으로는 핀이 시트에 가려질 수 있으므로, 가능하면 호출 측이
 * 바텀시트의 실측 높이(`visibleHeightPx`)를 전달해야 한다.
 */
export const getFocusedMarkerVerticalOffset = (sheetHeightPx?: number) =>
  Math.round(
    (sheetHeightPx ?? window.innerHeight * BOTTOM_SHEET_HEIGHT_RATIO.medium) /
      MARKER_VERTICAL_OFFSET_DIVISOR
  );

/**
 * 지도의 현재 투영(projection)으로 좌표를 세로 오프셋만큼 미리 이동시킨 중심 좌표를 계산한다.
 * 지도가 막 마운트돼 투영이 아직 준비되지 않았으면(또는 테스트 등에서 투영을 제공하지 않으면)
 * `null`을 반환해 호출 측이 idle 이후 보정하는 방식으로 대체하도록 한다.
 */
const getOffsetCenter = (
  map: google.maps.Map,
  position: MapPosition,
  zoom: number,
  sheetHeightPx?: number
) => {
  const projection = map.getProjection?.();
  if (!projection) return null;

  const worldPoint = projection.fromLatLngToPoint(
    new google.maps.LatLng(position.lat, position.lng)
  );
  if (!worldPoint) return null;

  const scale = 2 ** zoom;
  const offsetWorldPoint = new google.maps.Point(
    worldPoint.x,
    worldPoint.y + getFocusedMarkerVerticalOffset(sheetHeightPx) / scale
  );

  return projection.fromPointToLatLng(offsetWorldPoint);
};

/**
 * 좌표를 카메라에 맞춘 뒤 바텀시트 높이에 비례해 중심을 아래로 옮겨 핀을 위에 배치합니다.
 *
 * 지도의 투영이 이미 준비된 상태(지도가 이미 화면에 떠 있는 일반적인 경우)라면 오프셋을 미리
 * 계산해 `moveCamera` 한 번으로 이동시킨다. moveCamera 직후 별도의 panBy로 다시 보정하면
 * "중앙으로 이동했다가 위로 튕겨 올라오는" 것처럼 두 단계로 보이므로 이를 피하기 위해서다.
 * 지도가 막 마운트돼 투영이 아직 없으면 우선 좌표로 이동한 뒤, 지도가 안정된(idle) 다음
 * panBy로 오프셋을 적용한다.
 *
 * 반환하는 함수를 호출하면 아직 발생하지 않은 idle 리스너를 취소합니다. React StrictMode 등으로
 * 같은 effect가 중복 실행되면 idle 리스너가 두 번 등록되어 오프셋이 두 번 적용될 수 있으므로,
 * 호출 측 effect의 cleanup에서 반드시 이 함수를 반환해 정리해야 한다.
 */
export const focusMapOnPosition = (
  map: google.maps.Map,
  position: MapPosition,
  zoom?: number,
  sheetHeightPx?: number
) => {
  const targetZoom = zoom ?? map.getZoom?.();
  const offsetCenter =
    targetZoom !== undefined ? getOffsetCenter(map, position, targetZoom, sheetHeightPx) : null;

  if (offsetCenter) {
    map.moveCamera({ center: offsetCenter, ...(zoom === undefined ? {} : { zoom }) });
    return () => {};
  }

  map.moveCamera({ center: position, ...(zoom === undefined ? {} : { zoom }) });
  // NOTE: 지도가 막 마운트된 직후에는 투영이 없어 위 계산이 불가능하므로, moveCamera가 실제로
  // 반영되어 지도가 안정된(idle) 다음 panBy로 오프셋을 적용한다.
  const idleListener = google.maps.event.addListenerOnce(map, 'idle', () => {
    map.panBy(0, getFocusedMarkerVerticalOffset(sheetHeightPx));
  });
  return () => google.maps.event.removeListener(idleListener);
};
