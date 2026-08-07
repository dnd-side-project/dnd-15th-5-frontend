import { AdvancedMarker, ControlPosition, MapControl, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

import { useCurrentPosition } from '../hooks/useCurrentPosition';

export default function CurrentLocationMarker() {
  const map = useMap();
  const { position, isLoading, refreshPosition } = useCurrentPosition();

  useEffect(() => {
    if (!map || !position) {
      return;
    }

    map.panTo(position);
    map.setZoom(16);
  }, [map, position]);

  const handleCurrentLocationClick = () => {
    if (map && position) {
      map.panTo(position);
      map.setZoom(16);
    }

    void refreshPosition();
  };

  return (
    <>
      {position && (
        <AdvancedMarker position={position}>
          <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
        </AdvancedMarker>
      )}

      <MapControl position={ControlPosition.RIGHT_BOTTOM}>
        <button
          type="button"
          aria-label="현재 위치로 이동"
          className="mt-4 mr-[max(1rem,env(safe-area-inset-right))] mb-[max(1rem,env(safe-area-inset-bottom))] ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg active:bg-neutral-100 disabled:text-neutral-300"
          disabled={isLoading}
          onClick={handleCurrentLocationClick}
        >
          <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path
              d="M12 3v3m0 12v3M3 12h3m12 0h3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </MapControl>
    </>
  );
}
