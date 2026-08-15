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
      <AdvancedMarker position={position} anchorLeft="-50%" anchorTop="-50%">
        <div className="h-5 w-5 rounded-full border-[3px] border-neutral-00 bg-primary-500 shadow-current-location" />
      </AdvancedMarker>
    </>
  );
}
