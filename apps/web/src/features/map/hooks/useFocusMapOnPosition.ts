import { useCallback, useEffect, useRef } from 'react';

import type { MapPosition } from '@/features/map/types';
import { focusMapOnPosition } from '@/features/map/utils/focusMapOnPosition';

/**
 * 마커·스티커 클릭으로 지도 포커스를 요청하는 함수를 반환한다.
 *
 * 직전 요청이 지도가 idle 상태가 되길 기다리는 중이면 취소한 뒤 다시 요청해, 빠르게 연속으로
 * 선택했을 때 지연된 오프셋이 여러 번 겹쳐 적용되지 않도록 한다.
 */
export const useFocusMapOnPosition = (map: google.maps.Map | null | undefined) => {
  const cancelPendingFocusRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      cancelPendingFocusRef.current?.();
      cancelPendingFocusRef.current = null;
    },
    [map]
  );

  return useCallback(
    (position: MapPosition, zoom?: number) => {
      if (!map) {
        return;
      }

      cancelPendingFocusRef.current?.();
      cancelPendingFocusRef.current = focusMapOnPosition(map, position, zoom);
    },
    [map]
  );
};
