import { AdvancedMarker, Circle } from '@vis.gl/react-google-maps';

import type { CurrentPosition } from '@chapchap/shared/location';

// Google Maps Circle은 Tailwind 클래스를 받을 수 없어 마커 점과 같은 색상 값을 공유한다.
const CURRENT_LOCATION_COLOR = '#4a6bff';

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
        fillColor={CURRENT_LOCATION_COLOR}
        fillOpacity={0.16}
        strokeColor={CURRENT_LOCATION_COLOR}
        strokeOpacity={0.3}
        strokeWeight={1}
        clickable={false}
      />
      <AdvancedMarker position={position} anchorLeft="-50%" anchorTop="-50%">
        <div
          className="h-5 w-5 rounded-full border-[3px] border-neutral-00 shadow-current-location"
          style={{ backgroundColor: CURRENT_LOCATION_COLOR }}
        />
      </AdvancedMarker>
    </>
  );
}
