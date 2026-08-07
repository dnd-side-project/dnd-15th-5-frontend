import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

import { useCurrentPosition } from '../hooks/useCurrentPosition';

export default function CurrentLocationMarker() {
  const map = useMap();
  const { position } = useCurrentPosition();

  useEffect(() => {
    if (!map || !position) {
      return;
    }

    map.panTo(position);
    map.setZoom(16);
  }, [map, position]);

  if (!position) {
    return null;
  }

  return (
    <AdvancedMarker position={position}>
      <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
    </AdvancedMarker>
  );
}
