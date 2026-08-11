import { AdvancedMarker, Circle } from '@vis.gl/react-google-maps';

import type { CurrentPosition } from '../../types';

type CurrentLocationMarkerProps = {
  position: CurrentPosition | null;
};

export default function CurrentLocationMarker({ position }: CurrentLocationMarkerProps) {
  if (!position) {
    return null;
  }

  return (
    <>
      <Circle
        center={position}
        radius={position.accuracy}
        fillColor="#3B82F6"
        fillOpacity={0.16}
        strokeColor="#3B82F6"
        strokeOpacity={0.3}
        strokeWeight={1}
        clickable={false}
      />
      <AdvancedMarker position={position}>
        <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
      </AdvancedMarker>
    </>
  );
}
