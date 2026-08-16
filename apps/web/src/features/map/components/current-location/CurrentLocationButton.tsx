import { ControlPosition, MapControl, useMap } from '@vis.gl/react-google-maps';

import { CurrentLocationIcon } from '@/shared/assets/icons';

import type { MapPosition } from '../../types';

type CurrentLocationButtonProps = {
  position: MapPosition | null;
  isLoading: boolean;
  errorMessage: string | null;
  onRequestPosition: () => void;
};

export default function CurrentLocationButton({
  position,
  isLoading,
  errorMessage,
  onRequestPosition,
}: CurrentLocationButtonProps) {
  const map = useMap();
  const isDisabled = !map || isLoading;

  const handleCurrentLocationClick = () => {
    if (!map) {
      return;
    }

    if (position) {
      map.panTo(position);
      return;
    }

    onRequestPosition();
  };

  return (
    <MapControl position={ControlPosition.RIGHT_BOTTOM}>
      <div className="m-3 flex flex-col items-end gap-2">
        {errorMessage && (
          <p
            role="status"
            className="max-w-52 rounded-lg bg-gray-900/85 px-3 py-2 text-xs text-white"
          >
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          aria-label="현재 위치로 이동"
          title="현재 위치로 이동"
          disabled={isDisabled}
          aria-busy={isLoading}
          onClick={handleCurrentLocationClick}
          className="flex size-8 items-center justify-center rounded-full bg-neutral-00 text-primary-500 shadow-current-location-button transition-[background-color,box-shadow,transform,opacity] hover:bg-neutral-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CurrentLocationIcon aria-hidden="true" className="size-4" />
        </button>
      </div>
    </MapControl>
  );
}
