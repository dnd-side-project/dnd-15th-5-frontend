import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

import type { MapPosition } from '../../types';

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

    map.panTo(position);
    hasMovedToCurrentPosition.current = true;
  }, [isAutomaticPanEnabled, map, position]);

  return null;
}
