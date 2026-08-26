import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

import { useMapFocusStore } from '@/features/map/stores/mapFocusStore';
import type { MapPosition } from '@/features/map/types';
import { focusMapOnPosition } from '@/features/map/utils/focusMapOnPosition';

/** 검색 결과 선택 등으로 `useMapFocusStore`에 좌표가 들어오면 지도를 그 위치로 이동시킨다. */
export default function MapFocusController() {
  const map = useMap();
  const focusPosition = useMapFocusStore((state) => state.focusPosition);
  const focusZoom = useMapFocusStore((state) => state.focusZoom);
  const clearFocusPosition = useMapFocusStore((state) => state.clearFocusPosition);
  const appliedFocusPosition = useRef<MapPosition | null>(null);

  useEffect(() => {
    if (!map || !focusPosition || appliedFocusPosition.current === focusPosition) {
      return;
    }

    // NOTE: 이 effect 안에서 clearFocusPosition으로 스스로의 의존값을 바꾸므로, React StrictMode의
    // 중복 실행을 cleanup으로 막으면 idle 리스너가 실제 idle 전에 취소돼버린다. 대신 이미 적용한
    // 좌표를 ref로 기억해 같은 좌표가 다시 들어와도 두 번 적용하지 않도록 막는다.
    appliedFocusPosition.current = focusPosition;
    focusMapOnPosition(map, focusPosition, focusZoom);
    clearFocusPosition();
  }, [clearFocusPosition, focusPosition, focusZoom, map]);

  return null;
}
