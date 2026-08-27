import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

import type { MapPosition } from '@/features/map/types';
import { focusMapOnPosition } from '@/features/map/utils/focusMapOnPosition';

type CurrentLocationCameraControllerProps = {
  isAutomaticPanEnabled: boolean;
  position: MapPosition | null;
};

/** 현재 위치가 처음 확인되면 줌을 유지한 채 지도 중심을 해당 좌표로 한 번 이동한다. */
export default function CurrentLocationCameraController({
  isAutomaticPanEnabled,
  position,
}: CurrentLocationCameraControllerProps) {
  const map = useMap();
  const hasMovedToCurrentPosition = useRef(false);
  const cancelPendingOffsetRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      cancelPendingOffsetRef.current?.();
      cancelPendingOffsetRef.current = null;
      // React StrictMode의 effect 사전 점검 cleanup 뒤 두 번째 setup이 카메라 이동을 다시
      // 등록할 수 있게 한다. 실제 unmount에서는 ref 자체가 함께 폐기된다.
      hasMovedToCurrentPosition.current = false;
    },
    []
  );

  useEffect(() => {
    if (hasMovedToCurrentPosition.current) {
      return;
    }

    // NOTE: 장소 상세·추천 좌표를 포커스한 채 지도에 진입한 경우, 뒤늦게 확인된 현재 위치가
    // 해당 카메라 이동을 덮어쓰지 않도록 이 지도 세션의 자동 이동을 사용한 것으로 처리한다.
    if (!isAutomaticPanEnabled) {
      hasMovedToCurrentPosition.current = true;
      return;
    }

    if (!map || !position) {
      return;
    }

    cancelPendingOffsetRef.current = focusMapOnPosition(map, position);
    hasMovedToCurrentPosition.current = true;
  }, [isAutomaticPanEnabled, map, position]);

  return null;
}
