import { useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

import { useMapFocusStore } from '../../stores/mapFocusStore';
import { focusMapOnPosition } from '../../utils/focusMapOnPosition';

/** 검색 결과 선택 등으로 `useMapFocusStore`에 좌표가 들어오면 지도를 그 위치로 이동시킨다. */
export default function MapFocusController() {
  const map = useMap();
  const focusPosition = useMapFocusStore((state) => state.focusPosition);
  const focusZoom = useMapFocusStore((state) => state.focusZoom);
  const clearFocusPosition = useMapFocusStore((state) => state.clearFocusPosition);

  useEffect(() => {
    if (!map || !focusPosition) {
      return;
    }

    focusMapOnPosition(map, focusPosition, focusZoom);
    clearFocusPosition();
  }, [clearFocusPosition, focusPosition, focusZoom, map]);

  return null;
}
