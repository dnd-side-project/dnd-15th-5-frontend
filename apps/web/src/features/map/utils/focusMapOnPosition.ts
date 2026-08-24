import type { MapPosition } from '@/features/map/types';
import { BOTTOM_SHEET_HEIGHT_RATIO } from '@/shared/ui/bottom-sheet';

const MARKER_VERTICAL_OFFSET_DIVISOR = 2.4;

/** 핀이 바텀시트 위로 남는 지도 영역의 중앙에 오도록 적용할 세로 오프셋입니다. */
export const getFocusedMarkerVerticalOffset = () =>
  Math.round(
    window.innerHeight * (BOTTOM_SHEET_HEIGHT_RATIO.medium / MARKER_VERTICAL_OFFSET_DIVISOR)
  );

/** 좌표를 카메라에 맞춘 뒤 바텀시트 높이에 비례해 중심을 아래로 옮겨 핀을 위에 배치합니다. */
export const focusMapOnPosition = (map: google.maps.Map, position: MapPosition, zoom?: number) => {
  map.moveCamera({ center: position, ...(zoom === undefined ? {} : { zoom }) });
  map.panBy(0, getFocusedMarkerVerticalOffset());
};
