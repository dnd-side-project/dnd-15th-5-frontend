import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

import { useMapFocusStore } from '@/features/map/stores/mapFocusStore';
import { focusMapOnPosition } from '@/features/map/utils/focusMapOnPosition';

/** 검색 결과 선택 등으로 `useMapFocusStore`에 좌표가 들어오면 지도를 그 위치로 이동시킨다. */
export default function MapFocusController() {
  const map = useMap();
  const focusPosition = useMapFocusStore((state) => state.focusPosition);
  const focusZoom = useMapFocusStore((state) => state.focusZoom);
  const clearFocusPosition = useMapFocusStore((state) => state.clearFocusPosition);
  const cancelPendingOffsetRef = useRef<(() => void) | null>(null);

  // 포커스 effect는 요청을 비우면서 스스로의 의존값을 바꾸므로 그 effect의 cleanup에서 취소하면
  // idle 전에 바로 취소된다. 새 요청은 아래에서 명시적으로 취소하고 여기서는 수명 종료만 정리한다.
  useEffect(
    () => () => {
      cancelPendingOffsetRef.current?.();
      cancelPendingOffsetRef.current = null;
    },
    []
  );

  useEffect(() => {
    if (!map || !focusPosition) {
      return;
    }

    cancelPendingOffsetRef.current?.();
    cancelPendingOffsetRef.current = focusMapOnPosition(map, focusPosition, focusZoom);
    clearFocusPosition();
  }, [clearFocusPosition, focusPosition, focusZoom, map]);

  return null;
}
