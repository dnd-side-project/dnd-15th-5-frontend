import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

import type { MapPosition } from '../../types';

type CurrentLocationCameraControllerProps = {
  position: MapPosition | null;
};

/** 현재 위치가 처음 확인되면 줌을 유지한 채 지도 중심을 해당 좌표로 한 번 이동한다. */
export default function CurrentLocationCameraController({
  position,
}: CurrentLocationCameraControllerProps) {
  const map = useMap();
  const hasMovedToCurrentPosition = useRef(false);

  useEffect(() => {
    if (!map || !position || hasMovedToCurrentPosition.current) {
      return;
    }

    map.panTo(position);
    hasMovedToCurrentPosition.current = true;
  }, [map, position]);

  return null;
}
